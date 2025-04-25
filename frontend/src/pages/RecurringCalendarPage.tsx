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
    const [refreshKey, setRefreshKey] = useState(0)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    const fetchData = async () => {
        setIsLoading(true)
        setLoading(true)
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

            setCalendarEvents(uniqueEvents)
            setRecurringPayments(payments)

            const storedAmounts = localStorage.getItem("eventAmounts")
            if (storedAmounts) {
                setEventAmounts(JSON.parse(storedAmounts))
            }

            setError(null)
        } catch (err) {
            setError("Failed to load calendar data. Please try again.")
        } finally {
            setIsLoading(false)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [refreshKey])

    const prevMonth = () => {
        setCurrentDate(subMonths(currentDate, 1))
    }

    const nextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1))
    }

    const handleAddEvent = () => {
        setSelectedEvent(null)
        setIsModalOpen(true)
    }

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event)
        setIsModalOpen(true)
    }

    const saveEventAmount = (eventId: number, amount: number) => {
        const updatedAmounts = { ...eventAmounts, [eventId]: amount }
        setEventAmounts(updatedAmounts)
        localStorage.setItem("eventAmounts", JSON.stringify(updatedAmounts))
    }

    const eventExists = (title: string, date: string, excludeEventId?: number) => {
        return calendarEvents.some(
            (event) =>
                event.event_title === title &&
                isSameDay(parseISO(event.event_date), parseISO(date)) &&
                (excludeEventId === undefined || event.event_id !== excludeEventId),
        )
    }

    const findEventsByTitle = (title: string) => {
        return calendarEvents.filter((event) => event.event_title === title)
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

        setIsProcessing(true)
        try {
            setIsLoading(true)

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
                            const relatedEvents = findEventsByTitle(selectedEvent.event_title)
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
                    
                    if (!eventExists(eventData.event_title, eventData.event_date)) {
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
                        setError("An event with this title and date already exists.")
                        setIsLoading(false)
                        setIsProcessing(false)
                        return
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
                    if (!eventExists(eventData.event_title, eventData.event_date)) {
                        const newEvent = await createCalendarEvent({
                            event_title: eventData.event_title,
                            event_date: eventData.event_date,
                            event_type: eventData.event_type,
                        })
                        savedEventId = newEvent.event_id
                    } else {
                        setError("An event with this title and date already exists.")
                        setIsLoading(false)
                        setIsProcessing(false)
                        return
                    }
                }
            }

            if (savedEventId && eventData.amount !== undefined) {
                saveEventAmount(savedEventId, eventData.amount)
            }

            setIsModalOpen(false)
            setSelectedEvent(null)

            await fetchData()
            setRefreshKey((prevKey) => prevKey + 1)
        } catch (err) {
            setError("Failed to save event. Please try again.")
        } finally {
            setIsLoading(false)
            setIsProcessing(false)
        }
    }

    const handleDeleteEvent = async () => {
        if (!selectedEvent || isDeleting || isProcessing) return

        setIsDeleting(true) 
        setIsProcessing(true)
        try {
            setIsLoading(true)

            setIsModalOpen(false)

            const isRecurringEvent =
                selectedEvent.event_type === "recurring_due" || selectedEvent.event_type === "recurring_payment"
            const recurringPayment = recurringPayments.find((p) => p.payment_name === selectedEvent.event_title)

            if (isRecurringEvent && recurringPayment) {
                try {
                    await deleteRecurringPayment(recurringPayment.recurring_id)
                   
                } catch (err) {
                    throw err
                }

                const relatedEvents = calendarEvents.filter(
                    (event) =>
                        (event.event_type === "recurring_due" || event.event_type === "recurring_payment") &&
                        event.event_title === selectedEvent.event_title,
                )

                for (const event of relatedEvents) {
                    try {
                        await deleteCalendarEvent(event.event_id)
                     
                        if (event.event_id && eventAmounts[event.event_id]) {
                            const updatedAmounts = { ...eventAmounts }
                            delete updatedAmounts[event.event_id]
                            setEventAmounts(updatedAmounts)
                            localStorage.setItem("eventAmounts", JSON.stringify(updatedAmounts))
                        }
                    } catch (err) {
                        
                    }
                }
            } else {
                try {
                    await deleteCalendarEvent(selectedEvent.event_id)
                  
                    if (selectedEvent.event_id && eventAmounts[selectedEvent.event_id]) {
                        const updatedAmounts = { ...eventAmounts }
                        delete updatedAmounts[selectedEvent.event_id]
                        setEventAmounts(updatedAmounts)
                        localStorage.setItem("eventAmounts", JSON.stringify(updatedAmounts))
                    }
                } catch (err) {
                  
                    throw err 
                }
            }

            await fetchData()
            setRefreshKey((prevKey) => prevKey + 1)

            setSelectedEvent(null)
        } catch (err) {
            setError("Failed to delete event. Please try again.")
        } finally {
            setIsLoading(false)
            setIsDeleting(false)
            setIsProcessing(false)
        }
    }

    const handleDeleteAllEvents = async () => {
        if (isDeleting || isProcessing) return

        setIsDeleting(true) 
        setIsProcessing(true)
        try {
            setIsLoading(true)

            setIsDeleteAllModalOpen(false)

            if (recurringPayments.length > 0) {
                for (const payment of recurringPayments) {
                    try {
                        await deleteRecurringPayment(payment.recurring_id)
                    } catch (err) {
                    }
                }
            }

            if (calendarEvents.length > 0) {
                for (const event of calendarEvents) {
                    try {
                        await deleteCalendarEvent(event.event_id)
                    } catch (err) {
                        
                    }
                }
            }

            setEventAmounts({})
            localStorage.removeItem("eventAmounts")

            await fetchData()
            setRefreshKey((prevKey) => prevKey + 1)

            setError(null)
        } catch (err) {
            setError("Failed to delete all events. Please try again.")
        } finally {
            setIsLoading(false)
            setIsDeleting(false)
            setIsProcessing(false)
        }
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

    if (loading) {
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
                        onClick={() => setIsDeleteAllModalOpen(true)}
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
                        {/* Are y0u reading this Sir Niaz*/}
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
                                        className={`h-24 p-2 rounded-md ${isCurrentDay
                                                ? "bg-calendar-highlight" 
                                                : day.isCurrentMonth
                                                    ? "bg-gray-50"
                                                    : "bg-gray-100 opacity-70"
                                            } relative`}
                                    >
                                        <div
                                            className={`text-sm font-medium ${isCurrentDay ? "bg-calendar-highlight rounded-full h-6 w-6 flex items-center justify-center" : ""}`}
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
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleSaveEvent}
                        onDelete={handleDeleteEvent}
                        eventAmounts={eventAmounts}
                        recurringPayments={recurringPayments}
                    />
                )}

                <DeleteAllConfirmationModal
                    isOpen={isDeleteAllModalOpen}
                    onClose={() => setIsDeleteAllModalOpen(false)}
                    onConfirm={handleDeleteAllEvents}
                    eventCount={calendarEvents.length}
                />

                {error && (
                    <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        <p>{error}</p>
                        <button className="absolute top-0 right-0 p-2" onClick={() => setError(null)}>
                            &times;
                        </button>
                    </div>
                )}

                {isLoading && (
                    <div className="fixed bottom-4 left-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg">
                        <p>Processing...</p>
                    </div>
                )}
            </div>
        </div>
    )
}
