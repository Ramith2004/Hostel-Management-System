import { Router } from 'express';
import {
  registerVisitor,
  recordVisitorExit,
  getVisitorHistory,
} from '../../../controllers/Admin/Hostel/visitormanagement.controller.ts';
import { authenticateToken } from '../../../middleware/auth.middleware.ts';
import { requireRole } from '../../../middleware/role.middleware.ts';
import { verifyTenant } from '../../../middleware/tenant.middleware.ts';

const router = Router();

router.use(authenticateToken);
router.use(verifyTenant);

router.post('/register', requireRole(['ADMIN', 'WARDEN', 'FLOOR_MANAGER']), registerVisitor);
router.patch('/:visitorId/exit', requireRole(['ADMIN', 'WARDEN', 'FLOOR_MANAGER']), recordVisitorExit);
router.get('/history', requireRole(['ADMIN', 'WARDEN']), getVisitorHistory);

export default router;