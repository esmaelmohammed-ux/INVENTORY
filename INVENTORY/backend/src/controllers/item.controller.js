import prisma from "../lib/prisma.js";

export const getItems = async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      include: {
        category: true,
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { name: "asc" },
    });
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
};
export const createItem = async (req, res) => {
  const { name, description, quantity, minQuantity, unit, categoryId } =
    req.body;

  try {
    const newItem = await prisma.item.create({
      data: {
        name,
        description,
        quantity: parseInt(quantity),
        minQuantity: parseInt(minQuantity),
        unit,
        categoryId: parseInt(categoryId),
      },
      include: {
        category: true,
      },
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ error: "Failed to create item" });
  }
};
export const updateItem = async (req, res) => {
  const { id } = req.params;
  const { name, description, quantity, minQuantity, unit, categoryId } =
    req.body;

  try {
    const updatedItem = await prisma.item.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        quantity: parseInt(quantity),
        minQuantity: parseInt(minQuantity),
        unit,
        categoryId: parseInt(categoryId),
      },
      include: {
        category: true,
      },
    });

    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ error: "Failed to update item" });
  }
};
export const deleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.item.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).end();
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Failed to delete item" });
  }
};
