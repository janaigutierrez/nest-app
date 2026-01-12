import React, { useState, useEffect } from 'react'
import { useQuests } from '../../context/QuestContext'
import { useAuth } from '../../context/AuthContext'
import { detectRitualCategory, calculateSmartXP } from '../../utils/aiDetection'
import logics from '../../logic'
import { getStatEmoji } from '../../utils/questHelpers'

function QuestModal({ isAI = false, userLevel = 1 }) {
    const { user } = useAuth()
    const { isQuestModalOpen, closeQuestModal, error, clearError } = useQuests()
    const [userInput, setUserInput] = useState('')
    const [generatedQuest, setGeneratedQuest] = useState(null)
    const [localError, setLocalError] = useState('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [aiAnalysis, setAiAnalysis] = useState(null)

    // Auto-analyze input when in AI mode
    useEffect(() => {
        if (isAI && userInput.trim() && userLevel > 3) {
            const timeoutId = setTimeout(async () => {
                setIsAnalyzing(true)
                try {
                    const detection = detectRitualCategory(userInput)
                    if (!detection.shouldUseFallback) {
                        // Parse input into potential tasks
                        const tasks = userInput.split(/[,\n]/).map(t => t.trim()).filter(t => t)
                        const xpCalculation = calculateSmartXP(tasks, detection.match)

                        setAiAnalysis({
                            category: detection.match.category,
                            confidence: detection.match.confidence,
                            tasks: tasks.map((task, index) => ({
                                title: task,
                                ...xpCalculation[index]
                            })),
                            totalXP: xpCalculation.reduce((sum, calc) => sum + calc.xp, 0),
                            totalTime: xpCalculation.reduce((sum, calc) => sum + calc.minutes, 0)
                        })
                    } else {
                        setAiAnalysis({
                            fallback: true,
                            message: detection.fallbackMessage
                        })
                    }
                } catch (error) {
                    console.error('AI analysis failed:', error)
                    setAiAnalysis({
                        fallback: true,
                        message: "Our neural networks need more coffee ☕ Care to lead?"
                    })
                }
                setIsAnalyzing(false)
            }, 1000) // Wait 1 second after user stops typing

            return () => clearTimeout(timeoutId)
        } else {
            setAiAnalysis(null)
        }
    }, [userInput, isAI, userLevel])

    const generateAIQuest = async () => {
        if (!userInput.trim()) return

        try {
            setGeneratedQuest(null)
            setLocalError('')

            if (aiAnalysis?.fallback) {
                // Fallback to manual
                setLocalError(aiAnalysis.message)
                return
            }

            if (aiAnalysis) {
                // Use AI analysis for single quest
                const mainTask = aiAnalysis.tasks[0] || { title: userInput.trim(), xp: 10, minutes: 15 }

                const questData = {
                    title: mainTask.title,
                    description: `AI-enhanced ${aiAnalysis.category.toLowerCase()} quest`,
                    targetStat: mainTask.stat,
                    experienceReward: mainTask.xp,
                    difficulty: mainTask.minutes < 10 ? 'Easy' : mainTask.minutes < 30 ? 'Medium' : 'Hard',
                    generatedBy: 'ai',
                    category: aiAnalysis.category
                }

                setGeneratedQuest(questData)
            } else {
                // Fallback to original AI service
                const aiQuest = await logics.quest.generateQuestWithAI(userInput)
                setGeneratedQuest(aiQuest)
            }

        } catch (error) {
            console.error('AI generation error:', error)
            setLocalError('AI generation failed. Please try manual mode.')
        }
    }

    const generateManualQuest = async () => {
        if (!userInput.trim()) return

        try {
            setGeneratedQuest(null)
            setLocalError('')
            const manualQuest = await logics.quest.generateQuestManually(userInput)
            setGeneratedQuest(manualQuest)
        } catch (error) {
            console.error('Manual generation error:', error)
            setLocalError(error.message)
        }
    }

    const acceptQuest = async () => {
        if (!generatedQuest) return

        try {
            await logics.quest.createQuest(generatedQuest)
            handleClose()
        } catch (error) {
            setLocalError(error.message)
        }
    }

    const handleClose = () => {
        setUserInput('')
        setGeneratedQuest(null)
        setLocalError('')
        setAiAnalysis(null)
        clearError()
        closeQuestModal()
    }

    const getStatEmojiLocal = (stat) => {
        return getStatEmoji(stat)
    }

    if (!isQuestModalOpen) return null

    const currentError = localError || error
    const aiAvailable = userLevel > 3

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-colors">

                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {isAI ? '🤖 AI Quest' : '✍️ Create Quest'}
                        </h2>
                        {isAI && !aiAvailable && (
                            <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-2 py-1 rounded-full">
                                Level 3+ Required
                            </span>
                        )}
                    </div>
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
                                    {isAI ? 'Describe your quest and let AI enhance it:' : 'What do you want to achieve?'}
                                </label>
                                <textarea
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder={isAI ?
                                        "E.g: gym workout squats deadlifts, study math chapter 5, buy groceries milk eggs..." :
                                        "E.g: go to the gym, study physics, read..."
                                    }
                                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                                    rows={isAI ? 4 : 3}
                                />
                            </div>

                            {/* AI Analysis Preview */}
                            {isAI && aiAvailable && (
                                <div className="space-y-2">
                                    {isAnalyzing && (
                                        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            Analyzing your input...
                                        </div>
                                    )}

                                    {aiAnalysis && !isAnalyzing && !aiAnalysis.fallback && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                                            <div className="text-sm text-blue-800 dark:text-blue-200">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium">🎯 Detected:</span>
                                                    <span>{aiAnalysis.category}</span>
                                                    <span className="text-xs opacity-75">({Math.round(aiAnalysis.confidence * 100)}% confidence)</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs">
                                                    <span>⏱️ ~{aiAnalysis.totalTime} min</span>
                                                    <span>⭐ ~{aiAnalysis.totalXP} XP</span>
                                                    <span>📝 {aiAnalysis.tasks.length} tasks detected</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {aiAnalysis?.fallback && (
                                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
                                            <div className="text-sm text-amber-800 dark:text-amber-200">
                                                <div className="font-medium mb-1">🤖 AI Status:</div>
                                                <div className="text-xs">{aiAnalysis.message}</div>
                                                <div className="text-xs mt-1 opacity-75">Will switch to manual mode if you proceed.</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Level Gate for AI */}
                            {isAI && !aiAvailable && (
                                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">🔒</div>
                                        <div className="font-medium text-purple-800 dark:text-purple-200 mb-1">
                                            AI Quests Locked
                                        </div>
                                        <div className="text-sm text-purple-600 dark:text-purple-300">
                                            Reach Level 3 to unlock AI-powered quest creation!
                                        </div>
                                        <div className="text-xs text-purple-500 dark:text-purple-400 mt-2">
                                            Complete more manual quests to level up.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentError && (
                                <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded">
                                    {currentError}
                                </div>
                            )}

                            <div className="space-y-3">
                                {isAI && aiAvailable ? (
                                    <button
                                        onClick={generateAIQuest}
                                        disabled={!userInput.trim() || isAnalyzing}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <span>🤖</span>
                                                Generate AI Quest
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={generateManualQuest}
                                        disabled={!userInput.trim()}
                                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                                    >
                                        ✨ Generate Quest
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Generated Quest Preview */}
                    {generatedQuest && (
                        <div className="space-y-4">
                            <div className="bg-purple-50 dark:bg-purple-900 border-2 border-purple-200 dark:border-purple-700 rounded-lg p-4">
                                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <span>🎯</span>
                                    {generatedQuest.title}
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
                                                {getStatEmojiLocal(generatedQuest.targetStat)}
                                                {generatedQuest.targetStat}
                                            </span>
                                        )}
                                        <span className="text-gray-500 dark:text-gray-400">{generatedQuest.difficulty}</span>
                                        {generatedQuest.generatedBy === 'ai' && (
                                            <span className="text-blue-600 dark:text-blue-400">🤖 AI Enhanced</span>
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