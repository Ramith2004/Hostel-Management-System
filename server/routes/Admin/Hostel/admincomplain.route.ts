import { Router } from 'express';
import {
  getAllComplaints,
  updateComplaintStatus,
  getComplaintStats,
} from '../../../controllers/Admin/Hostel/admincomplain.controller.ts';
import { authenticateToken } from '../../../middleware/auth.middleware.ts';
import { requireRole } from '../../../middleware/role.middleware.ts';
import { verifyTenant } from '../../../middleware/tenant.middleware.ts';

const router = Router();

router.use(authenticateToken);
router.use(verifyTenant);

router.get('/', requireRole(['ADMIN', 'WARDEN']), getAllComplaints);
router.patch('/:complaintId/status', requireRole(['ADMIN', 'WARDEN']), updateComplaintStatus);
router.get('/stats', requireRole(['ADMIN', 'WARDEN']), getComplaintStats);

export default router;