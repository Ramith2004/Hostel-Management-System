import { Router } from 'express';
import {
  createFloor,
  getFloorsByBuilding,
  getFloorById,
  updateFloor,
  deleteFloor,
  getFloorStats,
} from '../../../controllers/Admin/Hostel/floor.controller.ts';
import { authenticateToken } from '../../../middleware/auth.middleware.ts';
import { requireRole } from '../../../middleware/role.middleware.ts';
import { verifyTenant } from '../../../middleware/tenant.middleware.ts';

const router = Router();

router.use(authenticateToken);
router.use(verifyTenant);

router.post('/', requireRole(['ADMIN']), createFloor);
router.get('/building/:buildingId', requireRole(['ADMIN', 'WARDEN', 'FLOOR_MANAGER']), getFloorsByBuilding);
router.get('/:floorId', requireRole(['ADMIN', 'WARDEN', 'FLOOR_MANAGER']), getFloorById);
router.put('/:floorId', requireRole(['ADMIN']), updateFloor);
router.delete('/:floorId', requireRole(['ADMIN']), deleteFloor);
router.get('/:floorId/stats', requireRole(['ADMIN', 'WARDEN', 'FLOOR_MANAGER']), getFloorStats);

export default router;