// frontend/src/services/recurringService.ts

import axios from 'axios';

const BASE = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}`;
const RECURRING_URL = `${BASE}/api/recurring-payments`;

/** 
 * Raw shape of what PG returns (DECIMAL as string)
 */
interface RecurringPaymentRaw {
    recurring_id: number;
    amount: string;            // comes back as string from Postgres
    payment_name: string;
    frequency: string;
    next_due_date: string;
}

/**
 * Coerced shape your UI actually wants
 */
export interface RecurringPayment {
    recurring_id: number;
    amount: number;            // now a true number
    payment_name: string;
    frequency: string;
    next_due_date: string;
}

/**
 * Map raw → coerced
 */
function normalize(r: RecurringPaymentRaw): RecurringPayment {
    return {
        ...r,
        amount: parseFloat(r.amount),
    };
}

/** GET all */
export async function fetchRecurringPayments(): Promise<RecurringPayment[]> {
    const res = await axios.get<{ recurringPayments: RecurringPaymentRaw[] }>(RECURRING_URL);
    return res.data.recurringPayments.map(normalize);
}

/** POST new */
export async function createRecurringPayment(data: {
    amount: number;
    payment_name: string;
    frequency: string;
    next_due_date: string;
}): Promise<RecurringPayment> {
    const res = await axios.post<{ recurring: RecurringPaymentRaw }>(RECURRING_URL, data);
    return normalize(res.data.recurring);
}

/** PUT existing */
export async function updateRecurringPayment(
    id: number,
    data: {
        amount: number;
        payment_name: string;
        frequency: string;
        next_due_date: string;
    }
): Promise<RecurringPayment> {
    const res = await axios.put<{ updated: RecurringPaymentRaw }>(`${RECURRING_URL}/${id}`, data);
    return normalize(res.data.updated);
}

/** DELETE */
export async function deleteRecurringPayment(id: number): Promise<void> {
    await axios.delete(`${RECURRING_URL}/${id}`);
}
