import { useState } from 'react'
import { RITUAL_CATEGORIES, TASK_SUGGESTIONS } from '../constants/ritualCategories'

export const useRitualWizard = ({ onSave, onClose }) => {
    const [ritualData, setRitualData] = useState({
        title: '',
        description: '',
        category: 'WORKOUT',
        microTasks: [
            {
                title: '',
                description: '',
                estimatedMinutes: 15,
                xpReward: 5,
                targetStat: null,
                emoji: '⏱️',
                order: 0
            }
        ]
    })

    const [currentStep, setCurrentStep] = useState(1)
    const [isCreating, setIsCreating] = useState(false)
    const [errors, setErrors] = useState({})

    // Calculations
    const validTasks = ritualData.microTasks.filter(task => task.title.trim())
    const totalTime = validTasks.reduce((sum, task) => sum + (task.estimatedMinutes || 0), 0)
    const totalXP = validTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0)

    // Calculate difficulty automatically
    const getDifficulty = () => {
        if (totalTime < 30) return { name: 'Quick', color: 'green', description: '< 30 minutes' }
        if (totalTime < 90) return { name: 'Standard', color: 'blue', description: '30-90 minutes' }
        if (totalTime < 180) return { name: 'Long', color: 'orange', description: '1.5-3 hours' }
        return { name: 'Epic', color: 'red', description: '3+ hours' }
    }

    const difficulty = getDifficulty()

    // Actions
    const addMicroTask = () => {
        if (ritualData.microTasks.length < 10) {
            setRitualData(prev => ({
                ...prev,
                microTasks: [...prev.microTasks, {
                    title: '',
                    description: '',
                    estimatedMinutes: 15,
                    xpReward: 5,
                    targetStat: null,
                    emoji: '⏱️',
                    order: prev.microTasks.length
                }]
            }))
        }
    }

    const updateMicroTask = (index, updatedTask) => {
        setRitualData(prev => ({
            ...prev,
            microTasks: prev.microTasks.map((task, i) =>
                i === index ? { ...task, ...updatedTask, order: i } : task
            )
        }))
    }

    const removeMicroTask = (index) => {
        if (ritualData.microTasks.length > 1) {
            setRitualData(prev => ({
                ...prev,
                microTasks: prev.microTasks.filter((_, i) => i !== index)
                    .map((task, i) => ({ ...task, order: i })) // Reorder
            }))
        }
    }

    const fillWithSuggestions = () => {
        const suggestions = TASK_SUGGESTIONS[ritualData.category] || []
        if (suggestions.length > 0) {
            const newMicroTasks = suggestions.map((suggestion, index) => ({
                title: suggestion,
                description: '',
                estimatedMinutes: 15,
                xpReward: 5,
                targetStat: null,
                emoji: '⏱️',
                order: index
            }))

            setRitualData(prev => ({
                ...prev,
                microTasks: newMicroTasks
            }))
        }
    }

    const validateRitual = () => {
        const newErrors = {}

        if (!ritualData.title.trim()) {
            newErrors.title = 'Ritual name is required'
        } else if (ritualData.title.trim().length < 3) {
            newErrors.title = 'Name must be at least 3 characters'
        }

        if (validTasks.length < 2) {
            newErrors.microTasks = 'Must have at least 2 valid steps'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateRitual()) return

        setIsCreating(true)
        try {
            const cleanedRitual = {
                ...ritualData,
                description: ritualData.description || `My ${RITUAL_CATEGORIES.find(c => c.value === ritualData.category)?.label} ritual`,
                microTasks: validTasks.map((task, index) => ({
                    ...task,
                    order: index,
                    title: task.title.trim(),
                    description: (task.description || '').trim()
                })),
                // Computed fields
                totalTime,
                totalXP,
                difficulty: difficulty.name,
                isRitual: true
            }

            await onSave?.(cleanedRitual)

            // Reset form
            setRitualData({
                title: '',
                description: '',
                category: 'WORKOUT',
                microTasks: [{
                    title: '',
                    description: '',
                    estimatedMinutes: 15,
                    xpReward: 5,
                    targetStat: null,
                    emoji: '⏱️',
                    order: 0
                }]
            })
            setCurrentStep(1)
            setErrors({})
            onClose?.()

        } catch (error) {
            console.error('Error creating ritual:', error)
            setErrors({ submit: 'Failed to create ritual. Please try again.' })
        } finally {
            setIsCreating(false)
        }
    }

    return {
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
        handleSubmit,
        addMicroTask,
        updateMicroTask,
        removeMicroTask,
        fillWithSuggestions
    }
}