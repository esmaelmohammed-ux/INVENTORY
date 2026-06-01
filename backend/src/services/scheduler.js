import { scheduledNotifications } from "./notifications.service.js";

export const startScheduledTasks = () => {
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 8 && now.getMinutes() === 0) {
      scheduledNotifications.checkLowStock();
    }
  }, 60000);

  console.log("⏰ Scheduled tasks started");
};
