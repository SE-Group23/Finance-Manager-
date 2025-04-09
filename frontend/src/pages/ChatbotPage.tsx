"use client"
import React, { useState, useRef, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import { SendIcon, LightbulbIcon, ChatbotIcon, AlertTriangleIcon } from "../components/icons/sidebar-icons"
import { getChatbotResponse } from "../services/chatbotService"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

const examplePrompts = [
  { text: "What's the 50/30/20 budgeting rule?" },
  { text: "Can you analyze my spending and suggest ways to save?" },
  { text: "What's the best way to start investing?" },
]

const capabilities = [
  { description: "Provides easy to understand financial information." },
  { description: "Personalised budget based on spending patterns analysation" },
  { description: "Tracks portfolio performance and explains investment strategies" },
]

const limitations = [
  { description: "May not reflect the latest changes in financial regulations" },
  { description: "Advice limited to available data" },
  { description: "Cannot predict stock market shifts and investment returns" },
]

const ChatbotPage: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [showIntro, setShowIntro] = useState<boolean>(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle the chat form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Hide the intro once we start sending a message
    if (showIntro) setShowIntro(false)

    // 1. Create the user's message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // Clear the input
    setInputValue("")

    try {
      // 2. Actually call the chatbot endpoint
      const aiText = await getChatbotResponse(userMessage.content)

      // 3. Create the AI message object
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiText,
        sender: "ai",
        timestamp: new Date(),
      }

      // 4. Add the AI message to state
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error("Error getting chatbot response:", error)
      // Show a fallback error
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: "Sorry, there was a problem getting the chatbot response. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  // convenience for clicking example prompts
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
                  {/* Examples */}
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
                          className="w-full h-16 p-2 bg-box-color rounded-lg text-sm hover:bg-[#EFF5C8] transition-colors font-medium text-center flex items-center justify-center text-gray-600"
                        >
                          {prompt.text} →
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-navbar bg-opacity-20 flex items-center justify-center mb-3">
                      <ChatbotIcon className="h-6 w-6 text-navbar" />
                    </div>
                    <h3 className="font-medium text-navbar mb-5 text-base">Capabilities</h3>
                    <div className="space-y-3 w-full">
                      {capabilities.map((cap, index) => (
                        <div
                          key={index}
                          className="w-full h-16 p-2 bg-box-color rounded-lg text-sm font-medium flex items-center justify-center text-center text-gray-600"
                        >
                          {cap.description}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Limitations */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-navbar bg-opacity-20 flex items-center justify-center mb-3">
                      <AlertTriangleIcon className="h-6 w-6 text-navbar" />
                    </div>
                    <h3 className="font-medium text-navbar mb-5 text-base">Limitations</h3>
                    <div className="space-y-3 w-full">
                      {limitations.map((lim, index) => (
                        <div
                          key={index}
                          className="w-full h-16 p-2 bg-box-color rounded-lg text-sm font-medium flex items-center justify-center text-center text-gray-600"
                        >
                          {lim.description}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Show conversation
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

          {/* Chat Input Box */}
          <div className="max-w-2xl mx-auto w-full mt-auto pt-6">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about your budget, spending or investments!"
                className="w-full pl-4 pr-12 py-3 rounded-full bg-white border border-gray-200 shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-navbar focus:border-transparent 
                           placeholder:font-medium placeholder:text-gray-500"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 flex 
                           items-center justify-center rounded-full bg-gray-100 text-gray-500 
                           hover:bg-navbar hover:text-white transition-colors"
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
