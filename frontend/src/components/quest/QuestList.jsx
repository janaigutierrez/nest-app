import { useState } from 'react'
import { useQuests } from '../../context/QuestContext'
import { useNotifications } from '../../context/NotificationContext'
import QuestCard from './QuestCard'
import AbandonModal from './AbandonModal'

const getSortedQuests = (quests, sortBy) => {
    const sorted = [...quests]
    switch (sortBy) {
        case 'stat':
            return sorted.sort((a, b) => {
                if (!a.targetStat && !b.targetStat) return 0
                if (!a.targetStat) return 1
                if (!b.targetStat) return -1
                return a.targetStat.localeCompare(b.targetStat)
            })
        case 'difficulty':
            const difficultyOrder = { 'EASY': 1, 'STANDARD': 2, 'HARD': 3, 'EPIC': 4 }
            return sorted.sort((a, b) => {
                return (difficultyOrder[a.difficulty] || 2) - (difficultyOrder[b.difficulty] || 2)
            })
        case 'xp':
            return sorted.sort((a, b) => b.experienceReward - a.experienceReward)
        case 'recent':
        default:
            return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    }
}

const QuestList = () => {
    const { quests, openQuestModal, getActiveQuests, getCompletedQuests, completeQuest, abandonQuest, refreshQuests } = useQuests()
    const { showSuccess, showError } = useNotifications()
    const [filter, setFilter] = useState('all')
    const [sortBy, setSortBy] = useState('recent')
    const [questToAbandon, setQuestToAbandon] = useState(null)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const getFilteredQuests = () => {
        switch (filter) {
            case 'active': return getActiveQuests()
            case 'completed': return getCompletedQuests()
            default: return quests
        }
    }

    const filteredQuests = getFilteredQuests()
    const sortedQuests = getSortedQuests(filteredQuests, sortBy)

    const handleComplete = async (questId) => {
        try {
            await completeQuest(questId)
        } catch (error) {
            console.error('Error completing quest:', error)
        }
    }

    const showAbandonConfirm = (quest) => {
        setQuestToAbandon(quest)
    }

    const handleAbandon = async () => {
        if (!questToAbandon) return
        try {
            await abandonQuest(questToAbandon._id)
            setQuestToAbandon(null)
        } catch (error) {
            console.error('Error abandoning quest:', error)
        }
    }

    const cancelAbandon = () => {
        setQuestToAbandon(null)
    }

    const handleRefresh = async () => {
        try {
            setIsRefreshing(true)
            await refreshQuests()
            showSuccess('🔄 Quests refreshed!')
        } catch (error) {
            console.error('Error refreshing quests:', error)
            showError('Failed to refresh quests')
        } finally {
            setIsRefreshing(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Quests</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${isRefreshing ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'
                            }`}
                    >
                        {isRefreshing ? '🔄' : '↻'} Refresh
                    </button>
                    <button
                        onClick={openQuestModal}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold"
                    >
                        ✨ Add Quest
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                        All ({quests.length})
                    </button>
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                        Active ({getActiveQuests().length})
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                        Completed ({getCompletedQuests().length})
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500 transition-colors"
                    >
                        <option value="recent">Recent</option>
                        <option value="stat">Stat</option>
                        <option value="difficulty">Difficulty</option>
                        <option value="xp">XP Reward</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {sortedQuests.length === 0 ? (
                    <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-4xl mb-4">🗡️</div>
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                            {filter === 'all' ? 'No quests yet!' : `No ${filter} quests found.`}
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm">
                            {filter === 'all'
                                ? 'Create your first quest to start your adventure!'
                                : 'Try a different filter to see more quests.'
                            }
                        </p>
                    </div>
                ) : (
                    sortedQuests.map((quest) => (
                        <QuestCard
                            key={quest._id}
                            quest={quest}
                            onComplete={handleComplete}
                            onAbandon={showAbandonConfirm}
                        />
                    ))
                )}
            </div>

            <AbandonModal
                quest={questToAbandon}
                onConfirm={handleAbandon}
                onCancel={cancelAbandon}
            />
        </div>
    )
}

export default QuestList