import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import {
    getCalendarEvents,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
} from '../controllers/calendarController';

const router = Router();

// all calendar endpoints require authentication
router.use(requireAuth);

router.get('/', getCalendarEvents);
router.post('/', createCalendarEvent);
router.put('/:id', updateCalendarEvent);
router.delete('/:id', deleteCalendarEvent);

export default router;
