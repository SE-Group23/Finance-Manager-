import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import {
  getBudget,
  setBudget,
  deleteBudget
} from '../controllers/budgetController';

const router = Router();

// GET all budgets for the user
router.get('/', requireAuth, getBudget);

// POST: upsert budgets for a specific month (still possible to store multiple categories)
router.post('/', requireAuth, setBudget);

// DELETE: remove a specific budget by ID
router.delete('/:id', requireAuth, deleteBudget);

export default router;
