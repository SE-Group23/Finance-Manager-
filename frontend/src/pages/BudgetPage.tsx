// frontend/src/pages/BudgetPage.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BudgetPage: React.FC = () => {
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [budgetData, setBudgetData] = useState<any>(null);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  // Fetch the current budget when the component mounts
  useEffect(() => {
    async function fetchBudget() {
      try {
        const res = await axios.get('http://localhost:8999/api/budgets', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBudgetData(res.data);
        if (res.data) {
          setMonthlyLimit(String(res.data.monthly_limit));
          setMonthlyIncome(String(res.data.monthly_income || ''));
        }
      } catch (error) {
        console.error('Error fetching budget:', error);
      }
    }
    fetchBudget();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        monthly_limit: parseFloat(monthlyLimit),
        monthly_income: monthlyIncome ? parseFloat(monthlyIncome) : null,
      };
      const res = await axios.post('http://localhost:8999/api/budgets', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgetData(res.data);
      setMessage('Budget updated successfully');
    } catch (error: any) {
      console.error('Error updating budget:', error);
      setMessage(error.response?.data?.error || 'Budget update failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4">Manage Budget</h1>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow max-w-md">
        <div className="mb-4">
          <label className="block mb-1">Monthly Income (optional)</label>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            className="p-2 border rounded w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Monthly Spending Limit</label>
          <input
            type="number"
            value={monthlyLimit}
            onChange={(e) => setMonthlyLimit(e.target.value)}
            className="p-2 border rounded w-full"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Update Budget
        </button>
      </form>
      {budgetData && (
        <div className="mt-6">
          <h2 className="text-xl font-bold">Budget Overview</h2>
          <p>
            <strong>Monthly Income:</strong> {budgetData.monthly_income || 'Not set'}
          </p>
          <p>
            <strong>Monthly Spending Limit:</strong> {budgetData.monthly_limit}
          </p>
          {/* Optionally, you can compute remaining budget if you integrate with transactions */}
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
