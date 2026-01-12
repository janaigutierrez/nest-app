import React from 'react'

const WizardHeader = ({ currentStep, onClose }) => {
    return (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Create New Ritual
                </h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
                >
                    ×
                </button>
            </div>

            {/* Steps indicator */}
            <div className="flex items-center mt-4 space-x-4">
                {[1, 2, 3].map(step => (
                    <div key={step} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step <= currentStep
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
                            }`}>
                            {step}
                        </div>
                        {step < 3 && (
                            <div className={`w-8 h-0.5 mx-2 ${step < currentStep ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-600'
                                }`} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default WizardHeader