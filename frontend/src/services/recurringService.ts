import axios from "axios"

const BASE = `${import.meta.env.VITE_API_HOST}`
const RECURRING_URL = `${BASE}/api/recurring-payments`

interface RecurringPaymentRaw {
  recurring_id: number
  amount: string
  payment_name: string
  frequency: string
  next_due_date: string
}

export interface RecurringPayment {
  recurring_id: number
  amount: number
  payment_name: string
  frequency: string
  next_due_date: string
}

function normalize(r: RecurringPaymentRaw): RecurringPayment {
  return {
    ...r,
    amount: Number.parseFloat(r.amount),
  }
}

export async function fetchRecurringPayments(): Promise<RecurringPayment[]> {
  const token = sessionStorage.getItem("token")
  const res = await axios.get<{ recurringPayments: RecurringPaymentRaw[] }>(RECURRING_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data.recurringPayments.map(normalize)
}

export async function createRecurringPayment(data: {
  amount: number
  payment_name: string
  frequency: string
  next_due_date: string
}): Promise<RecurringPayment> {
  const token = sessionStorage.getItem("token")
  const res = await axios.post<{ recurring: RecurringPaymentRaw }>(RECURRING_URL, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return normalize(res.data.recurring)
}

export async function updateRecurringPayment(
  id: number,
  data: {
    amount: number
    payment_name: string
    frequency: string
    next_due_date: string
  },
): Promise<RecurringPayment> {
  const token = sessionStorage.getItem("token")
  const res = await axios.put<{ updated: RecurringPaymentRaw }>(`${RECURRING_URL}/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return normalize(res.data.updated)
}

export async function deleteRecurringPayment(id: number): Promise<void> {
  const token = sessionStorage.getItem("token")
  await axios.delete(`${RECURRING_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
