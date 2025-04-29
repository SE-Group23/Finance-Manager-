"use client"

import { useEffect } from "react"
import { format, addMonths, subMonths, parseISO, isSameDay, startOfDay, endOfWeek, isSameMonth } from "date-fns"
import { EventModal } from "../components/calender-recurring/EventModal"
import { DeleteAllConfirmationModal } from "../components/calender-recurring/DeleteAllConfirmationModal"
import Sidebar from "../components/Sidebar"
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react"
import { NotificationsPanel } from "../components/calender-recurring/NotificationsPanel"
import { useAppDispatch, useAppSelector } from "../hooks"
import {
  fetchCalendarData,
  saveEvent,
  deleteEvent,
  deleteAllEvents,
  setCurrentDate,
  setIsModalOpen,
  setIsDeleteAllModalOpen,
  setSelectedEvent,
  clearError,
} from "../store/slices/calendarSlice"
import type { CalendarEvent } from "../services/calendarService"

export default function RecurringCalendarPage() {
  const dispatch = useAppDispatch()
  const {
    currentDate,
    calendarEvents,
    recurringPayments,
    eventAmounts,
    isModalOpen,
    isDeleteAllModalOpen,
    selectedEvent,
    loading,
    isDeleting,
    isProcessing,
    error,
    refreshKey,
  } = useAppSelector((state) => state.calendar)

  useEffect(() => {
    dispatch(fetchCalendarData())
  }, [dispatch, refreshKey])

  const prevMonth = () => {
    dispatch(setCurrentDate(subMonths(currentDate, 1)))
  }

  const nextMonth = () => {
    dispatch(setCurrentDate(addMonths(currentDate, 1)))
  }

  const handleAddEvent = () => {
    dispatch(setSelectedEvent(null))
    dispatch(setIsModalOpen(true))
  }

  const handleEventClick = (event: CalendarEvent) => {
    dispatch(setSelectedEvent(event))
    dispatch(setIsModalOpen(true))
  }

  const handleSaveEvent = async (eventData: {
    event_id?: number
    event_title: string
    event_date: string
    event_type: string
    isRecurring: boolean
    frequency?: string
    amount?: number
  }) => {
    if (isProcessing) return

    dispatch(saveEvent(eventData))
  }

  const handleDeleteEvent = async () => {
    if (!selectedEvent || isDeleting || isProcessing) return
    dispatch(deleteEvent())
  }

  const handleDeleteAllEvents = async () => {
    if (isDeleting || isProcessing) return
    dispatch(deleteAllEvents())
  }

  const urgentEvents = calendarEvents.filter((event) => {
    const eventDate = parseISO(event.event_date)
    const today = startOfDay(new Date())
    const sevenDaysFromNow = new Date(today)
    sevenDaysFromNow.setDate(today.getDate() + 7)

    return eventDate >= today && eventDate <= sevenDaysFromNow
  })

  const thisWeekEvents = calendarEvents.filter((event) => {
    const eventDate = parseISO(event.event_date)
    const today = startOfDay(new Date())
    const weekEnd = endOfWeek(today)

    return eventDate >= today && eventDate <= weekEnd
  })

  const upcomingEvents = calendarEvents.filter((event) => {
    const eventDate = parseISO(event.event_date)
    const today = startOfDay(new Date())
    const weekEnd = endOfWeek(today)
    const sixMonthsFromNow = addMonths(today, 6)

    return eventDate > weekEnd && eventDate <= sixMonthsFromNow
  })

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const firstDayIndex = firstDay.getDay()

    const lastDay = new Date(year, month + 1, 0)
    const lastDate = lastDay.getDate()

    const prevLastDay = new Date(year, month, 0)
    const prevLastDate = prevLastDay.getDate()

    const totalDays = 42

    const days = []

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevLastDate - i),
        isCurrentMonth: false,
      })
    }

    for (let i = 1; i <= lastDate; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      })
    }

    const remainingDays = totalDays - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      })
    }

    return days
  }

  const calendarDays = generateCalendarDays()

  const getEventsForDay = (day: Date) => {
    const uniqueEvents: CalendarEvent[] = []
    const eventMap = new Map<string, CalendarEvent>()

    calendarEvents
      .filter((event) => {
        const eventDate = parseISO(event.event_date)
        return isSameDay(eventDate, day)
      })
      .forEach((event) => {
        const key = `${event.event_title}-${event.event_date}`
        if (!eventMap.has(key)) {
          eventMap.set(key, event)
          uniqueEvents.push(event)
        }
      })

    return uniqueEvents
  }

  const getEventAmount = (eventId: number): number => {
    if (eventAmounts[eventId]) {
      return eventAmounts[eventId]
    }

    const event = calendarEvents.find((e) => e.event_id === eventId)
    if (event) {
      const recurringPayment = recurringPayments.find((p) => p.payment_name === event.event_title)
      if (recurringPayment?.amount) {
        return recurringPayment.amount
      }
    }

    return 0
  }

  if (loading && calendarEvents.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl">Loading calendar...</div>
      </div>
    )
  }

  const today = new Date()
  const paymentsThisMonth = calendarEvents.filter((event) => {
    const eventDate = parseISO(event.event_date)
    const amount = getEventAmount(event.event_id)
    return isSameMonth(eventDate, today) && amount > 0
  }).length

  return (
    <div className="flex min-h-screen bg-background-light font-inter">
      <Sidebar activePage="calendar" />

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <button
            onClick={() => dispatch(setIsDeleteAllModalOpen(true))}
            className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            disabled={isDeleting || isProcessing}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All Events
          </button>
        </div>
        <hr className="mb-6" />

        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-3">
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <NotificationsPanel
                  key={refreshKey}
                  urgentEvents={urgentEvents}
                  thisWeekEvents={thisWeekEvents}
                  upcomingEvents={upcomingEvents}
                  recurringPayments={recurringPayments}
                  eventAmounts={eventAmounts}
                  paymentsThisMonth={paymentsThisMonth}
                />
              </div>
            </div>

            <div>
              <button
                onClick={handleAddEvent}
                className="h-40 w-full rounded-2xl flex flex-col items-center justify-center transition-colors shadow-lg bg-gradient-to-r from-calendar-highlight to-calendar-highlightHover"
                disabled={isDeleting || isProcessing}
              >
                <Plus className="h-12 w-12 text-black mb-2" />
                <span className="text-lg font-medium text-black">Add event</span>
              </button>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium">{format(currentDate, "MMMM yyyy")}</h2>
              <div className="flex space-x-2">
                <button onClick={prevMonth} className="p-1 rounded-full hover:bg-gray-100" aria-label="Previous month">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={nextMonth} className="p-1 rounded-full hover:bg-gray-100" aria-label="Next month">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                <div key={index} className="p-2 text-center text-[#FF9F1C] font-medium">
                  {day}
                </div>
              ))}

              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDay(day.date)
                const isCurrentDay = isSameDay(day.date, new Date())
                const dayNumber = day.date.getDate()

                return (
                  <div
                    key={index}
                    className={`h-24 p-2 rounded-md ${
                      isCurrentDay
                        ? "bg-calendar-highlight"
                        : day.isCurrentMonth
                          ? "bg-gray-50"
                          : "bg-gray-100 opacity-70"
                    } relative`}
                  >
                    <div
                      className={`text-sm font-medium ${
                        isCurrentDay
                          ? "bg-calendar-highlight rounded-full h-6 w-6 flex items-center justify-center"
                          : ""
                      }`}
                    >
                      {dayNumber}
                    </div>
                    <div className="mt-1 space-y-1 overflow-y-auto max-h-[60px]">
                      {dayEvents.map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          onClick={() => handleEventClick(event)}
                          className="text-xs p-1 px-2 rounded-md truncate cursor-pointer bg-calendar-event hover:bg-calendar-eventHover"
                        >
                          {event.event_title}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {isModalOpen && (
          <EventModal
            event={selectedEvent}
            isOpen={isModalOpen}
            onClose={() => dispatch(setIsModalOpen(false))}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
            eventAmounts={eventAmounts}
            recurringPayments={recurringPayments}
          />
        )}

        <DeleteAllConfirmationModal
          isOpen={isDeleteAllModalOpen}
          onClose={() => dispatch(setIsDeleteAllModalOpen(false))}
          onConfirm={handleDeleteAllEvents}
          eventCount={calendarEvents.length}
        />

        {error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p>{error}</p>
            <button className="absolute top-0 right-0 p-2" onClick={() => dispatch(clearError())}>
              &times;
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="fixed bottom-4 left-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg">
            <p>Processing...</p>
          </div>
        )}
      </div>
    </div>
  )
}
