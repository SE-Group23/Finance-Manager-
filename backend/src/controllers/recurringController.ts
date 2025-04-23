// backend/src/controllers/recurringController.ts

import { Request, Response, NextFunction, RequestHandler } from 'express';
import { pool } from '../db';

/**
 * Helper to compute a Date 24h before the given timestamp.
 */
function computeReminderDate(due: string): Date {
    const dueDate = new Date(due);
    return new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);
}

/**
 * UC-7 Main Flow: Create a recurring payment and schedule a reminder.
 */
export const createRecurringPayment: RequestHandler =
    async (req, res, next) => {
        const userId = (req as any).userId as number;
        const { amount, payment_name, frequency, next_due_date } = req.body;

        if (!amount || !payment_name || !frequency || !next_due_date) {
            res.status(400).json({ error: 'Missing required fields.' });
            return;
        }

        try {
            // 1) Insert into recurring_payments
            const insertText = `
        INSERT INTO recurring_payments
          (user_id, amount, payment_name, frequency, next_due_date)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *`;
            const { rows } = await pool.query(insertText, [
                userId,
                amount,
                payment_name,
                frequency,
                next_due_date,
            ]);
            const recurring = rows[0];

            // 2) Schedule a reminder 24h before due date
            const reminderDate = computeReminderDate(next_due_date);
            const eventTitle = `Reminder: ${payment_name}`;
            await pool.query(
                `INSERT INTO calendar_events
           (user_id, event_title, event_date, event_type)
         VALUES ($1,$2,$3,'recurring_payment')`,
                [userId, eventTitle, reminderDate]
            );

            res.status(201).json({ recurring });
        } catch (err) {
            console.error('createRecurringPayment error', err);
            res.status(500).json({ error: 'Server error.' });
        }
    };

/**
 * UC-7 Alternate Flow: Update a recurring payment and re-schedule its reminder.
 */
export const updateRecurringPayment: RequestHandler =
    async (req, res, next) => {
        const userId = (req as any).userId as number;
        const recurringId = Number(req.params.id);
        const { amount, payment_name, frequency, next_due_date } = req.body;

        try {
            // 1) Verify it exists
            const existing = await pool.query(
                `SELECT payment_name
           FROM recurring_payments
          WHERE recurring_id=$1 AND user_id=$2`,
                [recurringId, userId]
            );
            if (existing.rows.length === 0) {
                res.status(404).json({ error: 'Not found.' });
                return;
            }
            const oldName = existing.rows[0].payment_name;

            // 2) Update the profile
            const updateText = `
        UPDATE recurring_payments
        SET amount=$1, payment_name=$2, frequency=$3, next_due_date=$4
        WHERE recurring_id=$5 AND user_id=$6
        RETURNING *`;
            const { rows } = await pool.query(updateText, [
                amount,
                payment_name,
                frequency,
                next_due_date,
                recurringId,
                userId,
            ]);
            const updated = rows[0];

            // 3) Remove old reminder
            await pool.query(
                `DELETE FROM calendar_events
           WHERE user_id=$1
             AND event_title=$2
             AND event_type='recurring_payment'`,
                [userId, `Reminder: ${oldName}`]
            );

            // 4) Insert new reminder
            const reminderDate = computeReminderDate(next_due_date);
            await pool.query(
                `INSERT INTO calendar_events
           (user_id, event_title, event_date, event_type)
         VALUES ($1,$2,$3,'recurring_payment')`,
                [userId, `Reminder: ${payment_name}`, reminderDate]
            );

            res.json({ updated });
        } catch (err) {
            console.error('updateRecurringPayment error', err);
            res.status(500).json({ error: 'Server error.' });
        }
    };

/**
 * UC-7 Supporting: List all recurring payments for the logged-in user.
 */
export const getRecurringPayments: RequestHandler =
    async (req, res, next) => {
        const userId = (req as any).userId as number;

        try {
            const { rows } = await pool.query(
                `SELECT * FROM recurring_payments
           WHERE user_id=$1
         ORDER BY next_due_date`,
                [userId]
            );
            res.json({ recurringPayments: rows });
        } catch (err) {
            console.error('getRecurringPayments error', err);
            res.status(500).json({ error: 'Server error.' });
        }
    };

/**
 * UC-7 Supporting: Delete a recurring payment and its reminder.
 */
export const deleteRecurringPayment: RequestHandler =
    async (req, res, next) => {
        const userId = (req as any).userId as number;
        const recurringId = Number(req.params.id);

        try {
            // 1) Fetch to know the name
            const { rows } = await pool.query(
                `SELECT payment_name
           FROM recurring_payments
          WHERE recurring_id=$1 AND user_id=$2`,
                [recurringId, userId]
            );
            if (rows.length === 0) {
                res.status(404).json({ error: 'Not found.' });
                return;
            }
            const name = rows[0].payment_name;

            // 2) Delete profile
            await pool.query(
                `DELETE FROM recurring_payments
           WHERE recurring_id=$1 AND user_id=$2`,
                [recurringId, userId]
            );

            // 3) Delete its reminder
            await pool.query(
                `DELETE FROM calendar_events
           WHERE user_id=$1
             AND event_title=$2
             AND event_type='recurring_payment'`,
                [userId, `Reminder: ${name}`]
            );

            res.json({ message: 'Deleted.' });
        } catch (err) {
            console.error('deleteRecurringPayment error', err);
            res.status(500).json({ error: 'Server error.' });
        }
    };
