import { Router } from 'express';
import {
  createMaintenanceRequest,
  getAllMaintenanceRequests,
  assignMaintenanceRequest,
  updateMaintenanceStatus,
} from '../../../controllers/Admin/Hostel/maintenancerequest.controller.ts';
import { authenticateToken } from '../../../middleware/auth.middleware.ts';
import { requireRole } from '../../../middleware/role.middleware.ts';
import { verifyTenant } from '../../../middleware/tenant.middleware.ts';

const router = Router();

router.use(authenticateToken);
router.use(verifyTenant);

router.post('/', requireRole(['ADMIN', 'WARDEN']), createMaintenanceRequest);
router.get('/', requireRole(['ADMIN', 'WARDEN', 'FLOOR_MANAGER']), getAllMaintenanceRequests);
router.patch('/:requestId/assign', requireRole(['ADMIN', 'WARDEN']), assignMaintenanceRequest);
router.patch('/:requestId/status', requireRole(['ADMIN', 'WARDEN']), updateMaintenanceStatus);

export default router;