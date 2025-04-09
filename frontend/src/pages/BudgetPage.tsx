// frontend/src/pages/BudgetPage.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface BudgetRecord {
  budget_id: number;
  category_id: number;
  category_name: string;
  budget_limit: number;
  spent: number;
  alert: boolean;
}

interface BudgetData {
  month_start: string;
  monthly_income: number | null;
  budgets: BudgetRecord[];
}

interface CategoryLimitInput {
  category: string;
  limit: string;
}

const BUDGET_API_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/budgets`;

const BudgetPage: React.FC = () => {
  // Form state for monthly income
  const [monthlyIncome, setMonthlyIncome] = useState('');
  // Dynamic array for category-based budgets
  const [categoryLimits, setCategoryLimits] = useState<CategoryLimitInput[]>([
    { category: '', limit: '' },
  ]);
  // For selecting the month (optional, defaults to current month)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  });
  // The budget data fetched from the API
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  // Message for success or error
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  // Fetch the current budget data when the component mounts or selectedMonth changes
  useEffect(() => {
    async function fetchBudget() {
      try {
        const res = await axios.get(BUDGET_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
          params: { month: selectedMonth },
        });
        setBudgetData(res.data);
        if (res.data) {
          // Optionally update the form fields based on existing data
          setMonthlyIncome(res.data.monthly_income ? String(res.data.monthly_income) : '');
          // The backend returns an array of budgets; you could prefill the categoryLimits if desired.
        }
      } catch (error) {
        console.error('Error fetching budget:', error);
      }
    }
    fetchBudget();
  }, [token, selectedMonth]);

  // Handle dynamic addition of a new category limit row
  const addCategoryLimit = () => {
    setCategoryLimits([...categoryLimits, { category: '', limit: '' }]);
  };

  // Remove a category limit row by index
  const removeCategoryLimit = (index: number) => {
    setCategoryLimits(categoryLimits.filter((_, i) => i !== index));
  };

  // Update a specific category limit input
  const updateCategoryLimit = (index: number, field: 'category' | 'limit', value: string) => {
    const newCategoryLimits = [...categoryLimits];
    newCategoryLimits[index] = { ...newCategoryLimits[index], [field]: value };
    setCategoryLimits(newCategoryLimits);
  };

  // Submit the budget data to the backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    // Validate monthly income (if provided)
    if (monthlyIncome !== '' && (isNaN(parseFloat(monthlyIncome)) || parseFloat(monthlyIncome) < 0)) {
      setMessage('Invalid monthly income. It must be a non-negative number.');
      return;
    }
    // Validate each category limit input
    for (const cl of categoryLimits) {
      if (!cl.category || isNaN(parseFloat(cl.limit)) || parseFloat(cl.limit) <= 0) {
        setMessage('Each category limit must include a valid category and a limit greater than 0.');
        return;
      }
    }

    // Construct payload: send monthly_income and array of category_limits
    const payload = {
      month_start: selectedMonth, // optional; backend defaults to current month if not provided
      monthly_income: monthlyIncome ? parseFloat(monthlyIncome) : null,
      category_limits: categoryLimits,
    };

    try {
      const res = await axios.post(BUDGET_API_URL, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgetData(res.data);
      setMessage('Budget updated successfully.');
    } catch (error: any) {
      console.error('Error updating budget:', error);
      setMessage(error.response?.data?.error || 'Budget update failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4">Manage Budget</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow max-w-2xl mb-6">
        <div className="mb-4">
          <label className="block mb-1">Select Month</label>
          <input
            type="date"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-2 border rounded w-full"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-1">Monthly Income (optional)</label>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            className="p-2 border rounded w-full"
            min="0"
          />
        </div>

        <h2 className="text-xl font-semibold mb-2">Category-Based Spending Limits</h2>
        {categoryLimits.map((cl, index) => (
          <div key={index} className="mb-4 flex flex-col md:flex-row gap-2">
            <input
              type="text"
              value={cl.category}
              onChange={(e) => updateCategoryLimit(index, 'category', e.target.value)}
              placeholder="Category (e.g., Food)"
              className="p-2 border rounded w-full md:w-1/2"
              required
            />
            <input
              type="number"
              value={cl.limit}
              onChange={(e) => updateCategoryLimit(index, 'limit', e.target.value)}
              placeholder="Spending Limit"
              className="p-2 border rounded w-full md:w-1/2"
              min="0"
              required
            />
            {categoryLimits.length > 1 && (
              <button
                type="button"
                onClick={() => removeCategoryLimit(index)}
                className="bg-red-500 text-white p-2 rounded"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addCategoryLimit}
          className="mb-4 bg-green-500 text-white p-2 rounded"
        >
          Add Category Limit
        </button>
        <div>
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Update Budget
          </button>
        </div>
      </form>
      
      {message && <p className="mb-4 text-green-600">{message}</p>}
      
      {budgetData && (
        <div className="mt-6 bg-white p-4 rounded shadow max-w-2xl">
          <h2 className="text-xl font-bold mb-2">Budget Overview</h2>
          <p>
            <strong>Month:</strong> {new Date(budgetData.month_start).toLocaleDateString()}
          </p>
          <p>
            <strong>Monthly Income:</strong> {budgetData.monthly_income !== null ? budgetData.monthly_income : 'Not set'}
          </p>
          {budgetData.budgets && budgetData.budgets.length > 0 ? (
            <table className="table-auto mt-4 w-full border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">Category</th>
                  <th className="p-2 border">Budget Limit</th>
                  <th className="p-2 border">Spent</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {budgetData.budgets.map((b: BudgetRecord) => (
                  <tr key={b.budget_id} className="text-center">
                    <td className="p-2 border">{b.category_name}</td>
                    <td className="p-2 border">{b.budget_limit}</td>
                    <td className="p-2 border">{b.spent}</td>
                    <td className="p-2 border">
                      {b.alert ? (
                        <span className="text-red-500 font-bold">Over Budget</span>
                      ) : (
                        <span className="text-green-500">Within Limit</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No category budgets set for this month.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
