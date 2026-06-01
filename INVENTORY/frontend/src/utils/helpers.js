import { USER_ROLES, REQUISITION_STATUS, ITEM_CATEGORIES } from "./constants";

export const formatDate = (dateString, options = {}) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getRoleLabel = (role) => {
  return USER_ROLES[role] ? role.replace("_", " ") : role;
};

export const getStatusColor = (status) => {
  const colors = {
    [REQUISITION_STATUS.PENDING]: "warning",
    [REQUISITION_STATUS.APPROVED]: "success",
    [REQUISITION_STATUS.REJECTED]: "error",
    [REQUISITION_STATUS.FULFILLED]: "info",
    LOW: "error",
    OK: "success",
  };
  return colors[status] || "default";
};

export const getCategoryName = (categoryId) => {
  return ITEM_CATEGORIES[categoryId] || "Unknown Category";
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const downloadFile = (data, filename, type = "text/plain") => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
