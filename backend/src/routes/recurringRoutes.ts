import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import {
    createRecurringPayment,
    getRecurringPayments,
    updateRecurringPayment,
    deleteRecurringPayment,
} from '../controllers/recurringController';

const router = Router();

// all routes here require a valid JWT
router.use(requireAuth);

// UC-7 Main and Alternate Flows
router.post('/', createRecurringPayment);
router.get('/', getRecurringPayments);
router.put('/:id', updateRecurringPayment);
router.delete('/:id', deleteRecurringPayment);

export default router;
