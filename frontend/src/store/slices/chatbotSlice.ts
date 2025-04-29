import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { getChatbotResponse } from "../../services/chatbotService"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

interface ChatbotState {
  messages: Message[]
  inputValue: string
  showIntro: boolean
  loading: boolean
  error: string | null
}

const serializeMessages = (messages: Message[]): string => {
  return JSON.stringify(
    messages.map((msg) => ({
      ...msg,
      timestamp: msg.timestamp.toISOString(),
    })),
  )
}

const deserializeMessages = (serialized: string): Message[] => {
  try {
    const parsed = JSON.parse(serialized)
    return parsed.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }))
  } catch (error) {
    console.error("Error deserializing messages:", error)
    return []
  }
}

const loadMessages = (): Message[] => {
  const stored = sessionStorage.getItem("chatbot_messages")
  if (stored) {
    return deserializeMessages(stored)
  }
  return []
}

const saveMessages = (messages: Message[]) => {
  const lastTenMessages = messages.slice(-10)
  sessionStorage.setItem("chatbot_messages", serializeMessages(lastTenMessages))
}

const initialState: ChatbotState = {
  messages: loadMessages(),
  inputValue: "",
  showIntro: loadMessages().length === 0, 
  loading: false,
  error: null,
}

export const sendMessage = createAsyncThunk("chatbot/sendMessage", async (message: string, { rejectWithValue }) => {
  try {
    const response = await getChatbotResponse(message)
    return response
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to get chatbot response")
  }
})

const chatbotSlice = createSlice({
  name: "chatbot",
  initialState,
  reducers: {
    setInputValue: (state, action) => {
      state.inputValue = action.payload
    },
    addUserMessage: (state, action) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: action.payload,
        sender: "user",
        timestamp: new Date(),
      }
      state.messages.push(userMessage)
      state.inputValue = ""
      state.showIntro = false

      saveMessages(state.messages)
    },
    setShowIntro: (state, action) => {
      state.showIntro = action.payload
    },
    clearMessages: (state) => {
      state.messages = []
      sessionStorage.removeItem("chatbot_messages")
      state.showIntro = true
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: action.payload,
          sender: "ai",
          timestamp: new Date(),
        }

        state.messages.push(aiMessage)

        saveMessages(state.messages)
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string

        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: "Sorry, there was a problem getting the chatbot response. Please try again.",
          sender: "ai",
          timestamp: new Date(),
        }

        state.messages.push(errorMessage)

    
        saveMessages(state.messages)
      })
  },
})

export const { setInputValue, addUserMessage, setShowIntro, clearMessages } = chatbotSlice.actions
export default chatbotSlice.reducer
