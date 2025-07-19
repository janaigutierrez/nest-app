import { RITUAL_CATEGORIES } from '../../../constants/ritualCategories'

const RitualBasicInfo = ({ ritualData, setRitualData, errors }) => {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ritual Name *
                </label>
                <input
                    type="text"
                    value={ritualData.title}
                    onChange={(e) => setRitualData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Leg Day Ritual, Study Session, Morning Flow"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (optional)
                </label>
                <textarea
                    value={ritualData.description}
                    onChange={(e) => setRitualData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this ritual..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    maxLength={200}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Category *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {RITUAL_CATEGORIES.map(category => (
                        <button
                            key={category.value}
                            type="button"
                            onClick={() => setRitualData(prev => ({ ...prev, category: category.value }))}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${ritualData.category === category.value
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                                }`}
                        >
                            <div className="text-2xl mb-1">{category.emoji}</div>
                            <div className="font-medium text-gray-900 dark:text-white">{category.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{category.description}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default RitualBasicInfo