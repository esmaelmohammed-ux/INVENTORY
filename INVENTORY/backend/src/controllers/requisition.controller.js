import prisma from "../lib/prisma.js";
import { notificationTriggers } from "../services/notifications.service.js";
import AuditLogService from "../services/auditLog.service.js";

export const createRequisition = async (req, res) => {
  const { title, description, items } = req.body;

  try {
    // Verify all items exist
    const itemIds = items.map((item) => item.itemId);
    const existingItems = await prisma.item.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, name: true },
    });

    if (existingItems.length !== items.length) {
      return res.status(400).json({ error: "One or more items not found" });
    }

    const requisition = await prisma.requisition.create({
      data: {
        title,
        description,
        createdById: req.user.id,
        departmentId: req.user.departmentId,
        items: {
          create: items.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                description: true,
                unit: true,
              },
            },
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    await notificationTriggers.onNewRequisition(requisition);
    
    // Log requisition creation
    await AuditLogService.logRequisition(
      'CREATED',
      requisition.id,
      req.user.id,
      null,
      {
        title: requisition.title,
        description: requisition.description,
        department: requisition.department.name,
        itemCount: requisition.items.length,
        items: requisition.items.map(item => ({
          itemId: item.itemId,
          itemName: item.item.name,
          quantity: item.quantity
        }))
      },
      { ipAddress: req.ip }
    );

    res.status(201).json(requisition);
  } catch (error) {
    console.error("Create requisition error:", error);
    res.status(500).json({ error: "Failed to create requisition" });
  }
};

export const getRequisitions = async (req, res) => {
  const { status, departmentId } = req.query;

  try {
    let whereClause = {};

    if (req.user.role === "DEPARTMENT_HEAD") {
      whereClause.departmentId = req.user.departmentId;
    } else if (req.user.role === "PROCUREMENT_OFFICER") {
    } else if (req.user.role === "STOREKEEPER") {
    } else if (req.user.role === "ADMIN") {
    }

    if (status) {
      whereClause.status = status;
    }

    if (
      departmentId &&
      (req.user.role === "PROCUREMENT_OFFICER" || req.user.role === "ADMIN")
    ) {
      whereClause.departmentId = parseInt(departmentId);
    }

    const requisitions = await prisma.requisition.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                description: true,
                unit: true,
              },
            },
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        processedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(requisitions);
  } catch (error) {
    console.error("Get requisitions error:", error);
    res.status(500).json({ error: "Failed to fetch requisitions" });
  }
};

export const deleteRequisition = async (req, res) => {
  const { id } = req.params;

  try {
    // First, get the requisition to check permissions and status
    const requisition = await prisma.requisition.findUnique({
      where: { id: parseInt(id) },
      include: {
        department: { select: { name: true } },
        items: {
          include: {
            item: { select: { name: true } }
          }
        }
      }
    });

    if (!requisition) {
      return res.status(404).json({ error: "Requisition not found" });
    }

    // Check if user is the creator or has appropriate permissions
    if (req.user.role === "DEPARTMENT_HEAD") {
      if (requisition.createdById !== req.user.id) {
        return res.status(403).json({ error: "You can only delete your own requisitions" });
      }
    } else if (!["ADMIN", "PROCUREMENT_OFFICER"].includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    // Only allow deletion of PENDING requisitions
    if (requisition.status !== "PENDING") {
      return res.status(400).json({ 
        error: `Cannot delete ${requisition.status.toLowerCase()} requisitions` 
      });
    }

    // Delete requisition items first (due to foreign key constraints)
    await prisma.requisitionItem.deleteMany({
      where: { requisitionId: parseInt(id) }
    });

    // Delete the requisition
    await prisma.requisition.delete({
      where: { id: parseInt(id) }
    });

    // Log requisition deletion
    await AuditLogService.logRequisition(
      'DELETED',
      parseInt(id),
      req.user.id,
      null,
      {
        title: requisition.title,
        description: requisition.description,
        department: requisition.department.name,
        itemCount: requisition.items.length,
        items: requisition.items.map(item => ({
          itemId: item.itemId,
          itemName: item.item.name,
          quantity: item.quantity
        }))
      },
      { ipAddress: req.ip }
    );

    res.json({ message: "Requisition deleted successfully" });
  } catch (error) {
    console.error("Delete requisition error:", error);
    res.status(500).json({ error: "Failed to delete requisition" });
  }
};

export const getRequisitionById = async (req, res) => {
  const { id } = req.params;

  try {
    const requisition = await prisma.requisition.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                description: true,
                unit: true,
                quantity: true,
              },
            },
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        processedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!requisition) {
      return res.status(404).json({ error: "Requisition not found" });
    }

    if (
      req.user.role === "DEPARTMENT_HEAD" &&
      requisition.departmentId !== req.user.departmentId
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(requisition);
  } catch (error) {
    console.error("Get requisition error:", error);
    res.status(500).json({ error: "Failed to fetch requisition" });
  }
};
export const updateRequisitionStatus = async (req, res) => {
  const { id } = req.params;
  const { status, reasonForRejection } = req.body;

  try {
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Status must be APPROVED or REJECTED" });
    }

    const existingRequisition = await prisma.requisition.findUnique({
      where: { id: parseInt(id) },
      include: { items: true },
    });

    if (!existingRequisition) {
      return res.status(404).json({ error: "Requisition not found" });
    }

    if (existingRequisition.status !== "PENDING") {
      return res.status(400).json({
        error: `Requisition is already ${existingRequisition.status.toLowerCase()}`,
      });
    }

    if (status === "REJECTED" && !reasonForRejection) {
      return res
        .status(400)
        .json({ error: "Reason for rejection is required" });
    }

    const updatedRequisition = await prisma.requisition.update({
      where: { id: parseInt(id) },
      data: {
        status,
        reasonForRejection: status === "REJECTED" ? reasonForRejection : null,
        processedById: req.user.id,
        processedAt: new Date(),
      },
      include: {
        items: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                description: true,
                unit: true,
              },
            },
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        processedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    await notificationTriggers.onRequisitionStatusChange(updatedRequisition);
    
    // Log requisition status change
    await AuditLogService.logRequisition(
      status === 'APPROVED' ? 'APPROVED' : 'REJECTED',
      parseInt(id),
      req.user.id,
      { status: existingRequisition.status },
      {
        status,
        reasonForRejection: reasonForRejection || null,
        processedAt: new Date(),
        processedBy: {
          id: req.user.id,
          name: `${updatedRequisition.processedBy.firstName} ${updatedRequisition.processedBy.lastName}`,
          role: req.user.role
        }
      },
      {
        ipAddress: req.ip,
        previousStatus: existingRequisition.status,
        title: updatedRequisition.title,
        department: updatedRequisition.department.name
      }
    );

    res.json({
      message: `Requisition ${status.toLowerCase()} successfully`,
      requisition: updatedRequisition,
    });
  } catch (error) {
    console.error("Update requisition status error:", error);
    res.status(500).json({ error: "Failed to update requisition status" });
  }
};

export const getRequisitionStats = async (req, res) => {
  try {
    let whereClause = {};

    if (req.user.role === "DEPARTMENT_HEAD") {
      whereClause.departmentId = req.user.departmentId;
    }

    const stats = await prisma.requisition.groupBy({
      by: ["status"],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    const formattedStats = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      FULFILLED: 0,
      total: 0,
    };

    stats.forEach((stat) => {
      formattedStats[stat.status] = stat._count.id;
      formattedStats.total += stat._count.id;
    });

    res.json(formattedStats);
  } catch (error) {
    console.error("Get requisition stats error:", error);
    res.status(500).json({ error: "Failed to fetch requisition statistics" });
  }
};
export const fulfillRequisition = async (req, res) => {
  const { id } = req.params;

  try {
    const requisition = await prisma.requisition.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!requisition) {
      return res.status(404).json({ error: "Requisition not found" });
    }

    if (requisition.status !== "APPROVED") {
      return res.status(400).json({
        error: `Cannot fulfill requisition with status: ${requisition.status}`,
      });
    }

    const insufficientStockItems = requisition.items.filter(
      (reqItem) => reqItem.item.quantity < reqItem.quantity
    );

    if (insufficientStockItems.length > 0) {
      return res.status(400).json({
        error: "Insufficient stock for some items",
        details: insufficientStockItems.map((item) => ({
          itemId: item.itemId,
          itemName: item.item.name,
          requested: item.quantity,
          available: item.item.quantity,
        })),
      });
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const transactionPromises = requisition.items.map(async (reqItem) => {
          const transaction = await tx.transaction.create({
            data: {
              type: "ISSUE",
              itemId: reqItem.itemId,
              quantity: -reqItem.quantity,
              notes: `Fulfilling requisition #${requisition.id}: ${reqItem.quantity} ${reqItem.item.unit} issued`,
              userId: req.user.id,
              requisitionId: requisition.id,
            },
          });

          await tx.item.update({
            where: { id: reqItem.itemId },
            data: {
              quantity: {
                decrement: reqItem.quantity,
              },
            },
          });

          return transaction;
        });

        const transactions = await Promise.all(transactionPromises);

        const updatedRequisition = await tx.requisition.update({
          where: { id: requisition.id },
          data: { status: "FULFILLED" },
          include: {
            items: {
              include: {
                item: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    unit: true,
                    quantity: true,
                  },
                },
              },
            },
            department: {
              select: {
                id: true,
                name: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            processedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        return { requisition: updatedRequisition, transactions };
      },
      {
        maxWait: 10000,
        timeout: 15000,
      }
    );
    
    // Log requisition fulfillment
    await AuditLogService.logRequisition(
      'FULFILLED',
      requisition.id,
      req.user.id,
      { status: 'APPROVED' },
      {
        status: 'FULFILLED',
        fulfilledAt: new Date(),
        fulfilledBy: {
          id: req.user.id,
          role: req.user.role
        },
        transactionIds: result.transactions.map(t => t.id),
        itemsIssued: requisition.items.map(item => ({
          itemId: item.itemId,
          itemName: item.item.name,
          quantityIssued: item.quantity,
          unit: item.item.unit
        }))
      },
      {
        ipAddress: req.ip,
        title: result.requisition.title,
        department: result.requisition.department.name
      }
    );

    res.json({
      message: "Requisition fulfilled successfully",
      requisition: result.requisition,
      transactions: result.transactions,
    });
  } catch (error) {
    console.error("Fulfill requisition error:", error);

    if (error.code === "P2028") {
      return res.status(500).json({
        error: "Transaction timeout. Please try again.",
      });
    }

    res.status(500).json({ error: "Failed to fulfill requisition" });
  }
};
