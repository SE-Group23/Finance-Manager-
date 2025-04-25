"use client"

import { useState, useEffect } from "react"
import { format, addMonths, subMonths, parseISO, isSameDay, isAfter } from "date-fns"
import {
    fetchCalendarEvents,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    type CalendarEvent,
} from "../services/calendarService"
import {
    fetchRecurringPayments,
    createRecurringPayment,
    updateRecurringPayment,
    deleteRecurringPayment,
    type RecurringPayment,
} from "../services/recurringService"
import { EventModal } from "../components/EventModal"
import { DeleteAllConfirmationModal } from "../components/DeleteAllConfirmationModal"
import Sidebar from "../components/Sidebar"
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react"
import { NotificationsPanel } from "../components/NotificationsPanel"

export default function RecurringCalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
    const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // Fetch calendar events and recurring payments
    const fetchData = async () => {
        setIsLoading(true)
        setLoading(true)
        try {
            const [events, payments] = await Promise.all([fetchCalendarEvents(), fetchRecurringPayments()])
            setCalendarEvents(events)
            setRecurringPayments(payments)
            setError(null)
        } catch (err) {
            console.error("Error fetching calendar data:", err)
            setError("Failed to load calendar data. Please try again.")
        } finally {
            setIsLoading(false)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Navigate to previous month
    const prevMonth = () => {
        setCurrentDate(subMonths(currentDate, 1))
    }

    // Navigate to next month
    const nextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1))
    }

    // Open modal to add a new event
    const handleAddEvent = () => {
        setSelectedEvent(null)
        setIsModalOpen(true)
    }

    // Open modal to edit an existing event
    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event)
        setIsModalOpen(true)
    }

    // Handle saving a new or updated event
    const handleSaveEvent = async (eventData: {
        event_id?: number
        event_title: string
        event_date: string
        event_type: string
        isRecurring: boolean
        frequency?: string
        amount?: number
    }) => {
        try {
            setIsLoading(true)
            setLoading(true)

            if (eventData.isRecurring) {
                // Handle recurring payment
                const recurringData = {
                    amount: eventData.amount || 0,
                    payment_name: eventData.event_title,
                    frequency: eventData.frequency || "monthly",
                    next_due_date: eventData.event_date,
                }

                if (selectedEvent?.event_id) {
                    // Find the corresponding recurring payment
                    const recurringPayment = recurringPayments.find((p) => p.payment_name === selectedEvent.event_title)

                    if (recurringPayment) {
                        await updateRecurringPayment(recurringPayment.recurring_id, recurringData)
                    } else {
                        await createRecurringPayment(recurringData)
                    }
                } else {
                    await createRecurringPayment(recurringData)
                }
            } else {
                // Handle one-time event
                if (selectedEvent?.event_id) {
                    await updateCalendarEvent(selectedEvent.event_id, {
                        event_title: eventData.event_title,
                        event_date: eventData.event_date,
                        event_type: eventData.event_type,
                    })
                } else {
                    await createCalendarEvent({
                        event_title: eventData.event_title,
                        event_date: eventData.event_date,
                        event_type: eventData.event_type,
                    })
                }
            }

            // Refresh data
            await fetchData()

            setIsModalOpen(false)
            setSelectedEvent(null)
        } catch (err) {
            console.error("Error saving event:", err)
            setError("Failed to save event. Please try again.")
        } finally {
            setIsLoading(false)
            setLoading(false)
        }
    }

    // Handle deleting an event
    const handleDeleteEvent = async () => {
        if (!selectedEvent) return

        try {
            setIsLoading(true)
            setLoading(true)

            // Check if this is a recurring event
            const isRecurringEvent =
                selectedEvent.event_type === "recurring_due" || selectedEvent.event_type === "recurring_payment"
            const recurringPayment = recurringPayments.find((p) => p.payment_name === selectedEvent.event_title)

            if (isRecurringEvent && recurringPayment) {
                // Delete the recurring payment source
                await deleteRecurringPayment(recurringPayment.recurring_id)

                // Delete all future instances of this recurring event
                const eventDate = parseISO(selectedEvent.event_date)
                const today = new Date()

                // Find all instances of this recurring event that are today or in the future
                const relatedEvents = calendarEvents.filter(
                    (event) =>
                        (event.event_type === "recurring_due" || event.event_type === "recurring_payment") &&
                        event.event_title === selectedEvent.event_title &&
                        isAfter(parseISO(event.event_date), today),
                )

                // Delete each instance
                await Promise.all(relatedEvents.map((event) => deleteCalendarEvent(event.event_id)))
            } else {
                // Delete a single non-recurring event
                await deleteCalendarEvent(selectedEvent.event_id)
            }

            // Refresh data
            await fetchData()

            setIsModalOpen(false)
            setSelectedEvent(null)
        } catch (err) {
            console.error("Error deleting event:", err)
            setError("Failed to delete event. Please try again.")
        } finally {
            setIsLoading(false)
            setLoading(false)
        }
    }

    // Handle deleting all events
    const handleDeleteAllEvents = async () => {
        try {
            setIsLoading(true)
            setLoading(true)

            // Delete all recurring payments
            await Promise.all(recurringPayments.map((payment) => deleteRecurringPayment(payment.recurring_id)))

            // Delete all calendar events
            await Promise.all(calendarEvents.map((event) => deleteCalendarEvent(event.event_id)))

            // Refresh data
            await fetchData()

            setIsDeleteAllModalOpen(false)
            setError(null)
        } catch (err) {
            console.error("Error deleting all events:", err)
            setError("Failed to delete all events. Please try again.")
        } finally {
            setIsLoading(false)
            setLoading(false)
        }
    }

    // Get urgent events (due in the next 7 days)
    const urgentEvents = calendarEvents.filter((event) => {
        const eventDate = parseISO(event.event_date)
        const today = new Date()
        const sevenDaysFromNow = new Date()
        sevenDaysFromNow.setDate(today.getDate() + 7)

        return eventDate >= today && eventDate <= sevenDaysFromNow
    })

    // Get this week's events
    const thisWeekEvents = calendarEvents.filter((event) => {
        const eventDate = parseISO(event.event_date)
        const today = new Date()
        const endOfWeek = new Date()
        endOfWeek.setDate(today.getDate() + (7 - today.getDay()))

        return eventDate >= today && eventDate <= endOfWeek
    })

    // Get upcoming events (beyond this week but within next 6 months)
    const upcomingEvents = calendarEvents.filter((event) => {
        const eventDate = parseISO(event.event_date)
        const today = new Date()
        const endOfWeek = new Date()
        endOfWeek.setDate(today.getDate() + (7 - today.getDay()))
        const sixMonthsFromNow = addMonths(today, 6)

        return eventDate > endOfWeek && eventDate <= sixMonthsFromNow
    })

    // Count upcoming payments (within next 6 months)
    const upcomingPayments = calendarEvents.filter((event) => {
        const eventDate = parseISO(event.event_date)
        const today = new Date()
        const sixMonthsFromNow = addMonths(today, 6)

        return (
            (event.event_type === "recurring_due" || event.event_type === "recurring_payment") &&
            eventDate >= today &&
            eventDate <= sixMonthsFromNow
        )
    }).length

    // Generate calendar days
    const generateCalendarDays = () => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()

        // Get the first day of the month
        const firstDay = new Date(year, month, 1)
        const firstDayIndex = firstDay.getDay()

        // Get the last day of the month
        const lastDay = new Date(year, month + 1, 0)
        const lastDate = lastDay.getDate()

        // Get the last day of the previous month
        const prevLastDay = new Date(year, month, 0)
        const prevLastDate = prevLastDay.getDate()

        // Calculate total days to display (max 42 - 6 weeks)
        const totalDays = 42

        const days = []

        // Previous month's days
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevLastDate - i),
                isCurrentMonth: false,
            })
        }

        // Current month's days
        for (let i = 1; i <= lastDate; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true,
            })
        }

        // Next month's days
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

    // Get events for a specific day
    const getEventsForDay = (day: Date) => {
        return calendarEvents.filter((event) => {
            const eventDate = parseISO(event.event_date)
            return isSameDay(eventDate, day)
        })
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-xl">Loading calendar...</div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-background-light font-inter">
            {/* Sidebar */}
            <Sidebar activePage="calendar" />

            {/* Main content */}
            <div className="flex-1 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Calendar</h1>
                    <button
                        onClick={() => setIsDeleteAllModalOpen(true)}
                        className="flex items-center px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All Events
                    </button>
                </div>
                <hr className="mb-6" />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Notifications panel */}
                    <div className="lg:col-span-3">
                        <NotificationsPanel
                            urgentEvents={urgentEvents}
                            thisWeekEvents={thisWeekEvents}
                            upcomingEvents={upcomingEvents}
                            upcomingPayments={upcomingPayments}
                        />

                        {/* Calendar section */}
                        <div className="bg-white p-6 rounded-lg shadow mt-6">
                            {/* Calendar header */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-medium">{format(currentDate, "MMMM yyyy")}</h2>
                                <div className="flex space-x-2">
                                    <button onClick={prevMonth} className="p-1" aria-label="Previous month">
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button onClick={nextMonth} className="p-1" aria-label="Next month">
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Calendar grid */}
                            <div className="grid grid-cols-7 gap-px">
                                {/* Week day headers */}
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                                    <div key={index} className="p-2 text-center text-gray-500 font-medium">
                                        {day}
                                    </div>
                                ))}

                                {/* Calendar days */}
                                {calendarDays.map((day, index) => {
                                    const dayEvents = getEventsForDay(day.date)
                                    const isToday = isSameDay(day.date, new Date())
                                    const dayNumber = day.date.getDate()

                                    return (
                                        <div
                                            key={index}
                                            className={`h-24 p-1 ${day.isCurrentMonth ? "bg-gray-200" : "bg-gray-100"
                                                } relative ${isToday ? "bg-yellow-50" : ""}`}
                                        >
                                            <div
                                                className={`text-sm p-1 ${isToday ? "bg-yellow-300 rounded-full h-7 w-7 flex items-center justify-center" : ""
                                                    }`}
                                            >
                                                {dayNumber}
                                            </div>
                                            <div className="mt-1 space-y-1 overflow-y-auto max-h-[60px]">
                                                {dayEvents.map((event, eventIndex) => (
                                                    <div
                                                        key={eventIndex}
                                                        onClick={() => handleEventClick(event)}
                                                        className={`text-xs p-1 rounded truncate cursor-pointer ${event.event_type === "recurring_due" || event.event_type === "recurring_payment"
                                                                ? "bg-orange-200 hover:bg-orange-300"
                                                                : "bg-yellow-200 hover:bg-yellow-300"
                                                            }`}
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

                    {/* Add event button */}
                    <div>
                        <button
                            onClick={handleAddEvent}
                            className="h-40 w-full bg-chatbot-highlight hover:bg-[#d9f07d] rounded-lg flex flex-col items-center justify-center transition-colors"
                        >
                            <Plus className="h-12 w-12 text-black mb-2" />
                            <span className="text-lg font-medium">Add event</span>
                        </button>
                    </div>
                </div>

                {/* Event Modal */}
                {isModalOpen && (
                    <EventModal
                        event={selectedEvent}
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleSaveEvent}
                        onDelete={handleDeleteEvent}
                    />
                )}

                {/* Delete All Confirmation Modal */}
                <DeleteAllConfirmationModal
                    isOpen={isDeleteAllModalOpen}
                    onClose={() => setIsDeleteAllModalOpen(false)}
                    onConfirm={handleDeleteAllEvents}
                    eventCount={calendarEvents.length}
                />

                {/* Error message */}
                {error && (
                    <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <p>{error}</p>
                        <button className="absolute top-0 right-0 p-2" onClick={() => setError(null)}>
                            &times;
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
