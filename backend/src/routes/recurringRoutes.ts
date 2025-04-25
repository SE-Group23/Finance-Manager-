import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import {
    createRecurringPayment,
    getRecurringPayments,
    updateRecurringPayment,
    deleteRecurringPayment,
} from '../controllers/recurringController';

const router = Router();

router.use(requireAuth);

router.post('/', createRecurringPayment);
router.get('/', getRecurringPayments);
router.put('/:id', updateRecurringPayment);
router.delete('/:id', deleteRecurringPayment);

export default router;
