import React from 'react'

const LevelProgress = ({ userProgression }) => {
    const { currentLevel, currentXP, progressPercentage, xpToNext, isMaxLevel } = userProgression

    return (
        <div className="max-w-md mx-auto mb-6">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">Level {currentLevel}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                    {isMaxLevel ? 'MAX LEVEL' : `Level ${currentLevel + 1}`}
                </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                    className="bg-purple-500 dark:bg-purple-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
            </div>

            <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">{currentXP} XP</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {isMaxLevel ? 'Max Level Reached!' : `${xpToNext} XP to go`}
                </span>
            </div>
        </div>
    )
}

export default LevelProgress