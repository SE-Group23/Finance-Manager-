import { Request, Response, NextFunction, RequestHandler } from 'express';
import { pool } from '../db';

/**
 * GET /api/calendar
 * UC-10 Main Flow Step 2: retrieve all calendar events (recurring reminders + custom deadlines).
 */
export const getCalendarEvents: RequestHandler = async (req, res) => {
    const userId = (req as any).userId as number;
    try {
        const { rows } = await pool.query(
            `SELECT event_id, event_title, event_date, event_type
         FROM calendar_events
        WHERE user_id = $1
        ORDER BY event_date`,
            [userId]
        );
        res.json({ events: rows });
    } catch (err) {
        console.error('getCalendarEvents error', err);
        res.status(500).json({ error: 'Server error.' });
    }
};

/**
 * POST /api/calendar
 * UC-10 Alternate: create a new custom financial deadline.
 */
export const createCalendarEvent: RequestHandler = async (req, res) => {
    const userId = (req as any).userId as number;
    const { event_title, event_date, event_type } = req.body;

    if (!event_title || !event_date) {
        res.status(400).json({ error: 'Title and date are required.' });
        return;
    }

    try {
        const insertText = `
      INSERT INTO calendar_events
        (user_id, event_title, event_date, event_type)
      VALUES ($1, $2, $3, $4)
      RETURNING event_id, event_title, event_date, event_type`;
        const { rows } = await pool.query(insertText, [
            userId,
            event_title,
            event_date,
            event_type || 'custom',
        ]);
        res.status(201).json({ event: rows[0] });
    } catch (err) {
        console.error('createCalendarEvent error', err);
        res.status(500).json({ error: 'Server error.' });
    }
};

/**
 * PUT /api/calendar/:id
 * UC-10 Main Flow Step 3 (edit events): update title/date/type of an existing event.
 */
export const updateCalendarEvent: RequestHandler = async (req, res) => {
    const userId = (req as any).userId as number;
    const eventId = Number(req.params.id);
    const { event_title, event_date, event_type } = req.body;

    try {
        // ensure the event exists and belongs to this user
        const { rows: existing } = await pool.query(
            `SELECT event_title, event_date, event_type
         FROM calendar_events
        WHERE event_id = $1 AND user_id = $2`,
            [eventId, userId]
        );
        if (existing.length === 0) {
            res.status(404).json({ error: 'Not found.' });
            return;
        }

        // apply updates (fall back to old values when fields are missing)
        const updatedTitle = event_title ?? existing[0].event_title;
        const updatedDate = event_date ?? existing[0].event_date;
        const updatedType = event_type ?? existing[0].event_type;

        const updateText = `
      UPDATE calendar_events
         SET event_title = $1
           , event_date  = $2
           , event_type  = $3
       WHERE event_id = $4 AND user_id = $5
       RETURNING event_id, event_title, event_date, event_type`;
        const { rows } = await pool.query(updateText, [
            updatedTitle,
            updatedDate,
            updatedType,
            eventId,
            userId,
        ]);

        res.json({ event: rows[0] });
    } catch (err) {
        console.error('updateCalendarEvent error', err);
        res.status(500).json({ error: 'Server error.' });
    }
};

/**
 * DELETE /api/calendar/:id
 * UC-10 Alternate Flow: remove an event.
 */
export const deleteCalendarEvent: RequestHandler = async (req, res) => {
    const userId = (req as any).userId as number;
    const eventId = Number(req.params.id);

    try {
        const { rowCount } = await pool.query(
            `DELETE FROM calendar_events
         WHERE event_id = $1 AND user_id = $2`,
            [eventId, userId]
        );
        if (rowCount === 0) {
            res.status(404).json({ error: 'Not found.' });
            return;
        }
        res.json({ message: 'Deleted.' });
    } catch (err) {
        console.error('deleteCalendarEvent error', err);
        res.status(500).json({ error: 'Server error.' });
    }
};
