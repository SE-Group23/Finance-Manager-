import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import {
  fetchCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  type CalendarEvent,
} from "../../services/calendarService"
import {
  fetchRecurringPayments,
  createRecurringPayment,
  updateRecurringPayment,
  deleteRecurringPayment,
  type RecurringPayment,
} from "../../services/recurringService"
import { parseISO, isSameDay } from "date-fns"

interface CalendarState {
  currentDate: Date
  calendarEvents: CalendarEvent[]
  recurringPayments: RecurringPayment[]
  eventAmounts: Record<number, number>
  isModalOpen: boolean
  isDeleteAllModalOpen: boolean
  selectedEvent: CalendarEvent | null
  loading: boolean
  isDeleting: boolean
  isProcessing: boolean
  error: string | null
  refreshKey: number
}

// Helper function to load event amounts from sessionStorage
const loadEventAmounts = (): Record<number, number> => {
  try {
    const storedAmounts = sessionStorage.getItem("eventAmounts")
    if (storedAmounts) {
      return JSON.parse(storedAmounts)
    }
  } catch (error) {
    console.error("Error loading event amounts:", error)
  }
  return {}
}

// Helper function to save event amounts to sessionStorage
const saveEventAmounts = (amounts: Record<number, number>) => {
  try {
    sessionStorage.setItem("eventAmounts", JSON.stringify(amounts))
  } catch (error) {
    console.error("Error saving event amounts:", error)
  }
}

const initialState: CalendarState = {
  currentDate: new Date(),
  calendarEvents: [],
  recurringPayments: [],
  eventAmounts: loadEventAmounts(),
  isModalOpen: false,
  isDeleteAllModalOpen: false,
  selectedEvent: null,
  loading: true,
  isDeleting: false,
  isProcessing: false,
  error: null,
  refreshKey: 0,
}

// Async thunks
export const fetchCalendarData = createAsyncThunk("calendar/fetchData", async (_, { rejectWithValue }) => {
  try {
    const [events, payments] = await Promise.all([fetchCalendarEvents(), fetchRecurringPayments()])

    const uniqueEvents: CalendarEvent[] = []
    const eventMap = new Map<string, CalendarEvent>()

    events.forEach((event) => {
      const key = `${event.event_title}-${event.event_date}`
      if (!eventMap.has(key)) {
        eventMap.set(key, event)
        uniqueEvents.push(event)
      } else {
        const existingEvent = eventMap.get(key)!
        if (event.event_id < existingEvent.event_id) {
          eventMap.set(key, event)
          const index = uniqueEvents.findIndex((e) => e.event_id === existingEvent.event_id)
          if (index !== -1) {
            uniqueEvents[index] = event
          }
        }
      }
    })

    return { events: uniqueEvents, payments }
  } catch (error) {
    return rejectWithValue("Failed to load calendar data. Please try again.")
  }
})

export const saveEvent = createAsyncThunk(
  "calendar/saveEvent",
  async (
    eventData: {
      event_id?: number
      event_title: string
      event_date: string
      event_type: string
      isRecurring: boolean
      frequency?: string
      amount?: number
    },
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as { calendar: CalendarState }
      const { calendarEvents, recurringPayments, selectedEvent } = state.calendar

      let savedEventId: number | undefined

      if (eventData.isRecurring) {
        const recurringData = {
          amount: eventData.amount !== undefined ? eventData.amount : 0,
          payment_name: eventData.event_title,
          frequency: eventData.frequency || "monthly",
          next_due_date: eventData.event_date,
        }

        if (selectedEvent?.event_id) {
          const recurringPayment = recurringPayments.find((p) => p.payment_name === selectedEvent.event_title)

          const isTitleChanged = selectedEvent.event_title !== eventData.event_title

          if (recurringPayment) {
            await updateRecurringPayment(recurringPayment.recurring_id, recurringData)

            if (isTitleChanged) {
              const relatedEvents = calendarEvents.filter((event) => event.event_title === selectedEvent.event_title)
              for (const event of relatedEvents) {
                await updateCalendarEvent(event.event_id, {
                  event_title: eventData.event_title,
                  event_type: "recurring_due",
                })
              }
            } else {
              await updateCalendarEvent(selectedEvent.event_id, {
                event_title: eventData.event_title,
                event_date: eventData.event_date,
                event_type: "recurring_due",
              })
            }

            savedEventId = selectedEvent.event_id
          } else {
            const newRecurringPayment = await createRecurringPayment(recurringData)

            await updateCalendarEvent(selectedEvent.event_id, {
              event_title: eventData.event_title,
              event_date: eventData.event_date,
              event_type: "recurring_due",
            })

            savedEventId = selectedEvent.event_id
          }
        } else {
          const eventExists = calendarEvents.some(
            (event) =>
              event.event_title === eventData.event_title &&
              isSameDay(parseISO(event.event_date), parseISO(eventData.event_date)),
          )

          if (!eventExists) {
            const newRecurringPayment = await createRecurringPayment(recurringData)

            await new Promise((resolve) => setTimeout(resolve, 500))

            const events = await fetchCalendarEvents()

            const newEvent = events.find(
              (e) =>
                e.event_title === eventData.event_title &&
                isSameDay(parseISO(e.event_date), parseISO(eventData.event_date)),
            )

            if (newEvent) {
              savedEventId = newEvent.event_id
            } else {
              const manualEvent = await createCalendarEvent({
                event_title: eventData.event_title,
                event_date: eventData.event_date,
                event_type: "recurring_due",
              })
              savedEventId = manualEvent.event_id
            }
          } else {
            return rejectWithValue("An event with this title and date already exists.")
          }
        }
      } else {
        if (selectedEvent?.event_id) {
          const wasRecurring =
            selectedEvent.event_type === "recurring_due" || selectedEvent.event_type === "recurring_payment"

          if (wasRecurring) {
            const recurringPayment = recurringPayments.find((p) => p.payment_name === selectedEvent.event_title)
            if (recurringPayment) {
              await deleteRecurringPayment(recurringPayment.recurring_id)
            }
          }

          await updateCalendarEvent(selectedEvent.event_id, {
            event_title: eventData.event_title,
            event_date: eventData.event_date,
            event_type: eventData.event_type,
          })
          savedEventId = selectedEvent.event_id
        } else {
          const eventExists = calendarEvents.some(
            (event) =>
              event.event_title === eventData.event_title &&
              isSameDay(parseISO(event.event_date), parseISO(eventData.event_date)),
          )

          if (!eventExists) {
            const newEvent = await createCalendarEvent({
              event_title: eventData.event_title,
              event_date: eventData.event_date,
              event_type: eventData.event_type,
            })
            savedEventId = newEvent.event_id
          } else {
            return rejectWithValue("An event with this title and date already exists.")
          }
        }
      }

      return { savedEventId, amount: eventData.amount }
    } catch (error) {
      return rejectWithValue("Failed to save event. Please try again.")
    }
  },
)

export const deleteEvent = createAsyncThunk("calendar/deleteEvent", async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as { calendar: CalendarState }
    const { selectedEvent, calendarEvents, recurringPayments, eventAmounts } = state.calendar

    if (!selectedEvent) {
      return rejectWithValue("No event selected for deletion.")
    }

    const isRecurringEvent =
      selectedEvent.event_type === "recurring_due" || selectedEvent.event_type === "recurring_payment"
    const recurringPayment = recurringPayments.find((p) => p.payment_name === selectedEvent.event_title)

    if (isRecurringEvent && recurringPayment) {
      await deleteRecurringPayment(recurringPayment.recurring_id)

      const relatedEvents = calendarEvents.filter(
        (event) =>
          (event.event_type === "recurring_due" || event.event_type === "recurring_payment") &&
          event.event_title === selectedEvent.event_title,
      )

      for (const event of relatedEvents) {
        await deleteCalendarEvent(event.event_id)
      }

      // Return the IDs of all deleted events
      return {
        deletedEventIds: relatedEvents.map((event) => event.event_id),
      }
    } else {
      await deleteCalendarEvent(selectedEvent.event_id)
      return {
        deletedEventIds: [selectedEvent.event_id],
      }
    }
  } catch (error) {
    return rejectWithValue("Failed to delete event. Please try again.")
  }
})

export const deleteAllEvents = createAsyncThunk(
  "calendar/deleteAllEvents",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { calendar: CalendarState }
      const { recurringPayments, calendarEvents } = state.calendar

      if (recurringPayments.length > 0) {
        for (const payment of recurringPayments) {
          try {
            await deleteRecurringPayment(payment.recurring_id)
          } catch (err) {
            // Continue even if one deletion fails
          }
        }
      }

      if (calendarEvents.length > 0) {
        for (const event of calendarEvents) {
          try {
            await deleteCalendarEvent(event.event_id)
          } catch (err) {
            // Continue even if one deletion fails
          }
        }
      }

      return true
    } catch (error) {
      return rejectWithValue("Failed to delete all events. Please try again.")
    }
  },
)

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setCurrentDate: (state, action) => {
      state.currentDate = action.payload
    },
    setIsModalOpen: (state, action) => {
      state.isModalOpen = action.payload
    },
    setIsDeleteAllModalOpen: (state, action) => {
      state.isDeleteAllModalOpen = action.payload
    },
    setSelectedEvent: (state, action) => {
      state.selectedEvent = action.payload
    },
    saveEventAmount: (state, action) => {
      const { eventId, amount } = action.payload
      state.eventAmounts = { ...state.eventAmounts, [eventId]: amount }
      saveEventAmounts(state.eventAmounts)
    },
    clearError: (state) => {
      state.error = null
    },
    incrementRefreshKey: (state) => {
      state.refreshKey += 1
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch calendar data
      .addCase(fetchCalendarData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCalendarData.fulfilled, (state, action) => {
        state.calendarEvents = action.payload.events
        state.recurringPayments = action.payload.payments
        state.loading = false
      })
      .addCase(fetchCalendarData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Save event
      .addCase(saveEvent.pending, (state) => {
        state.isProcessing = true
        state.error = null
      })
      .addCase(saveEvent.fulfilled, (state, action) => {
        if (action.payload.savedEventId && action.payload.amount !== undefined) {
          state.eventAmounts = {
            ...state.eventAmounts,
            [action.payload.savedEventId]: action.payload.amount,
          }
          saveEventAmounts(state.eventAmounts)
        }
        state.isModalOpen = false
        state.selectedEvent = null
        state.isProcessing = false
        state.refreshKey += 1
      })
      .addCase(saveEvent.rejected, (state, action) => {
        state.error = action.payload as string
        state.isProcessing = false
      })

      // Delete event
      .addCase(deleteEvent.pending, (state) => {
        state.isDeleting = true
        state.isProcessing = true
        state.error = null
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        const updatedAmounts = { ...state.eventAmounts }
        action.payload.deletedEventIds.forEach((id) => {
          delete updatedAmounts[id]
        })
        state.eventAmounts = updatedAmounts
        saveEventAmounts(updatedAmounts)

        state.isModalOpen = false
        state.selectedEvent = null
        state.isDeleting = false
        state.isProcessing = false
        state.refreshKey += 1
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.error = action.payload as string
        state.isDeleting = false
        state.isProcessing = false
      })

      // Delete all events
      .addCase(deleteAllEvents.pending, (state) => {
        state.isDeleting = true
        state.isProcessing = true
        state.error = null
      })
      .addCase(deleteAllEvents.fulfilled, (state) => {
        state.eventAmounts = {}
        sessionStorage.removeItem("eventAmounts")
        state.isDeleteAllModalOpen = false
        state.isDeleting = false
        state.isProcessing = false
        state.refreshKey += 1
      })
      .addCase(deleteAllEvents.rejected, (state, action) => {
        state.error = action.payload as string
        state.isDeleting = false
        state.isProcessing = false
      })
  },
})

export const {
  setCurrentDate,
  setIsModalOpen,
  setIsDeleteAllModalOpen,
  setSelectedEvent,
  saveEventAmount,
  clearError,
  incrementRefreshKey,
} = calendarSlice.actions
export default calendarSlice.reducer
