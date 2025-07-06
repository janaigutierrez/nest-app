const AbandonModal = ({ quest, onConfirm, onCancel }) => {
    if (!quest) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Abandon Quest?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to abandon "{quest.title}"? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                        Abandon Quest
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AbandonModal