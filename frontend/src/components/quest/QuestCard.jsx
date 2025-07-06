import React from 'react'
import { getStatEmoji, getDifficultyColor, getTimeDisplay } from '../../utils/questHelpers'

const QuestCard = React.memo(({ quest, onComplete, onAbandon }) => {
    return (
        <div
            className={`p-6 rounded-xl border transition-all hover:shadow-md ${quest.isCompleted
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
        >
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <h3 className={`text-lg font-semibold ${quest.isCompleted
                        ? 'line-through text-gray-500 dark:text-gray-400'
                        : 'text-gray-900 dark:text-gray-100'
                        }`}>
                        {quest.isCompleted ? '✅' : '🎯'} {quest.title}
                    </h3>

                    <div className="flex gap-2">
                        {!quest.isCompleted ? (
                            <>
                                <button
                                    onClick={() => onComplete(quest._id)}
                                    className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                    title="Complete Quest"
                                >
                                    ✅
                                </button>
                                <button
                                    onClick={() => onAbandon(quest)}
                                    className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                    title="Abandon Quest"
                                >
                                    ❌
                                </button>
                            </>
                        ) : (
                            <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                                Completed
                            </span>
                        )}
                    </div>
                </div>

                {(quest.generatedBy === 'ai' || quest.generatedBy === 'epic_fallback') && quest.aiMetadata?.prompt && (
                    <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-purple-600 dark:text-purple-400 font-medium">Original prompt:</span>
                            <span className="text-purple-700 dark:text-purple-300 italic">"{quest.aiMetadata.prompt}"</span>
                            {quest.generatedBy === 'epic_fallback' && (
                                <span className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 px-2 py-1 rounded text-xs">
                                    fallback
                                </span>
                            )}
                        </div>
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

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {quest.targetStat && (
                            <span className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                                {getStatEmoji(quest.targetStat)}
                                <span className="font-medium">{quest.targetStat}</span>
                            </span>
                        )}

                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(quest.difficulty)}`}>
                            {quest.difficulty}
                        </span>

                        {quest.generatedBy === 'ai' && (
                            <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">
                                🤖 AI
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="font-bold text-yellow-600 dark:text-yellow-400">
                            +{quest.experienceReward} XP
                        </span>
                    </div>
                </div>

                {quest.createdAt && (
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                        Created: {getTimeDisplay(quest.createdAt)}
                    </div>
                )}
            </div>
        </div>
    )
})

QuestCard.displayName = 'QuestCard'

export default QuestCard