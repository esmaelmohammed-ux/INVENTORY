import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        departmentId: true,
      },
    });

    if (!user) {
      return res.status(403).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden: Insufficient permissions",
        required: allowedRoles,
        current: req.user.role,
      });
    }

    next();
  };
};

export const canAccessDepartment = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.role === "ADMIN" || req.user.role === "PROCUREMENT_OFFICER") {
    return next();
  }

  const requestedDepartmentId = parseInt(
    req.params.departmentId || req.body.departmentId
  );

  if (req.user.departmentId !== requestedDepartmentId) {
    return res.status(403).json({
      error: "Forbidden: Cannot access other departments",
    });
  }

  next();
};
