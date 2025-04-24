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
    return (
        <div className="bg-[#0a3a43] text-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>

            {/* Upcoming payments badge */}
            <div className="mb-4">
                <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {upcomingPayments} upcoming payments
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Urgent section */}
                <div>
                    <h3 className="text-sm font-medium mb-2">Urgent</h3>
                    <div className="space-y-3">
                        {urgentEvents.length > 0 ? (
                            urgentEvents.slice(0, 2).map((event, index) => (
                                <div key={index} className="border-l-2 border-red-500 pl-3">
                                    <h4 className="font-semibold">{event.event_title}</h4>
                                    <p className="text-sm text-gray-300">{format(parseISO(event.event_date), "dd/MM/yy")}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-300">No urgent events</p>
                        )}
                    </div>
                </div>

                {/* This Week section */}
                <div>
                    <h3 className="text-sm font-medium mb-2">This Week</h3>
                    <div className="space-y-3">
                        {thisWeekEvents.length > 0 ? (
                            thisWeekEvents.slice(0, 2).map((event, index) => (
                                <div key={index} className="border-l-2 border-red-500 pl-3">
                                    <h4 className="font-semibold">{event.event_title}</h4>
                                    <p className="text-sm text-gray-300">{format(parseISO(event.event_date), "dd/MM/yy")}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-300">No events this week</p>
                        )}
                    </div>
                </div>

                {/* Upcoming section */}
                <div>
                    <h3 className="text-sm font-medium mb-2">Upcoming</h3>
                    {upcomingEvents.length > 0 ? (
                        <p className="text-sm text-gray-300">{upcomingEvents.length} events coming up</p>
                    ) : (
                        <p className="text-sm text-gray-300">No events found</p>
                    )}
                </div>
            </div>
        </div>
    )
}
