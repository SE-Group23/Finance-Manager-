import BudgetManagerContent from "../components/BudgetManager"
import Sidebar from "../components/Sidebar"

function BudgetPage() {
  return (
    <div className="flex h-screen">
      <Sidebar activePage="budgets" />

      <div className="flex-1 overflow-auto bg-[#f0f8e8]">
        <BudgetManagerContent />
      </div>
    </div>
  )
}

export default BudgetPage
