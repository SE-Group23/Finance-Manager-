// backend/src/routes/dashboardRoutes.ts
import express from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();

// authentication middleware to all dashboard routes
router.use(requireAuth);

// Get dashboard data
router.get('/', getDashboardData);

export default router;