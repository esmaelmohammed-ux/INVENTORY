import express from "express";
import {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller.js";
import { authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authorize("ADMIN"), createDepartment);
router.get("/", authorize("ADMIN"), getDepartments);
router.put("/:id", authorize("ADMIN"), updateDepartment);
router.delete("/:id", authorize("ADMIN"), deleteDepartment);

export default router;
