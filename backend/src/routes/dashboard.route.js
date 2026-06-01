import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.get(
  "/stats",
  authorize(
    "DEPARTMENT_HEAD",
    "PROCUREMENT_OFFICER",
    "STOREKEEPER",
    "ADMIN",
    "AUDITOR"
  ),
  getDashboardStats
);

export default router;
