import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import {
  getBudgets,
  setBudgets,
  deleteBudget,
  updateMonthlyIncome,
  updateAlertSettings,
  getCurrentMonthStart,
  type Budget,
  type CategoryLimit,
} from "../../services/budgetService"

interface BudgetState {
  budgets: Budget[]
  monthlyIncome: number
  alertThreshold: number
  loading: boolean
  formLoading: boolean
  error: string | null
  editingIndex: number | null
  newBudgetAmount: string
  showAddCategory: boolean
  newCategory: {
    name: string
    budget: string
  }
}

const initialState: BudgetState = {
  budgets: [],
  monthlyIncome: 0,
  alertThreshold: 100,
  loading: true,
  formLoading: false,
  error: null,
  editingIndex: null,
  newBudgetAmount: "",
  showAddCategory: false,
  newCategory: {
    name: "",
    budget: "",
  },
}

export const fetchBudgets = createAsyncThunk("budgets/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const data = await getBudgets()
    return data
  } catch (error) {
    return rejectWithValue("Failed to load budgets. Please try again later.")
  }
})

export const saveBudget = createAsyncThunk(
  "budgets/save",
  async ({ index, amount, budgets }: { index: number; amount: number; budgets: Budget[] }, { rejectWithValue }) => {
    try {
      const budget = budgets[index]
      const categoryLimit: CategoryLimit = {
        category: budget.category_name,
        limit: amount,
      }

      await setBudgets(budget.month_start, [categoryLimit])
      return { index, amount }
    } catch (error) {
      return rejectWithValue("Failed to update budget. Please try again.")
    }
  },
)

export const removeBudget = createAsyncThunk(
  "budgets/remove",
  async ({ index, budgets }: { index: number; budgets: Budget[] }, { rejectWithValue }) => {
    try {
      const budget = budgets[index]
      await deleteBudget(budget.budget_id)
      return index
    } catch (error) {
      return rejectWithValue("Failed to delete budget. Please try again.")
    }
  },
)

export const addBudgetCategory = createAsyncThunk(
  "budgets/addCategory",
  async ({ name, budget }: { name: string; budget: number }, { rejectWithValue }) => {
    try {
      const categoryLimit: CategoryLimit = {
        category: name,
        limit: budget,
      }

      await setBudgets(getCurrentMonthStart(), [categoryLimit])
      return true
    } catch (error) {
      return rejectWithValue("Failed to add category. Please try again.")
    }
  },
)

export const setMonthlyIncome = createAsyncThunk("budgets/setIncome", async (amount: number, { rejectWithValue }) => {
  try {
    await updateMonthlyIncome(amount)
    return amount
  } catch (error) {
    return rejectWithValue("Failed to update monthly income. Please try again.")
  }
})

export const setAlertThreshold = createAsyncThunk(
  "budgets/setAlertThreshold",
  async (threshold: number, { rejectWithValue }) => {
    try {
      await updateAlertSettings(threshold)
      return threshold
    } catch (error) {
      return rejectWithValue("Failed to update alert threshold. Please try again.")
    }
  },
)

const budgetSlice = createSlice({
  name: "budgets",
  initialState,
  reducers: {
    setEditingIndex: (state, action) => {
      state.editingIndex = action.payload
      if (action.payload !== null) {
        state.newBudgetAmount = state.budgets[action.payload].budget_limit.toString()
      }
    },
    setNewBudgetAmount: (state, action) => {
      state.newBudgetAmount = action.payload
    },
    setShowAddCategory: (state, action) => {
      state.showAddCategory = action.payload
      if (!action.payload) {
        state.newCategory = { name: "", budget: "" }
      }
    },
    setNewCategory: (state, action) => {
      state.newCategory = action.payload
    },
    clearBudgetError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        const data = action.payload
        const budgetsWithColor = data.budgets.map((budget: Budget) => ({
          ...budget,
          color: getCategoryColor(budget.category_name),
        }))
        state.budgets = budgetsWithColor
        state.monthlyIncome = data.monthly_income || 0
        state.alertThreshold = data.alert_threshold || 100
        state.loading = false
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(saveBudget.pending, (state) => {
        state.formLoading = true
        state.error = null
      })
      .addCase(saveBudget.fulfilled, (state, action) => {
        const { index, amount } = action.payload
        state.budgets[index].budget_limit = amount
        state.editingIndex = null
        state.formLoading = false
      })
      .addCase(saveBudget.rejected, (state, action) => {
        state.formLoading = false
        state.error = action.payload as string
      })
      .addCase(removeBudget.pending, (state) => {
        state.formLoading = true
        state.error = null
      })
      .addCase(removeBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.filter((_, i) => i !== action.payload)
        state.formLoading = false
      })
      .addCase(removeBudget.rejected, (state, action) => {
        state.formLoading = false
        state.error = action.payload as string
      })
      // Add budget category
      .addCase(addBudgetCategory.pending, (state) => {
        state.formLoading = true
        state.error = null
      })
      .addCase(addBudgetCategory.fulfilled, (state) => {
        state.formLoading = false
        state.showAddCategory = false
        state.newCategory = { name: "", budget: "" }
      })
      .addCase(addBudgetCategory.rejected, (state, action) => {
        state.formLoading = false
        state.error = action.payload as string
      })
      .addCase(setMonthlyIncome.fulfilled, (state, action) => {
        state.monthlyIncome = action.payload
      })
      .addCase(setAlertThreshold.fulfilled, (state, action) => {
        state.alertThreshold = action.payload
      })
  },
})

const categoryColors: Record<string, string> = {
  "Food and Drink": "#8FD14F",
  Personal: "#E88B8B",
  Income: "#A0D959",
  Transport: "#C89BF9",
  Shopping: "#F0A6E8",
  Entertainment: "#FFA726",
  "Health and Fitness": "#80DECD",
  "Bills and Utilities": "#7CD5F9",
}

const getCategoryColor = (categoryName: string) => {
  if (categoryColors[categoryName]) {
    return categoryColors[categoryName]
  }

  const letters = "0123456789ABCDEF"
  let color = "#"
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

export const { setEditingIndex, setNewBudgetAmount, setShowAddCategory, setNewCategory, clearBudgetError } =
  budgetSlice.actions
export default budgetSlice.reducer
