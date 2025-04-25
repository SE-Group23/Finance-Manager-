"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import type { CalendarEvent } from "../services/calendarService"
import type { RecurringPayment } from "../services/recurringService"
import { X, Trash2, ChevronDown } from "lucide-react"

interface EventModalProps {
    event: CalendarEvent | null
    isOpen: boolean
    onClose: () => void
    onSave: (eventData: {
        event_id?: number
        event_title: string
        event_date: string
        event_type: string
        isRecurring: boolean
        frequency?: string
        amount?: number
    }) => void
    onDelete: () => void
    eventAmounts?: Record<number, number>
    recurringPayments?: RecurringPayment[]
}

export function EventModal({
    event,
    isOpen,
    onClose,
    onSave,
    onDelete,
    eventAmounts = {},
    recurringPayments = [],
}: EventModalProps) {
    const [title, setTitle] = useState("")
    const [date, setDate] = useState("")
    const [amount, setAmount] = useState("")
    const [isRecurring, setIsRecurring] = useState(false)
    const [frequency, setFrequency] = useState("monthly")
    const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false)

    useEffect(() => {
        if (event) {
            setTitle(event.event_title)
            setDate(format(parseISO(event.event_date), "yyyy-MM-dd"))

            const isEventRecurring = event.event_type === "recurring_due" || event.event_type === "recurring_payment"
            setIsRecurring(isEventRecurring)

            let eventAmount = ""

            if (isEventRecurring) {
                const recurringPayment = recurringPayments.find((p) => p.payment_name === event.event_title)
                if (recurringPayment?.amount) {
                    eventAmount = recurringPayment.amount.toString()
                }
            }

            if (!eventAmount && event.event_id && eventAmounts[event.event_id]) {
                eventAmount = eventAmounts[event.event_id].toString()
            }

            setAmount(eventAmount)

            console.log("Event data loaded:", {
                title: event.event_title,
                date: format(parseISO(event.event_date), "yyyy-MM-dd"),
                isRecurring: isEventRecurring,
                amount: eventAmount,
                recurringPayment: recurringPayments.find((p) => p.payment_name === event.event_title),
            })
        } else {
            setTitle("")
            setDate(format(new Date(), "yyyy-MM-dd"))
            setAmount("")
            setIsRecurring(false)
            setFrequency("monthly")
        }
    }, [event, eventAmounts, recurringPayments])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        console.log("Submitting form with data:", {
            event_id: event?.event_id,
            event_title: title,
            event_date: date,
            event_type: isRecurring ? "recurring_due" : "custom",
            isRecurring,
            frequency: isRecurring ? frequency : undefined,
            amount: amount ? Number.parseFloat(amount) : undefined,
        })

        onSave({
            event_id: event?.event_id,
            event_title: title,
            event_date: date,
            event_type: isRecurring ? "recurring_due" : "custom",
            isRecurring,
            frequency: isRecurring ? frequency : undefined,
            amount: amount ? Number.parseFloat(amount) : undefined,
        })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-lg">
                <button onClick={onClose} className="absolute top-4 right-4 text-red-500 hover:text-red-700" aria-label="Close">
                    <X className="h-5 w-5" />
                </button>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Add title"
                            className="w-full p-2 text-xl font-medium border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-md bg-white focus:outline-none"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full p-2 border border-gray-200 rounded-md bg-white focus:outline-none"
                            step="0.01"
                        />
                    </div>

                    <div className="mb-4 flex items-center">
                        <input
                            type="checkbox"
                            id="recurring-checkbox"
                            checked={isRecurring}
                            onChange={() => setIsRecurring(!isRecurring)}
                            className="h-4 w-4 text-[#FF9F1C] border-gray-300 rounded focus:ring-[#FF9F1C]"
                        />
                        <label htmlFor="recurring-checkbox" className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">
                            Recurring?
                        </label>
                    </div>

                    {isRecurring && (
                        <div className="mb-6 relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={
                                        frequency === "daily"
                                            ? "Every day"
                                            : frequency === "weekly"
                                                ? "Every week"
                                                : frequency === "monthly"
                                                    ? "Every month"
                                                    : frequency === "yearly"
                                                        ? "Every year"
                                                        : "Select frequency"
                                    }
                                    onClick={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
                                    readOnly
                                    className="w-full p-2 pr-10 border border-gray-200 rounded-md bg-white focus:outline-none cursor-pointer"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                </div>
                            </div>

                            {showFrequencyDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                    <div
                                        className="p-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            setFrequency("daily")
                                            setShowFrequencyDropdown(false)
                                        }}
                                    >
                                        Every day
                                    </div>
                                    <div
                                        className="p-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            setFrequency("weekly")
                                            setShowFrequencyDropdown(false)
                                        }}
                                    >
                                        Every week
                                    </div>
                                    <div
                                        className="p-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            setFrequency("monthly")
                                            setShowFrequencyDropdown(false)
                                        }}
                                    >
                                        Every month
                                    </div>
                                    <div
                                        className="p-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            setFrequency("yearly")
                                            setShowFrequencyDropdown(false)
                                        }}
                                    >
                                        Every year
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between mt-6">
                        {event && (
                            <button
                                type="button"
                                onClick={onDelete}
                                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none ml-auto"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
