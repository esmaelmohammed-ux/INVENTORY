import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import AuditLogService from "../services/auditLog.service.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { department: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      // Log failed login attempt
      await AuditLogService.logAuth(
        'LOGIN_FAILED',
        user?.id || null,
        email,
        req.ip,
        req.get('User-Agent'),
        'FAILED',
        { reason: 'Invalid credentials', email }
      );
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password: _, ...userWithoutPassword } = user;
    
    // Log successful login
    await AuditLogService.logAuth(
      'LOGIN',
      user.id,
      user.email,
      req.ip,
      req.get('User-Agent'),
      'SUCCESS',
      { role: user.role, department: user.department?.name }
    );
    
    res.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const registerUsers = async (req, res) => {
  const { email, password, firstName, lastName, role, departmentId } = req.body;

  try {
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: "All the fields are required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        departmentId: departmentId ? parseInt(departmentId) : null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        departmentId: true,
        createdAt: true,
      },
    });

    // Log user creation
    await AuditLogService.logUserManagement(
      'CREATED',
      newUser.id,
      req.user.id, // Admin who created the user
      null,
      {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        departmentId: newUser.departmentId
      },
      req.ip
    );
    
    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
