import React, { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import logics from '../../logic'

const WeeklyAgendaView = () => {
    const [selectedWeek, setSelectedWeek] = useState(new Date())
    const [selectedQuest, setSelectedQuest] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [weekQuests, setWeekQuests] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [draggedQuest, setDraggedQuest] = useState(null)
    const [dragOverSlot, setDragOverSlot] = useState(null)

    // Get the start of the week (Monday)
    const getWeekStart = (date) => {
        const d = new Date(date)
        const day = d.getDay()
        const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is Sunday
        return new Date(d.setDate(diff))
    }

    // Generate week days array
    const weekDays = useMemo(() => {
        const start = getWeekStart(selectedWeek)
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(start)
            date.setDate(start.getDate() + i)
            return date
        })
    }, [selectedWeek])

    // Generate time slots (every hour for weekly view)
    const timeSlots = useMemo(() => {
        const slots = []
        for (let hour = 6; hour < 24; hour++) { // Show 6AM to 11PM for weekly view
            slots.push(`${hour.toString().padStart(2, '0')}:00`)
        }
        return slots
    }, [])

    // Helper function to split cross-day quests for weekly view
    const splitCrossDayQuestsWeekly = (questsByDay, weekDays) => {
        const processedQuests = {}

        // Initialize empty arrays for each day
        weekDays.forEach(day => {
            processedQuests[day.toDateString()] = []
        })

        // Process each day's quests
        Object.keys(questsByDay).forEach(dateKey => {
            const dayQuests = questsByDay[dateKey] || []
            const currentDate = new Date(dateKey)

            dayQuests.forEach(quest => {
                if (!quest.scheduledTime || !quest.duration) {
                    console.warn('Invalid quest data in weekly view:', quest)
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

                    // Today's part
                    const todayQuest = {
                        ...quest,
                        duration: todayDuration,
                        isSplitQuest: true,
                        splitType: 'today',
                        originalDuration: quest.duration,
                        overflowMinutes: tomorrowDuration
                    }
                    processedQuests[dateKey].push(todayQuest)

                    // Tomorrow's part (if tomorrow is within the week)
                    const tomorrow = new Date(currentDate)
                    tomorrow.setDate(tomorrow.getDate() + 1)
                    const tomorrowKey = tomorrow.toDateString()

                    if (processedQuests[tomorrowKey] !== undefined) {
                        // Tomorrow is within current week view
                        const tomorrowEndHour = Math.floor(tomorrowDuration / 60)
                        const tomorrowEndMinute = tomorrowDuration % 60
                        const endTime = `${tomorrowEndHour.toString().padStart(2, '0')}:${tomorrowEndMinute.toString().padStart(2, '0')}`

                        const continuationQuest = {
                            ...quest,
                            id: `${quest.id}-continuation-weekly`, // Unique ID for weekly continuation
                            scheduledTime: '00:00',
                            duration: tomorrowDuration,
                            title: `${quest.title} (cont.)`,
                            isSplitQuest: true,
                            splitType: 'continuation',
                            originalDuration: quest.duration,
                            endTime: endTime,
                            originalQuestId: quest.id
                        }
                        processedQuests[tomorrowKey].push(continuationQuest)
                    }
                } else {
                    // Quest fits within the day
                    processedQuests[dateKey].push({
                        ...quest,
                        isSplitQuest: false
                    })
                }
            })
        })

        return processedQuests
    }

    // Helper function to check for continuation quests from previous week
    const getContinuationQuestsForWeek = async (weekDays) => {
        try {
            // Check if any quest from Sunday of previous week continues into Monday
            const firstDay = weekDays[0] // Monday
            const previousSunday = new Date(firstDay)
            previousSunday.setDate(previousSunday.getDate() - 1)

            const sundayQuests = await logics.quest.getQuestsByDate(previousSunday)
            const continuationQuests = {}

            sundayQuests.forEach(quest => {
                if (!quest.scheduledTime || !quest.duration) return

                const [startHour, startMinute] = quest.scheduledTime.split(':').map(Number)
                const startMinutesTotal = startHour * 60 + startMinute
                const endMinutesTotal = startMinutesTotal + quest.duration
                const endOfDay = 24 * 60

                if (endMinutesTotal > endOfDay) {
                    // This quest from Sunday continues into Monday
                    const mondayDuration = endMinutesTotal - endOfDay
                    const mondayEndHour = Math.floor(mondayDuration / 60)
                    const mondayEndMinute = mondayDuration % 60
                    const endTime = `${mondayEndHour.toString().padStart(2, '0')}:${mondayEndMinute.toString().padStart(2, '0')}`

                    const mondayKey = firstDay.toDateString()
                    if (!continuationQuests[mondayKey]) {
                        continuationQuests[mondayKey] = []
                    }

                    const continuationQuest = {
                        ...quest,
                        id: `${quest.id}-continuation-weekly-prev`, // Unique ID
                        scheduledTime: '00:00',
                        duration: mondayDuration,
                        title: `${quest.title} (cont.)`,
                        isSplitQuest: true,
                        splitType: 'continuation',
                        originalDuration: quest.duration,
                        endTime: endTime,
                        originalQuestId: quest.id
                    }
                    continuationQuests[mondayKey].push(continuationQuest)
                }
            })

            return continuationQuests
        } catch (error) {
            console.warn('Could not load weekly continuation quests:', error)
            return {}
        }
    }

    // Current time line calculation for weekly view
    const getCurrentTimeLineWeekly = () => {
        const now = new Date()
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()

        // Check if current time is within visible hours (6AM-11PM)
        if (currentHour < 6 || currentHour >= 24) return null

        // Find today in the week
        const today = new Date()
        const todayInWeek = weekDays.find(day => day.toDateString() === today.toDateString())

        if (!todayInWeek) return null // Today is not in current week view

        // Calculate position: 64px header + (hour - 6) * 80px per hour
        const position = 64 + ((currentHour - 6) * 80) + ((currentMinute / 60) * 80)
        const dayIndex = weekDays.findIndex(day => day.toDateString() === today.toDateString())

        return {
            position,
            dayIndex: dayIndex + 1, // +1 because first column is time column
            time: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
        }
    }

    const currentTimeLineWeekly = getCurrentTimeLineWeekly()

    // Update current time line every minute
    useEffect(() => {
        const updateTimeInterval = setInterval(() => {
            // Force re-render to update time line position
            setSelectedWeek(prev => new Date(prev))
        }, 60000) // Update every minute

        return () => clearInterval(updateTimeInterval)
    }, [])

    useEffect(() => {
        loadQuestsForWeek()
    }, [selectedWeek])

    // Auto-refresh for quest updates
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                loadQuestsForWeek()
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        const interval = setInterval(loadQuestsForWeek, 30000)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            clearInterval(interval)
        }
    }, [selectedWeek])

    const loadQuestsForWeek = async () => {
        try {
            setLoading(true)
            setError(null)

            // Load quests for each day of the week
            const weekPromises = weekDays.map(date =>
                logics.quest.getQuestsByDate(date).catch(() => [])
            )

            const weekData = await Promise.all(weekPromises)

            // Organize by date
            const organizedQuests = {}
            weekData.forEach((dayQuests, index) => {
                const dateKey = weekDays[index].toDateString()
                organizedQuests[dateKey] = dayQuests.filter(quest =>
                    quest.scheduledTime && quest.duration
                )
            })

            // Get continuation quests from previous week
            const continuationQuests = await getContinuationQuestsForWeek(weekDays)

            // Merge continuation quests
            Object.keys(continuationQuests).forEach(dateKey => {
                if (organizedQuests[dateKey]) {
                    organizedQuests[dateKey] = [...organizedQuests[dateKey], ...continuationQuests[dateKey]]
                } else {
                    organizedQuests[dateKey] = continuationQuests[dateKey]
                }
            })

            // Split cross-day quests
            const processedQuests = splitCrossDayQuestsWeekly(organizedQuests, weekDays)

            console.log('📅 Weekly quests processed with splitting:', processedQuests)
            setWeekQuests(processedQuests)

        } catch (error) {
            console.error('Error loading week quests:', error)
            const friendlyError = error.message?.includes('network') || error.message?.includes('fetch')
                ? 'Unable to load weekly agenda. Please check your connection.'
                : 'Failed to load weekly agenda. Please try again.'
            setError(friendlyError)
            setWeekQuests({})
        } finally {
            setLoading(false)
        }
    }

    const navigateWeek = (direction) => {
        const newDate = new Date(selectedWeek)
        newDate.setDate(newDate.getDate() + (direction * 7))
        setSelectedWeek(newDate)
    }

    const openQuestModal = (quest) => {
        setSelectedQuest(quest)
        setIsModalOpen(true)
    }

    const closeQuestModal = () => {
        setIsModalOpen(false)
        setSelectedQuest(null)
    }

    const handleDragStart = (e, quest) => {
        // Don't allow dragging split quests
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

    const handleDragOver = (e, dayDate, timeSlot) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOverSlot(`${dayDate.toDateString()}-${timeSlot}`)
    }

    const handleDragLeave = () => {
        setDragOverSlot(null)
    }

    const handleDrop = async (e, dayDate, targetTimeSlot) => {
        e.preventDefault()
        if (!draggedQuest || !targetTimeSlot) return

        try {
            const targetDateString = dayDate.toISOString().split('T')[0]

            // Update local state immediately
            const updatedQuest = {
                ...draggedQuest,
                scheduledTime: targetTimeSlot,
                scheduledDate: dayDate.toISOString()
            }

            // Remove from old date
            setWeekQuests(prev => {
                const newQuests = { ...prev }
                Object.keys(newQuests).forEach(dateKey => {
                    newQuests[dateKey] = newQuests[dateKey].filter(q => q.id !== draggedQuest.id)
                })

                // Add to new date
                const targetKey = dayDate.toDateString()
                if (!newQuests[targetKey]) newQuests[targetKey] = []
                newQuests[targetKey].push(updatedQuest)

                return newQuests
            })

            // Update backend
            await logics.quest.updateQuest(draggedQuest.id, {
                scheduledTime: targetTimeSlot,
                scheduledDate: targetDateString
            })

            console.log('✅ Quest moved to new day/time:', {
                questId: draggedQuest.id,
                newDate: targetDateString,
                newTime: targetTimeSlot
            })

        } catch (error) {
            console.error('❌ Error moving quest:', error)
            setError('Failed to move quest. Please try again.')
            loadQuestsForWeek()
        } finally {
            setDraggedQuest(null)
            setDragOverSlot(null)
        }
    }

    const getStatColor = (stat) => {
        const colors = {
            STRENGTH: 'border-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30',
            DEXTERITY: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30',
            WISDOM: 'border-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30',
            CHARISMA: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30',
        }
        return colors[stat] || 'border-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
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

    const formatWeekRange = () => {
        const start = weekDays[0]
        const end = weekDays[6]
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    }

    const isToday = (date) => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading weekly agenda...</p>
                </div>
            </div>
        )
    }

    const totalQuests = Object.values(weekQuests).flat().length

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60 px-4 sm:px-6 py-3 shadow-sm">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigateWeek(-1)}
                        className="p-2 sm:p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors touch-manipulation"
                    >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Week View
                        </h2>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {formatWeekRange()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {totalQuests} quest{totalQuests !== 1 ? 's' : ''} scheduled
                        </p>
                    </div>

                    <button
                        onClick={() => navigateWeek(1)}
                        className="p-2 sm:p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors touch-manipulation"
                    >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                <button
                    onClick={() => setSelectedWeek(new Date())}
                    className="mt-3 w-full py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/50 rounded-lg transition-all duration-200 flex items-center justify-center gap-1"
                >
                    <Calendar className="w-4 h-4" />
                    Go to This Week
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
                            onClick={loadQuestsForWeek}
                            className="ml-auto text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Weekly Grid */}
            <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-8 min-h-full relative">
                    {/* Current Time Line - Crosses ALL Days */}
                    {currentTimeLineWeekly && (
                        <div
                            className="absolute z-30 pointer-events-none"
                            style={{
                                top: `${currentTimeLineWeekly.position}px`,
                                left: `${100 / 8}%`, // Start after time column
                                width: `${(100 / 8) * 7}%` // Span all 7 day columns
                            }}
                        >
                            <div className="relative">
                                <div className="h-0.5 bg-red-500 shadow-lg animate-pulse"></div>
                                {/* Time indicator on today's column */}
                                <div
                                    className="absolute -top-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg whitespace-nowrap"
                                    style={{
                                        left: `${((currentTimeLineWeekly.dayIndex - 1) / 7) * 100}%`,
                                        transform: 'translateX(-50%)'
                                    }}
                                >
                                    🕐 {currentTimeLineWeekly.time}
                                </div>
                                {/* Arrow indicators at both ends */}
                                <div className="absolute left-0 -top-2">
                                    <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-red-500"></div>
                                </div>
                                <div className="absolute right-0 -top-2">
                                    <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-red-500"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Time Column */}
                    <div className="border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Time</span>
                        </div>
                        {timeSlots.map(time => (
                            <div key={time} className="h-20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{time}</span>
                            </div>
                        ))}
                    </div>

                    {/* Day Columns */}
                    {weekDays.map((dayDate) => (
                        <div key={dayDate.toDateString()} className="border-r border-gray-200 dark:border-gray-700 relative">
                            {/* Day Header */}
                            <div className={`h-16 border-b border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center ${isToday(dayDate) ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-50 dark:bg-gray-800'
                                }`}>
                                <span className={`text-xs font-medium ${isToday(dayDate)
                                    ? 'text-purple-700 dark:text-purple-300'
                                    : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                    {dayDate.toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                                <span className={`text-sm font-bold ${isToday(dayDate)
                                    ? 'text-purple-900 dark:text-purple-100'
                                    : 'text-gray-900 dark:text-white'
                                    }`}>
                                    {dayDate.getDate()}
                                </span>
                            </div>

                            {/* Time Slots */}
                            {timeSlots.map(time => (
                                <WeeklyTimeSlot
                                    key={`${dayDate.toDateString()}-${time}`}
                                    dayDate={dayDate}
                                    time={time}
                                    isDragOver={dragOverSlot === `${dayDate.toDateString()}-${time}`}
                                    onDragOver={(e) => handleDragOver(e, dayDate, time)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, dayDate, time)}
                                />
                            ))}

                            {/* Quest Blocks for this day */}
                            {(weekQuests[dayDate.toDateString()] || []).map(quest => (
                                <WeeklyQuestBlock
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
                        </div>
                    ))}
                </div>
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

const WeeklyTimeSlot = ({ isDragOver, onDragOver, onDragLeave, onDrop }) => {
    return (
        <div
            className={`h-20 border-b border-gray-200 dark:border-gray-700 relative transition-colors duration-200 ${isDragOver ? 'bg-purple-100 dark:bg-purple-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            {isDragOver && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                        Drop
                    </div>
                </div>
            )}
        </div>
    )
}

const WeeklyQuestBlock = ({ quest, onClick, onDragStart, onDragEnd, getStatColor, getStatEmoji, isDragging }) => {
    // Safety check for scheduledTime
    if (!quest.scheduledTime || !quest.scheduledTime.includes(':')) {
        console.warn('Invalid quest scheduledTime in weekly view:', quest)
        return null
    }

    const [startHour] = quest.scheduledTime.split(':').map(Number)
    const topPosition = 64 + ((startHour - 6) * 80) // 64px header + hour offset from 6AM

    // Use the quest's duration (already adjusted for split quests)
    const height = Math.max((quest.duration / 60) * 80, 20) // Scale height based on duration, minimum 20px

    // Special styling for split quests
    const getSplitQuestStyling = () => {
        if (!quest.isSplitQuest) return ''

        if (quest.splitType === 'continuation') {
            return 'border-l-2 border-dashed border-orange-500 bg-orange-50 dark:bg-orange-900/20'
        }

        if (quest.splitType === 'today' && quest.overflowMinutes) {
            return 'border-b border-dashed border-orange-300 dark:border-orange-600'
        }

        return ''
    }

    const isDraggable = !quest.isCompleted && !quest.isSplitQuest

    return (
        <div
            className={`absolute left-1 right-1 rounded shadow-sm border-l-2 text-xs transition-all duration-200 ${quest.isCompleted
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 opacity-75 cursor-pointer'
                : quest.isSplitQuest
                    ? getSplitQuestStyling() || `border-l-2 ${getStatColor(quest.targetStat)} cursor-pointer`
                    : `cursor-move ${getStatColor(quest.targetStat)}`
                } ${isDragging ? 'opacity-50 scale-105 z-50' : 'hover:shadow-md'
                }`}
            style={{
                top: `${topPosition}px`,
                height: `${height}px`,
                minHeight: '20px'
            }}
            onClick={onClick}
            draggable={isDraggable}
            onDragStart={isDraggable ? onDragStart : undefined}
            onDragEnd={isDraggable ? onDragEnd : undefined}
        >
            <div className="p-1 h-full flex flex-col justify-center">
                <div className="flex items-center gap-1">
                    {quest.isCompleted ? (
                        <span className="text-xs text-green-600 dark:text-green-400">✅</span>
                    ) : quest.splitType === 'continuation' ? (
                        <span className="text-xs text-orange-600 dark:text-orange-400">🔗</span>
                    ) : (
                        <span className="text-xs">{getStatEmoji(quest.targetStat)}</span>
                    )}
                    <span className={`font-medium text-xs truncate ${quest.isCompleted
                        ? 'line-through text-gray-500 dark:text-gray-400'
                        : quest.splitType === 'continuation'
                            ? 'text-orange-900 dark:text-orange-100'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                        {quest.title}
                    </span>
                </div>
                <div className={`text-xs ${quest.isCompleted
                    ? 'text-gray-500 dark:text-gray-500'
                    : quest.splitType === 'continuation'
                        ? 'text-orange-700 dark:text-orange-300'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}>
                    {quest.duration}min
                    {quest.splitType === 'today' && quest.overflowMinutes > 0 && (
                        <div className="text-orange-600 dark:text-orange-400 font-semibold">
                            +{quest.overflowMinutes}min
                        </div>
                    )}
                    {quest.splitType === 'continuation' && quest.endTime && (
                        <div className="text-orange-600 dark:text-orange-400 font-semibold">
                            until {quest.endTime}
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
                                {quest.splitType === 'continuation' ? 'Continuation from previous day' :
                                    quest.splitType === 'today' ? `Continues next day (+${quest.overflowMinutes}min)` :
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

                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Status:</span>
                        <span className={`font-medium ${quest.isCompleted ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                            {quest.isCompleted ? '✅ Completed' : '⏳ Pending'}
                        </span>
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

export default WeeklyAgendaView