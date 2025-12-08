import { Router } from 'express';
import {
  recordPayment,
  getPaymentHistory,
  generatePaymentDues,
  initiateRazorpayHostelPayment,
  verifyRazorpayHostelPayment,
  checkPaymentStatus,
} from '../../../controllers/Admin/Hostel/payment.controller.ts';
import { authenticateToken } from '../../../middleware/auth.middleware.ts';
import { requireRole } from '../../../middleware/role.middleware.ts';
import { verifyTenant } from '../../../middleware/tenant.middleware.ts';

const router = Router();

router.use(authenticateToken);
router.use(verifyTenant);

// Existing routes
router.post('/record', requireRole(['ADMIN', 'WARDEN']), recordPayment);
router.get('/history', requireRole(['ADMIN', 'WARDEN']), getPaymentHistory);
router.post('/generate-dues', requireRole(['ADMIN']), generatePaymentDues);

// Razorpay routes
router.post('/razorpay/initiate', requireRole(['ADMIN']), initiateRazorpayHostelPayment);
router.post('/razorpay/verify', requireRole(['ADMIN']), verifyRazorpayHostelPayment);

// NEW: Check payment status
router.get('/:paymentId/status', requireRole(['ADMIN', 'WARDEN']), checkPaymentStatus);

export default router;