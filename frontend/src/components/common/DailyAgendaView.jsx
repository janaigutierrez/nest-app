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
    const [draggedQuest, setDraggedQuest] = useState(null)
    const [dragOverSlot, setDragOverSlot] = useState(null)

    const timeSlots = useMemo(() => {
        const slots = []
        for (let hour = 0; hour < 24; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`)
            slots.push(`${hour.toString().padStart(2, '0')}:30`)
        }
        return slots
    }, [])

    // Helper function to split cross-day quests
    const splitCrossDayQuests = (quests, targetDate) => {
        const processedQuests = []

        quests.forEach(quest => {
            if (!quest.scheduledTime || !quest.duration) {
                console.warn('Invalid quest data:', quest)
                return
            }

            const [startHour, startMinute] = quest.scheduledTime.split(':').map(Number)
            const startMinutesTotal = startHour * 60 + startMinute
            const endMinutesTotal = startMinutesTotal + quest.duration
            const endOfDay = 24 * 60 // 24:00 in minutes

            if (endMinutesTotal > endOfDay) {
                // Quest extends past midnight - split it
                const todayDuration = endOfDay - startMinutesTotal
                const tomorrowDuration = endMinutesTotal - endOfDay

                // Today's part (current quest)
                const todayQuest = {
                    ...quest,
                    duration: todayDuration,
                    isSplitQuest: true,
                    splitType: 'today',
                    originalDuration: quest.duration,
                    overflowMinutes: tomorrowDuration
                }
                processedQuests.push(todayQuest)

                // Check if we need to show tomorrow's part
                const tomorrow = new Date(targetDate)
                tomorrow.setDate(tomorrow.getDate() + 1)

                // Only create tomorrow's part if viewing current day
                // Tomorrow's part will be handled when viewing tomorrow

            } else {
                // Quest fits within the day
                processedQuests.push({
                    ...quest,
                    isSplitQuest: false
                })
            }
        })

        return processedQuests
    }

    // Helper function to check for continuation quests from yesterday
    const getContinuationQuests = async (targetDate) => {
        try {
            const yesterday = new Date(targetDate)
            yesterday.setDate(yesterday.getDate() - 1)

            const yesterdayQuests = await logics.quest.getQuestsByDate(yesterday)
            const continuationQuests = []

            yesterdayQuests.forEach(quest => {
                if (!quest.scheduledTime || !quest.duration) return

                const [startHour, startMinute] = quest.scheduledTime.split(':').map(Number)
                const startMinutesTotal = startHour * 60 + startMinute
                const endMinutesTotal = startMinutesTotal + quest.duration
                const endOfDay = 24 * 60

                if (endMinutesTotal > endOfDay) {
                    // This quest from yesterday continues into today
                    const tomorrowDuration = endMinutesTotal - endOfDay
                    const tomorrowEndHour = Math.floor(tomorrowDuration / 60)
                    const tomorrowEndMinute = tomorrowDuration % 60
                    const endTime = `${tomorrowEndHour.toString().padStart(2, '0')}:${tomorrowEndMinute.toString().padStart(2, '0')}`

                    const continuationQuest = {
                        ...quest,
                        id: `${quest.id}-continuation`, // Unique ID for continuation
                        scheduledTime: '00:00',
                        duration: tomorrowDuration,
                        title: `${quest.title} (cont.)`,
                        isSplitQuest: true,
                        splitType: 'continuation',
                        originalDuration: quest.duration,
                        endTime: endTime,
                        originalQuestId: quest.id
                    }
                    continuationQuests.push(continuationQuest)
                }
            })

            return continuationQuests
        } catch (error) {
            console.warn('Could not load continuation quests:', error)
            return []
        }
    }

    // Current time line calculation
    const getCurrentTimeLine = () => {
        const now = new Date()
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()

        // Check if we're viewing today
        const today = new Date()
        const isViewingToday = selectedDate.toDateString() === today.toDateString()

        if (!isViewingToday) return null

        // Calculate position: (hour * 2 + minute/30) * 48px per slot
        const position = (currentHour * 2 + currentMinute / 30) * 48

        return {
            position,
            time: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
        }
    }

    const currentTimeLine = getCurrentTimeLine()

    // Update current time line every minute
    useEffect(() => {
        const updateTimeInterval = setInterval(() => {
            // Force re-render to update time line position
            setSelectedDate(prev => new Date(prev))
        }, 60000) // Update every minute

        return () => clearInterval(updateTimeInterval)
    }, [])

    useEffect(() => {
        loadQuestsForDate(selectedDate)
    }, [selectedDate])

    // Listen for quest updates globally (quest completion, etc.)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // Refresh when user returns to tab
                loadQuestsForDate(selectedDate)
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        // Also refresh every 30 seconds to catch updates from other tabs
        const interval = setInterval(() => {
            loadQuestsForDate(selectedDate)
        }, 30000)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            clearInterval(interval)
        }
    }, [selectedDate])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return

            switch (event.key) {
                case 'ArrowLeft':
                    navigateDay(-1)
                    break
                case 'ArrowRight':
                    navigateDay(1)
                    break
                case 'Home':
                    setSelectedDate(new Date())
                    break
                case 'Escape':
                    if (isModalOpen) closeQuestModal()
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isModalOpen])

    const loadQuestsForDate = async (date) => {
        try {
            setLoading(true)
            setError(null)

            console.log('🔍 Date queried:', date)

            // Load quests for the target date
            const questsResponse = await logics.quest.getQuestsByDate(date)
            console.log('📦 Quests received:', questsResponse)

            // Load continuation quests from yesterday
            const continuationQuests = await getContinuationQuests(date)
            console.log('📅 Continuation quests:', continuationQuests)

            // Combine and process all quests
            const allQuests = [...(questsResponse || []), ...continuationQuests]
            const validQuests = allQuests.filter(quest => {
                if (!quest.scheduledTime || !quest.duration) {
                    console.warn('Invalid quest data:', quest)
                    return false
                }
                return true
            })

            // Split cross-day quests
            const processedQuests = splitCrossDayQuests(validQuests, date)
            console.log('📊 Processed quests count:', processedQuests.length)

            setDayQuests(processedQuests)

        } catch (error) {
            console.error('Error loading quests for date:', error)
            const friendlyError = error.message?.includes('network') || error.message?.includes('fetch')
                ? 'Unable to load agenda. Please check your connection.'
                : 'Failed to load daily agenda. Please try again.'
            setError(friendlyError)
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

    const handleDragStart = (e, quest) => {
        // Don't allow dragging split quests or continuation quests
        if (quest.isSplitQuest) {
            e.preventDefault()
            return
        }
        setDraggedQuest(quest)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragEnd = () => {
        setDraggedQuest(null)
        setDragOverSlot(null)
    }

    const handleDragOver = (e, timeSlot) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOverSlot(timeSlot)
    }

    const handleDragLeave = () => {
        setDragOverSlot(null)
    }

    const handleDrop = async (e, targetTimeSlot) => {
        e.preventDefault()
        if (!draggedQuest || !targetTimeSlot) return

        try {
            // Update local state immediately for better UX
            const updatedQuest = {
                ...draggedQuest,
                scheduledTime: targetTimeSlot
            }

            setDayQuests(prev => prev.map(q =>
                q.id === draggedQuest.id ? updatedQuest : q
            ))

            // Call backend API to update quest
            await logics.quest.updateQuest(draggedQuest.id, {
                scheduledTime: targetTimeSlot
            })

            console.log('✅ Quest moved successfully:', {
                questId: draggedQuest.id,
                newTime: targetTimeSlot,
                oldTime: draggedQuest.scheduledTime
            })

        } catch (error) {
            console.error('❌ Error moving quest:', error)
            setError('Failed to move quest. Please try again.')
            // Revert changes on error
            loadQuestsForDate(selectedDate)
        } finally {
            setDraggedQuest(null)
            setDragOverSlot(null)
        }
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
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60 px-4 sm:px-6 py-3 shadow-sm">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigateDay(-1)}
                        className="p-2 sm:p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors touch-manipulation"
                    >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatDate(selectedDate)}
                        </h2>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {selectedDate.toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </p>
                    </div>

                    <button
                        onClick={() => navigateDay(1)}
                        className="p-2 sm:p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors touch-manipulation"
                    >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
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
                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-700">
                    <div className="flex items-center gap-2">
                        <span className="text-red-500 text-sm">⚠️</span>
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>
                        <button
                            onClick={() => loadQuestsForDate(selectedDate)}
                            className="ml-auto text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Time Slots and Quests */}
            <div className="flex-1 overflow-y-auto">
                {dayQuests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full p-6 mb-4">
                            <Calendar className="w-12 h-12 text-purple-500 dark:text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-700 dark:text-gray-300">No quests scheduled</h3>
                        <p className="text-sm text-center text-gray-600 dark:text-gray-400 max-w-sm">
                            Create and schedule quests to see them in your daily agenda
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
                                isDragOver={dragOverSlot === time}
                                onDragOver={(e) => handleDragOver(e, time)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, time)}
                            />
                        ))}

                        {/* Quest Blocks */}
                        {dayQuests.map((quest) => (
                            <QuestBlock
                                key={quest.id}
                                quest={quest}
                                onClick={() => openQuestModal(quest)}
                                onDragStart={(e) => handleDragStart(e, quest)}
                                onDragEnd={handleDragEnd}
                                getStatColor={getStatColor}
                                getStatEmoji={getStatEmoji}
                                isDragging={draggedQuest?.id === quest.id}
                            />
                        ))}

                        {/* Current Time Line */}
                        {currentTimeLine && (
                            <div
                                className="absolute left-0 right-0 z-30 pointer-events-none"
                                style={{ top: `${currentTimeLine.position}px` }}
                            >
                                {/* Time line */}
                                <div className="relative">
                                    <div className="h-0.5 bg-red-500 shadow-lg animate-pulse"></div>
                                    {/* Time indicator */}
                                    <div className="absolute left-3 -top-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                        🕐 {currentTimeLine.time}
                                    </div>
                                    {/* Arrow indicator */}
                                    <div className="absolute right-3 -top-2">
                                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
                                    </div>
                                </div>
                            </div>
                        )}
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

const TimeSlot = ({ time, isHourMark, isDragOver, onDragOver, onDragLeave, onDrop }) => {
    return (
        <div
            className={`relative h-12 transition-colors duration-200 ${isHourMark
                    ? 'border-t border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30'
                    : 'border-t border-dashed border-gray-200 dark:border-gray-700'
                } ${isDragOver ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600' : ''
                }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <div className="absolute left-3 top-2 text-xs font-medium text-gray-600 dark:text-gray-400 font-mono">
                {isHourMark && (
                    <span className="bg-white dark:bg-gray-800 px-1 rounded">
                        {time}
                    </span>
                )}
            </div>
            {isDragOver && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                        Drop here
                    </div>
                </div>
            )}
        </div>
    )
}

const QuestBlock = ({ quest, onClick, onDragStart, onDragEnd, getStatColor, getStatEmoji, isDragging }) => {
    // Safety check for scheduledTime
    if (!quest.scheduledTime || !quest.scheduledTime.includes(':')) {
        console.warn('Invalid quest scheduledTime:', quest)
        return null
    }

    const [startHour, startMinute] = quest.scheduledTime.split(':').map(Number)
    const topPosition = (startHour * 2 + startMinute / 30) * 48

    // Use the quest's duration (already adjusted for split quests)
    const height = Math.max((quest.duration / 30) * 48, 40) // Minimum 40px height

    // Special styling for split quests
    const getSplitQuestStyling = () => {
        if (!quest.isSplitQuest) return ''

        if (quest.splitType === 'continuation') {
            return 'border-l-4 border-dashed border-orange-500 bg-orange-50 dark:bg-orange-900/20'
        }

        if (quest.splitType === 'today' && quest.overflowMinutes) {
            return 'border-b-2 border-dashed border-orange-300 dark:border-orange-600'
        }

        return ''
    }

    const isDraggable = !quest.isCompleted && !quest.isSplitQuest

    return (
        <div
            className={`absolute left-16 right-4 rounded-lg shadow-sm border-l-4 hover:shadow-lg transition-all duration-200 ${quest.isCompleted
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 opacity-75 cursor-pointer'
                    : quest.isSplitQuest
                        ? getSplitQuestStyling() || `border-l-4 ${getStatColor(quest.targetStat)} cursor-pointer`
                        : `cursor-move ${getStatColor(quest.targetStat)}`
                } ${isDragging ? 'opacity-50 scale-105 z-50' : 'hover:scale-[1.02]'
                }`}
            style={{
                top: `${topPosition}px`,
                height: `${height}px`,
                minHeight: '40px'
            }}
            onClick={onClick}
            draggable={isDraggable}
            onDragStart={isDraggable ? onDragStart : undefined}
            onDragEnd={isDraggable ? onDragEnd : undefined}
        >
            <div className="p-3 h-full flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                    {quest.isCompleted ? (
                        <span className="text-base text-green-600 dark:text-green-400">✅</span>
                    ) : quest.splitType === 'continuation' ? (
                        <span className="text-base text-orange-600 dark:text-orange-400">🔗</span>
                    ) : (
                        <span className="text-base">{getStatEmoji(quest.targetStat)}</span>
                    )}
                    <span className={`font-semibold text-sm truncate leading-tight ${quest.isCompleted
                            ? 'line-through text-gray-500 dark:text-gray-400'
                            : quest.splitType === 'continuation'
                                ? 'text-orange-900 dark:text-orange-100'
                                : 'text-gray-900 dark:text-white'
                        }`}>
                        {quest.title}
                    </span>
                    {quest.isCompleted && (
                        <span className="text-xs font-medium text-green-600 dark:text-green-400 ml-auto">
                            Done
                        </span>
                    )}
                </div>
                <div className={`text-xs font-medium ${quest.isCompleted
                        ? 'text-gray-500 dark:text-gray-500'
                        : quest.splitType === 'continuation'
                            ? 'text-orange-700 dark:text-orange-300'
                            : 'text-gray-600 dark:text-gray-300'
                    }`}>
                    <span className="inline-flex items-center gap-1">
                        <span>{quest.targetStat}</span>
                        <span className="text-gray-400 dark:text-gray-500">•</span>
                        <span>{quest.duration}min</span>
                        {quest.splitType === 'continuation' && quest.endTime && (
                            <>
                                <span className="text-gray-400 dark:text-gray-500">•</span>
                                <span className="text-orange-600 dark:text-orange-400">
                                    until {quest.endTime}
                                </span>
                            </>
                        )}
                        {quest.isCompleted && quest.completedAt && (
                            <>
                                <span className="text-gray-400 dark:text-gray-500">•</span>
                                <span className="text-green-600 dark:text-green-400">
                                    {new Date(quest.completedAt).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </>
                        )}
                    </span>
                    {quest.splitType === 'today' && quest.overflowMinutes > 0 && (
                        <div className="text-orange-600 dark:text-orange-400 font-semibold mt-1 flex items-center gap-1">
                            <span>⏰</span>
                            <span>+{quest.overflowMinutes}min tomorrow</span>
                        </div>
                    )}
                    {quest.splitType === 'continuation' && (
                        <div className="text-orange-600 dark:text-orange-400 font-semibold mt-1 flex items-center gap-1">
                            <span>📅</span>
                            <span>Continued from yesterday</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const QuestDetailModal = ({ quest, isOpen, onClose }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">
                        {quest.splitType === 'continuation' ? '🔗' :
                            quest.targetStat === 'STRENGTH' ? '💪' :
                                quest.targetStat === 'DEXTERITY' ? '⚡' :
                                    quest.targetStat === 'WISDOM' ? '🧠' :
                                        quest.targetStat === 'CHARISMA' ? '✨' : '⭐'}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {quest.title}
                    </h3>
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Time:</span>
                        <span className="text-gray-900 dark:text-white">
                            {quest.scheduledTime}
                            {quest.splitType === 'continuation' && quest.endTime && ` - ${quest.endTime}`}
                            {` (${quest.duration} min)`}
                        </span>
                    </div>

                    {quest.isSplitQuest && (
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Quest Type:</span>
                            <span className="text-orange-600 dark:text-orange-400 font-medium">
                                {quest.splitType === 'continuation' ? 'Continuation from yesterday' :
                                    quest.splitType === 'today' ? `Continues tomorrow (+${quest.overflowMinutes}min)` :
                                        'Split Quest'}
                            </span>
                        </div>
                    )}

                    {quest.originalDuration && quest.originalDuration !== quest.duration && (
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Original Duration:</span>
                            <span className="text-gray-900 dark:text-white">{quest.originalDuration} min</span>
                        </div>
                    )}

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
                    className="mt-6 w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                    Close
                </button>
            </div>
        </div>
    )
}

export default DailyAgendaView