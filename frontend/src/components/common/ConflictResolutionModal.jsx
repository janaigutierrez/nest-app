import { useState } from 'react'
import { X, Clock, AlertTriangle, Lightbulb, Calendar } from 'lucide-react'

const ConflictResolutionModal = ({
    isOpen,
    onClose,
    conflictData,
    questTitle,
    targetTime,
    targetDuration,
    onResolve
}) => {
    const [selectedResolution, setSelectedResolution] = useState(null)
    const [selectedSuggestion, setSelectedSuggestion] = useState(null)

    if (!isOpen || !conflictData) return null

    const { hasConflicts, conflicts, suggestions, worstOverlap } = conflictData

    const handleResolve = () => {
        if (selectedResolution === 'proceed') {
            onResolve({ action: 'proceed', data: null })
        } else if (selectedResolution === 'suggest' && selectedSuggestion) {
            onResolve({ action: 'reschedule', data: selectedSuggestion })
        }
        onClose()
    }

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        if (hours === 0) return `${mins}min`
        if (mins === 0) return `${hours}h`
        return `${hours}h ${mins}min`
    }

    const getConflictSeverity = (overlapMinutes) => {
        if (overlapMinutes >= 30) return 'severe'
        if (overlapMinutes >= 15) return 'moderate'
        return 'minor'
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Scheduling Conflict Detected
                            </h2>
                            <p className="text-sm text-gray-600">
                                "{questTitle}" conflicts with existing quests
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Conflict Details */}
                <div className="p-6 space-y-6">
                    {/* Current Schedule Attempt */}
                    <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Attempting to Schedule
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-blue-800">
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {targetTime}
                            </span>
                            <span>Duration: {formatDuration(targetDuration)}</span>
                        </div>
                    </div>

                    {/* Conflict List */}
                    <div className="space-y-3">
                        <h3 className="font-medium text-gray-900 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            Conflicting Quests ({conflicts.length})
                        </h3>

                        {conflicts.map((conflict, index) => (
                            <div
                                key={index}
                                className={`border rounded-lg p-3 ${getConflictSeverity(conflict.overlapMinutes) === 'severe'
                                        ? 'border-red-200 bg-red-50'
                                        : getConflictSeverity(conflict.overlapMinutes) === 'moderate'
                                            ? 'border-orange-200 bg-orange-50'
                                            : 'border-yellow-200 bg-yellow-50'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            {conflict.quest.title}
                                        </h4>
                                        <div className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                                            <span>{conflict.quest.scheduledTime}</span>
                                            <span>{formatDuration(conflict.quest.duration)}</span>
                                            <span className="capitalize">{conflict.quest.difficulty.toLowerCase()}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-medium ${getConflictSeverity(conflict.overlapMinutes) === 'severe'
                                                ? 'text-red-700'
                                                : getConflictSeverity(conflict.overlapMinutes) === 'moderate'
                                                    ? 'text-orange-700'
                                                    : 'text-yellow-700'
                                            }`}>
                                            {formatDuration(conflict.overlapMinutes)} overlap
                                        </div>
                                        <div className="text-xs text-gray-500 capitalize">
                                            {conflict.overlapType.replace('_', ' ').toLowerCase()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Resolution Options */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">Choose Resolution:</h3>

                        {/* Option 1: Proceed with conflict */}
                        <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                                type="radio"
                                name="resolution"
                                value="proceed"
                                checked={selectedResolution === 'proceed'}
                                onChange={(e) => setSelectedResolution(e.target.value)}
                                className="mt-1"
                            />
                            <div>
                                <div className="font-medium text-gray-900">
                                    Proceed with Overlap
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    Schedule anyway. Quests will be stacked and shown with a "+{conflicts.length}" indicator.
                                </div>
                                {worstOverlap >= 30 && (
                                    <div className="text-xs text-orange-600 mt-1 font-medium">
                                        ⚠️ Significant overlap ({formatDuration(worstOverlap)}) - Consider rescheduling
                                    </div>
                                )}
                            </div>
                        </label>

                        {/* Option 2: Use suggested time */}
                        {suggestions.length > 0 && (
                            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="resolution"
                                    value="suggest"
                                    checked={selectedResolution === 'suggest'}
                                    onChange={(e) => setSelectedResolution(e.target.value)}
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4 text-green-500" />
                                        Use Suggested Time
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1 mb-3">
                                        Choose from available time slots with no conflicts:
                                    </div>

                                    <div className="space-y-2 ml-6">
                                        {suggestions.slice(0, 3).map((suggestion, index) => (
                                            <label
                                                key={index}
                                                className="flex items-center gap-3 p-2 bg-green-50 rounded border cursor-pointer hover:bg-green-100 transition-colors"
                                            >
                                                <input
                                                    type="radio"
                                                    name="suggestion"
                                                    value={suggestion.time}
                                                    checked={selectedSuggestion === suggestion.time}
                                                    onChange={(e) => setSelectedSuggestion(e.target.value)}
                                                    disabled={selectedResolution !== 'suggest'}
                                                />
                                                <div className="flex items-center gap-4">
                                                    <span className="font-medium text-green-800">
                                                        {suggestion.time}
                                                    </span>
                                                    <span className="text-xs text-green-600">
                                                        {suggestion.reason}
                                                    </span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </label>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleResolve}
                        disabled={!selectedResolution || (selectedResolution === 'suggest' && !selectedSuggestion)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {selectedResolution === 'proceed' ? 'Schedule Anyway' :
                            selectedResolution === 'suggest' ? 'Reschedule' :
                                'Choose Option'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConflictResolutionModal