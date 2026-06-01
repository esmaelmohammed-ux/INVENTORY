import prisma from "../lib/prisma.js";

// Basic health check
export const getHealthStatus = async (req, res) => {
  try {
    const healthCheck = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      services: {},
    };

    try {
      await prisma.$queryRaw`SELECT 1`;
      healthCheck.services.database = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        provider: "PostgreSQL",
      };
    } catch (dbError) {
      healthCheck.status = "degraded";
      healthCheck.services.database = {
        status: "unhealthy",
        error: dbError.message,
        timestamp: new Date().toISOString(),
      };
    }

    res.json(healthCheck);
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
      details: error.message,
    });
  }
};

// Service status overview
export const getServiceStatus = async (req, res) => {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      services: {
        database: "unknown",
        api: "healthy",
        authentication: "healthy",
        email: process.env.SMTP_USER ? "configured" : "not_configured",
      },
    };

    try {
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Database timeout")), 5000)
        ),
      ]);

      status.services.database = "healthy";
    } catch (dbError) {
      status.services.database = "unhealthy";
      console.error("Database health check failed:", dbError.message);
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({
      error: "Service status check failed",
      timestamp: new Date().toISOString(),
      details: error.message,
    });
  }
};

export const testDatabaseConnection = async (req, res) => {
  try {
    const startTime = Date.now();

    await prisma.$queryRaw`SELECT 1`;

    const responseTime = Date.now() - startTime;

    res.json({
      status: "connected",
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      database: {
        provider: "PostgreSQL",
        connected: true,
        responseTime: responseTime,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "disconnected",
      timestamp: new Date().toISOString(),
      error: "Database connection failed",
      details: error.message,
    });
  }
};

export const getSystemDiagnostics = async (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    message: "Diagnostics endpoint is temporarily disabled",
    status: "info",
  });
};
