// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { format, parseISO } from "date-fns"
// import type { CalendarEvent } from "../services/calendarService"

// interface EventModalProps {
//     event: CalendarEvent | null
//     isOpen: boolean
//     onClose: () => void
//     onSave: (eventData: {
//         event_id?: number
//         event_title: string
//         event_date: string
//         event_type: string
//         isRecurring: boolean
//         frequency?: string
//         amount?: number
//     }) => void
//     onDelete: () => void
// }

// export function EventModal({ event, isOpen, onClose, onSave, onDelete }: EventModalProps) {
//     const [title, setTitle] = useState("")
//     const [date, setDate] = useState("")
//     const [amount, setAmount] = useState("")
//     const [isRecurring, setIsRecurring] = useState(false)
//     const [frequency, setFrequency] = useState("monthly")
//     const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false)

//     // Initialize form with event data if editing
//     useEffect(() => {
//         if (event) {
//             setTitle(event.event_title)
//             setDate(format(parseISO(event.event_date), "yyyy-MM-dd"))
//             setIsRecurring(event.event_type === "recurring_due" || event.event_type === "recurring_payment")
//             // Amount would need to be fetched from recurring payments if this is a recurring event
//         } else {
//             // Default values for new event
//             setTitle("")
//             setDate(format(new Date(), "yyyy-MM-dd"))
//             setAmount("")
//             setIsRecurring(false)
//             setFrequency("monthly")
//         }
//     }, [event])

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault()

//         onSave({
//             event_id: event?.event_id,
//             event_title: title,
//             event_date: date,
//             event_type: isRecurring ? "recurring_due" : "custom",
//             isRecurring,
//             frequency: isRecurring ? frequency : undefined,
//             amount: amount ? Number.parseFloat(amount) : undefined,
//         })
//     }

//     const handleFrequencySelect = (selectedFrequency: string) => {
//         setFrequency(selectedFrequency)
//         setShowFrequencyDropdown(false)
//     }

//     if (!isOpen) return null

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-[#f8fae1] rounded-lg p-6 w-full max-w-md relative">
//                 {/* Close button */}
//                 <button onClick={onClose} className="absolute top-4 right-4 text-red-500 hover:text-red-700" aria-label="Close">
//                     <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                 </button>

//                 <h2 className="text-2xl font-semibold mb-6">{event ? "Edit event" : "Add title"}</h2>

//                 <form onSubmit={handleSubmit}>
//                     {/* Title input */}
//                     <div className="mb-4">
//                         <input
//                             type="text"
//                             value={title}
//                             onChange={(e) => setTitle(e.target.value)}
//                             placeholder="Add title"
//                             className="w-full p-2 border-b border-gray-300 bg-transparent focus:outline-none focus:border-navbar"
//                             required
//                         />
//                     </div>

//                     {/* Date input */}
//                     <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//                         <input
//                             type="date"
//                             value={date}
//                             onChange={(e) => setDate(e.target.value)}
//                             className="w-full p-2 border border-gray-300 rounded bg-[#e8f0ed] focus:outline-none focus:ring-1 focus:ring-navbar"
//                             required
//                         />
//                     </div>

//                     {/* Amount input */}
//                     <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
//                         <input
//                             type="number"
//                             value={amount}
//                             onChange={(e) => setAmount(e.target.value)}
//                             placeholder="0.00"
//                             className="w-full p-2 border border-gray-300 rounded bg-[#e8f0ed] focus:outline-none focus:ring-1 focus:ring-navbar"
//                             step="0.01"
//                         />
//                     </div>

//                     {/* Recurring toggle */}
//                     <div className="mb-4 flex items-center">
//                         <label className="flex items-center cursor-pointer">
//                             <div className="relative">
//                                 <input
//                                     type="checkbox"
//                                     className="sr-only"
//                                     checked={isRecurring}
//                                     onChange={() => setIsRecurring(!isRecurring)}
//                                 />
//                                 <div className={`block w-10 h-6 rounded-full ${isRecurring ? "bg-navbar" : "bg-gray-300"}`}></div>
//                                 <div
//                                     className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${isRecurring ? "transform translate-x-4" : ""}`}
//                                 ></div>
//                             </div>
//                             <div className="ml-3 text-gray-700 font-medium">Recurring?</div>
//                         </label>
//                     </div>

//                     {/* Frequency dropdown (only shown if recurring) */}
//                     {isRecurring && (
//                         <div className="mb-6 relative">
//                             <button
//                                 type="button"
//                                 onClick={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
//                                 className="w-full p-2 border border-gray-300 rounded bg-[#e8f0ed] text-left focus:outline-none focus:ring-1 focus:ring-navbar"
//                             >
//                                 {frequency === "daily" && "Every day"}
//                                 {frequency === "weekly" && "Every week"}
//                                 {frequency === "monthly" && "Every month"}
//                                 {frequency === "yearly" && "Every year"}
//                             </button>

//                             {showFrequencyDropdown && (
//                                 <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg">
//                                     <ul>
//                                         <li
//                                             className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                                             onClick={() => handleFrequencySelect("daily")}
//                                         >
//                                             Every day
//                                         </li>
//                                         <li
//                                             className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                                             onClick={() => handleFrequencySelect("weekly")}
//                                         >
//                                             Every weekday
//                                         </li>
//                                         <li
//                                             className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                                             onClick={() => handleFrequencySelect("weekly")}
//                                         >
//                                             Every week
//                                         </li>
//                                         <li
//                                             className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                                             onClick={() => handleFrequencySelect("monthly")}
//                                         >
//                                             Every 2 weeks
//                                         </li>
//                                         <li
//                                             className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                                             onClick={() => handleFrequencySelect("monthly")}
//                                         >
//                                             Every month
//                                         </li>
//                                         <li
//                                             className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                                             onClick={() => handleFrequencySelect("yearly")}
//                                         >
//                                             Every year
//                                         </li>
//                                     </ul>
//                                 </div>
//                             )}
//                         </div>
//                     )}

// {/* Action buttons */}
// <div className="flex justify-between">
//     {event && (
//         <button
//             type="button"
//             onClick={onDelete}
//             className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
//         >
//             Delete
//         </button>
//     )}
//     <button
//         type="submit"
//         className="px-4 py-2 bg-navbar text-white rounded hover:bg-navbar-dark focus:outline-none ml-auto"
//     >
//         Save
//     </button>
// </div>
//                 </form>
//             </div>
//         </div>
//     )
// }

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

    const handleFrequencySelect = (selectedFrequency: string) => {
        setFrequency(selectedFrequency)
        setShowFrequencyDropdown(false)
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

                <h2 className="text-2xl font-semibold mb-6">{event ? "Edit event" : "Add event"}</h2>

                <form onSubmit={handleSubmit}>
                    {/* Title input */}
                    <div className="mb-4">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Add title"
                            className="w-full p-2 border-b border-gray-300 bg-transparent focus:outline-none focus:border-navbar"
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
                            className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#4a7c7d]"
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
                            className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#4a7c7d]"
                            step="0.01"
                        />
                    </div>

                    {/* Recurring toggle */}
                    <div className="mb-4 flex items-center">
                        <label className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={isRecurring}
                                    onChange={() => setIsRecurring(!isRecurring)}
                                />
                                <div className={`block w-10 h-6 rounded-full ${isRecurring ? "bg-[#4a7c7d]" : "bg-gray-300"}`}></div>
                                <div
                                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${isRecurring ? "translate-x-4" : "translate-x-0"
                                        }`}
                                    style={{ zIndex: 1 }}
                                ></div>
                            </div>
                            <div className="ml-3 text-gray-700 font-medium">Recurring?</div>
                        </label>
                    </div>

                    {/* Frequency dropdown (only shown if recurring) */}
                    {isRecurring && (
                        <div className="mb-6 relative">
                            <button
                                type="button"
                                onClick={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
                                className="w-full p-2 border border-gray-300 rounded bg-white text-left focus:outline-none focus:ring-1 focus:ring-[#4a7c7d]"
                            >
                                {frequency === "daily" && "Every day"}
                                {frequency === "weekly" && "Every week"}
                                {frequency === "monthly" && "Every month"}
                                {frequency === "yearly" && "Every year"}
                            </button>

                            {showFrequencyDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg">
                                    <ul>
                                        <li
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleFrequencySelect("daily")}
                                        >
                                            Every day
                                        </li>
                                        <li
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleFrequencySelect("weekly")}
                                        >
                                            Every weekday
                                        </li>
                                        <li
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleFrequencySelect("weekly")}
                                        >
                                            Every week
                                        </li>
                                        <li
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleFrequencySelect("monthly")}
                                        >
                                            Every 2 weeks
                                        </li>
                                        <li
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleFrequencySelect("monthly")}
                                        >
                                            Every month
                                        </li>
                                        <li
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleFrequencySelect("yearly")}
                                        >
                                            Every year
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-between">
                        {event && (
                            <button
                                type="button"
                                onClick={onDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
                            >
                                Delete
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-4 py-2 bg-navbar text-white rounded hover:bg-navbar-dark focus:outline-none ml-auto"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
