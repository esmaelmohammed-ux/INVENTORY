import prisma from "../lib/prisma.js";

export const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(departments);
  } catch (error) {
    res.status(500).json({ error, message: "Failed to fetch departments" });
  }
};

export const createDepartment = async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: "All fiels are requered." });
  }
  const department = await prisma.department.findUnique({
    where: { name },
  });
  if (department) {
    return res.status(400).json({ error: "Department already exists." });
  }
  try {
    const newDepartment = await prisma.department.create({
      data: {
        name,
        description,
      },
    });
    res.status(201).json(newDepartment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create department" });
  }
};

export const updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Check if another department with the same name exists (excluding current department)
    const existingDepartment = await prisma.department.findUnique({
      where: { name },
    });
    
    if (existingDepartment && existingDepartment.id !== parseInt(id, 10)) {
      return res.status(400).json({ error: "Department name already exists." });
    }

    const updatedDepartment = await prisma.department.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
        description,
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });
    
    res.json(updatedDepartment);
  } catch (error) {
    res.status(500).json({ error: "Failed to update department" });
  }
};

export const deleteDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.department.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete department" });
  }
};
