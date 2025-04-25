import { format, parseISO, isSameMonth } from "date-fns"
import type { CalendarEvent } from "../services/calendarService"
import type { RecurringPayment } from "../services/recurringService"

interface NotificationsPanelProps {
    urgentEvents: CalendarEvent[]
    thisWeekEvents: CalendarEvent[]
    upcomingEvents: CalendarEvent[]
    recurringPayments?: RecurringPayment[]
    eventAmounts?: Record<number, number>
    paymentsThisMonth?: number
}

export function NotificationsPanel({
    urgentEvents,
    thisWeekEvents,
    upcomingEvents,
    recurringPayments = [],
    eventAmounts = {},
    paymentsThisMonth,
}: NotificationsPanelProps) {
    const getEventAmount = (event: CalendarEvent): number => {
        if (event.event_type === "recurring_due" || event.event_type === "recurring_payment") {
            const payment = recurringPayments.find((p) => p.payment_name === event.event_title)
            if (payment?.amount) {
                return payment.amount
            }
        }

        if (eventAmounts && event.event_id && eventAmounts[event.event_id]) {
            return eventAmounts[event.event_id]
        }

        return 0
    }

    const today = new Date()
    const todayEvents = urgentEvents.filter((event) => {
        const eventDate = parseISO(event.event_date)
        return (
            eventDate.getFullYear() === today.getFullYear() &&
            eventDate.getMonth() === today.getMonth() &&
            eventDate.getDate() === today.getDate()
        )
    })

    const displayPaymentsThisMonth =
        paymentsThisMonth !== undefined
            ? paymentsThisMonth
            : urgentEvents.filter((event) => {
                const eventDate = parseISO(event.event_date)
                return isSameMonth(eventDate, today) && getEventAmount(event) > 0
            }).length

    return (
        <div className="bg-calendar-teal text-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>

            <div className="mb-6">
                <span className="inline-block bg-calendar-urgent text-white text-sm px-3 py-1 rounded-full font-medium">
                    {displayPaymentsThisMonth} payments due
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-3">Urgent</h3>
                    <div className="space-y-4">
                        {todayEvents.length > 0 ? (
                            todayEvents.slice(0, 3).map((event, index) => {
                                const amount = getEventAmount(event)

                                return (
                                    <div key={index} className="border-l-4 border-calendar-urgent pl-3 py-1">
                                        <h4 className="font-semibold text-xl">{event.event_title}</h4>
                                        <p className="text-sm opacity-80">{format(parseISO(event.event_date), "dd/MM/yy")}</p>
                                        {amount > 0 && <p className="text-sm font-medium mt-1">Amount: ${amount.toFixed(2)}</p>}
                                    </div>
                                )
                            })
                        ) : (
                            <p className="text-sm opacity-70 italic">No urgent events</p>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-3">This Week</h3>
                    <div className="space-y-4">
                        {thisWeekEvents.length > 0 ? (
                            thisWeekEvents.slice(0, 3).map((event, index) => {
                                const amount = getEventAmount(event)

                                return (
                                    <div key={index} className="border-l-4 border-calendar-urgent pl-3 py-1">
                                        <h4 className="font-semibold text-xl">{event.event_title}</h4>
                                        <p className="text-sm opacity-80">{format(parseISO(event.event_date), "dd/MM/yy")}</p>
                                        {amount > 0 && <p className="text-sm font-medium mt-1">Amount: ${amount.toFixed(2)}</p>}
                                    </div>
                                )
                            })
                        ) : (
                            <p className="text-sm opacity-70 italic">No events this week</p>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-3">Upcoming</h3>
                    <div className="space-y-4">
                        {upcomingEvents.length > 0 ? (
                            <>
                                {upcomingEvents.slice(0, 2).map((event, index) => {
                                    const amount = getEventAmount(event)

                                    return (
                                        <div key={index} className="border-l-4 border-calendar-urgent pl-3 py-1">
                                            <h4 className="font-semibold text-xl">{event.event_title}</h4>
                                            <p className="text-sm opacity-80">{format(parseISO(event.event_date), "dd/MM/yy")}</p>
                                            {amount > 0 && <p className="text-sm font-medium mt-1">Amount: ${amount.toFixed(2)}</p>}
                                        </div>
                                    )
                                })}
                                {upcomingEvents.length > 2 && (
                                    <p className="text-sm opacity-80">+{upcomingEvents.length - 2} more events</p>
                                )}
                            </>
                        ) : (
                            <p className="text-sm opacity-70 italic">No upcoming events</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
