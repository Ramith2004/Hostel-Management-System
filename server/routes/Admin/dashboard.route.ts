import express from 'express';
import {
  getDashboardMetrics,
  getOccupancyTrend,
  getComplaintTrend
} from '../../controllers/Admin/dashboard.controller.ts';
import { authenticateToken } from '../../middleware/auth.middleware.ts';
import { requireRole } from '../../middleware/role.middleware.ts';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken, requireRole(['ADMIN']));

router.get('/metrics', getDashboardMetrics);
router.get('/occupancy-trend', getOccupancyTrend);
router.get('/complaint-trend', getComplaintTrend);

export default router;