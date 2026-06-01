import express from "express";
import {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateServiceRequestStatus,
  getServiceRequestStats,
  deleteServiceRequest,
} from "../controllers/serviceRequest.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/", authorize("DEPARTMENT_HEAD"), createServiceRequest);

router.get(
  "/stats",
  authorize("PROCUREMENT_OFFICER", "STOREKEEPER", "ADMIN", "AUDITOR"),
  getServiceRequestStats
);

router.get(
  "/",
  authorize(
    "DEPARTMENT_HEAD",
    "PROCUREMENT_OFFICER",
    "STOREKEEPER",
    "ADMIN",
    "AUDITOR"
  ),
  getServiceRequests
);

router.get("/:id", getServiceRequestById);

router.patch(
  "/:id/status",
  authorize("PROCUREMENT_OFFICER"),
  updateServiceRequestStatus
);

router.delete(
  "/:id",
  authorize("DEPARTMENT_HEAD", "PROCUREMENT_OFFICER", "ADMIN"),
  deleteServiceRequest
);

export default router;
