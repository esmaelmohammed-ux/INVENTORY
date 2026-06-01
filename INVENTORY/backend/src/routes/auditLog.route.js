import express from "express";
import {
  getAuditLogs,
  getAuditStats,
  getAuditLogById,
  getAuditTrail,
  getUserActivity
} from "../controllers/auditLog.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

// All audit routes require authentication
router.use(authenticateToken);

// Get all audit logs with filtering and pagination
// Only accessible to ADMIN and AUDITOR
router.get(
  "/",
  authorize("ADMIN", "AUDITOR"),
  getAuditLogs
);

// Get audit statistics
// Only accessible to ADMIN and AUDITOR
router.get(
  "/stats",
  authorize("ADMIN", "AUDITOR"),
  getAuditStats
);

// Get specific audit log by ID
// Only accessible to ADMIN and AUDITOR
router.get(
  "/:id",
  authorize("ADMIN", "AUDITOR"),
  getAuditLogById
);

// Get audit trail for a specific entity
// Only accessible to ADMIN and AUDITOR
router.get(
  "/trail/:entityType/:entityId",
  authorize("ADMIN", "AUDITOR"),
  getAuditTrail
);

// Get activity for a specific user
// Accessible to ADMIN, AUDITOR, and the user themselves
router.get(
  "/user/:userId",
  authorize("ADMIN", "AUDITOR", "STOREKEEPER", "PROCUREMENT_OFFICER", "DEPARTMENT_HEAD"),
  getUserActivity
);

export default router;