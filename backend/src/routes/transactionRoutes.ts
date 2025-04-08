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

// Create a new transaction
router.post('/', requireAuth, createTransaction);

// Get all transactions for the user
router.get('/', requireAuth, getTransactions);

// Get transactions within a specified date range
router.get('/date-range', requireAuth, getTransactionsByDateRange);

// Get transactions filtered by type (credit or debit)
router.get('/type', requireAuth, getTransactionsByType);

// Get all unique categories used by the user
router.get('/categories', requireAuth, getUserCategories);

// Get a single transaction by its ID
router.get('/:id', requireAuth, getTransactionById);

// Update a transaction
router.put('/:id', requireAuth, updateTransaction);

// Delete a transaction
router.delete('/:id', requireAuth, deleteTransaction);

export default router;
