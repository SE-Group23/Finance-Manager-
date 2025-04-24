// backend/src/routes/chatbotRoutes.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { getChatbotResponse } from '../controllers/chatbotController';

const router = Router();

router.post('/', requireAuth, getChatbotResponse);

export default router;
