import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { getZakatAndTaxSummary } from '../controllers/zakatTaxController';

const router = Router();

router.get('/', requireAuth, getZakatAndTaxSummary);

export default router;
