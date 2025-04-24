// frontend/src/pages/TransactionsPage.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Transaction {
  transaction_id: number;
  amount: number;
  category: string;
  transaction_type: 'credit' | 'debit';
  vendor?: string;
  note?: string;
  transaction_date: string;
}

const TRANSACTIONS_API_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/transactions`;

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [vendor, setVendor] = useState('');
  const [note, setNote] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [transactionType, setTransactionType] = useState<'debit' | 'credit'>('debit');
  const token = localStorage.getItem('token');

  // Fetch transactions on component mount
  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await axios.get(TRANSACTIONS_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(res.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    }
    fetchTransactions();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newTransaction = {
        amount: parseFloat(amount),
        category,
        vendor,
        note,
        transactionDate: transactionDate || new Date().toISOString(),
        transaction_type: transactionType,  // New field added here
      };
      const res = await axios.post(TRANSACTIONS_API_URL, newTransaction, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions([res.data, ...transactions]);
      // Clear the form fields
      setAmount('');
      setCategory('');
      setVendor('');
      setNote('');
      setTransactionDate('');
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Transactions</h1>
      <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded shadow">
        <div className="mb-4">
          <label className="block mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="p-2 border rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Transaction Type</label>
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value as 'debit' | 'credit')}
            className="p-2 border rounded w-full"
          >
            <option value="debit">Debit (Expense)</option>
            <option value="credit">Credit (Income)</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Vendor (optional)</label>
          <input
            type="text"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            className="p-2 border rounded w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="p-2 border rounded w-full"
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block mb-1">Transaction Date</label>
          <input
            type="datetime-local"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="p-2 border rounded w-full"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Add Transaction
        </button>
      </form>
      <h2 className="text-xl font-bold mb-2">Transaction History</h2>
      <ul>
        {transactions.map((t) => (
          <li key={t.transaction_id} className="border-b py-2">
            <p>
              <strong>Amount:</strong> {t.amount}
              {` | `}
              <strong>Category:</strong> {t.category}
            </p>
            <p>
              <strong>Type:</strong>{' '}
              {t.transaction_type === 'credit' ? 'Credit (Income)' : 'Debit (Expense)'}
            </p>
            {t.vendor && <p><strong>Vendor:</strong> {t.vendor}</p>}
            {t.note && <p><strong>Note:</strong> {t.note}</p>}
            <p>
              <strong>Date:</strong> {new Date(t.transaction_date).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionsPage;
