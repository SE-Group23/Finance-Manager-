"use client"
import { format } from "date-fns"
import { ChevronLeftIcon } from "../icons/ChevronLeftIcon"
import { ChevronRightIcon } from "../icons/ChevronRightIcon"

interface CalendarHeaderProps {
    currentDate: Date
    onPrevMonth: () => void
    onNextMonth: () => void
}

export function CalendarHeader({ currentDate, onPrevMonth, onNextMonth }: CalendarHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{format(currentDate, "MMMM yyyy")}</h2>
            <div className="flex space-x-2">
                <button onClick={onPrevMonth} className="p-2 rounded-full hover:bg-gray-100" aria-label="Previous month">
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button onClick={onNextMonth} className="p-2 rounded-full hover:bg-gray-100" aria-label="Next month">
                    <ChevronRightIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    )
}
