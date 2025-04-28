import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type Transaction,
  type TransactionInput,
} from "../../services/transactionService"

interface TransactionState {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  isFormVisible: boolean
  editingTransaction: Transaction | null
}

const initialState: TransactionState = {
  transactions: [],
  loading: true,
  error: null,
  isFormVisible: false,
  editingTransaction: null,
}

export const fetchTransactions = createAsyncThunk("transactions/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const transactions = await getTransactions()
    return transactions
  } catch (error) {
    return rejectWithValue("Failed to load transactions. Please try again later.")
  }
})

export const addTransaction = createAsyncThunk(
  "transactions/add",
  async (transaction: TransactionInput, { rejectWithValue }) => {
    try {
      const newTransaction = await createTransaction(transaction)
      return newTransaction
    } catch (error) {
      return rejectWithValue("Failed to create transaction. Please try again.")
    }
  },
)

export const editTransaction = createAsyncThunk(
  "transactions/edit",
  async ({ id, transaction }: { id: number; transaction: TransactionInput }, { rejectWithValue }) => {
    try {
      const updatedTransaction = await updateTransaction(id, transaction)
      return updatedTransaction
    } catch (error) {
      return rejectWithValue("Failed to update transaction. Please try again.")
    }
  },
)

export const removeTransaction = createAsyncThunk("transactions/remove", async (id: number, { rejectWithValue }) => {
  try {
    await deleteTransaction(id)
    return id
  } catch (error) {
    return rejectWithValue("Failed to delete transaction. Please try again.")
  }
})

const transactionSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    showTransactionForm: (state) => {
      state.isFormVisible = true
      state.editingTransaction = null
    },
    hideTransactionForm: (state) => {
      state.isFormVisible = false
      state.editingTransaction = null
    },
    setEditingTransaction: (state, action) => {
      state.editingTransaction = action.payload
      state.isFormVisible = true
    },
    clearTransactionError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false
        state.transactions = action.payload
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(addTransaction.pending, (state) => {
        state.error = null
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.transactions = [action.payload, ...state.transactions]
        state.isFormVisible = false
      })
      .addCase(addTransaction.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(editTransaction.pending, (state) => {
        state.error = null
      })
      .addCase(editTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.map((t) =>
          t.transaction_id === action.payload.transaction_id ? action.payload : t,
        )
        state.isFormVisible = false
        state.editingTransaction = null
      })
      .addCase(editTransaction.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(removeTransaction.pending, (state) => {
        state.error = null
      })
      .addCase(removeTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter((t) => t.transaction_id !== action.payload)
      })
      .addCase(removeTransaction.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { showTransactionForm, hideTransactionForm, setEditingTransaction, clearTransactionError } =
  transactionSlice.actions
export default transactionSlice.reducer
