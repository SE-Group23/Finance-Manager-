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


router.post('/', requireAuth, createTransaction);

router.get('/', requireAuth, getTransactions);

router.put('/:id', requireAuth, updateTransaction);

router.delete('/:id', requireAuth, deleteTransaction);

router.get("/summary", getSummary)



export default router;

