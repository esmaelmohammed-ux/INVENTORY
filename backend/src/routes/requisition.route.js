import express from "express";
import {
  createRequisition,
  getRequisitions,
  getRequisitionStats,
  getRequisitionById,
  updateRequisitionStatus,
  fulfillRequisition,
  deleteRequisition,
} from "../controllers/requisition.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/", authorize("DEPARTMENT_HEAD"), createRequisition);

router.get(
  "/",
  authorize(
    "DEPARTMENT_HEAD",
    "PROCUREMENT_OFFICER",
    "STOREKEEPER",
    "ADMIN",
    "AUDITOR"
  ),
  getRequisitions
);
router.get(
  "/stats",
  authorize("PROCUREMENT_OFFICER", "STOREKEEPER", "ADMIN", "AUDITOR"),
  getRequisitionStats
);

router.get("/:id", getRequisitionById);

router.patch(
  "/:id/status",
  authorize("PROCUREMENT_OFFICER"),
  updateRequisitionStatus
);

router.post("/:id/fulfill", authorize("STOREKEEPER"), fulfillRequisition);

router.delete(
  "/:id",
  authorize("DEPARTMENT_HEAD", "PROCUREMENT_OFFICER", "ADMIN"),
  deleteRequisition
);

export default router;
