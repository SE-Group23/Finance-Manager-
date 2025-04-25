// backend/src/routes/transactionRoutes.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { 
  createTransaction, 
  getTransactions, 
  updateTransaction, 
  deleteTransaction,
  getSummary
} from '../controllers/transactionController';

const router = Router();

// Create a new transaction
router.post('/', requireAuth, createTransaction);

// Get all transactions for the user
router.get('/', requireAuth, getTransactions);

// Update a transaction
router.put('/:id', requireAuth, updateTransaction);

// Delete a transaction
router.delete('/:id', requireAuth, deleteTransaction);

router.get("/summary", getSummary)



export default router;

