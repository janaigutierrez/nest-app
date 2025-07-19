import { useRitualWizard } from '../../../hooks/useRitualWizard'
import RitualBasicInfo from './RitualBasicInfo'
import RitualTasksStep from './RitualTasksStep'
import RitualPreview from './RitualPreview'
import WizardHeader from './WizardHeader'
import WizardFooter from './WizardFooter'

const RitualBuilder = ({ isOpen, onClose, onSave }) => {
    const {
        ritualData,
        setRitualData,
        currentStep,
        setCurrentStep,
        isCreating,
        errors,
        validTasks,
        totalTime,
        totalXP,
        difficulty,
        validateRitual,
        handleSubmit: handleWizardSubmit,
        addMicroTask,
        updateMicroTask,
        removeMicroTask,
        fillWithSuggestions
    } = useRitualWizard({ onSave, onClose })

    const handleSubmit = () => {
        handleWizardSubmit()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">

                <WizardHeader
                    currentStep={currentStep}
                    onClose={onClose}
                />

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {currentStep === 1 && (
                        <RitualBasicInfo
                            ritualData={ritualData}
                            setRitualData={setRitualData}
                            errors={errors}
                        />
                    )}

                    {currentStep === 2 && (
                        <RitualTasksStep
                            ritualData={ritualData}
                            addMicroTask={addMicroTask}
                            updateMicroTask={updateMicroTask}
                            removeMicroTask={removeMicroTask}
                            fillWithSuggestions={fillWithSuggestions}
                            errors={errors}
                        />
                    )}

                    {currentStep === 3 && (
                        <RitualPreview
                            ritualData={ritualData}
                            validTasks={validTasks}
                            totalTime={totalTime}
                            totalXP={totalXP}
                            difficulty={difficulty}
                        />
                    )}
                </div>

                <WizardFooter
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    onClose={onClose}
                    onSubmit={handleSubmit}
                    isCreating={isCreating}
                    validateRitual={validateRitual}
                    validTasks={validTasks}
                    totalTime={totalTime}
                    totalXP={totalXP}
                    ritualData={ritualData}
                    errors={errors}
                />
            </div>
        </div>
    )
}

export default RitualBuilder