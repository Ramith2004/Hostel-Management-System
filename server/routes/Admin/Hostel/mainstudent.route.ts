import { Router } from 'express';
import complaintRoutes from './studentcomplain.route.ts';

const router = Router();

router.use('/complaints', complaintRoutes);

export default router;