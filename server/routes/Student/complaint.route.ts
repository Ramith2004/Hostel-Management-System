import { Router } from "express";
import { studentComplaintController } from "../../controllers/Student/studentComplaint.controller.ts";
import { authenticateToken } from "../../middleware/auth.middleware.ts";
import { requireRole } from "../../middleware/role.middleware.ts";
import { verifyTenant } from "../../middleware/tenant.middleware.ts";

const router = Router();

// Apply middleware
router.use(authenticateToken);
router.use(verifyTenant);
router.use(requireRole(["STUDENT"]));

// Routes - Order matters! More specific routes first
router.post("/:tenantId/submit", studentComplaintController.submitComplaint.bind(studentComplaintController));
router.get("/:tenantId/my-complaints", studentComplaintController.getMyComplaints.bind(studentComplaintController));

// Comment routes - Must come before generic :complaintId route
router.get("/:tenantId/:complaintId/comments", studentComplaintController.getComments.bind(studentComplaintController));
router.post("/:tenantId/:complaintId/comments", studentComplaintController.addComment.bind(studentComplaintController));

// Generic complaint detail - Must come last
router.get("/:tenantId/:complaintId", studentComplaintController.getComplaintDetail.bind(studentComplaintController));

export default router;