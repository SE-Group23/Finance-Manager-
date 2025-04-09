"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import { SendIcon, LightbulbIcon, ChatbotIcon, AlertTriangleIcon } from "../components/icons/sidebar-icons"

interface Prompt {
  text: string
}

interface Capability {
  description: string
}

interface Limitation {
  description: string
}

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

const examplePrompts: Prompt[] = [
  { text: "What's the 50/30/20 budgeting rule?" },
  { text: "Can you analyze my spending and suggest ways to save?" },
  { text: "What's the best way to start investing?" },
]

const capabilities: Capability[] = [
  { description: "Provides easy to understand financial information." },
  { description: "Personalised budget based on spending patterns analysation" },
  { description: "Tracks portfolio performance and explains investment strategies" },
]

const limitations: Limitation[] = [
  { description: "May not reflect the latest changes in financial regulations" },
  { description: "Advice limited to available data" },
  { description: "Cannot predict stock market shifts and investment returns" },
]

const ChatbotPage: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [showIntro, setShowIntro] = useState<boolean>(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Hide intro when conversation starts
    if (showIntro) {
      setShowIntro(false)
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(inputValue),
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    }, 1000)
  }

  const getAIResponse = (query: string): string => {
    // Simple response logic - in a real app, this would connect to an AI service
    if (query.toLowerCase().includes("budget") || query.toLowerCase().includes("50/30/20")) {
      return "The 50/30/20 budgeting rule suggests allocating 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment. This creates a balanced approach to managing your finances."
    } else if (query.toLowerCase().includes("save") || query.toLowerCase().includes("saving")) {
      return "Based on typical spending patterns, you could save money by: 1) Reviewing subscription services you rarely use, 2) Meal planning to reduce food waste, 3) Using cashback or rewards credit cards for regular purchases."
    } else if (query.toLowerCase().includes("invest") || query.toLowerCase().includes("investing")) {
      return "For beginners, a good way to start investing is through index funds or ETFs that track the broader market. These provide diversification with lower fees. Consider starting with a small, regular investment to build the habit."
    } else {
      return "Thank you for your question. I can help with budgeting, saving strategies, investment advice, and general financial planning. Could you provide more details about your specific financial situation?"
    }
  }

  const handleExampleClick = (text: string): void => {
    setInputValue(text)
  }

  return (
    <div className="flex h-screen bg-background-light font-inter">
      {/* Sidebar */}
      <Sidebar activePage="chatbot" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-background-light p-4 border-b">
          <h1 className="text-xl font-semibold text-primary-dark">Personalised Financial Advisor</h1>
        </header>

        <main className="flex-1 overflow-auto p-6 flex flex-col">
          <div className="max-w-2xl mx-auto w-full flex-1">
            {showIntro ? (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-xl font-bold text-primary-dark mb-2">Let's make your money work smarter!</h2>
                  <p className="text-xl font-bold text-primary-dark">What do you need help with today?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  {/* Examples Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-navbar bg-opacity-20 flex items-center justify-center mb-3">
                      <LightbulbIcon className="h-6 w-6 text-navbar" />
                    </div>
                    <h3 className="font-medium text-navbar mb-5 text-base">Examples</h3>
                    <div className="space-y-3 w-full">
                      {examplePrompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => handleExampleClick(prompt.text)}
                          className="w-full h-16 text-left p-2 bg-box-color rounded-lg text-sm hover:bg-[#EFF5C8] transition-colors font-medium text-center flex items-center justify-center text-gray-600"
                        >
                          {prompt.text} →
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Capabilities Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-navbar bg-opacity-20 flex items-center justify-center mb-3">
                      <ChatbotIcon className="h-6 w-6 text-navbar" />
                    </div>
                    <h3 className="font-medium text-navbar mb-5 text-base">Capabilities</h3>
                    <div className="space-y-3 w-full">
                      {capabilities.map((capability, index) => (
                        <div
                          key={index}
                          className="w-full h-16 p-2 bg-box-color rounded-lg text-sm font-medium flex items-center justify-center text-center text-gray-600"
                        >
                          {capability.description}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Limitations Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-navbar bg-opacity-20 flex items-center justify-center mb-3">
                      <AlertTriangleIcon className="h-6 w-6 text-navbar" />
                    </div>
                    <h3 className="font-medium text-navbar mb-5 text-base">Limitations</h3>
                    <div className="space-y-3 w-full">
                      {limitations.map((limitation, index) => (
                        <div
                          key={index}
                          className="w-full h-16 p-2 bg-box-color rounded-lg text-sm font-medium flex items-center justify-center text-center text-gray-600"
                        >
                          {limitation.description}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-4 pb-4 flex-1">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                        message.sender === "user"
                          ? "bg-navbar text-white"
                          : "bg-white text-gray-800 border border-gray-200"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70 text-right">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="max-w-2xl mx-auto w-full mt-auto pt-6">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about your budget, spending or investments!"
                className="w-full pl-4 pr-12 py-3 rounded-full bg-white border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-navbar focus:border-transparent font-inter placeholder:font-medium placeholder:text-gray-500"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-navbar hover:text-white transition-colors"
              >
                <SendIcon size={16} />
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ChatbotPage
