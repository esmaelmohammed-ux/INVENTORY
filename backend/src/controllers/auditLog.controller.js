import AuditLogService from "../services/auditLog.service.js";
import prisma from "../lib/prisma.js";

/**
 * Audit Log Controller
 * Handles all audit log related operations
 */

export const getAuditLogs = async (req, res) => {
  try {
    const {
      entityType,
      entityId,
      userId,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    const result = await AuditLogService.getAuditLogs({
      entityType,
      entityId,
      userId: userId ? parseInt(userId) : null,
      action,
      startDate,
      endDate,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json(result);
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

export const getAuditStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await AuditLogService.getAuditStats(startDate, endDate);

    res.json({
      ...stats,
      dateRange: {
        start: startDate || 'all time',
        end: endDate || 'all time'
      }
    });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({ error: 'Failed to fetch audit statistics' });
  }
};

export const getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const auditLog = await prisma.auditLog.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!auditLog) {
      return res.status(404).json({ error: 'Audit log not found' });
    }

    const formattedLog = {
      ...auditLog,
      oldValues: auditLog.oldValues ? JSON.parse(auditLog.oldValues) : null,
      newValues: auditLog.newValues ? JSON.parse(auditLog.newValues) : null,
      metadata: auditLog.metadata ? JSON.parse(auditLog.metadata) : null
    };

    res.json(formattedLog);
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
};

export const getAuditTrail = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { limit = 100 } = req.query;

    const result = await AuditLogService.getAuditLogs({
      entityType: entityType.toUpperCase(),
      entityId,
      limit: parseInt(limit)
    });

    res.json({
      entityType,
      entityId,
      trail: result.auditLogs,
      totalLogs: result.pagination.totalCount
    });
  } catch (error) {
    console.error('Get audit trail error:', error);
    res.status(500).json({ error: 'Failed to fetch audit trail' });
  }
};

export const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;

    const result = await AuditLogService.getAuditLogs({
      userId: parseInt(userId),
      startDate,
      endDate,
      limit: parseInt(limit)
    });

    res.json({
      userId: parseInt(userId),
      activities: result.auditLogs,
      totalActivities: result.pagination.totalCount,
      dateRange: {
        start: startDate || 'all time',
        end: endDate || 'all time'
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
};

// Export audit log service for internal use
export { AuditLogService };