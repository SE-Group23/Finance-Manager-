// src/routes/contactRoutes.ts
import { Router } from 'express';
import { submitContactForm } from '../controllers/contactController';

const router = Router();

router.post('/submit', submitContactForm);

export default router;
