import { useState } from 'react'
import { useQuests } from '../../context/QuestContext'
import { useNotifications } from '../../context/NotificationContext'

const QuestActions = ({ quest }) => {
    const { completeQuest, abandonQuest } = useQuests()
    const { showSuccess, showError } = useNotifications()
    const [showAbandonModal, setShowAbandonModal] = useState(false)

    const handleComplete = async () => {
        try {
            await completeQuest(quest._id)
            showSuccess('🎉 Quest completed! XP earned!')
        } catch (error) {
            console.error('Error completing quest:', error)
            showError('Failed to complete quest')
        }
    }

    const handleAbandon = async () => {
        try {
            await abandonQuest(quest._id)
            showSuccess('Quest abandoned')
            setShowAbandonModal(false)
        } catch (error) {
            console.error('Error abandoning quest:', error)
            showError('Failed to abandon quest')
        }
    }

    const showConfirm = () => setShowAbandonModal(true)
    const hideConfirm = () => setShowAbandonModal(false)

    if (quest.isCompleted) {
        return (
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                Completed
            </span>
        )
    }

    return (
        <>
            <div className="flex gap-2">
                <button
                    onClick={handleComplete}
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    title="Complete Quest"
                >
                    ✅
                </button>
                <button
                    onClick={showConfirm}
                    className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    title="Abandon Quest"
                >
                    ❌
                </button>
            </div>

            {showAbandonModal && (
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
                                onClick={hideConfirm}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAbandon}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                                Abandon Quest
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default QuestActions