import express from "express";
import {
  getHealthStatus,
  getSystemDiagnostics,
  testDatabaseConnection,
  getServiceStatus,
} from "../controllers/health.controller.js";

const router = express.Router();

// Public health check (no authentication required)
router.get("/", getHealthStatus);
router.get("/status", getServiceStatus);
router.get("/database", testDatabaseConnection);

// Detailed diagnostics (optional authentication for internal use)
router.get("/diagnostics", getSystemDiagnostics);

// Simple ping endpoint for load balancers
router.get("/ping", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "inventory-api",
  });
});

// Version endpoint
router.get("/version", (req, res) => {
  res.json({
    version: process.env.npm_package_version || "1.0.0",
    name: process.env.npm_package_name || "inventory-management-system",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

export default router;
