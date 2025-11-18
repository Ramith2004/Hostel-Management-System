import { Router } from 'express';
import {
  createAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} from '../../../controllers/Admin/Hostel/announcement.controller.ts';
import { authenticateToken } from '../../../middleware/auth.middleware.ts';
import { requireRole } from '../../../middleware/role.middleware.ts';
import { verifyTenant } from '../../../middleware/tenant.middleware.ts';

const router = Router();

router.use(authenticateToken);
router.use(verifyTenant);

router.post('/', requireRole(['ADMIN', 'WARDEN']), createAnnouncement);
router.get('/', getAllAnnouncements); // All authenticated users can view
router.put('/:announcementId', requireRole(['ADMIN', 'WARDEN']), updateAnnouncement);
router.delete('/:announcementId', requireRole(['ADMIN']), deleteAnnouncement);

export default router;