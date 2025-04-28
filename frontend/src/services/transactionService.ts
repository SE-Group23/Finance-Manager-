import axios from "axios"

const API_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/transactions`

export interface Transaction {
  transaction_id: number
  amount: number
  category: string
  transaction_type: "credit" | "debit"
  vendor?: string
  note?: string
  transaction_date: string
}

export interface TransactionInput {
  amount: number
  category: string
  vendor?: string
  note?: string
  transactionDate?: string
  transaction_type: "credit" | "debit"
}

export const getTransactions = async (): Promise<Transaction[]> => {
  const token = sessionStorage.getItem("token")
  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const createTransaction = async (transaction: TransactionInput): Promise<Transaction> => {
  const token = sessionStorage.getItem("token")
  try {
    const response = await axios.post(API_URL, transaction, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateTransaction = async (id: number, transaction: TransactionInput): Promise<Transaction> => {
  const token = sessionStorage.getItem("token")
  try {
    const response = await axios.put(`${API_URL}/${id}`, transaction, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteTransaction = async (id: number): Promise<void> => {
  const token = sessionStorage.getItem("token")
  try {
    await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (error) {
    throw error
  }
}
