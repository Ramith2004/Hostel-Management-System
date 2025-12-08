import { Router } from 'express';
import {
  getPaymentStats,
  getDashboardData,
  getPaymentHistory,
  getOutstandingDues,
  sendPaymentReminders,
  getPaymentReports,
  getPaymentSettings,
  updatePaymentSettings,
} from '../../controllers/Admin/adminpaymentdashboard.controller.ts';
import { authenticateToken } from '../../middleware/auth.middleware.ts';
import { verifyTenant } from '../../middleware/tenant.middleware.ts';
import { requireRole } from '../../middleware/role.middleware.ts';

const router = Router();

// Apply middleware
router.use(authenticateToken);
router.use(verifyTenant);

// All routes require ADMIN or WARDEN role
router.use(requireRole(['ADMIN', 'WARDEN']));

// Stats endpoints
router.get('/stats', getPaymentStats);
router.get('/dashboard-data', getDashboardData);

// History endpoints
router.get('/history', getPaymentHistory);

// Dues endpoints
router.get('/dues', getOutstandingDues);
router.post('/send-reminders', sendPaymentReminders);

// Reports endpoints
router.get('/reports', getPaymentReports);

// Settings endpoints
router.get('/settings', getPaymentSettings);
router.post('/settings', requireRole(['ADMIN']), updatePaymentSettings);

export default router;