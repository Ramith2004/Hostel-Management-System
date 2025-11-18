import { Router } from 'express';
import { register, login } from '../controllers/Auth/auth.controller.ts';
import { 
  addOrganizationDetails, 
  addAdminProfileDetails, 
  processPayment, 
  completeOnboarding 
} from '../controllers/Auth/onboarding.controller.ts';
import { authenticateToken } from '../middleware/auth.middleware.ts'; // You need to create this

const router = Router();

// Auth endpoints
router.post('/register', register);
router.post('/login', login);

// Onboarding endpoints (protected)
router.post('/onboarding/organization', authenticateToken, addOrganizationDetails);
router.post('/onboarding/admin-profile', authenticateToken, addAdminProfileDetails);
router.post('/onboarding/payment', authenticateToken, processPayment);
router.post('/onboarding/complete', authenticateToken, completeOnboarding);

export default router;