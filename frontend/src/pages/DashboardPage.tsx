// frontend/src/pages/DashboardPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to your Finance Manager Dashboard!</p>
      <div className="mt-6">
        <Link to="/transactions" className="text-blue-500 hover:underline mr-4">
          Manage Transactions
        </Link>
        <Link to="/budget" className="text-blue-500 hover:underline mr-4">
          Manage Budget
        </Link>
        <Link to="/chatbot" className="text-blue-500 hover:underline">
          AI Chatbot
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
// simple dashboard page with links to different sections of the app.