"use client"

import type React from "react"

import type { ReactNode } from "react"
import {
  DashboardIcon,
  TransactionsIcon,
  BudgetsIcon,
  AssetsIcon,
  CalendarIcon,
  ZakatIcon,
  ChatbotIcon,
  SettingsIcon,
  LogoutIcon,
} from "../components/icons/sidebar-icons"

interface NavItemProps {
  icon: ReactNode
  text: string
  active: boolean
  className?: string
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, active, className }) => {
  return (
    <li>
      <a
        href="#"
        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
          active ? "font-medium " + (className || "") : "text-white hover:bg-navbar-dark hover:text-white"
        }`}
      >
        <span className="flex-shrink-0">{icon}</span>
        <span>{text}</span>
      </a>
    </li>
  )
}

interface SidebarProps {
  activePage: string
}

const Sidebar: React.FC<SidebarProps> = ({ activePage }) => {
  return (
    <div className="w-[180px] bg-navbar text-white flex flex-col rounded-r-xl overflow-hidden">
      <div className="p-4 flex items-center gap-2">
        <div className="w-8 h-8 rounded overflow-hidden">
          <img src="/src/assets/logo.png" alt="Company Logo" className="w-full h-full object-cover" />
        </div>
        <span className="font-bold font-inter">TBD</span>
      </div>

      <nav className="flex-1">
        <ul className="space-y-1 px-2">
          <NavItem icon={<DashboardIcon />} text="Dashboard" active={activePage === "dashboard"} />
          <NavItem icon={<TransactionsIcon />} text="Transactions" active={activePage === "transactions"} />
          <NavItem icon={<BudgetsIcon />} text="Budgets" active={activePage === "budgets"} />
          <NavItem icon={<AssetsIcon />} text="Assets" active={activePage === "assets"} />
          <NavItem icon={<CalendarIcon />} text="Calendar" active={activePage === "calendar"} />
          <NavItem icon={<ZakatIcon />} text="Zakat & Tax" active={activePage === "zakat"} />
          <NavItem
            icon={<ChatbotIcon />}
            text="AI Chatbot"
            active={activePage === "chatbot"}
            className={activePage === "chatbot" ? "bg-chatbot-highlight text-black rounded-md" : ""}
          />
        </ul>
      </nav>

      <div className="mt-auto border-t border-navbar-dark p-4">
        <div className="flex items-center gap-4 mb-2">
          <button className="text-white hover:text-gray-200">
            <SettingsIcon size={18} />
          </button>
          <button className="text-white hover:text-gray-200">
            <LogoutIcon size={18} />
          </button>
        </div>
        <div className="text-sm">
          <div className="font-medium">Sam Wheeler</div>
          <div className="text-white text-opacity-80 text-xs">samwheeler@example.com</div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
