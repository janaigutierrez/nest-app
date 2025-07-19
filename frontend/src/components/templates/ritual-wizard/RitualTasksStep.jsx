import MicroTaskInput from '../MicroTaskInput'

const RitualTasksStep = ({
    ritualData,
    addMicroTask,
    updateMicroTask,
    removeMicroTask,
    fillWithSuggestions,
    errors
}) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Ritual Steps
                </h3>
                <button
                    type="button"
                    onClick={fillWithSuggestions}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                >
                    💡 Fill with suggestions
                </button>
            </div>

            {errors.microTasks && (
                <p className="text-red-500 text-sm">{errors.microTasks}</p>
            )}

            <div className="space-y-4">
                {ritualData.microTasks.map((task, index) => (
                    <MicroTaskInput
                        key={index}
                        task={task}
                        index={index}
                        onUpdate={updateMicroTask}
                        onRemove={removeMicroTask}
                        canRemove={ritualData.microTasks.length > 1}
                    />
                ))}
            </div>

            {ritualData.microTasks.length < 10 && (
                <button
                    type="button"
                    onClick={addMicroTask}
                    className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                >
                    <span className="text-xl">+</span>
                    <span>Add Step</span>
                </button>
            )}
        </div>
    )
}

export default RitualTasksStep