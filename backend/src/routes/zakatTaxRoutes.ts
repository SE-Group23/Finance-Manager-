// backend/src/routes/zakatTaxRoutes.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { getZakatAndTaxSummary } from '../controllers/zakatTaxController';

const router = Router();

// Secure the GET endpoint with authentication
router.get('/', requireAuth, getZakatAndTaxSummary);

export default router;
