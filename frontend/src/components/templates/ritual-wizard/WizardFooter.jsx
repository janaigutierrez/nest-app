import React from 'react'

const WizardFooter = ({
    currentStep,
    setCurrentStep,
    onClose,
    onSubmit,
    isCreating,
    validateRitual,
    validTasks,
    totalTime,
    totalXP,
    ritualData,
    errors
}) => {
    return (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {currentStep > 1 && (
                        <button
                            onClick={() => setCurrentStep(currentStep - 1)}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                        >
                            ← Back
                        </button>
                    )}

                    {/* Progress info */}
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {validTasks.length} steps • {totalTime} min • {totalXP} XP
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                    >
                        Cancel
                    </button>

                    {currentStep < 3 ? (
                        <button
                            onClick={() => setCurrentStep(currentStep + 1)}
                            disabled={currentStep === 1 && !ritualData.title.trim()}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            onClick={onSubmit}
                            disabled={isCreating || !validateRitual()}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            {isCreating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <span>🎯</span>
                                    Create Ritual
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {errors.submit && (
                <p className="text-red-500 text-sm mt-2">{errors.submit}</p>
            )}
        </div>
    )
}

export default WizardFooter