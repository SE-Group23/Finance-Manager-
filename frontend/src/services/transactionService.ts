// //frontend/src/services/transactionService.ts

import axios from "axios"

const API_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/transactions`


export interface Transaction {
    transaction_id: number
    user_id: number
    amount: number
    transaction_type: "credit" | "debit"
    vendor?: string
    description?: string
    transaction_date: string
    payment_method?: string
    category_id: number
    category_name: string
  }

export interface NewTransaction {
  user_id: number
  amount: number
  transaction_type: "credit" | "debit"
  category_id: number
  vendor?: string
  description?: string
  payment_method?: string
  transaction_date: string
}

// Fetch all transactions
export async function fetchTransactions() {
  const token = localStorage.getItem("token")

  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data as Transaction[]
}

// Fetch a single transaction
export async function fetchTransactionById(transactionId: number) {
  const token = localStorage.getItem("token")

  const response = await axios.get(`${API_URL}/${transactionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data as Transaction
}

// Create
export async function createTransaction(transactionData: NewTransaction) {
  const token = localStorage.getItem("token")

  const response = await axios.post(API_URL, transactionData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data as Transaction
}

// Update
export async function updateTransaction(transactionId: number, transactionData: NewTransaction) {
  const token = localStorage.getItem("token")

  const response = await axios.put(`${API_URL}/${transactionId}`, transactionData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data as Transaction
}

// Delete
export async function deleteTransaction(transactionId: number) {
  const token = localStorage.getItem("token")

  const response = await axios.delete(`${API_URL}/${transactionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}
