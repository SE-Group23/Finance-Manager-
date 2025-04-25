import { format, parseISO } from "date-fns"
import type { CalendarEvent } from "../services/calendarService"

interface NotificationsPanelProps {
    urgentEvents: CalendarEvent[]
    thisWeekEvents: CalendarEvent[]
    upcomingEvents: CalendarEvent[]
    upcomingPayments: number
}

export function NotificationsPanel({
    urgentEvents,
    thisWeekEvents,
    upcomingEvents,
    upcomingPayments,
}: NotificationsPanelProps) {
    // Calculate how many events to show and how many are remaining within the 6-month window
    const eventsToShow = upcomingEvents.slice(0, 2)
    const remainingEventsCount = upcomingEvents.length - 2

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>

            {/* Upcoming payments badge */}
            <div className="mb-6">
                <span className="inline-block bg-red-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                    {upcomingPayments} upcoming payments in next 6 months
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Urgent section */}
                <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-3">Urgent</h3>
                    <div className="space-y-3">
                        {urgentEvents.length > 0 ? (
                            urgentEvents.slice(0, 3).map((event, index) => (
                                <div key={index} className="border-l-3 border-red-500 pl-3 py-1">
                                    <h4 className="font-semibold text-gray-800">{event.event_title}</h4>
                                    <p className="text-sm text-gray-600">{format(parseISO(event.event_date), "dd MMM yyyy")}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-600 italic">No urgent events</p>
                        )}
                    </div>
                </div>

                {/* This Week section */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-3">This Week</h3>
                    <div className="space-y-3">
                        {thisWeekEvents.length > 0 ? (
                            thisWeekEvents.slice(0, 3).map((event, index) => (
                                <div key={index} className="border-l-3 border-blue-500 pl-3 py-1">
                                    <h4 className="font-semibold text-gray-800">{event.event_title}</h4>
                                    <p className="text-sm text-gray-600">{format(parseISO(event.event_date), "dd MMM yyyy")}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-600 italic">No events this week</p>
                        )}
                    </div>
                </div>

                {/* Upcoming section */}
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-3">Upcoming</h3>
                    <div className="space-y-3">
                        {upcomingEvents.length > 0 ? (
                            <>
                                {eventsToShow.map((event, index) => (
                                    <div key={index} className="border-l-3 border-green-500 pl-3 py-1">
                                        <h4 className="font-semibold text-gray-800">{event.event_title}</h4>
                                        <p className="text-sm text-gray-600">{format(parseISO(event.event_date), "dd MMM yyyy")}</p>
                                    </div>
                                ))}
                                {remainingEventsCount > 0 && (
                                    <p className="text-sm text-gray-600 font-medium">
                                        +{remainingEventsCount} more events in next 6 months
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-gray-600 italic">No upcoming events</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
