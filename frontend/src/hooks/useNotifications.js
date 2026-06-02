import { useState, useCallback } from "react";
// This custom hook manages notifications within the application. It allows components to add new notifications, remove specific notifications, and clear all notifications. Each notification includes an ID, message, type (e.g., success, error), and a timestamp. Notifications are automatically removed after 5 seconds to ensure they do not clutter the user interface.
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const addNotification = useCallback(
    (notification) => {
      const id = Date.now();
      const newNotification = {
        id,
        ...notification,
        timestamp: new Date(),
      };

      setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]);

      // Auto remove after 5 seconds
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    },
    [removeNotification],
  );

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
};
