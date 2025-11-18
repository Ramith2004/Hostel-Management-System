import { Router } from 'express';
import buildingRoutes from './building.route.ts';
import floorRoutes from './floor.route.ts';
import roomRoutes from './room.route.ts';
import roomAmenityRoutes from './roomamenity.route.ts';
import adminComplaintRoutes from './admincomplain.route.ts';
import maintenanceRoutes from './maintenance.route.ts';
import paymentRoutes from './payment.route.ts';
import visitorRoutes from './visitor.route.ts';
import announcementRoutes from './announcement.route.ts';

const router = Router();

router.use('/buildings', buildingRoutes);
router.use('/floors', floorRoutes);
router.use('/rooms', roomRoutes);
router.use('/amenities', roomAmenityRoutes);
router.use('/complaints', adminComplaintRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/payments', paymentRoutes);
router.use('/visitors', visitorRoutes);
router.use('/announcements', announcementRoutes);

export default router;