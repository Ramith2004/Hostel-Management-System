import { Router } from "express";
import { adminComplaintResolutionController } from "../../../controllers/Admin/Hostel/adminComplaintResolution.controller.ts";
import { authenticateToken } from "../../../middleware/auth.middleware.ts";
import { requireRole } from "../../../middleware/role.middleware.ts";
import { verifyTenant } from "../../../middleware/tenant.middleware.ts";

const router = Router();

// Apply middleware
router.use(authenticateToken);
router.use(verifyTenant);
router.use(requireRole(["ADMIN", "WARDEN"]));

// IMPORTANT: Specific routes MUST come BEFORE dynamic routes
// Static routes first (these should match exact strings)
router.get("/:tenantId/all", adminComplaintResolutionController.getAllComplaints.bind(adminComplaintResolutionController));
router.get("/:tenantId/stats", adminComplaintResolutionController.getComplaintStats.bind(adminComplaintResolutionController));
router.get("/:tenantId/by-category", adminComplaintResolutionController.getComplaintsByCategory.bind(adminComplaintResolutionController));
router.get("/:tenantId/report", adminComplaintResolutionController.getComplaintReport.bind(adminComplaintResolutionController));

// Dynamic routes last (these match any string)
router.get("/:tenantId/:complaintId/comments", adminComplaintResolutionController.getComments.bind(adminComplaintResolutionController));
router.post("/:tenantId/:complaintId/comments", adminComplaintResolutionController.addComment.bind(adminComplaintResolutionController));

// Most generic dynamic route MUST be last
router.get("/:tenantId/:complaintId", adminComplaintResolutionController.getComplaintDetail.bind(adminComplaintResolutionController));
router.patch("/:tenantId/:complaintId/status", adminComplaintResolutionController.updateComplaintStatus.bind(adminComplaintResolutionController));
router.patch("/:tenantId/:complaintId/resolve", adminComplaintResolutionController.resolveComplaint.bind(adminComplaintResolutionController));

export default router;