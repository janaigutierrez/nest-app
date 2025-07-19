import { RITUAL_CATEGORIES } from '../../../constants/ritualCategories'

const RitualPreview = ({ ritualData, validTasks, totalTime, totalXP, difficulty }) => {
    const selectedCategory = RITUAL_CATEGORIES.find(c => c.value === ritualData.category)

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Ritual Preview
            </h3>

            {/* Ritual Card Preview */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{selectedCategory?.emoji}</span>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">{ritualData.title}</h4>
                            <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                                🎯 Ritual
                            </span>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${difficulty.color}-100 text-${difficulty.color}-700 dark:bg-${difficulty.color}-900 dark:text-${difficulty.color}-300`}>
                        {difficulty.name}
                    </span>
                </div>

                {ritualData.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{ritualData.description}</p>
                )}

                {/* Steps preview */}
                <div className="space-y-2 mb-4">
                    {validTasks.map((task, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg">
                            <div className="w-6 h-6 bg-amber-400 dark:bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <span className="font-medium text-gray-900 dark:text-white">{task.title}</span>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {task.estimatedMinutes} min • {task.xpReward} XP
                                    {task.targetStat && (
                                        <span className="ml-2 px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                            {task.targetStat}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                        <span>⭐</span>
                        <span>{totalXP} XP total</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{totalTime} minutes</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span>📝</span>
                        <span>{validTasks.length} steps</span>
                    </span>
                </div>
            </div>

            {/* XP Breakdown */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">XP Breakdown</h4>
                <div className="space-y-2">
                    {validTasks.map((task, index) => (
                        <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{task.title}</span>
                            <span className="font-medium text-gray-900 dark:text-white">{task.xpReward} XP</span>
                        </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
                            <span>Total XP</span>
                            <span>{totalXP} XP</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RitualPreview