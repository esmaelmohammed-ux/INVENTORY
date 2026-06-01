export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== "";
};

export const validateNumber = (value, min = 0, max = Infinity) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

export const validateRequisitionItems = (items) => {
  return (
    items.length > 0 && items.every((item) => item.itemId && item.quantity > 0)
  );
};

export const validateStockLevel = (current, minimum) => {
  return current >= minimum;
};

export const getValidationErrors = (formData, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const value = formData[field];
    const fieldRules = rules[field];

    if (fieldRules.required && !validateRequired(value)) {
      errors[field] = fieldRules.requiredMessage || "This field is required";
    }

    if (fieldRules.email && value && !validateEmail(value)) {
      errors[field] = "Please enter a valid email address";
    }

    if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
      errors[field] = `Must be at least ${fieldRules.minLength} characters`;
    }

    if (
      fieldRules.validateNumber &&
      value &&
      !validateNumber(value, fieldRules.min, fieldRules.max)
    ) {
      errors[field] = `Must be between ${fieldRules.min} and ${fieldRules.max}`;
    }
  });

  return errors;
};
