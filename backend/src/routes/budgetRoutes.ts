import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import {
    getBudget,
    setBudget,
    deleteBudget
} from '../controllers/budgetController';

const router = Router();

router.get('/', requireAuth, getBudget);

router.post('/', requireAuth, setBudget);

router.delete('/:id', requireAuth, deleteBudget);

export default router;
