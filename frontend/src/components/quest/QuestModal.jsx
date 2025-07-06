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
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedQuest, setGeneratedQuest] = useState(null)
    const [localError, setLocalError] = useState('')

    const aiAvailable = isFeatureUnlocked('AI_QUEST_GENERATION')

    const generateQuest = async () => {
        try {
            validator.text(userInput.trim(), 100, 3, 'quest description')

            setIsGenerating(true)
            setLocalError('')
            setGeneratedQuest(null)


            const createdQuest = await addQuest({
                title: userInput.trim(),
                useAI: true,
                difficulty: 'STANDARD'
            })

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

            await addQuest({
                title: userInput.trim(),
                useAI: false,
                difficulty: 'STANDARD'
            })

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
        setUserInput('')
        setGeneratedQuest(null)
        setLocalError('')
        clearError()
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
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-colors">

                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create Quest</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl transition-colors"
                    >
                        x
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

                            {currentError && (
                                <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded">
                                    {currentError}
                                </div>
                            )}

                            <div className="space-y-3">
                                {aiAvailable ? (
                                    <button
                                        onClick={generateQuest}
                                        disabled={false}
                                        className="w-full py-3 px-4 rounded-lg font-semibold transition-all bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white"
                                    >
                                        {isGenerating ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                                Creating with AI...
                                            </span>
                                        ) : (
                                            '🤖 Create with AI'
                                        )}
                                    </button>
                                ) : (
                                    <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg text-center text-sm text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                                        🔒 AI Generation unlocks at Level 3
                                    </div>
                                )}

                                <button
                                    onClick={createManualQuest}
                                    disabled={false}
                                    className="w-full py-3 px-4 rounded-lg font-semibold transition-all bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
                                >
                                    📝 Create Manual Quest
                                </button>
                            </div>
                        </div>
                    )}

                    {generatedQuest && (
                        <div className="space-y-4">
                            <div className="p-4 bg-purple-50 dark:bg-purple-900 border-2 border-purple-200 dark:border-purple-700 rounded-lg">
                                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">
                                    🎯 {generatedQuest.title}
                                </h3>

                                {generatedQuest.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        {generatedQuest.description}
                                    </p>
                                )}

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-3">
                                        {generatedQuest.targetStat && (
                                            <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                                                {getStatEmoji(generatedQuest.targetStat)}
                                                {generatedQuest.targetStat}
                                            </span>
                                        )}
                                        <span className="text-gray-500 dark:text-gray-400">{generatedQuest.difficulty}</span>
                                        {generatedQuest.generatedBy === 'ai' && (
                                            <span className="text-purple-600 dark:text-purple-400">🤖 AI</span>
                                        )}
                                    </div>
                                    <span className="font-bold text-yellow-600 dark:text-yellow-400">
                                        +{generatedQuest.experienceReward} XP
                                    </span>
                                </div>
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