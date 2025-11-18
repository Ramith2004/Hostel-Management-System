import express from 'express';
import { 
  createRoom,
  getRoomById,
  getAllRooms,
  updateRoom,
  deleteRoom,
  bulkCreateRooms,
  getRoomOccupancy,
  getRoomStats,
  getRoomsByFloor,
} from '../../../controllers/Admin/Hostel/room.controller.ts';
import { authenticateToken } from '../../../middleware/auth.middleware.ts';
import { requireRole } from '../../../middleware/role.middleware.ts';
import { verifyTenant } from '../../../middleware/tenant.middleware.ts';

const router = express.Router();

// All routes require authentication, tenant verification, and admin role
router.use(authenticateToken);
router.use(verifyTenant);
router.use(requireRole(['ADMIN', 'WARDEN']));

// Room CRUD operations
router.post('/', createRoom);
router.post('/bulk/create', bulkCreateRooms);
router.get('/occupancy', getRoomOccupancy);
router.get('/', getAllRooms);
router.get('/floor/:floorId', getRoomsByFloor);
router.get('/:roomId', getRoomById);
router.get('/:roomId/stats', getRoomStats);
router.put('/:roomId', updateRoom);
router.delete('/:roomId', deleteRoom);

export default router;