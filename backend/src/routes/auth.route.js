import { Router } from "express";

import {
  getProfile,
  login,
  registerUsers,
} from "../controllers/auth.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.js";
import { authValidation, validateRequest } from "../middleware/validation.js";

const router = Router();

router.post("/login", validateRequest(authValidation), login);
router.post("/register", authenticateToken, authorize("ADMIN"), registerUsers);

router.get("/profile", authenticateToken, getProfile);
export default router;
