import express from "express";
import {
  getTransactions,
  getTransactionStats,
  getTransactionById,
  adjustStock,
} from "../controllers/transaction.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.js";
// This route handles endpoints related to inventory transactions, including retrieving transaction records, getting transaction statistics, and adjusting stock levels. Access to these endpoints is restricted based on user roles, with certain actions limited to storekeepers and administrators.
const router = express.Router();

router.use(authenticateToken);

router.get(
  "/",
  authorize("STOREKEEPER", "PROCUREMENT_OFFICER", "ADMIN", "AUDITOR"),
  getTransactions,
);

router.get(
  "/stats",
  authorize("STOREKEEPER", "PROCUREMENT_OFFICER", "ADMIN", "AUDITOR"),
  getTransactionStats,
);

router.get(
  "/:id",
  authorize("STOREKEEPER", "PROCUREMENT_OFFICER", "ADMIN", "AUDITOR"),
  getTransactionById,
);

router.post("/adjust", authorize("ADMIN", "STOREKEEPER"), adjustStock);

export default router;
