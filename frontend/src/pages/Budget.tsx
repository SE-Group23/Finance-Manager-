// src/pages/budgets.tsx or src/app/budgets/page.tsx (depending on your routing)
"use client"

import BudgetManagerContent from '../components/budget-manager-content';
import Sidebar from '../components/Sidebar'; // Import the Sidebar component

function BudgetsPage() {
  return (
    <div className="flex h-screen">
      {/* Include the Sidebar component and pass the active page */}
      <Sidebar activePage="budgets" />
      
      {/* Main content area */}
      <div className="flex-1 overflow-auto bg-background-light">
        <BudgetManagerContent />
      </div>
    </div>
  );
}

export default BudgetsPage;