import { RequestHandler } from 'express';
import { pool } from '../db';

function computeReminderDate(due: string): Date {
    const d = new Date(due);
    return new Date(d.getTime() - 24 * 60 * 60 * 1000);
}

function addInterval(date: Date, frequency: string): Date {
    const d = new Date(date);
    switch (frequency) {
        case 'daily':
            d.setDate(d.getDate() + 1);
            break;
        case 'weekly':
            d.setDate(d.getDate() + 7);
            break;
        case 'monthly':
            d.setMonth(d.getMonth() + 1);
            break;
        case 'yearly':
            d.setFullYear(d.getFullYear() + 1);
            break;
        default:
            throw new Error(`Unknown frequency: ${frequency}`);
    }
    return d;
}

async function scheduleDueDates(
    userId: number,
    paymentName: string,
    startDate: string,
) {
    const first = new Date(startDate);
    const horizon = new Date();
    horizon.setFullYear(horizon.getFullYear() + 1);

    let occ = new Date(first);
    while (occ <= horizon) {
        await pool.query(
            `INSERT INTO calendar_events
         (user_id, event_title, event_date, event_type)
       VALUES ($1, $2, $3, 'recurring_due')`,
            [userId, paymentName, occ],
        );
        occ = addInterval(occ, '');
    }
}

export const createRecurringPayment: RequestHandler = async (req, res) => {
    const userId = (req as any).userId as number;
    const { amount, payment_name, frequency, next_due_date } = req.body;
    if (!amount || !payment_name || !frequency || !next_due_date) {
        res.status(400).json({ error: 'Missing required fields.' });
        return;
    }

    try {
        const { rows } = await pool.query(
            `INSERT INTO recurring_payments
         (user_id, amount, payment_name, frequency, next_due_date)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
            [userId, amount, payment_name, frequency, next_due_date],
        );
        const recurring = rows[0];

        const reminderDate = computeReminderDate(next_due_date);
        await pool.query(
            `INSERT INTO calendar_events
         (user_id, event_title, event_date, event_type)
       VALUES ($1,$2,$3,'recurring_payment')`,
            [userId, `Reminder: ${payment_name}`, reminderDate],
        );

        await (async () => {
            const first = new Date(next_due_date);
            const horizon = new Date();
            horizon.setFullYear(horizon.getFullYear() + 1);
            let occ = new Date(first);
            while (occ <= horizon) {
                await pool.query(
                    `INSERT INTO calendar_events
             (user_id, event_title, event_date, event_type)
           VALUES ($1, $2, $3, 'recurring_due')`,
                    [userId, payment_name, occ],
                );
                occ = addInterval(occ, frequency);
            }
        })();

        res.status(201).json({ recurring });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
};

export const updateRecurringPayment: RequestHandler = async (req, res) => {
    const userId = (req as any).userId as number;
    const recurringId = Number(req.params.id);
    const { amount, payment_name, frequency, next_due_date } = req.body;

    try {
        const { rows: existing } = await pool.query(
            `SELECT payment_name
         FROM recurring_payments
        WHERE recurring_id=$1 AND user_id=$2`,
            [recurringId, userId],
        );
        if (!existing.length) {
            res.status(404).json({ error: 'Not found.' });
            return;
        }
        const oldName = existing[0].payment_name;

        const { rows } = await pool.query(
            `UPDATE recurring_payments
         SET amount=$1, payment_name=$2, frequency=$3, next_due_date=$4
       WHERE recurring_id=$5 AND user_id=$6
       RETURNING *`,
            [amount, payment_name, frequency, next_due_date, recurringId, userId],
        );
        const updated = rows[0];

        await pool.query(
            `DELETE FROM calendar_events
         WHERE user_id=$1
           AND event_title=$2
           AND event_type='recurring_due'
           AND event_date > NOW()`,
            [userId, oldName],
        );

        await pool.query(
            `DELETE FROM calendar_events
         WHERE user_id=$1
           AND event_title=$2
           AND event_type='recurring_payment'
           AND event_date > NOW()`,
            [userId, `Reminder: ${oldName}`],
        );

        const reminderDate = computeReminderDate(next_due_date);
        await pool.query(
            `INSERT INTO calendar_events
         (user_id, event_title, event_date, event_type)
       VALUES ($1,$2,$3,'recurring_payment')`,
            [userId, `Reminder: ${payment_name}`, reminderDate],
        );

        const first = new Date(next_due_date);
        const horizon = new Date();
        horizon.setFullYear(horizon.getFullYear() + 1);
        let occ = new Date(first);
        while (occ <= horizon) {
            await pool.query(
                `INSERT INTO calendar_events
           (user_id, event_title, event_date, event_type)
         VALUES ($1, $2, $3, 'recurring_due')`,
                [userId, payment_name, occ],
            );
            occ = addInterval(occ, frequency);
        }

        res.json({ updated });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
};


export const getRecurringPayments: RequestHandler = async (req, res) => {
    const userId = (req as any).userId as number;
    try {
        const { rows } = await pool.query(
            `SELECT * FROM recurring_payments WHERE user_id=$1 ORDER BY next_due_date`,
            [userId],
        );
        res.json({ recurringPayments: rows });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
};

export const deleteRecurringPayment: RequestHandler = async (req, res) => {
    const userId = (req as any).userId as number;
    const recurringId = Number(req.params.id);

    try {
        const { rows } = await pool.query(
            `SELECT payment_name
         FROM recurring_payments
        WHERE recurring_id=$1 AND user_id=$2`,
            [recurringId, userId],
        );
        if (!rows.length) {
            res.status(404).json({ error: 'Not found.' });
            return;
        }
        const name = rows[0].payment_name;

        await pool.query(
            `DELETE FROM recurring_payments
         WHERE recurring_id=$1 AND user_id=$2`,
            [recurringId, userId],
        );

        await pool.query(
            `DELETE FROM calendar_events
         WHERE user_id=$1
           AND event_title=$2
           AND event_type='recurring_due'
           AND event_date  > NOW()`,
            [userId, name],
        );

        await pool.query(
            `DELETE FROM calendar_events
         WHERE user_id=$1
           AND event_title=$2
           AND event_type='recurring_payment'
           AND event_date > NOW()`,
            [userId, `Reminder: ${name}`],
        );

        res.json({ message: 'Deleted.' });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
};
