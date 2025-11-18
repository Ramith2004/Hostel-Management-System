import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.ts";
import { requireRole } from "../middleware/role.middleware.ts";
import { verifyTenant } from "../middleware/tenant.middleware.ts";
import {
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile,
  getStudentWithRoom,
} from "../controllers/StudentProfile/student-profile.controller.ts";

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(verifyTenant);

// Student Profile Routes
router.post("/", requireRole(["STUDENT"]), createStudentProfile);
router.get("/", requireRole(["STUDENT"]), getStudentProfile);
router.put("/", requireRole(["STUDENT"]), updateStudentProfile);
router.get("/with-room", requireRole(["STUDENT"]), getStudentWithRoom);
router.post("/", requireRole(["STUDENT"]), createStudentProfile);

export default router;