import prisma from "../lib/prisma.js";
import { notificationTriggers } from "../services/notifications.service.js";
import AuditLogService from "../services/auditLog.service.js";
export const getTransactions = async (req, res) => {
  const { type, itemId, startDate, endDate, page = 1, limit = 50 } = req.query;

  try {
    let whereClause = {};

    if (type) {
      whereClause.type = type;
    }

    if (itemId) {
      whereClause.itemId = parseInt(itemId);
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: {
          item: {
            select: {
              id: true,
              name: true,
              unit: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          requisition: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.transaction.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / take);

    res.json({
      transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

export const getTransactionStats = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    let whereClause = {};

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    const [typeStats, topItems, allTransactions] = await Promise.all([
      prisma.transaction.groupBy({
        by: ["type"],
        where: whereClause,
        _count: { id: true },
        _sum: { quantity: true },
      }),

      prisma.transaction.groupBy({
        by: ["itemId"],
        where: whereClause,
        _count: { id: true },
        _sum: { quantity: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),

      prisma.transaction.findMany({
        where: whereClause,
        select: {
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const dailyStatsMap = new Map();

    allTransactions.forEach((transaction) => {
      const dateKey = transaction.createdAt.toISOString().split("T")[0];

      if (!dailyStatsMap.has(dateKey)) {
        dailyStatsMap.set(dateKey, { date: dateKey, count: 0 });
      }

      dailyStatsMap.get(dateKey).count++;
    });

    const dailyStats = Array.from(dailyStatsMap.values());

    const topItemsWithDetails = await Promise.all(
      topItems.map(async (item) => {
        const itemDetails = await prisma.item.findUnique({
          where: { id: item.itemId },
          select: { name: true, unit: true },
        });
        return {
          itemId: item.itemId,
          itemName: itemDetails?.name || "Unknown Item",
          unit: itemDetails?.unit || "",
          transactionCount: item._count.id,
          totalQuantity: Math.abs(item._sum.quantity),
        };
      })
    );

    res.json({
      byType: typeStats.map((stat) => ({
        type: stat.type,
        count: stat._count.id,
        totalQuantity: Math.abs(stat._sum.quantity),
      })),
      dailyVolume: dailyStats,
      topItems: topItemsWithDetails,
      summary: {
        totalTransactions: allTransactions.length,
        dateRange: {
          start: startDate || "all time",
          end: endDate || "all time",
        },
      },
    });
  } catch (error) {
    console.error("Get transaction stats error:", error);
    res.status(500).json({ error: "Failed to fetch transaction statistics" });
  }
};

export const getTransactionById = async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            description: true,
            unit: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true,
          },
        },
        requisition: {
          select: {
            id: true,
            title: true,
            status: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    console.error("Get transaction error:", error);
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
};

export const adjustStock = async (req, res) => {
  const { itemId, quantity, notes, type = "ADJUST" } = req.body;

  try {
    if (!itemId || !quantity || quantity === 0) {
      return res.status(400).json({
        error: "Item ID and non-zero quantity are required",
      });
    }

    const item = await prisma.item.findUnique({
      where: { id: parseInt(itemId) },
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          type,
          itemId: parseInt(itemId),
          quantity: parseInt(quantity),
          notes: notes || `Manual ${type.toLowerCase()} by user`,
          userId: req.user.id,
        },
        include: {
          item: {
            select: {
              id: true,
              name: true,
              unit: true,
            },
          },
        },
      });

      const updatedItem = await tx.item.update({
        where: { id: parseInt(itemId) },
        data: {
          quantity: {
            increment: parseInt(quantity),
          },
        },
      });
      if (updatedItem.quantity <= updatedItem.minQuantity) {
        await notificationTriggers.onLowStock([
          {
            id: updatedItem.id,
            name: updatedItem.name,
            currentQuantity: updatedItem.quantity,
            minQuantity: updatedItem.minQuantity,
            unit: updatedItem.unit,
          },
        ]);
      }
      return { transaction, updatedItem };
    });
    
    // Log inventory adjustment in audit trail
    await AuditLogService.logInventory(
      'STOCK_ADJUSTED',
      parseInt(itemId),
      req.user.id,
      { quantity: item.quantity },
      { 
        quantity: result.updatedItem.quantity,
        adjustment: quantity,
        adjustmentType: type
      },
      {
        ipAddress: req.ip,
        itemName: item.name,
        notes: notes || `Manual ${type.toLowerCase()} by user`,
        transactionId: result.transaction.id,
        previousQuantity: item.quantity,
        newQuantity: result.updatedItem.quantity
      }
    );

    res.status(201).json({
      message: "Stock adjusted successfully",
      transaction: result.transaction,
      newQuantity: result.updatedItem.quantity,
    });
  } catch (error) {
    console.error("Adjust stock error:", error);
    res.status(500).json({ error: "Failed to adjust stock" });
  }
};
