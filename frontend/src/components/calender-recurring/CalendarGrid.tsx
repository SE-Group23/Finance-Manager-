"use client"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, getDay } from "date-fns"
import type { CalendarEvent } from "../../services/calendarService"

interface CalendarGridProps {
    currentDate: Date
    calendarEvents: CalendarEvent[]
    onEventClick: (event: CalendarEvent) => void
}

export function CalendarGrid({ currentDate, calendarEvents, onEventClick }: CalendarGridProps) {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const getEventsForDay = (day: Date) => {
        return calendarEvents.filter((event) => {
            const eventDate = parseISO(event.event_date)
            return isSameDay(eventDate, day)
        })
    }

    return (
        <div className="bg-white rounded-lg overflow-hidden">
            <div className="grid grid-cols-7 text-center">
                {weekDays.map((day, index) => (
                    <div key={index} className="py-2 text-sm font-medium text-gray-500">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-200">
              
                {Array.from({ length: getDay(monthStart) }).map((_, index) => (
                    <div key={`empty-start-${index}`} className="bg-gray-50 h-28 p-1" />
                ))}

                {daysInMonth.map((day, dayIndex) => {
                    const dayEvents = getEventsForDay(day)
                    const isToday = isSameDay(day, new Date())

                    return (
                        <div key={dayIndex} className={`bg-[#f0f8f4] h-28 p-1 relative ${isToday ? "bg-yellow-50" : ""}`}>
                            <div
                                className={`text-sm p-1 ${isToday ? "bg-yellow-300 rounded-full h-7 w-7 flex items-center justify-center" : ""
                                    }`}
                            >
                                {format(day, "d")}
                            </div>

                            <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                                {dayEvents.map((event, eventIndex) => (
                                    <div
                                        key={eventIndex}
                                        onClick={() => onEventClick(event)}
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

                {Array.from({ length: 6 - getDay(monthEnd) }).map((_, index) => (
                    <div key={`empty-end-${index}`} className="bg-gray-50 h-28 p-1" />
                ))}
            </div>
        </div>
    )
}
