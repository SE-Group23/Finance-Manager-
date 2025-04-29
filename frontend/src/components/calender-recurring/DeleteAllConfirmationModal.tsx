"use client"

interface DeleteAllConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    eventCount: number
}

export function DeleteAllConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    eventCount,
}: DeleteAllConfirmationModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-lg">
                <h2 className="text-xl font-bold text-red-600 mb-4">Delete All Events</h2>

                <p className="mb-6">Are you sure you want to delete all {eventCount} events? This action cannot be undone.</p>

                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
                    >
                        Delete All
                    </button>
                </div>
            </div>
        </div>
    )
}
