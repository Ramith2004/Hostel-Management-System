import { Router } from 'express';
import {
  createBuilding,
  getAllBuildings,
  getBuildingById,
  updateBuilding,
  deleteBuilding,
  getBuildingStats,
} from '../../../controllers/Admin/Hostel/building.controller.ts';
import { authenticateToken } from '../../../middleware/auth.middleware.ts';
import { requireRole } from '../../../middleware/role.middleware.ts';
import { verifyTenant } from '../../../middleware/tenant.middleware.ts';

const router = Router();

// All routes require authentication and tenant verification
router.use(authenticateToken);
router.use(verifyTenant);

// Admin-only routes
router.post('/', requireRole(['ADMIN']), createBuilding);
router.get('/', requireRole(['ADMIN', 'WARDEN']), getAllBuildings);
router.get('/:buildingId', requireRole(['ADMIN', 'WARDEN']), getBuildingById);
router.put('/:buildingId', requireRole(['ADMIN']), updateBuilding);
router.delete('/:buildingId', requireRole(['ADMIN']), deleteBuilding);
router.get('/:buildingId/stats', requireRole(['ADMIN', 'WARDEN']), getBuildingStats);

export default router;