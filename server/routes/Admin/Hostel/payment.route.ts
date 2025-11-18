import { Router } from 'express';
import {
  recordPayment,
  getPaymentHistory,
  generatePaymentDues,
} from '../../../controllers/Admin/Hostel/payment.controller.ts';
import { authenticateToken } from '../../../middleware/auth.middleware.ts';
import { requireRole } from '../../../middleware/role.middleware.ts';
import { verifyTenant } from '../../../middleware/tenant.middleware.ts';

const router = Router();

router.use(authenticateToken);
router.use(verifyTenant);

router.post('/record', requireRole(['ADMIN', 'WARDEN']), recordPayment);
router.get('/history', requireRole(['ADMIN', 'WARDEN']), getPaymentHistory);
router.post('/generate-dues', requireRole(['ADMIN']), generatePaymentDues);

export default router;