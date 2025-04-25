"use client"

import { useState, useEffect } from "react"
import { format, addMonths, subMonths, parseISO, isSameDay, startOfDay, endOfWeek, isSameMonth } from "date-fns"
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
    const [eventAmounts, setEventAmounts] = useState<Record<number, number>>({})
    const [refreshKey, setRefreshKey] = useState(0) // Used to force re-render of components
    const [isDeleting, setIsDeleting] = useState(false) // Track deletion state
    const [isProcessing, setIsProcessing] = useState(false) // Track any API operation

    // Fetch calendar events and recurring payments
    const fetchData = async () => {
        setIsLoading(true)
        setLoading(true)
        try {
            const [events, payments] = await Promise.all([fetchCalendarEvents(), fetchRecurringPayments()])

            // Filter out duplicate events (same title and date)
            const uniqueEvents: CalendarEvent[] = []
            const eventMap = new Map<string, CalendarEvent>()

            events.forEach((event) => {
                const key = `${event.event_title}-${event.event_date}`
                if (!eventMap.has(key)) {
                    eventMap.set(key, event)
                    uniqueEvents.push(event)
                } else {
                    // If duplicate exists, keep the one with the lower ID (likely the original)
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

            setCalendarEvents(uniqueEvents)
            setRecurringPayments(payments)

            // Initialize event amounts from local storage
            const storedAmounts = localStorage.getItem("eventAmounts")
            if (storedAmounts) {
                setEventAmounts(JSON.parse(storedAmounts))
            }

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
    }, [refreshKey]) // Add refreshKey to dependencies to force re-fetch

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

    // Helper function to save event amount to local storage
    const saveEventAmount = (eventId: number, amount: number) => {
        const updatedAmounts = { ...eventAmounts, [eventId]: amount }
        setEventAmounts(updatedAmounts)
        localStorage.setItem("eventAmounts", JSON.stringify(updatedAmounts))
    }

    // Check if an event with the same title and date already exists
    const eventExists = (title: string, date: string, excludeEventId?: number) => {
        return calendarEvents.some(
            (event) =>
                event.event_title === title &&
                isSameDay(parseISO(event.event_date), parseISO(date)) &&
                (excludeEventId === undefined || event.event_id !== excludeEventId),
        )
    }

    // Find all events with the same title (for recurring events)
    const findEventsByTitle = (title: string) => {
        return calendarEvents.filter((event) => event.event_title === title)
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
        if (isProcessing) return // Prevent multiple operations

        setIsProcessing(true)
        try {
            setIsLoading(true)

            let savedEventId: number | undefined

            if (eventData.isRecurring) {
                // Handle recurring payment
                const recurringData = {
                    amount: eventData.amount !== undefined ? eventData.amount : 0,
                    payment_name: eventData.event_title,
                    frequency: eventData.frequency || "monthly",
                    next_due_date: eventData.event_date,
                }

                console.log("Creating/updating recurring payment:", recurringData)

                if (selectedEvent?.event_id) {
                    // Find the corresponding recurring payment
                    const recurringPayment = recurringPayments.find((p) => p.payment_name === selectedEvent.event_title)

                    // Check if we're changing the title
                    const isTitleChanged = selectedEvent.event_title !== eventData.event_title

                    if (recurringPayment) {
                        // Update existing recurring payment
                        await updateRecurringPayment(recurringPayment.recurring_id, recurringData)

                        // If title changed, update all related events
                        if (isTitleChanged) {
                            const relatedEvents = findEventsByTitle(selectedEvent.event_title)
                            for (const event of relatedEvents) {
                                await updateCalendarEvent(event.event_id, {
                                    event_title: eventData.event_title,
                                    event_type: "recurring_due",
                                })
                            }
                        } else {
                            // Just update the current event
                            await updateCalendarEvent(selectedEvent.event_id, {
                                event_title: eventData.event_title,
                                event_date: eventData.event_date,
                                event_type: "recurring_due",
                            })
                        }

                        savedEventId = selectedEvent.event_id
                    } else {
                        // Create new recurring payment for existing event
                        const newRecurringPayment = await createRecurringPayment(recurringData)
                        console.log("Created new recurring payment:", newRecurringPayment)

                        // Update the event type
                        await updateCalendarEvent(selectedEvent.event_id, {
                            event_title: eventData.event_title,
                            event_date: eventData.event_date,
                            event_type: "recurring_due",
                        })

                        savedEventId = selectedEvent.event_id
                    }
                } else {
                    // Check if an event with the same title and date already exists
                    if (!eventExists(eventData.event_title, eventData.event_date)) {
                        // Create new recurring payment - this will automatically create a calendar event
                        // in the backend, so we don't need to create one here
                        const newRecurringPayment = await createRecurringPayment(recurringData)
                        console.log("Created new recurring payment:", newRecurringPayment)

                        // Wait a moment for the backend to create the event
                        await new Promise((resolve) => setTimeout(resolve, 500))

                        // Fetch the latest events to get the newly created event
                        const events = await fetchCalendarEvents()

                        // Find the event that was just created
                        const newEvent = events.find(
                            (e) =>
                                e.event_title === eventData.event_title &&
                                isSameDay(parseISO(e.event_date), parseISO(eventData.event_date)),
                        )

                        if (newEvent) {
                            savedEventId = newEvent.event_id
                            console.log("Found automatically created event:", newEvent)
                        } else {
                            // If for some reason the event wasn't created automatically, create it manually
                            console.log("No automatically created event found, creating manually")
                            const manualEvent = await createCalendarEvent({
                                event_title: eventData.event_title,
                                event_date: eventData.event_date,
                                event_type: "recurring_due",
                            })
                            savedEventId = manualEvent.event_id
                        }
                    } else {
                        console.log("Event already exists, not creating duplicate")
                        setError("An event with this title and date already exists.")
                        setIsLoading(false)
                        setIsProcessing(false)
                        return
                    }
                }
            } else {
                // Handle one-time event
                if (selectedEvent?.event_id) {
                    // Check if this was previously a recurring event
                    const wasRecurring =
                        selectedEvent.event_type === "recurring_due" || selectedEvent.event_type === "recurring_payment"

                    if (wasRecurring) {
                        // Find and delete the recurring payment
                        const recurringPayment = recurringPayments.find((p) => p.payment_name === selectedEvent.event_title)
                        if (recurringPayment) {
                            await deleteRecurringPayment(recurringPayment.recurring_id)
                            console.log(`Deleted recurring payment with ID ${recurringPayment.recurring_id}`)
                        }
                    }

                    // Update existing event
                    await updateCalendarEvent(selectedEvent.event_id, {
                        event_title: eventData.event_title,
                        event_date: eventData.event_date,
                        event_type: eventData.event_type,
                    })
                    savedEventId = selectedEvent.event_id
                } else {
                    // Check if an event with the same title and date already exists
                    if (!eventExists(eventData.event_title, eventData.event_date)) {
                        // Create new event
                        const newEvent = await createCalendarEvent({
                            event_title: eventData.event_title,
                            event_date: eventData.event_date,
                            event_type: eventData.event_type,
                        })
                        savedEventId = newEvent.event_id
                    } else {
                        console.log("Event already exists, not creating duplicate")
                        setError("An event with this title and date already exists.")
                        setIsLoading(false)
                        setIsProcessing(false)
                        return
                    }
                }
            }

            // Save amount for all events (recurring and non-recurring)
            if (savedEventId && eventData.amount !== undefined) {
                saveEventAmount(savedEventId, eventData.amount)
            }

            // Close modal first to improve perceived performance
            setIsModalOpen(false)
            setSelectedEvent(null)

            // Force refresh of data and components
            await fetchData()
            setRefreshKey((prevKey) => prevKey + 1)
        } catch (err) {
            console.error("Error saving event:", err)
            setError("Failed to save event. Please try again.")
        } finally {
            setIsLoading(false)
            setIsProcessing(false)
        }
    }

    // Handle deleting an event
    const handleDeleteEvent = async () => {
        if (!selectedEvent || isDeleting || isProcessing) return

        setIsDeleting(true) // Prevent multiple delete attempts
        setIsProcessing(true)
        try {
            setIsLoading(true)

            // Close modal first to improve perceived performance
            setIsModalOpen(false)

            // Check if this is a recurring event
            const isRecurringEvent =
                selectedEvent.event_type === "recurring_due" || selectedEvent.event_type === "recurring_payment"
            const recurringPayment = recurringPayments.find((p) => p.payment_name === selectedEvent.event_title)

            if (isRecurringEvent && recurringPayment) {
                // Delete the recurring payment source first
                try {
                    await deleteRecurringPayment(recurringPayment.recurring_id)
                    console.log(`Deleted recurring payment with ID ${recurringPayment.recurring_id}`)
                } catch (err) {
                    console.error(`Error deleting recurring payment ${recurringPayment.recurring_id}:`, err)
                    throw err // Re-throw to handle in the outer catch
                }

                // Find all instances of this recurring event
                const relatedEvents = calendarEvents.filter(
                    (event) =>
                        (event.event_type === "recurring_due" || event.event_type === "recurring_payment") &&
                        event.event_title === selectedEvent.event_title,
                )

                console.log(`Found ${relatedEvents.length} related events to delete`)

                // Delete each instance
                for (const event of relatedEvents) {
                    try {
                        await deleteCalendarEvent(event.event_id)
                        console.log(`Deleted calendar event with ID ${event.event_id}`)

                        // Remove amount from storage if exists
                        if (event.event_id && eventAmounts[event.event_id]) {
                            const updatedAmounts = { ...eventAmounts }
                            delete updatedAmounts[event.event_id]
                            setEventAmounts(updatedAmounts)
                            localStorage.setItem("eventAmounts", JSON.stringify(updatedAmounts))
                        }
                    } catch (err) {
                        console.error(`Error deleting event ${event.event_id}:`, err)
                        // Continue with other deletions even if one fails
                    }
                }
            } else {
                // Delete a single non-recurring event
                try {
                    await deleteCalendarEvent(selectedEvent.event_id)
                    console.log(`Deleted calendar event with ID ${selectedEvent.event_id}`)

                    // Remove amount from storage if exists
                    if (selectedEvent.event_id && eventAmounts[selectedEvent.event_id]) {
                        const updatedAmounts = { ...eventAmounts }
                        delete updatedAmounts[selectedEvent.event_id]
                        setEventAmounts(updatedAmounts)
                        localStorage.setItem("eventAmounts", JSON.stringify(updatedAmounts))
                    }
                } catch (err) {
                    console.error(`Error deleting event ${selectedEvent.event_id}:`, err)
                    throw err // Re-throw to handle in the outer catch
                }
            }

            // Refresh data
            await fetchData()
            setRefreshKey((prevKey) => prevKey + 1)

            setSelectedEvent(null)
        } catch (err) {
            console.error("Error in delete process:", err)
            setError("Failed to delete event. Please try again.")
        } finally {
            setIsLoading(false)
            setIsDeleting(false) // Reset deleting state
            setIsProcessing(false)
        }
    }

    // Handle deleting all events
    const handleDeleteAllEvents = async () => {
        if (isDeleting || isProcessing) return

        setIsDeleting(true) // Prevent multiple delete attempts
        setIsProcessing(true)
        try {
            setIsLoading(true)

            // Close modal first to improve perceived performance
            setIsDeleteAllModalOpen(false)

            // Delete all recurring payments first
            if (recurringPayments.length > 0) {
                for (const payment of recurringPayments) {
                    try {
                        await deleteRecurringPayment(payment.recurring_id)
                        console.log(`Deleted recurring payment with ID ${payment.recurring_id}`)
                    } catch (err) {
                        console.error(`Error deleting recurring payment ${payment.recurring_id}:`, err)
                        // Continue with other deletions even if one fails
                    }
                }
            }

            // Then delete all calendar events
            if (calendarEvents.length > 0) {
                for (const event of calendarEvents) {
                    try {
                        await deleteCalendarEvent(event.event_id)
                        console.log(`Deleted calendar event with ID ${event.event_id}`)
                    } catch (err) {
                        console.error(`Error deleting event ${event.event_id}:`, err)
                        // Continue with other deletions even if one fails
                    }
                }
            }

            // Clear all event amounts
            setEventAmounts({})
            localStorage.removeItem("eventAmounts")

            // Refresh data
            await fetchData()
            setRefreshKey((prevKey) => prevKey + 1)

            setError(null)
        } catch (err) {
            console.error("Error deleting all events:", err)
            setError("Failed to delete all events. Please try again.")
        } finally {
            setIsLoading(false)
            setIsDeleting(false) // Reset deleting state
            setIsProcessing(false)
        }
    }

    // Get urgent events (due today or in the next 7 days)
    const urgentEvents = calendarEvents.filter((event) => {
        const eventDate = parseISO(event.event_date)
        const today = startOfDay(new Date()) // Use startOfDay to ignore time component
        const sevenDaysFromNow = new Date(today)
        sevenDaysFromNow.setDate(today.getDate() + 7)

        return eventDate >= today && eventDate <= sevenDaysFromNow
    })

    // Get this week's events
    const thisWeekEvents = calendarEvents.filter((event) => {
        const eventDate = parseISO(event.event_date)
        const today = startOfDay(new Date())
        const weekEnd = endOfWeek(today)

        return eventDate >= today && eventDate <= weekEnd
    })

    // Get upcoming events (beyond this week but within next 6 months)
    const upcomingEvents = calendarEvents.filter((event) => {
        const eventDate = parseISO(event.event_date)
        const today = startOfDay(new Date())
        const weekEnd = endOfWeek(today)
        const sixMonthsFromNow = addMonths(today, 6)

        return eventDate > weekEnd && eventDate <= sixMonthsFromNow
    })

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
        // Filter out duplicate events (same title and date)
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

    // Get amount for an event
    const getEventAmount = (eventId: number): number => {
        if (eventAmounts[eventId]) {
            return eventAmounts[eventId]
        }

        // Check recurring payments
        const event = calendarEvents.find((e) => e.event_id === eventId)
        if (event) {
            const recurringPayment = recurringPayments.find((p) => p.payment_name === event.event_title)
            if (recurringPayment?.amount) {
                return recurringPayment.amount
            }
        }

        return 0
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-xl">Loading calendar...</div>
            </div>
        )
    }

    // Calculate payments due this month
    const today = new Date()
    const paymentsThisMonth = calendarEvents.filter((event) => {
        const eventDate = parseISO(event.event_date)
        const amount = getEventAmount(event.event_id)
        return isSameMonth(eventDate, today) && amount > 0
    }).length

    return (
        <div className="flex min-h-screen bg-gray-100 font-inter">
            {/* Sidebar */}
            <Sidebar activePage="calendar" />

            {/* Main content */}
            <div className="flex-1 p-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Calendar</h1>
                    <button
                        onClick={() => setIsDeleteAllModalOpen(true)}
                        className="flex items-center px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        disabled={isDeleting || isProcessing}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All Events
                    </button>
                </div>
                <hr className="mb-6" />

                <div className="grid grid-cols-1 gap-6">
                    {/* Notifications panel and Calendar */}
                    <div className="grid grid-cols-4 gap-6">
                        {/* Notifications panel - spans 3 columns */}
                        <div className="col-span-3">
                            <NotificationsPanel
                                key={refreshKey} // Force re-render when data changes
                                urgentEvents={urgentEvents}
                                thisWeekEvents={thisWeekEvents}
                                upcomingEvents={upcomingEvents}
                                recurringPayments={recurringPayments}
                                eventAmounts={eventAmounts}
                                paymentsThisMonth={paymentsThisMonth}
                            />
                        </div>

                        {/* Add event button - spans 1 column */}
                        <div>
                            <button
                                onClick={handleAddEvent}
                                className="h-40 w-full bg-calendar-highlight hover:bg-opacity-90 rounded-lg flex flex-col items-center justify-center transition-colors"
                                disabled={isDeleting || isProcessing}
                            >
                                <Plus className="h-12 w-12 text-black mb-2" />
                                <span className="text-lg font-medium">Add event</span>
                            </button>
                        </div>
                    </div>

                    {/* Calendar section - spans full width */}
                    <div className="mt-6">
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
                        <div className="grid grid-cols-7 gap-2">
                            {/* Week day headers */}
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                                <div key={index} className="p-2 text-center text-[#FF9F1C] font-medium">
                                    {day}
                                </div>
                            ))}

                            {/* Calendar days */}
                            {calendarDays.map((day, index) => {
                                const dayEvents = getEventsForDay(day.date)
                                const isCurrentDay = isSameDay(day.date, new Date())
                                const dayNumber = day.date.getDate()

                                return (
                                    <div
                                        key={index}
                                        className={`h-24 p-2 rounded-md ${isCurrentDay
                                                ? "bg-calendar-highlight"
                                                : day.isCurrentMonth
                                                    ? "bg-calendar-mint"
                                                    : "bg-gray-100 opacity-70"
                                            } relative`}
                                    >
                                        <div className="text-sm font-medium">{dayNumber}</div>
                                        <div className="mt-1 space-y-1 overflow-y-auto max-h-[60px]">
                                            {dayEvents.map((event, eventIndex) => {
                                                const eventType = event.event_type
                                                let bgColor = "bg-calendar-event" // Default color

                                                if (eventType === "recurring_due" || eventType === "recurring_payment") {
                                                    bgColor = "bg-calendar-event" // Orange for recurring
                                                } else if (event.event_title.toLowerCase().includes("fee")) {
                                                    bgColor = "bg-calendar-event" // Orange for fee deadlines
                                                } else if (event.event_title.toLowerCase().includes("groceries")) {
                                                    bgColor = "bg-calendar-event" // Orange for groceries
                                                }

                                                return (
                                                    <div
                                                        key={eventIndex}
                                                        onClick={() => handleEventClick(event)}
                                                        className={`text-xs p-1 px-2 rounded-md truncate cursor-pointer ${bgColor}`}
                                                    >
                                                        {event.event_title}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
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
                        eventAmounts={eventAmounts}
                        recurringPayments={recurringPayments}
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

                {/* Loading indicator */}
                {isLoading && (
                    <div className="fixed bottom-4 left-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                        <p>Processing...</p>
                    </div>
                )}
            </div>
        </div>
    )
}
