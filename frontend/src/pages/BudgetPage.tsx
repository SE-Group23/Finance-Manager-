import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface BudgetRecord {
  budget_id: number;
  category_id: number;
  category_name: string;
  budget_limit: number;
  month_start: string;
  spent: number;
  alert: boolean;
}

// The GET response shape
interface BudgetData {
  budgets: BudgetRecord[];
}

// For posting new category limits
interface CategoryLimitInput {
  category: string;
  limit: string;
}

const BUDGET_API_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/budgets`;

const BudgetPage: React.FC = () => {
  // Form state: The user picks a month and a set of category limits
  const [monthStart, setMonthStart] = useState(() => {
    // default to the first day of this month
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [categoryLimits, setCategoryLimits] = useState<CategoryLimitInput[]>([
    { category: '', limit: '' },
  ]);

  // The budget data fetched from the API (showing all months)
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  // 1) Fetch all budgets (no month param needed)
  useEffect(() => {
    async function fetchBudgets() {
      try {
        const res = await axios.get(BUDGET_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBudgetData(res.data);
      } catch (error) {
        console.error('Error fetching budgets:', error);
        setMessage('Failed to load budgets.');
      }
    }
    fetchBudgets();
  }, [token]);

  // Add another row for category/limit input
  const addCategoryLimit = () => {
    setCategoryLimits([...categoryLimits, { category: '', limit: '' }]);
  };

  // Remove a row from the local form
  const removeCategoryLimit = (index: number) => {
    setCategoryLimits(categoryLimits.filter((_, i) => i !== index));
  };

  // Update a category limit row in the local form
  const updateCategoryLimit = (
    index: number,
    field: 'category' | 'limit',
    value: string
  ) => {
    const newLimits = [...categoryLimits];
    newLimits[index] = { ...newLimits[index], [field]: value };
    setCategoryLimits(newLimits);
  };

  // 2) Submit new budgets for the chosen month
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    // Validate
    for (const cl of categoryLimits) {
      if (!cl.category || isNaN(+cl.limit) || +cl.limit <= 0) {
        setMessage('Each category limit must have a valid category and a limit > 0.');
        return;
      }
    }

    // Build the payload with the user-chosen month
    const payload = {
      month_start: monthStart, // server normalizes day=1 anyway
      category_limits: categoryLimits,
    };

    try {
      await axios.post(BUDGET_API_URL, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Budget(s) created/updated.');

      // Refetch full budget list
      const res = await axios.get(BUDGET_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgetData(res.data);

      // Optional: Clear out the form
      // setCategoryLimits([{ category: '', limit: '' }]);
    } catch (error: any) {
      console.error('Error updating budget:', error);
      setMessage(error.response?.data?.error || 'Budget update failed.');
    }
  };

  // 3) Delete a budget item
  const handleDeleteBudget = async (budgetId: number) => {
    setMessage('');
    try {
      await axios.delete(`${BUDGET_API_URL}/${budgetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Budget deleted.');

      // refetch
      const refreshed = await axios.get(BUDGET_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgetData(refreshed.data);
    } catch (error) {
      console.error('Error deleting budget:', error);
      setMessage('Failed to delete budget.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4">Manage Budget</h1>

      {/* FORM to add or update budgets for a specific new month */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow max-w-2xl">
        <h2 className="text-xl font-semibold mb-2">Add/Update Budgets for a Month</h2>
        <div className="mb-4">
          <label className="block mb-1">Month</label>
          <input
            type="date"
            value={monthStart}
            onChange={(e) => setMonthStart(e.target.value)}
            className="p-2 border rounded w-full"
          />
          <p className="text-sm text-gray-500">
            Only the month/year matter—server normalizes to day=1.
          </p>
        </div>

        {categoryLimits.map((cl, index) => (
          <div key={index} className="mb-4 flex flex-col md:flex-row gap-2">
            <input
              type="text"
              placeholder="Category e.g. Food"
              value={cl.category}
              onChange={(e) => updateCategoryLimit(index, 'category', e.target.value)}
              className="p-2 border rounded w-full md:w-1/2"
              required
            />
            <input
              type="number"
              placeholder="Spending limit"
              value={cl.limit}
              onChange={(e) => updateCategoryLimit(index, 'limit', e.target.value)}
              className="p-2 border rounded w-full md:w-1/2"
              min="0"
              required
            />
            {categoryLimits.length > 1 && (
              <button
                type="button"
                className="bg-red-500 text-white p-2 rounded"
                onClick={() => removeCategoryLimit(index)}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addCategoryLimit}
          className="bg-green-500 text-white p-2 rounded"
        >
          + Add Another Category
        </button>

        <div className="mt-4">
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Save Budgets
          </button>
        </div>
      </form>

      {message && <p className="text-red-600 mt-4">{message}</p>}

      {/* TABLE of all budgets (for every month) */}
      {budgetData && budgetData.budgets && budgetData.budgets.length > 0 ? (
        <div className="mt-8 bg-white p-4 rounded shadow max-w-4xl">
          <h2 className="text-xl font-bold mb-2">All Budgets</h2>

          <table className="table-auto w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">Month</th>
                <th className="p-2 border">Category</th>
                <th className="p-2 border">Budget Limit</th>
                <th className="p-2 border">Spent</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {budgetData.budgets.map((b) => {
                const monthStr = new Date(b.month_start).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                });
                return (
                  <tr key={b.budget_id} className="text-center">
                    <td className="p-2 border">{monthStr}</td>
                    <td className="p-2 border">{b.category_name}</td>
                    <td className="p-2 border">{b.budget_limit}</td>
                    <td className="p-2 border">{b.spent}</td>
                    <td className="p-2 border">
                      {b.alert ? (
                        <span className="text-red-600 font-semibold">Over Budget</span>
                      ) : (
                        <span className="text-green-500">Within Limit</span>
                      )}
                    </td>
                    <td className="p-2 border">
                      <button
                        onClick={() => handleDeleteBudget(b.budget_id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-8">
          <p>No budgets found.</p>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
