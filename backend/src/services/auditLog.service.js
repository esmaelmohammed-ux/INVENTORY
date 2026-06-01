import prisma from "../lib/prisma.js";

export class AuditLogService {
  static async createAuditLog({
    action,
    entityType,
    entityId,
    oldValues = null,
    newValues = null,
    userId,
    ipAddress = null,
    userAgent = null,
    metadata = null,
    status = "SUCCESS",
  }) {
    try {
      const auditLog = await prisma.auditLog.create({
        data: {
          action,
          entityType,
          entityId: entityId ? String(entityId) : null,
          oldValues: oldValues ? JSON.stringify(oldValues) : null,
          newValues: newValues ? JSON.stringify(newValues) : null,
          userId,
          ipAddress,
          userAgent,
          metadata: metadata ? JSON.stringify(metadata) : null,
          status,
          timestamp: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return auditLog;
    } catch (error) {
      console.error("Audit logging failed:", error);
      // Don't throw - audit logging should not break main functionality
      return null;
    }
  }

  /**
   * Log user authentication events
   */
  static async logAuth(
    action,
    userId,
    email,
    ipAddress,
    userAgent,
    status = "SUCCESS",
    metadata = null
  ) {
    return this.createAuditLog({
      action: `AUTH_${action}`,
      entityType: "USER",
      entityId: userId,
      newValues: { email, timestamp: new Date() },
      userId: userId || null,
      ipAddress,
      userAgent,
      status,
      metadata,
    });
  }

  /**
   * Log user management activities
   */
  static async logUserManagement(
    action,
    targetUserId,
    performedBy,
    oldValues = null,
    newValues = null,
    ipAddress = null
  ) {
    return this.createAuditLog({
      action: `USER_${action}`,
      entityType: "USER",
      entityId: targetUserId,
      oldValues,
      newValues,
      userId: performedBy,
      ipAddress,
      metadata: {
        targetUserId,
        performedBy,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Log requisition activities
   */
  static async logRequisition(
    action,
    requisitionId,
    userId,
    oldValues = null,
    newValues = null,
    metadata = null
  ) {
    return this.createAuditLog({
      action: `REQUISITION_${action}`,
      entityType: "REQUISITION",
      entityId: requisitionId,
      oldValues,
      newValues,
      userId,
      metadata,
    });
  }

  /**
   * Log service request activities
   */
  static async logServiceRequest(
    action,
    serviceRequestId,
    userId,
    oldValues = null,
    newValues = null,
    metadata = null
  ) {
    return this.createAuditLog({
      action: `SERVICE_REQUEST_${action}`,
      entityType: "SERVICE_REQUEST",
      entityId: serviceRequestId,
      oldValues,
      newValues,
      userId,
      metadata,
    });
  }

  /**
   * Log inventory activities
   */
  static async logInventory(
    action,
    itemId,
    userId,
    oldValues = null,
    newValues = null,
    metadata = null
  ) {
    return this.createAuditLog({
      action: `INVENTORY_${action}`,
      entityType: "ITEM",
      entityId: itemId,
      oldValues,
      newValues,
      userId,
      metadata,
    });
  }

  /**
   * Log system administrative activities
   */
  static async logSystem(
    action,
    entityType,
    entityId,
    userId,
    oldValues = null,
    newValues = null,
    metadata = null
  ) {
    return this.createAuditLog({
      action: `SYSTEM_${action}`,
      entityType,
      entityId,
      oldValues,
      newValues,
      userId,
      metadata,
    });
  }

  /**
   * Get audit logs with filtering and pagination
   */
  static async getAuditLogs({
    entityType = null,
    entityId = null,
    userId = null,
    action = null,
    startDate = null,
    endDate = null,
    page = 1,
    limit = 50,
  }) {
    const where = {};

    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = String(entityId);
    if (userId) where.userId = userId;
    if (action) where.action = action;

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [auditLogs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { timestamp: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      auditLogs: auditLogs.map((log) => ({
        ...log,
        oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
        newValues: log.newValues ? JSON.parse(log.newValues) : null,
        metadata: log.metadata ? JSON.parse(log.metadata) : null,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get audit statistics
   */
  static async getAuditStats(startDate = null, endDate = null) {
    const where = {};
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const [actionStats, entityStats, userStats, dailyStats] = await Promise.all(
      [
        // Actions by type
        prisma.auditLog.groupBy({
          by: ["action"],
          where,
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
        }),

        // Entities by type
        prisma.auditLog.groupBy({
          by: ["entityType"],
          where,
          _count: { id: true },
        }),

        // Most active users
        prisma.auditLog.groupBy({
          by: ["userId"],
          where: { ...where, userId: { not: null } },
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 10,
        }),

        // Daily activity
        prisma.auditLog.findMany({
          where,
          select: { timestamp: true },
          orderBy: { timestamp: "asc" },
        }),
      ]
    );

    // Process daily stats
    const dailyMap = new Map();
    dailyStats.forEach((log) => {
      const date = log.timestamp.toISOString().split("T")[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });

    // Get user details for top users
    const topUsersWithDetails = await Promise.all(
      userStats.map(async (stat) => {
        const user = await prisma.user.findUnique({
          where: { id: stat.userId },
          select: { firstName: true, lastName: true, role: true },
        });
        return {
          userId: stat.userId,
          name: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
          role: user?.role || "Unknown",
          activityCount: stat._count.id,
        };
      })
    );

    return {
      actionStats: actionStats.map((stat) => ({
        action: stat.action,
        count: stat._count.id,
      })),
      entityStats: entityStats.map((stat) => ({
        entityType: stat.entityType,
        count: stat._count.id,
      })),
      topUsers: topUsersWithDetails,
      dailyActivity: Array.from(dailyMap.entries()).map(([date, count]) => ({
        date,
        count,
      })),
      totalLogs: actionStats.reduce((sum, stat) => sum + stat._count.id, 0),
    };
  }
}

export default AuditLogService;
