import { useQuests } from '../../context/QuestContext'
import { useNotifications } from '../../context/NotificationContext'
import { rules } from 'common'
import { useState } from 'react'

function QuestList() {
    const { quests, completeQuest, abandonQuest, openQuestModal, error, clearError } = useQuests()
    const { showSuccess, showError } = useNotifications()
    const [questToAbandon, setQuestToAbandon] = useState(null)

    const getStatEmoji = (stat) => {
        if (!stat) return '❓'
        return rules.STAT_RULES.STATS[stat]?.emoji || '❓'
    }

    const handleCompleteQuest = async (questId) => {
        try {
            await completeQuest(questId)
            showSuccess('Quest completed! 🎉')
        } catch (error) {
            showError('Error completing quest')
            console.error('Error completing quest:', error)
        }
    }

    const handleAbandonQuest = async (questId) => {
        console.log('🔍 Attempting to abandon quest:', questId) // Debug
        try {
            await abandonQuest(questId)
            showSuccess('Quest abandoned')
            setQuestToAbandon(null)
        } catch (error) {
            showError('Error abandoning quest')
            console.error('Error abandoning quest:', error)
        }
    }

    const showAbandonConfirm = (quest) => {
        setQuestToAbandon(quest)
    }

    const cancelAbandon = () => {
        setQuestToAbandon(null)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">List</h2>
                <button
                    onClick={openQuestModal}
                    className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Add Quest
                </button>
            </div>

            {error && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{error}</span>
                    <button
                        onClick={clearError}
                        className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-700 dark:text-red-200"
                    >
                        <span className="text-xl">&times;</span>
                    </button>
                </div>
            )}

            {questToAbandon && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">🗑️ Abandon Quest</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to abandon "<strong className="text-gray-900 dark:text-gray-100">{questToAbandon.title}</strong>"?
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleAbandonQuest(questToAbandon._id || questToAbandon.id)}
                                className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                            >
                                Yes, Abandon
                            </button>
                            <button
                                onClick={cancelAbandon}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {quests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <div className="text-4xl mb-2">📜</div>
                        <p>No quests yet. Create your first epic quest!</p>
                    </div>
                ) : (
                    quests.map((quest, index) => {
                        return (
                            <div
                                key={quest._id || quest.id || index}
                                className={`p-4 border rounded-lg shadow-sm hover:shadow-md transition-all ${quest.isCompleted
                                    ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-75'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <div className="mb-3">
                                    <h3 className={`font-bold text-lg mb-1 ${quest.isCompleted
                                        ? 'line-through text-gray-500 dark:text-gray-400'
                                        : 'text-gray-900 dark:text-gray-100'
                                        }`}>
                                        {quest.isCompleted ? '✅' : '🎯'} {quest.title}
                                    </h3>

                                    {(quest.generatedBy === 'ai' || quest.generatedBy === 'epic_fallback') && quest.aiMetadata?.prompt && (
                                        <div className="mb-2 text-xs bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded px-2 py-1">
                                            <span className="text-purple-600 dark:text-purple-400 font-medium">Original: </span>
                                            <span className="text-purple-700 dark:text-purple-300 italic">"{quest.aiMetadata.prompt}"</span>
                                            {quest.generatedBy === 'epic_fallback' && (
                                                <span className="text-orange-600 dark:text-orange-400 ml-2">(fallback)</span>
                                            )}
                                        </div>
                                    )}

                                    {quest.description && (
                                        <p className={`text-sm ${quest.isCompleted
                                            ? 'text-gray-400 dark:text-gray-500'
                                            : 'text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {quest.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-3">
                                        {quest.targetStat && (
                                            <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                                                {getStatEmoji(quest.targetStat)}
                                                {quest.targetStat}
                                            </span>
                                        )}

                                        <span className="text-gray-500 dark:text-gray-400">
                                            {quest.difficulty}
                                        </span>

                                        {quest.generatedBy === 'ai' && (
                                            <span className="text-purple-600 dark:text-purple-400">
                                                🤖 AI
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-yellow-600 dark:text-yellow-400">
                                            +{quest.experienceReward} XP
                                        </span>

                                        {!quest.isCompleted ? (
                                            <div className="flex gap-1">
                                                <button
                                                    className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                                    onClick={() => handleCompleteQuest(quest._id || quest.id)}
                                                    title="Complete Quest"
                                                >
                                                    ✅
                                                </button>
                                                <button
                                                    className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                                    onClick={() => showAbandonConfirm(quest)}
                                                    title="Abandon Quest"
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                                                Completed ✨
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default QuestList