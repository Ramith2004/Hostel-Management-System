import express from 'express';
import {
  createAllocation,
  getAllocationById,
  getAllAllocations,
  updateAllocation,
  deallocateStudent,
  bulkAllocate,
  getStudentAllocationHistory
} from '../../controllers/Admin/allocation.controller.ts';
import { authenticateToken } from '../../middleware/auth.middleware.ts';
import { requireRole } from '../../middleware/role.middleware.ts';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken, requireRole(['ADMIN']));

router.post('/', createAllocation);
router.post('/bulk', bulkAllocate);
router.get('/', getAllAllocations);
router.get('/:allocationId', getAllocationById);
router.put('/:allocationId', updateAllocation);
router.delete('/:allocationId', deallocateStudent);
router.get('/student/:studentId/history', getStudentAllocationHistory);

export default router;