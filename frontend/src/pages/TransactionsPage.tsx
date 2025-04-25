// frontend/src/pages/TransactionsPage.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import { fetchTransactions, createTransaction, updateTransaction, deleteTransaction } from "../services/transactionService"
import type { Transaction } from "../services/transactionService"
import OutgoingTxnIcon from "../components/icons/OutgoingTxnIcon"
import IncomingTxnIcon from "../components/icons/IncomingTxnIcon"



interface Summary {
  netWorth: number
  income: number
  expenses: number
}

const PencilIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
)

const XIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

const CalendarIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
)

const CheckIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await fetchTransactions()
        setTransactions(data)
      } catch (err) {
        console.error("Failed to load transactions:", err)
      }
    }
    loadTransactions()
  }, [])


  useEffect(() => {
    const loadSummary = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/transactions/summary?user_id=1`)
        const data = await res.json()
        setSummary(data)
      } catch (err) {
        console.error("Failed to load summary", err)
      }
    }
  
    loadSummary()
  }, [])


  const [isAddingTransaction, setIsAddingTransaction] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [transactionDate, setTransactionDate] = useState("")
  const [datePickerValue, setDatePickerValue] = useState("")
  const [transactionType, setTransactionType] = useState<"debit" | "credit">("debit")
  const [summary, setSummary] = useState<Summary>({
    netWorth: 0,
    income: 0,
    expenses: 0,
  })



  // Add a new state variable for tracking invalid amount input
  const [amountError, setAmountError] = useState(false)
  // Add new state variables for field validation errors after the existing state declarations
  const [fieldErrors, setFieldErrors] = useState({
    title: false,
    amount: false,
    paymentMethod: false,
    date: false,
    category: false,
  })
  // Add state for editing form
  const [editForm, setEditForm] = useState({
    title: "",
    amount: "",
    category: "",
    paymentMethod: "",
    transactionDate: "",
    datePickerValue: "",
    transactionType: "debit" as "debit" | "credit",
  })
  const [editFieldErrors, setEditFieldErrors] = useState({
    title: false,
    amount: false,
    paymentMethod: false,
    date: false,
    category: false,
  })
  const [editAmountError, setEditAmountError] = useState(false)

  // Convert between date formats
  useEffect(() => {
    if (datePickerValue) {
      const date = new Date(datePickerValue)
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate(),
      ).padStart(2, "0")}T00:00:00Z`
      setTransactionDate(formattedDate)
    }
  }, [datePickerValue])

  // Convert between date formats for edit form
  useEffect(() => {
    if (editForm.datePickerValue) {
      const date = new Date(editForm.datePickerValue)
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate(),
      ).padStart(2, "0")}T00:00:00Z`
      setEditForm((prev) => ({ ...prev, transactionDate: formattedDate }))
    }
  }, [editForm.datePickerValue])

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups: Record<string, Transaction[]>, transaction) => {
    const date = new Date(transaction.transaction_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })

    if (!groups[date]) {
      groups[date] = []
    }

    groups[date].push(transaction)
    return groups
  }, {})

  // Replace the handleSubmit function with this updated version that sorts transactions by date
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check for empty required fields
    const errors = {
      title: title.trim() === "",
      amount: amount.trim() === "",
      paymentMethod: paymentMethod.trim() === "",
      date: datePickerValue === "",
      category: category === "",
    }

    setFieldErrors(errors)

    // If any required field is empty, prevent submission
    if (Object.values(errors).some((error) => error)) {
      return
    }

    try {
      const newTransaction = {
        // transaction_id: Math.floor(Math.random() * 1000),
        // amount: Number.parseFloat(amount),
        // category,
        // payment_method: paymentMethod,
        // transaction_date: transactionDate || new Date().toISOString(),
        // transaction_type: transactionType,
        // vendor: title,
        user_id: 1, // Replace with actual user ID from session
        amount: Number.parseFloat(amount),
        transaction_type: transactionType,
        category_id: getCategoryId(category),
        vendor: title,
        description: "",
        transaction_date: transactionDate || new Date().toISOString(),
        payment_method: paymentMethod,
      }

      // // Add the new transaction and sort all transactions by date (newest first)
      // const updatedTransactions = [...transactions, newTransaction as Transaction].sort((a, b) => {
      //   return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
      // })

      const created = await createTransaction(newTransaction)
      console.log("created", created)
      const updatedTransactions = [...transactions, created].sort((a, b) =>
        new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
      )

      setTransactions(updatedTransactions)
      resetForm()
      setIsAddingTransaction(false)
    } catch (error) {
      console.error("Error creating transaction:", error)
    }
  }

  const resetForm = () => {
    setTitle("")
    setAmount("")
    setCategory("")
    setPaymentMethod("")
    setTransactionDate("")
    setDatePickerValue("")
    setTransactionType("debit")
    setAmountError(false)
    setFieldErrors({
      title: false,
      amount: false,
      paymentMethod: false,
      date: false,
      category: false,
    })
  }

  // const handleDelete = (id: number) => {
  //   // For preview, just update the state directly
  //   setTransactions(transactions.filter((t) => t.transaction_id !== id))
  // }
  const handleDelete = async (id: number) => {
    try {
      await deleteTransaction(id)
      setTransactions(transactions.filter((t) => t.transaction_id !== id))
    } catch (error) {
      console.error("Failed to delete transaction:", error)
    }
  }

  // const getCategoryClass = (category: string) => {
  //   switch (category.toLowerCase()) {
  //     case "food and drink":
  //       return "bg-green-100 text-green-800"
  //     case "bills and utilities":
  //       return "bg-blue-100 text-blue-800"
  //     case "personal":
  //       return "bg-pink-100 text-pink-800"
  //     case "income":
  //       return "bg-lime-100 text-lime-800"
  //     case "transport":
  //       return "bg-purple-100 text-purple-800"
  //     case "shopping":
  //       return "bg-amber-100 text-amber-800"
  //     case "entertainment":
  //       return "bg-orange-100 text-orange-800"
  //     case "health and fitness":
  //       return "bg-teal-100 text-teal-800"
  //     default:
  //       return "bg-gray-100 text-gray-800"
  //   }
  // }

  const getCategoryClass = (category?: string) => {
    if (!category) return "bg-gray-100 text-gray-800"
  
    switch (category.toLowerCase()) {
      case "food and drink":
        return "bg-green-100 text-green-800"
      case "bills and utilities":
        return "bg-blue-100 text-blue-800"
      case "personal":
        return "bg-pink-100 text-pink-800"
      case "income":
        return "bg-lime-100 text-lime-800"
      case "transport":
        return "bg-purple-100 text-purple-800"
      case "shopping":
        return "bg-amber-100 text-amber-800"
      case "entertainment":
        return "bg-orange-100 text-orange-800"
      case "health and fitness":
        return "bg-teal-100 text-teal-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }
  

  const getCategoryId = (category: string): number => {
    const map: Record<string, number> = {
      "Food and Drink": 1,
      "Personal": 2,
      "Income": 3,
      "Transport": 4,
      "Shopping": 5,
      "Entertainment": 6,
      "Health and Fitness": 7,
      "Bills and Utilities": 8,
    }
    return map[category] || 0
  }

  // Format date to show date before month (DD/MM/YYYY)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  // Format date for date picker (YYYY-MM-DD)
  const formatDateForPicker = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(
      2,
      "0",
    )}`
  }

  // Update the handleAmountChange function to detect invalid inputs
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Check if the input is valid (only numbers and decimal point)
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setAmount(value)
      setAmountError(false)
    } else {
      // Show error but don't update the amount value
      setAmountError(true)
    }
  }

  // Handle amount change for edit form
  const handleEditAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Check if the input is valid (only numbers and decimal point)
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setEditForm((prev) => ({ ...prev, amount: value }))
      setEditAmountError(false)
    } else {
      // Show error but don't update the amount value
      setEditAmountError(true)
    }
  }

  // Start editing a transaction
  const startEditing = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setEditForm({
      title: transaction.vendor || "",
      amount: transaction.amount.toString(),
      category: transaction.category_name,
      paymentMethod: transaction.payment_method || "",
      transactionDate: transaction.transaction_date,
      datePickerValue: formatDateForPicker(transaction.transaction_date),
      transactionType: transaction.transaction_type,
    })
    setEditFieldErrors({
      title: false,
      amount: false,
      paymentMethod: false,
      date: false,
      category: false,
    })
    setEditAmountError(false)
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingTransaction(null)
    setEditForm({
      title: "",
      amount: "",
      category: "",
      paymentMethod: "",
      transactionDate: "",
      datePickerValue: "",
      transactionType: "debit",
    })
  }

  // Also update the saveEditedTransaction function to maintain proper sorting
  const saveEditedTransaction = () => {
    if (!editingTransaction) return

    // Check for empty required fields
    const errors = {
      title: editForm.title.trim() === "",
      amount: editForm.amount.trim() === "",
      paymentMethod: editForm.paymentMethod.trim() === "",
      date: editForm.datePickerValue === "",
      category: editForm.category === "",
    }

    setEditFieldErrors(errors)

    // If any required field is empty, prevent submission
    if (Object.values(errors).some((error) => error)) {
      return
    }

    try {
      const updatedTransaction: Transaction = {
        ...editingTransaction,
        vendor: editForm.title,
        amount: Number.parseFloat(editForm.amount),
        category_name: editForm.category,
        payment_method: editForm.paymentMethod,
        transaction_date: editForm.transactionDate || new Date().toISOString(),
        transaction_type: editForm.transactionType,
      }

      // Update the transaction in the state and resort
      const updatedTransactions = transactions
        .map((t) => (t.transaction_id === editingTransaction.transaction_id ? updatedTransaction : t))
        .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())

      setTransactions(updatedTransactions)

      // Reset editing state
      setEditingTransaction(null)
    } catch (error) {
      console.error("Error updating transaction:", error)
    }
  }

  return (
    <div className="flex h-screen bg-background-light">
      <Sidebar activePage="transactions" />

      <div className="flex-1 overflow-auto bg-background-light rounded-l-xl">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4 text-header-blue">Transactions</h1>
          <hr className="mb-6" />

          <div className="flex mb-6 gap-6">
            <div className="flex-1 bg-primary-medium text-white p-6 rounded-[20px]">
              <h2 className="text-xl font-bold mb-6 -mt-1 text-[#F8F9FA]">This Month</h2>

              <div className="flex justify-between gap-2">
                <div className="flex-1">
                  <div className="text-sm text-[#F8F9FA] mb-1">Net Worth</div>
                  <div className="text-4xl font-bold text-white whitespace-normal overflow-hidden">
                    ${summary.netWorth.toLocaleString()}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-sm text-[#F8F9FA] mb-1">Income</div>
                  <div className="text-4xl font-bold text-finapp-green whitespace-normal overflow-hidden">
                    ${summary.income.toLocaleString()}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-sm text-[#F8F9FA] mb-1">Expenses</div>
                  <div className="text-4xl font-bold text-finapp-red whitespace-normal overflow-hidden">
                    ${summary.expenses.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <button
                onClick={() => setIsAddingTransaction(true)}
                className="flex flex-col items-center justify-center w-40 h-full text-header-blue rounded-[20px] relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-85"
                  style={{
                    backgroundImage:
                      "linear-gradient(to bottom, rgba(226, 255, 84, 1) 0%, rgba(205, 253, 92, 0.96) 29%, rgba(169, 248, 107, 0.9) 61%, rgba(107, 241, 131, 0.8) 81%, rgba(47, 234, 155, 0.7) 100%)",
                  }}
                ></div>
                <div className="relative z-10">
                  <span className="text-[96px] font-normal leading-[26px] mb-6 block">+</span>
                  <span className="text-center text-[20px] font-semibold leading-[26px] block">
                    Record
                    <br />
                    Transaction
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-0 pb-6 mb-6">
            <h2 className="text-xl font-bold mb-6 -mt-1 text-black/50 px-6 pt-6">Transaction History</h2>

            {isAddingTransaction && (
              <div className="mb-6 bg-[#F8FAF9] p-6 mx-6 rounded-[15px] border-2 border-[#CCD4DB] relative">
                <div className="flex justify-between mb-4">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setTransactionType("debit")}
                      className={`w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden ${
                        transactionType === "debit" ? "" : "opacity-40"
                      }`}
                    >
                      <OutgoingTxnIcon size={100} />
                    </button>

                    <button
                      onClick={() => setTransactionType("credit")}
                      className={`w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden ${
                        transactionType === "credit" ? "" : "opacity-40"
                      }`}
                    >
                      <IncomingTxnIcon size={100} />
                    </button>
                  </div>

                  <button onClick={() => setIsAddingTransaction(false)} className="text-red-500 absolute top-4 right-4">
                    <XIcon size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex">
                  <div className="w-1/2 pr-4">
                    <div className="mb-4">
                      <label className="block font-medium text-[13px] tracking-[-0.02em] text-black/50 font-inter mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`w-full p-2 border-2 ${
                          fieldErrors.title ? "border-red-500" : "border-[#CCD4DB]"
                        } rounded-[8.7px] bg-white font-semibold font-inter text-[15px]`}
                      />
                      {fieldErrors.title && <p className="text-red-500 text-xs mt-1 font-inter">Title is required</p>}
                    </div>

                    <div className="mb-4">
                      <label className="block font-medium text-[13px] tracking-[-0.02em] text-black/50 font-inter mb-1">
                        Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={amount}
                        onChange={handleAmountChange}
                        className={`w-full p-2 border-2 ${
                          fieldErrors.amount ? "border-red-500" : "border-[#CCD4DB]"
                        } rounded-[8.7px] bg-white font-semibold font-inter text-[15px]`}
                      />
                      {amountError && (
                        <p className="text-red-500 text-xs mt-1 font-inter">Please enter a numerical value</p>
                      )}
                      {fieldErrors.amount && <p className="text-red-500 text-xs mt-1 font-inter">Amount is required</p>}
                    </div>
                  </div>

                  <div className="w-1/2 pl-4">
                    <div className="mb-4">
                      <label className="block font-medium text-[13px] tracking-[-0.02em] text-black/50 font-inter mb-1">
                        Payment Method <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className={`w-full p-2 border-2 ${
                          fieldErrors.paymentMethod ? "border-red-500" : "border-[#CCD4DB]"
                        } rounded-[8.7px] bg-white font-semibold font-inter text-[15px]`}
                      />
                      {fieldErrors.paymentMethod && (
                        <p className="text-red-500 text-xs mt-1 font-inter">Payment method is required</p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block font-medium text-[13px] tracking-[-0.02em] text-black/50 font-inter mb-1">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <CalendarIcon className="text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={datePickerValue}
                          onChange={(e) => setDatePickerValue(e.target.value)}
                          className={`date-picker w-full p-2 border-2 ${
                            fieldErrors.date ? "border-red-500" : "border-[#CCD4DB]"
                          } rounded-[8.7px] bg-white pr-10 font-semibold font-inter text-[15px]`}
                        />
                      </div>
                      {fieldErrors.date && <p className="text-red-500 text-xs mt-1 font-inter">Date is required</p>}
                    </div>
                  </div>
                </form>

                <div className="mt-2">
                  <div className="flex flex-col">
                    <div className="flex items-center mb-1">
                      <label className="block font-medium text-[13px] tracking-[-0.02em] text-black/50 font-inter">
                        Category <span className="text-red-500">*</span>
                      </label>
                      {fieldErrors.category && (
                        <p className="text-red-500 text-xs ml-2 font-inter">Category is required</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setCategory("Food and Drink")}
                        className={`px-3 py-0.5 text-[14.5px] font-bold font-inter ${
                          category === "Food and Drink" ? "" : "opacity-55"
                        }`}
                        style={{
                          borderRadius: "8.7px",
                          border: "3px solid",
                          borderColor:
                            category === "Food and Drink"
                              ? "#37A4F1"
                              : fieldErrors.category
                                ? "rgba(239, 68, 68, 0.5)"
                                : "transparent",
                          backgroundColor: "rgb(220 252 231)",
                          color: "rgb(22 101 52)",
                        }}
                      >
                        Food and Drink
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategory("Personal")}
                        className={`px-3 py-0.5 text-[14.5px] font-bold font-inter ${
                          category === "Personal" ? "" : "opacity-55"
                        }`}
                        style={{
                          borderRadius: "8.7px",
                          border: "3px solid",
                          borderColor:
                            category === "Personal"
                              ? "#37A4F1"
                              : fieldErrors.category
                                ? "rgba(239, 68, 68, 0.5)"
                                : "transparent",
                          backgroundColor: "rgb(252 231 243)",
                          color: "rgb(157 23 77)",
                        }}
                      >
                        Personal
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategory("Income")}
                        className={`px-3 py-0.5 text-[14.5px] font-bold font-inter ${
                          category === "Income" ? "" : "opacity-55"
                        }`}
                        style={{
                          borderRadius: "8.7px",
                          border: "3px solid",
                          borderColor:
                            category === "Income"
                              ? "#37A4F1"
                              : fieldErrors.category
                                ? "rgba(239, 68, 68, 0.5)"
                                : "transparent",
                          backgroundColor: "rgb(236 252 203)",
                          color: "rgb(63 98 18)",
                        }}
                      >
                        Income
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategory("Transport")}
                        className={`px-3 py-0.5 text-[14.5px] font-bold font-inter ${
                          category === "Transport" ? "" : "opacity-55"
                        }`}
                        style={{
                          borderRadius: "8.7px",
                          border: "3px solid",
                          borderColor:
                            category === "Transport"
                              ? "#37A4F1"
                              : fieldErrors.category
                                ? "rgba(239, 68, 68, 0.5)"
                                : "transparent",
                          backgroundColor: "rgb(243 232 255)",
                          color: "rgb(107 33 168)",
                        }}
                      >
                        Transport
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategory("Shopping")}
                        className={`px-3 py-0.5 text-[14.5px] font-bold font-inter ${
                          category === "Shopping" ? "" : "opacity-55"
                        }`}
                        style={{
                          borderRadius: "8.7px",
                          border: "3px solid",
                          borderColor:
                            category === "Shopping"
                              ? "#37A4F1"
                              : fieldErrors.category
                                ? "rgba(239, 68, 68, 0.5)"
                                : "transparent",
                          backgroundColor: "rgb(254 243 199)",
                          color: "rgb(146 64 14)",
                        }}
                      >
                        Shopping
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategory("Entertainment")}
                        className={`px-3 py-0.5 text-[14.5px] font-bold font-inter ${
                          category === "Entertainment" ? "" : "opacity-55"
                        }`}
                        style={{
                          borderRadius: "8.7px",
                          border: "3px solid",
                          borderColor:
                            category === "Entertainment"
                              ? "#37A4F1"
                              : fieldErrors.category
                                ? "rgba(239, 68, 68, 0.5)"
                                : "transparent",
                          backgroundColor: "rgb(255 237 213)",
                          color: "rgb(154 52 18)",
                        }}
                      >
                        Entertainment
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategory("Health and Fitness")}
                        className={`px-3 py-0.5 text-[14.5px] font-bold font-inter ${
                          category === "Health and Fitness" ? "" : "opacity-55"
                        }`}
                        style={{
                          borderRadius: "8.7px",
                          border: "3px solid",
                          borderColor:
                            category === "Health and Fitness"
                              ? "#37A4F1"
                              : fieldErrors.category
                                ? "rgba(239, 68, 68, 0.5)"
                                : "transparent",
                          backgroundColor: "rgb(204 251 241)",
                          color: "rgb(17 94 89)",
                        }}
                      >
                        Health and Fitness
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategory("Bills and Utilities")}
                        className={`px-3 py-0.5 text-[14.5px] font-bold font-inter ${
                          category === "Bills and Utilities" ? "" : "opacity-55"
                        }`}
                        style={{
                          borderRadius: "8.7px",
                          border: "3px solid",
                          borderColor:
                            category === "Bills and Utilities"
                              ? "#37A4F1"
                              : fieldErrors.category
                                ? "rgba(239, 68, 68, 0.5)"
                                : "transparent",
                          backgroundColor: "rgb(219 234 254)",
                          color: "rgb(30 64 175)",
                        }}
                      >
                        Bills and Utilities
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSubmit}
                    className="px-10 py-1.5 bg-[#00B512] text-[#F9FAFB] font-semibold text-[16px] font-inter hover:bg-[#00A010]"
                    style={{ borderRadius: "44px" }}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {Object.entries(groupedTransactions).length > 0 ? (
              Object.entries(groupedTransactions).map(([date, dateTransactions], groupIndex) => (
                <div key={date} className={`${groupIndex > 0 ? "mt-8" : ""} px-6`}>
                  <h3 className="text-[16px] font-bold mb-1 text-[#E29578] leading-[28px] tracking-[-0.02em]">
                    {date}
                  </h3>

                  {dateTransactions.map((transaction, index) => (
                    <div key={transaction.transaction_id}>
                      {editingTransaction?.transaction_id === transaction.transaction_id ? (
                        // Edit form for the transaction
                        <div className="mb-4 bg-[#F8FAF9] p-6 rounded-[15px] border-2 border-[#CCD4DB] relative">
                          <div className="flex justify-between mb-4">
                            <div className="flex space-x-4">
                              <button
                                onClick={() => setEditForm((prev) => ({ ...prev, transactionType: "debit" }))}
                                className={`w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden ${
                                  editForm.transactionType === "debit" ? "" : "opacity-40"
                                }`}
                              >
                                <OutgoingTxnIcon size={100} />
                              </button>

                              <button
                                onClick={() => setEditForm((prev) => ({ ...prev, transactionType: "credit" }))}
                                className={`w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden ${
                                  editForm.transactionType === "credit" ? "" : "opacity-40"
                                }`}
                              >
                                <IncomingTxnIcon size={100} />
                              </button>
                            </div>
                          </div>

                          <div className="flex">
                            <div className="w-1/2 pr-4">
                              <div className="mb-4">
                                <label className="block font-medium text-[13px] tracking-[-0.02em] text-black/50 font-inter mb-1">
                                  Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={editForm.title}
                                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                                  className={`w-full p-2 border-2 ${
                                    editFieldErrors.title ? "border-red-500" : "border-[#CCD4DB]"
                                  } rounded-[8.7px] bg-white font-semibold font-inter text-[15px]`}
                                />
                                {editFieldErrors.title && (
                                  <p className="text-red-500 text-xs mt-1 font-inter">Title is required</p>
                                )}
                              </div>

                              <div className="mb-4">
                                <label className="block font-medium text-[13px] tracking-[-0.02em] text-black/50 font-inter mb-1">
                                  Amount <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={editForm.amount}
                                  onChange={handleEditAmountChange}
                                  className={`w-full p-2 border-2 ${
                                    editFieldErrors.amount ? "border-red-500" : "border-[#CCD4DB]"
                                  } rounded-[8.7px] bg-white font-semibold font-inter text-[15px]`}
                                />
                                {editAmountError && (
                                  <p className="text-red-500 text-xs mt-1 font-inter">Please enter a numerical value</p>
                                )}
                                {editFieldErrors.amount && (
                                  <p className="text-red-500 text-xs mt-1 font-inter">Amount is required</p>
                                )}
                              </div>
                            </div>

                            <div className="w-1/2 pl-4">
                              <div className="mb-4">
                                <label className="block font-medium text-[13px] tracking-[-0.02em] text-black/50 font-inter mb-1">
                                  Payment Method <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={editForm.paymentMethod}
                                  onChange={(e) => setEditForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                                  className={`w-full p-2 border-2 ${
                                    editFieldErrors.paymentMethod ? "border-red-500" : "border-[#CCD4DB]"
                                  } rounded-[8.7px] bg-white font-semibold font-inter text-[15px]`}
                                />
                                {editFieldErrors.paymentMethod && (
                                  <p className="text-red-500 text-xs mt-1 font-inter">Payment method is required</p>
                                )}
                              </div>

                              <div className="mb-4">
                                <label className="block font-medium text-[13px] tracking-[-0.02em] text-black/50 font-inter mb-1">
                                  Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <CalendarIcon className="text-gray-400" />
                                  </div>
                                  <input
                                    type="date"
                                    value={editForm.datePickerValue}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({ ...prev, datePickerValue: e.target.value }))
                                    }
                                    className={`date-picker w-full p-2 border-2 ${
                                      editFieldErrors.date ? "border-red-500" : "border-[#CCD4DB]"
                                    } rounded-[8.7px] bg-white pr-10 font-semibold font-inter text-[15px]`}
                                  />
                                </div>
                                {editFieldErrors.date && (
                                  <p className="text-red-500 text-xs mt-1 font-inter">Date is required</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-2">
                            <div className="flex flex-col">
                              <div className="flex items-center mb-1">
                                <label className="block font-medium text-[13px] tracking-[-0.02em] text-black/50 font-inter">
                                  Category <span className="text-red-500">*</span>
                                </label>
                                {editFieldErrors.category && (
                                  <p className="text-red-500 text-xs ml-2 font-inter">Category is required</p>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditForm((prev) => ({ ...prev, category: "Food and Drink" }))}
                                  className={`px-3 py-0.5 text-[14.5px] font-bold font-inter ${
                                    editForm.category === "Food and Drink" ? "" : "opacity-55"
                                  }`}
                                  style={{
                                    borderRadius: "8.7px",
                                    border: "3px solid",
                                    borderColor:
                                      editForm.category === "Food and Drink"
                                        ? "#37A4F1"
                                        : editFieldErrors.category
                                          ? "rgba(239, 68, 68, 0.5)"
                                          : "transparent",
                                    backgroundColor: "rgb(220 252 231)",
                                    color: "rgb(22 101 52)",
                                  }}
                                >
                                  Food and Drink
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditForm((prev) => ({ ...prev, category: "Personal" }))}
                                  className={`px-3 py-0.5 text-[14.5px] font-bold font-inter ${
                                    editForm.category === "Personal" ? "" : "opacity-55"
                                  }`}
                                  style={{
                                    borderRadius: "8.7px",
                                    border: "3px solid",
                                    borderColor:
                                      editForm.category === "Personal"
                                        ? "#37A4F1"
                                        : editFieldErrors.category
                                          ? "rgba(239, 68, 68, 0.5)"
                                          : "transparent",
                                    backgroundColor: "rgb(252 231 243)",
                                    color: "rgb(157 23 77)",
                                  }}
                                >
                                  Personal
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditForm((prev) => ({ ...prev, category: "Income" }))}
                                  className={`px-3 py-0.5 text-[14.5px] font-bold font-inter ${
                                    editForm.category === "Income" ? "" : "opacity-55"
                                  }`}
                                  style={{
                                    borderRadius: "8.7px",
                                    border: "3px solid",
                                    borderColor:
                                      editForm.category === "Income"
                                        ? "#37A4F1"
                                        : editFieldErrors.category
                                          ? "rgba(239, 68, 68, 0.5)"
                                          : "transparent",
                                    backgroundColor: "rgb(236 252 203)",
                                    color: "rgb(63 98 18)",
                                  }}
                                >
                                  Income
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditForm((prev) => ({ ...prev, category: "Transport" }))}
                                  className={`px-3 py-0.5 text-[14.5px] font-bold font-inter ${
                                    editForm.category === "Transport" ? "" : "opacity-55"
                                  }`}
                                  style={{
                                    borderRadius: "8.7px",
                                    border: "3px solid",
                                    borderColor:
                                      editForm.category === "Transport"
                                        ? "#37A4F1"
                                        : editFieldErrors.category
                                          ? "rgba(239, 68, 68, 0.5)"
                                          : "transparent",
                                    backgroundColor: "rgb(243 232 255)",
                                    color: "rgb(107 33 168)",
                                  }}
                                >
                                  Transport
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditForm((prev) => ({ ...prev, category: "Shopping" }))}
                                  className={`px-3 py-0.5 text-[14.5px] font-bold font-inter ${
                                    editForm.category === "Shopping" ? "" : "opacity-55"
                                  }`}
                                  style={{
                                    borderRadius: "8.7px",
                                    border: "3px solid",
                                    borderColor:
                                      editForm.category === "Shopping"
                                        ? "#37A4F1"
                                        : editFieldErrors.category
                                          ? "rgba(239, 68, 68, 0.5)"
                                          : "transparent",
                                    backgroundColor: "rgb(254 243 199)",
                                    color: "rgb(146 64 14)",
                                  }}
                                >
                                  Shopping
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditForm((prev) => ({ ...prev, category: "Entertainment" }))}
                                  className={`px-3 py-0.5 text-[14.5px] font-bold font-inter ${
                                    editForm.category === "Entertainment" ? "" : "opacity-55"
                                  }`}
                                  style={{
                                    borderRadius: "8.7px",
                                    border: "3px solid",
                                    borderColor:
                                      editForm.category === "Entertainment"
                                        ? "#37A4F1"
                                        : editFieldErrors.category
                                          ? "rgba(239, 68, 68, 0.5)"
                                          : "transparent",
                                    backgroundColor: "rgb(255 237 213)",
                                    color: "rgb(154 52 18)",
                                  }}
                                >
                                  Entertainment
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditForm((prev) => ({ ...prev, category: "Health and Fitness" }))}
                                  className={`px-3 py-0.5 text-[14.5px] font-bold font-inter ${
                                    editForm.category === "Health and Fitness" ? "" : "opacity-55"
                                  }`}
                                  style={{
                                    borderRadius: "8.7px",
                                    border: "3px solid",
                                    borderColor:
                                      editForm.category === "Health and Fitness"
                                        ? "#37A4F1"
                                        : editFieldErrors.category
                                          ? "rgba(239, 68, 68, 0.5)"
                                          : "transparent",
                                    backgroundColor: "rgb(204 251 241)",
                                    color: "rgb(17 94 89)",
                                  }}
                                >
                                  Health and Fitness
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditForm((prev) => ({ ...prev, category: "Bills and Utilities" }))}
                                  className={`px-3 py-0.5 text-[14.5px] font-bold font-inter ${
                                    editForm.category === "Bills and Utilities" ? "" : "opacity-55"
                                  }`}
                                  style={{
                                    borderRadius: "8.7px",
                                    border: "3px solid",
                                    borderColor:
                                      editForm.category === "Bills and Utilities"
                                        ? "#37A4F1"
                                        : editFieldErrors.category
                                          ? "rgba(239, 68, 68, 0.5)"
                                          : "transparent",
                                    backgroundColor: "rgb(219 234 254)",
                                    color: "rgb(30 64 175)",
                                  }}
                                >
                                  Bills and Utilities
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end mt-4 space-x-2">
                            <button
                              onClick={cancelEditing}
                              className="px-10 py-1.5 bg-gray-200 text-gray-700 font-semibold text-[16px] font-inter hover:bg-gray-300"
                              style={{ borderRadius: "44px" }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={saveEditedTransaction}
                              className="px-10 py-1.5 bg-[#00B512] text-[#F9FAFB] font-semibold text-[16px] font-inter hover:bg-[#00A010]"
                              style={{ borderRadius: "44px" }}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Normal transaction display
                        <div className={`${index > 0 ? "mb-1" : "mb-2"} flex items-center py-1`}>
                          <div className="mr-2 -ml-1">
                            {transaction.transaction_type === "debit" ? (
                              <OutgoingTxnIcon size={58} />
                            ) : (
                              <IncomingTxnIcon size={58} />
                            )}
                          </div>

                          <div
                            className="flex flex-col justify-between h-[58px] -mt-1"
                            style={{ marginLeft: "-2.5px", minWidth: "220px", flex: "0 1 auto" }}
                          >
                            <div className="font-semibold text-[26.81px]">
                              {transaction.vendor || "Unnamed Transaction"}
                            </div>
                            <div className="font-medium text-[14.52px] text-black/50 mt-0.5">
                              {formatDate(transaction.transaction_date)}
                            </div>
                          </div>

                          <div className="flex-1 flex items-center">
                            <div className="flex-1 flex justify-center pl-8">
                              <div className="whitespace-nowrap">
                                <span
                                  className={`px-3 py-1 font-bold text-[14.5px] font-inter ${getCategoryClass(
                                    transaction.category_name,
                                  )}`}
                                  style={{ borderRadius: "8.7px" }}
                                >
                                  {transaction.category_name}
                                </span>
                              </div>
                            </div>

                            <div className="w-[140px] text-center font-medium text-[15px] tracking-[-0.02em] text-black mr-8">
                              {transaction.payment_method || "Cash"}
                            </div>
                          </div>

                          <div className="w-[120px] text-right font-semibold text-[36px] tracking-[-0.02em] font-inter mr-8">
                            ${Math.abs(transaction.amount).toFixed(0)}
                          </div>

                          <div className="flex space-x-2 w-16">
                            <button
                              onClick={() => startEditing(transaction)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <PencilIcon size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(transaction.transaction_id)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <XIcon size={18} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No transactions found. Add your first transaction!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionsPage


