import express from "express";
import {
  generateInventoryReport,
  generateTransactionReport,
  generateRequisitionReport,
  generateAuditReport,
  generateFinancialReport,
} from "../controllers/report.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.js";
// This route handles endpoints for generating various reports related to inventory, transactions, requisitions, audits, and financials. Access to these endpoints is restricted based on user roles.
const router = express.Router();

router.use(authenticateToken);

router.get(
  "/inventory",
  authorize("STOREKEEPER", "ADMIN", "AUDITOR"),
  generateInventoryReport,
);

router.get(
  "/transactions",
  authorize("STOREKEEPER", "ADMIN", "AUDITOR"),
  generateTransactionReport,
);

router.get(
  "/requisitions",
  authorize("PROCUREMENT_OFFICER", "ADMIN", "AUDITOR"),
  generateRequisitionReport,
);

router.get("/audit", authorize("ADMIN", "AUDITOR"), generateAuditReport);

router.get(
  "/financial",
  authorize("ADMIN", "AUDITOR", "PROCUREMENT_OFFICER"),
  generateFinancialReport,
);

export default router;
