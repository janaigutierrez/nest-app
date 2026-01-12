import React from 'react'

const StatCard = ({ stat, statInfo }) => {
    const colorClasses = {
        red: 'text-red-600 dark:text-red-400',
        green: 'text-green-600 dark:text-green-400',
        blue: 'text-blue-600 dark:text-blue-400',
        purple: 'text-purple-600 dark:text-purple-400'
    }

    const bgClasses = {
        red: 'bg-red-500 dark:bg-red-400',
        green: 'bg-green-500 dark:bg-green-400',
        blue: 'bg-blue-500 dark:bg-blue-400',
        purple: 'bg-purple-500 dark:bg-purple-400'
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{stat.emoji}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{stat.name}</span>
                </div>
                <span className={`text-sm font-bold ${colorClasses[stat.color]}`}>
                    Level {statInfo.level}
                </span>
            </div>

            {!statInfo.isMaxLevel ? (
                <>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-500 ${bgClasses[stat.color]}`}
                            style={{ width: `${statInfo.progress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{statInfo.points} points</span>
                        <span>{statInfo.pointsToNext} to Level {statInfo.level + 1}</span>
                    </div>
                </>
            ) : (
                <div className="text-center">
                    <div className={`text-sm font-bold ${colorClasses[stat.color]} mb-1`}>
                        ⭐ MAX LEVEL ⭐
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {statInfo.points} points mastered
                    </div>
                </div>
            )}
        </div>
    )
}

export default StatCard