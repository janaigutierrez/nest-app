import React, { useState } from 'react'

const MicroTaskInput = ({ task, index, onUpdate, onRemove, canRemove }) => {
    const [showCustomization, setShowCustomization] = useState(false)
    const [isTimeManuallySet, setIsTimeManuallySet] = useState(false)

    // Auto-estimación mejorada (tu código actual)
    const estimateTask = (title) => {
        const timePatterns = {
            // Quick tasks (1-5 min)
            'water|drink|agua|beber': { time: 2, emoji: '💧', xp: 0 },
            'vitamins|pills|pastillas': { time: 1, emoji: '💊', xp: 0 },
            'teeth|brush|dientes': { time: 3, emoji: '🦷', xp: 0 },
            'bed|cama|make': { time: 3, emoji: '🛏️', xp: 0 },

            // Achievement tasks (5-15 min)
            'meditation|meditar|breathe': { time: 10, emoji: '🧘', xp: 8, stat: 'WISDOM' },
            'stretch|estirar|yoga': { time: 10, emoji: '🤸', xp: 5, stat: 'DEXTERITY' },
            'journal|diario|write': { time: 12, emoji: '📝', xp: 8, stat: 'WISDOM' },
            'planning|planificar|plan': { time: 15, emoji: '📋', xp: 10, stat: 'WISDOM' },

            // Workout tasks (15-30 min)
            'squats|sentadillas': { time: 15, emoji: '🦵', xp: 12, stat: 'STRENGTH' },
            'deadlifts|peso muerto': { time: 15, emoji: '🏋️', xp: 15, stat: 'STRENGTH' },
            'bench press|press banca': { time: 20, emoji: '💪', xp: 15, stat: 'STRENGTH' },
            'pushups|flexiones': { time: 10, emoji: '💪', xp: 8, stat: 'STRENGTH' },
            'cardio|running|correr': { time: 25, emoji: '🏃', xp: 15, stat: 'STRENGTH' },

            // Study tasks (20-45 min)
            'study|estudiar|learn': { time: 30, emoji: '📚', xp: 20, stat: 'WISDOM' },
            'read|leer|book': { time: 25, emoji: '📖', xp: 15, stat: 'WISDOM' },
            'practice|practicar': { time: 30, emoji: '🎯', xp: 18, stat: 'DEXTERITY' },

            // Creative tasks (20-60 min)
            'draw|dibujar|art': { time: 35, emoji: '🎨', xp: 20, stat: 'DEXTERITY' },
            'music|música|instrument': { time: 30, emoji: '🎵', xp: 18, stat: 'DEXTERITY' },
            'cook|cocinar|recipe': { time: 25, emoji: '👨‍🍳', xp: 12, stat: 'DEXTERITY' }
        }

        const titleLower = title.toLowerCase()

        for (const [pattern, data] of Object.entries(timePatterns)) {
            if (new RegExp(pattern).test(titleLower)) {
                return data
            }
        }

        return { time: 15, emoji: '⏱️', xp: 5, stat: null }
    }

    const handleTitleChange = (newTitle) => {
        const updates = { title: newTitle }

        // Solo auto-estimate si no se ha configurado manualmente
        if (!isTimeManuallySet && newTitle.trim()) {
            const estimated = estimateTask(newTitle)
            updates.estimatedMinutes = estimated.time
            updates.emoji = estimated.emoji
            updates.xpReward = estimated.xp

            // Auto-detect stat solo si no está manualmente configurado
            if (!task.targetStat && estimated.stat) {
                updates.targetStat = estimated.stat
            }
        }

        onUpdate(index, updates)
    }

    const handleTimeChange = (newTime) => {
        setIsTimeManuallySet(true)
        const timeValue = parseInt(newTime) || 15

        // Recalcular XP basado en tiempo (aproximado)
        const estimatedXP = Math.max(0, Math.floor(timeValue / 3)) // ~3min = 1XP

        onUpdate(index, {
            estimatedMinutes: timeValue,
            xpReward: estimatedXP
        })
    }

    const handleXPChange = (newXP) => {
        onUpdate(index, { xpReward: parseInt(newXP) || 0 })
    }

    const resetToAuto = () => {
        setIsTimeManuallySet(false)
        if (task.title) {
            const estimated = estimateTask(task.title)
            onUpdate(index, {
                estimatedMinutes: estimated.time,
                emoji: estimated.emoji,
                xpReward: estimated.xp,
                targetStat: estimated.stat
            })
        }
    }

    const statOptions = [
        { value: '', label: 'Auto', emoji: '🤖', color: 'gray' },
        { value: 'STRENGTH', label: 'Strength', emoji: '💪', color: 'red' },
        { value: 'DEXTERITY', label: 'Dexterity', emoji: '🎯', color: 'green' },
        { value: 'WISDOM', label: 'Wisdom', emoji: '🧠', color: 'blue' },
        { value: 'CHARISMA', label: 'Charisma', emoji: '✨', color: 'purple' }
    ]

    const getSelectedStat = () => {
        return statOptions.find(opt => opt.value === (task.targetStat || '')) || statOptions[0]
    }

    return (
        <div className={`bg-white dark:bg-gray-800 border-2 rounded-xl p-4 transition-all ${showCustomization
                ? 'border-purple-300 dark:border-purple-600 shadow-lg'
                : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
            }`}>
            <div className="flex items-center gap-3">

                {/* Número de step */}
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-amber-500 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                    {index + 1}
                </div>

                {/* Input principal */}
                <div className="flex-1">
                    <input
                        type="text"
                        value={task.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder={`Step ${index + 1} (e.g., "Squats 3x8", "10min meditation")`}
                        className="w-full p-3 text-lg border-0 bg-transparent dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                    />
                </div>

                {/* Quick stats display */}
                {task.title && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowCustomization(!showCustomization)}
                            className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                            title="Customize step"
                        >
                            <span className="text-lg">{task.emoji || '⏱️'}</span>
                            <span className="font-medium">{task.estimatedMinutes}min</span>
                            <span className="text-purple-600 dark:text-purple-400 font-bold">{task.xpReward}XP</span>
                            <span className="text-xs">{showCustomization ? '▲' : '▼'}</span>
                        </button>
                    </div>
                )}

                {/* Remove button */}
                {canRemove && (
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="flex-shrink-0 w-8 h-8 text-red-500 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-full flex items-center justify-center transition-colors"
                        title="Remove step"
                    >
                        ×
                    </button>
                )}
            </div>

            {/* Customización expandible */}
            {showCustomization && task.title && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-4">

                    {/* Time & XP */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                ⏱️ Minutes
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max="240"
                                    value={task.estimatedMinutes}
                                    onChange={(e) => handleTimeChange(e.target.value)}
                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-center font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                ⭐ XP Reward
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="50"
                                value={task.xpReward}
                                onChange={(e) => handleXPChange(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-center font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                🎯 Stat Focus
                            </label>
                            <select
                                value={task.targetStat || ''}
                                onChange={(e) => onUpdate(index, { targetStat: e.target.value || null })}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                {statOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.emoji} {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Quick time buttons */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            🚀 Quick Times
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {[5, 10, 15, 20, 30, 45, 60].map(time => (
                                <button
                                    key={time}
                                    type="button"
                                    onClick={() => handleTimeChange(time)}
                                    className={`px-3 py-1 text-sm rounded-lg border transition-colors ${task.estimatedMinutes === time
                                            ? 'bg-purple-500 text-white border-purple-500'
                                            : 'bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 hover:bg-purple-100 dark:hover:bg-purple-900'
                                        }`}
                                >
                                    {time}min
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            📝 Description (optional)
                        </label>
                        <textarea
                            value={task.description || ''}
                            onChange={(e) => onUpdate(index, { description: e.target.value })}
                            placeholder="Additional details..."
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            rows={2}
                            maxLength={200}
                        />
                    </div>

                    {/* Reset button */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={resetToAuto}
                            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                        >
                            🤖 Reset to Auto
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MicroTaskInput