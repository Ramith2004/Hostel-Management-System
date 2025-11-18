import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.middleware.ts";
import { requireRole } from "../../middleware/role.middleware.ts";
import { verifyTenant } from "../../middleware/tenant.middleware.ts";
import {
  createStudent,
  getStudents,
} from "../../controllers/Admin/student.controller.ts";
const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(verifyTenant);

// Admin creates students
router.post("/", requireRole(["ADMIN"]), createStudent);
router.get("/", requireRole(["ADMIN"]), getStudents);

export default router;