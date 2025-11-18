import { Router } from 'express';
import {
  createComplaint,
  getMyComplaints,
  addComplaintComment,
} from '../../../controllers/Admin/Hostel/studentcomplain.controller.ts';
import { authenticateToken } from '../../../middleware/auth.middleware.ts';
import { requireRole } from '../../../middleware/role.middleware.ts'
import { verifyTenant } from '../../../middleware/tenant.middleware.ts'

const router = Router();

router.use(authenticateToken);
router.use(verifyTenant);

router.post('/', requireRole(['STUDENT']), createComplaint);
router.get('/my-complaints', requireRole(['STUDENT']), getMyComplaints);
router.post('/:complaintId/comment', requireRole(['STUDENT', 'ADMIN', 'WARDEN']), addComplaintComment);

export default router;