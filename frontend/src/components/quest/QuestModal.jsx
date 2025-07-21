import { useState } from 'react'
import { useQuests } from '../../context/QuestContext'
import { rules, validator } from 'common'
import { useAuth } from '../../context/AuthContext'

function QuestModal() {
    const { user } = useAuth()
    const {
        isQuestModalOpen,
        closeQuestModal,
        addQuest,
        isFeatureUnlocked,
        error,
        clearError
    } = useQuests()

    const [userInput, setUserInput] = useState('')
    const [difficulty, setDifficulty] = useState('STANDARD')
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedQuest, setGeneratedQuest] = useState(null)
    const [localError, setLocalError] = useState('')

    const [isScheduled, setIsScheduled] = useState(false)
    const [scheduledDate, setScheduledDate] = useState('')
    const [scheduledTime, setScheduledTime] = useState('')
    const [duration, setDuration] = useState(30)

    const aiAvailable = isFeatureUnlocked('AI_QUEST_GENERATION')

    const today = new Date().toISOString().split('T')[0]
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    const resetForm = () => {
        setUserInput('')
        setDifficulty('STANDARD')
        setIsGenerating(false)
        setGeneratedQuest(null)
        setLocalError('')
        setIsScheduled(false)
        setScheduledDate('')
        setScheduledTime('')
        setDuration(30)
        clearError()
    }

    const generateQuest = async () => {
        try {
            validator.text(userInput.trim(), 100, 3, 'quest description')

            setIsGenerating(true)
            setLocalError('')
            setGeneratedQuest(null)

            if (isScheduled) {
                if (!scheduledDate) {
                    setLocalError('Please select a date for your scheduled quest')
                    return
                }
                if (!scheduledTime) {
                    setLocalError('Please select a time for your scheduled quest')
                    return
                }
            }

            const questData = {
                title: userInput.trim(),
                useAI: true,
                difficulty,
                isScheduled,
                scheduledDate: isScheduled ? scheduledDate : null,
                scheduledTime: isScheduled ? scheduledTime : null,
                duration: isScheduled ? duration : 30
            }

            console.log('🔧 Frontend sending questData:', questData)
            console.log('🔧 isScheduled state:', isScheduled)
            console.log('🔧 scheduledDate state:', scheduledDate)
            console.log('🔧 scheduledTime state:', scheduledTime)

            const createdQuest = await addQuest(questData)
            setGeneratedQuest(createdQuest)

        } catch (error) {
            console.error('❌ Full error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                cause: error.cause
            })

            let errorMessage = 'Failed to create quest'

            if (error.message?.includes('Failed to save quest to database')) {
                errorMessage = 'Database error - please try again'
            } else if (error.message?.includes('Scheduled date is required')) {
                errorMessage = 'Please select a date for your scheduled quest'
            } else if (error.message?.includes('Scheduled time is required')) {
                errorMessage = 'Please select a time for your scheduled quest'
            } else if (error.message?.includes('Duration must be between')) {
                errorMessage = 'Duration must be between 5 and 480 minutes'
            } else if (error.message?.includes('Invalid time format')) {
                errorMessage = 'Please enter a valid time format (HH:MM)'
            } else if (error.message?.includes('AI service')) {
                errorMessage = 'AI service temporarily unavailable'
            } else if (error.message?.includes('validation failed')) {
                errorMessage = 'Quest data validation failed - try a simpler description'
            } else if (error.message?.includes('targetStat')) {
                errorMessage = 'Stat detection failed - try manual quest instead'
            } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
                errorMessage = 'Network error - check your connection'
            } else if (error.message) {
                errorMessage = error.message
            }

            setLocalError(errorMessage)
        } finally {
            setIsGenerating(false)
        }
    }

    const createManualQuest = async () => {
        try {
            validator.text(userInput.trim(), 100, 3, 'quest title')

            if (isScheduled) {
                if (!scheduledDate) {
                    setLocalError('Please select a date for your scheduled quest')
                    return
                }
                if (!scheduledTime) {
                    setLocalError('Please select a time for your scheduled quest')
                    return
                }
                if (duration < 5 || duration > 480) {
                    setLocalError('Duration must be between 5 and 480 minutes')
                    return
                }
            }

            const questData = {
                title: userInput.trim(),
                useAI: false,
                difficulty,
                isScheduled,
                scheduledDate: isScheduled ? scheduledDate : null,
                scheduledTime: isScheduled ? scheduledTime : null,
                duration: isScheduled ? duration : 30
            }

            console.log('🔧 Frontend sending questData:', questData)
            console.log('🔧 isScheduled state:', isScheduled)
            console.log('🔧 scheduledDate state:', scheduledDate)
            console.log('🔧 scheduledTime state:', scheduledTime)

            await addQuest(questData)
            handleClose()

        } catch (error) {
            console.error('Error creating manual quest:', error)
            setLocalError(error.message || 'Error creating quest.')
        }
    }

    const acceptQuest = () => {
        handleClose()
    }

    const handleClose = () => {
        resetForm()
        closeQuestModal()
    }

    const getStatEmoji = (stat) => {
        if (!stat) return '❓'
        return rules.STAT_RULES.STATS[stat]?.emoji || '❓'
    }

    if (!isQuestModalOpen) return null

    const currentError = localError || error

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-colors max-h-[90vh] overflow-y-auto">

                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create Quest</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl transition-colors"
                    >
                        ×
                    </button>
                </div>

                <div className="p-6">

                    {!generatedQuest && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                                    What do you want to achieve?
                                </label>
                                <textarea
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder="E.g: go to the gym, study physics, read..."
                                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                                    Difficulty
                                </label>
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                                >
                                    <option value="QUICK">⚡ Quick (25 XP)</option>
                                    <option value="STANDARD">⭐ Standard (50 XP)</option>
                                    <option value="LONG">🔥 Long (100 XP)</option>
                                    <option value="EPIC">💎 Epic (200 XP)</option>
                                </select>
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">📅</span>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Schedule this quest
                                        </span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isScheduled}
                                            onChange={(e) => {
                                                setIsScheduled(e.target.checked)
                                                if (e.target.checked && !scheduledDate) {
                                                    setScheduledDate(today)
                                                }
                                                if (e.target.checked && !scheduledTime) {
                                                    setScheduledTime(currentTime)
                                                }
                                            }}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>

                                {isScheduled && (
                                    <div className="space-y-3 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                📅 Date
                                            </label>
                                            <input
                                                type="date"
                                                value={scheduledDate}
                                                onChange={(e) => setScheduledDate(e.target.value)}
                                                min={today}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                    🕐 Time
                                                </label>
                                                <input
                                                    type="time"
                                                    value={scheduledTime}
                                                    onChange={(e) => setScheduledTime(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                    ⏱️ Duration (min)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={duration}
                                                    onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                                                    min="5"
                                                    max="480"
                                                    step="5"
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            💡 Scheduled quests appear in your daily agenda
                                        </div>
                                    </div>
                                )}
                            </div>

                            {currentError && (
                                <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded">
                                    {currentError}
                                </div>
                            )}

                            <div className="space-y-3">
                                {aiAvailable ? (
                                    <>
                                        <button
                                            onClick={generateQuest}
                                            disabled={isGenerating || !userInput.trim()}
                                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    🤖 {isScheduled ? 'Generate & Schedule' : 'Generate with AI'}
                                                </>
                                            )}
                                        </button>
                                        <div className="text-center text-sm text-gray-500 dark:text-gray-400">or</div>
                                    </>
                                ) : null}

                                <button
                                    onClick={createManualQuest}
                                    disabled={isGenerating || !userInput.trim()}
                                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
                                >
                                    ✅ {isScheduled ? 'Create & Schedule' : 'Create Quest'}
                                </button>
                            </div>
                        </div>
                    )}

                    {generatedQuest && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    🎉 Quest Generated!
                                </h3>
                            </div>

                            <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                                <div className="flex items-start gap-3 mb-3">
                                    <span className="text-2xl">
                                        {getStatEmoji(generatedQuest.targetStat)}
                                    </span>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 dark:text-gray-100">
                                            {generatedQuest.title}
                                        </h4>
                                        {generatedQuest.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                {generatedQuest.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded text-xs font-medium">
                                            {generatedQuest.difficulty}
                                        </span>
                                        {generatedQuest.targetStat && (
                                            <span className="text-gray-600 dark:text-gray-300">
                                                {rules.STAT_RULES.STATS[generatedQuest.targetStat]?.name || generatedQuest.targetStat}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                                        +{generatedQuest.experienceReward} XP
                                    </span>
                                </div>

                                {generatedQuest.isScheduled && (
                                    <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <span>📅</span>
                                            <span>
                                                Scheduled for {generatedQuest.scheduledDate} at {generatedQuest.scheduledTime}
                                                ({generatedQuest.duration} min)
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={acceptQuest}
                                    className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                                >
                                    ✅ Accept & Close
                                </button>
                                <button
                                    onClick={() => setGeneratedQuest(null)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                                >
                                    🔄 Try Again
                                </button>
                            </div>

                            <button
                                onClick={handleClose}
                                className="w-full bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 text-white py-2 px-4 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}

export default QuestModal