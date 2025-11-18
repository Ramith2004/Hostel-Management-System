import { Router } from 'express';
import {
  createAmenity,
  getAllAmenities,
  getAmenityById,
  updateAmenity,
  deleteAmenity,
  addAmenityToRoom,
  removeAmenityFromRoom,
} from '../../../controllers/Admin/Hostel/roomamenity.controller.ts';
import { authenticateToken } from '../../../middleware/auth.middleware.ts';
import { requireRole } from '../../../middleware/role.middleware.ts';
import { verifyTenant } from '../../../middleware/tenant.middleware.ts';

const router = Router();

router.use(authenticateToken);
router.use(verifyTenant);

router.post('/', requireRole(['ADMIN']), createAmenity);
router.get('/', requireRole(['ADMIN', 'WARDEN', 'STUDENT']), getAllAmenities);
router.get('/:amenityId', requireRole(['ADMIN', 'WARDEN']), getAmenityById);
router.put('/:amenityId', requireRole(['ADMIN']), updateAmenity);
router.delete('/:amenityId', requireRole(['ADMIN']), deleteAmenity);

router.post('/room/add', requireRole(['ADMIN']), addAmenityToRoom);
router.delete('/room/remove/:mappingId', requireRole(['ADMIN']), removeAmenityFromRoom);

export default router;