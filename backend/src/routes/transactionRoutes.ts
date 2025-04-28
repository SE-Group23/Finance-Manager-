// backend/src/routes/transactionRoutes.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { 
    createTransaction, 
    getTransactions, 
    getTransactionById, 
    getTransactionsByDateRange,
    getTransactionsByType,  
    updateTransaction, 
    deleteTransaction,
    getUserCategories
  } from '../controllers/transactionController';

const router = Router();

router.post('/', requireAuth, createTransaction);

router.get('/', requireAuth, getTransactions);

router.get('/date-range', requireAuth, getTransactionsByDateRange);

router.get('/type', requireAuth, getTransactionsByType);

router.get('/categories', requireAuth, getUserCategories);

router.get('/:id', requireAuth, getTransactionById);

router.put('/:id', requireAuth, updateTransaction);

router.delete('/:id', requireAuth, deleteTransaction);

export default router;