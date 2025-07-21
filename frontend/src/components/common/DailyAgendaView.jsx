import React, { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import logics from '../../logic'

const DailyAgendaView = () => {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [selectedQuest, setSelectedQuest] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [dayQuests, setDayQuests] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const timeSlots = useMemo(() => {
        const slots = []
        for (let hour = 0; hour < 24; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`)
            slots.push(`${hour.toString().padStart(2, '0')}:30`)
        }
        return slots
    }, [])

    useEffect(() => {
        loadQuestsForDate(selectedDate)
    }, [selectedDate])


    const loadQuestsForDate = async (date) => {
        try {
            setLoading(true)
            setError(null)

            console.log('🔍 Date queried:', date)

            const questsResponse = await logics.quest.getQuestsByDate(date)

            console.log('📦 Quests received:', questsResponse)
            console.log('📊 Quests count:', questsResponse?.length)

            setDayQuests(questsResponse || [])

        } catch (error) {
            console.error('Error loading quests for date:', error)
            setError(error.message)
            setDayQuests([])
        } finally {
            setLoading(false)
        }
    }

    const navigateDay = (direction) => {
        const newDate = new Date(selectedDate)
        newDate.setDate(newDate.getDate() + direction)
        setSelectedDate(newDate)
    }

    const openQuestModal = (quest) => {
        setSelectedQuest(quest)
        setIsModalOpen(true)
    }

    const closeQuestModal = () => {
        setIsModalOpen(false)
        setSelectedQuest(null)
    }

    const formatDate = (date) => {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) return 'Today'
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        })
    }

    const getStatColor = (stat) => {
        const colors = {
            STRENGTH: 'bg-red-500',
            DEXTERITY: 'bg-blue-500',
            WISDOM: 'bg-green-500',
            CHARISMA: 'bg-purple-500',
        }
        return colors[stat] || 'bg-gray-500'
    }

    const getStatEmoji = (stat) => {
        const emojis = {
            STRENGTH: '💪',
            DEXTERITY: '⚡',
            WISDOM: '🧠',
            CHARISMA: '✨',
        }
        return emojis[stat] || '⭐'
    }

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading agenda...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header with Navigation */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigateDay(-1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="text-center">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatDate(selectedDate)}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedDate.toLocaleDateString()}
                        </p>
                    </div>

                    <button
                        onClick={() => navigateDay(1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <button
                    onClick={() => setSelectedDate(new Date())}
                    className="mt-2 w-full py-1 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900 rounded transition-colors"
                >
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Go to Today
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="px-4 py-2 bg-red-50 dark:bg-red-900 border-b border-red-200 dark:border-red-700">
                    <p className="text-sm text-red-600 dark:text-red-400">
                        Error loading agenda: {error}
                    </p>
                </div>
            )}

            {/* Time Slots and Quests */}
            <div className="flex-1 overflow-y-auto">
                {dayQuests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-16 h-16 mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No quests for today</h3>
                        <p className="text-sm text-center">
                            Schedule some quests to see them here
                        </p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Time Grid */}
                        {timeSlots.map((time, index) => (
                            <TimeSlot
                                key={time}
                                time={time}
                                isHourMark={index % 2 === 0}
                            />
                        ))}

                        {/* Quest Blocks */}
                        {dayQuests.map((quest) => (
                            <QuestBlock
                                key={quest.id}
                                quest={quest}
                                onClick={() => openQuestModal(quest)}
                                getStatColor={getStatColor}
                                getStatEmoji={getStatEmoji}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Quest Detail Modal */}
            {isModalOpen && selectedQuest && (
                <QuestDetailModal
                    quest={selectedQuest}
                    isOpen={isModalOpen}
                    onClose={closeQuestModal}
                />
            )}
        </div>
    )
}

const TimeSlot = ({ time, isHourMark }) => {
    return (
        <div className={`relative h-12 border-gray-200 dark:border-gray-700 ${isHourMark ? 'border-t border-b' : 'border-t border-dashed'
            }`}>
            <div className="absolute left-2 top-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
                {isHourMark && time}
            </div>
        </div>
    )
}

const QuestBlock = ({ quest, onClick, getStatColor, getStatEmoji }) => {
    const [startHour, startMinute] = quest.scheduledTime.split(':').map(Number)
    const topPosition = (startHour * 2 + startMinute / 30) * 48
    const height = (quest.duration / 30) * 48

    return (
        <div
            className={`absolute left-16 right-4 rounded-lg shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-shadow ${getStatColor(quest.targetStat)
                } bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}
            style={{
                top: `${topPosition}px`,
                height: `${height}px`,
                minHeight: '40px'
            }}
            onClick={onClick}
        >
            <div className="p-2 h-full flex flex-col justify-center">
                <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm">{getStatEmoji(quest.targetStat)}</span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {quest.title}
                    </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {quest.targetStat} • {quest.duration}min
                </div>
            </div>
        </div>
    )
}

const QuestDetailModal = ({ quest, isOpen, onClose }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {quest.title}
                </h3>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Time:</span>
                        <span className="text-gray-900 dark:text-white">{quest.scheduledTime} ({quest.duration} min)</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Difficulty:</span>
                        <span className="text-gray-900 dark:text-white">{quest.difficulty}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Target Stat:</span>
                        <span className="text-gray-900 dark:text-white">{quest.targetStat}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">XP Reward:</span>
                        <span className="text-gray-900 dark:text-white">{quest.experienceReward} XP</span>
                    </div>

                    {quest.description && (
                        <div>
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Description:</span>
                            <p className="text-gray-900 dark:text-white">{quest.description}</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    )
}

export default DailyAgendaView