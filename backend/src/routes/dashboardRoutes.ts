import express from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();

router.use(requireAuth);
router.get('/', getDashboardData);

export default router;