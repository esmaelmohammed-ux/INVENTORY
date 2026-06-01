import prisma from "../lib/prisma.js";
import { sendEmail, sendBulkEmail } from "./email.service.js";

// Get users by role(s)
const getUsersByRole = async (roles) => {
  return await prisma.user.findMany({
    where: {
      role: {
        in: roles,
      },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });
};

// Notification triggers
export const notificationTriggers = {
  // Low stock notification
  onLowStock: async (items) => {
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== "true") return;

    try {
      const storekeepers = await getUsersByRole(["STOREKEEPER", "ADMIN"]);
      await sendBulkEmail(storekeepers, "lowStock", items);
      console.log(
        `📧 Low stock notifications sent to ${storekeepers.length} users`
      );
    } catch (error) {
      console.error("Low stock notification failed:", error);
    }
  },

  // Requisition status change
  onRequisitionStatusChange: async (requisition) => {
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== "true") return;

    try {
      // Notify the creator
      const creator = await prisma.user.findUnique({
        where: { id: requisition.createdById },
        select: { email: true, firstName: true, lastName: true },
      });

      if (creator) {
        await sendEmail(creator.email, "requisitionStatus", {
          ...requisition,
          action: requisition.status,
        });
        console.log(
          `📧 Requisition status notification sent to ${creator.email}`
        );
      }
    } catch (error) {
      console.error("Requisition notification failed:", error);
    }
  },

  // New requisition for approval
  onNewRequisition: async (requisition) => {
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== "true") return;

    try {
      const procurementOfficers = await getUsersByRole([
        "PROCUREMENT_OFFICER",
        "ADMIN",
      ]);
      await sendBulkEmail(procurementOfficers, "newRequisition", requisition);
      console.log(
        `📧 New requisition notifications sent to ${procurementOfficers.length} users`
      );
    } catch (error) {
      console.error("New requisition notification failed:", error);
    }
  },

  // Service request status change
  onServiceRequestStatusChange: async (serviceRequest) => {
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== "true") return;

    try {
      // Notify the creator
      const creator = await prisma.user.findUnique({
        where: { id: serviceRequest.createdById },
        select: { email: true, firstName: true, lastName: true },
      });

      if (creator) {
        await sendEmail(creator.email, "serviceRequestStatus", {
          ...serviceRequest,
          action: serviceRequest.status,
        });
        console.log(
          `📧 Service request status notification sent to ${creator.email}`
        );
      }
    } catch (error) {
      console.error("Service request notification failed:", error);
    }
  },
};

// Scheduled notification checks
export const scheduledNotifications = {
  checkLowStock: async () => {
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== "true") return;

    try {
      const lowStockItems = await prisma.item.findMany({
        where: {
          quantity: {
            lte: prisma.item.fields.minQuantity,
          },
        },
        include: {
          category: {
            select: { name: true },
          },
        },
      });

      if (lowStockItems.length > 0) {
        await notificationTriggers.onLowStock(
          lowStockItems.map((item) => ({
            id: item.id,
            name: item.name,
            currentQuantity: item.quantity,
            minQuantity: item.minQuantity,
            unit: item.unit,
            category: item.category.name,
          }))
        );
      }
    } catch (error) {
      console.error("Scheduled low stock check failed:", error);
    }
  },
};
