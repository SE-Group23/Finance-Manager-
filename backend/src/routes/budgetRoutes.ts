// backend/src/routes/budgetRoutes.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { getBudget, setBudget } from '../controllers/budgetController';

const router = Router();

router.get('/', requireAuth, getBudget);
router.post('/', requireAuth, setBudget);

export default router;
