import { Router } from 'express';
import {
  getStudentDues,
  getPaymentHistory,
  initiateStudentPayment,
  verifyStudentPayment,
  checkStudentPaymentStatus,
} from '../../controllers/Student/studentpayment.controller.js';
import { authenticateToken, authorizeRole } from '../../middleware/auth.middleware.js'; // ✅ Use auth.middleware
import { verifyTenant } from '../../middleware/tenant.middleware.js'; // ✅ Keep tenant verification

const router = Router();

// ✅ Apply middleware in correct order
router.use(authenticateToken); // Extracts userId, role, tenantId from token
router.use(authorizeRole(['STUDENT'])); // Verify role is STUDENT
router.use(verifyTenant); // Verify tenant exists and is not suspended

// ✅ Routes AFTER all middleware
router.get('/dues', getStudentDues);
router.get('/history', getPaymentHistory);
router.post('/initiate', initiateStudentPayment);
router.post('/verify', verifyStudentPayment);
router.get('/status/:paymentId', checkStudentPaymentStatus);

export default router;