import { body, validationResult } from "express-validator";

export const validateRequest = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
      timestamp: new Date().toISOString(),
    });
  };
};

export const authValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
];

export const itemValidation = [
  body("name").notEmpty().trim(),
  body("quantity").isInt({ min: 0 }),
  body("minQuantity").isInt({ min: 0 }),
  body("unit").notEmpty().trim(),
  body("categoryId").isInt({ min: 1 }),
];

export const requisitionValidation = [
  body("title").notEmpty().trim(),
  body("items").isArray({ min: 1 }),
  body("items.*.itemId").isInt({ min: 1 }),
  body("items.*.quantity").isInt({ min: 1 }),
];
