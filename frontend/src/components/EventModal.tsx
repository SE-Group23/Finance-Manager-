"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import type { CalendarEvent } from "../services/calendarService"

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
}

export function EventModal({ event, isOpen, onClose, onSave, onDelete }: EventModalProps) {
    const [title, setTitle] = useState("")
    const [date, setDate] = useState("")
    const [amount, setAmount] = useState("")
    const [isRecurring, setIsRecurring] = useState(false)
    const [frequency, setFrequency] = useState("monthly")
    const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false)

    // Initialize form with event data if editing
    useEffect(() => {
        if (event) {
            setTitle(event.event_title)
            setDate(format(parseISO(event.event_date), "yyyy-MM-dd"))
            setIsRecurring(event.event_type === "recurring_due" || event.event_type === "recurring_payment")
            // Amount would need to be fetched from recurring payments if this is a recurring event
        } else {
            // Default values for new event
            setTitle("")
            setDate(format(new Date(), "yyyy-MM-dd"))
            setAmount("")
            setIsRecurring(false)
            setFrequency("monthly")
        }
    }, [event])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

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
                {/* Close button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-red-500 hover:text-red-700" aria-label="Close">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-semibold mb-6">{event ? "Edit event" : "Add title"}</h2>

                <form onSubmit={handleSubmit}>
                    {/* Title input */}
                    <div className="mb-4">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Add title"
                            className="w-full p-2 border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-500"
                            required
                        />
                    </div>

                    {/* Date input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-gray-500"
                            required
                        />
                    </div>

                    {/* Amount input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-gray-500"
                            step="0.01"
                        />
                    </div>

                    {/* Simple Recurring checkbox */}
                    <div className="mb-4 flex items-center">
                        <input
                            type="checkbox"
                            id="recurring-checkbox"
                            checked={isRecurring}
                            onChange={() => setIsRecurring(!isRecurring)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="recurring-checkbox" className="ml-2 block text-sm text-gray-700">
                            Recurring?
                        </label>
                    </div>

                    {/* Frequency dropdown (only shown if recurring) */}
                    {isRecurring && (
                        <div className="mb-6 relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                            <select
                                value={frequency}
                                onChange={(e) => setFrequency(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-gray-500"
                            >
                                <option value="daily">Every day</option>
                                <option value="weekly">Every week</option>
                                <option value="monthly">Every month</option>
                                <option value="yearly">Every year</option>
                            </select>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-between mt-6">
                        {event && (
                            <button
                                type="button"
                                onClick={onDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
                                style={{ backgroundColor: "#ef4444" }} // Explicit red color
                            >
                                Delete
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none ml-auto"
                            style={{ backgroundColor: "#4a7c7d" }} // Your app's theme color
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
