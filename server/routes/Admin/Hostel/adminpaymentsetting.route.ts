import { Router } from 'express';
import {
  getFeeSettings,
  createInitialFeeSettings,
  updateFeeSettings,
} from '../../../controllers/Admin/Hostel/paymentsetting.controller.ts';
import { authenticateToken } from '../../../middleware/auth.middleware.ts';
import { requireRole } from '../../../middleware/role.middleware.ts';
import { verifyTenant } from '../../../middleware/tenant.middleware.ts';

const router = Router();

router.use(authenticateToken);
router.use(verifyTenant);

// Get fee settings
router.get('/', requireRole(['ADMIN', 'WARDEN']), getFeeSettings);

// Create initial fee settings
router.post('/', requireRole(['ADMIN']), createInitialFeeSettings);

// Update fee settings
router.put('/', requireRole(['ADMIN']), updateFeeSettings);

export default router;