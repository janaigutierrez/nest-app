// backend/utils/questOverlapDetection.js
import Quest from '../models/Quest.js'

/**
 * Detects quest scheduling conflicts for a user
 * @param {string} userId - User ID
 * @param {Date} targetDate - Date to check conflicts for
 * @param {string} targetTime - Time in HH:MM format
 * @param {number} targetDuration - Duration in minutes
 * @param {string} excludeQuestId - Quest ID to exclude from conflict check (for updates)
 * @returns {Object} Conflict detection result
 */
const detectQuestOverlap = async (userId, targetDate, targetTime, targetDuration, excludeQuestId = null) => {
    try {
        // Convert target time to minutes for easy comparison
        const [targetHours, targetMinutes] = targetTime.split(':').map(Number)
        const targetStartMinutes = targetHours * 60 + targetMinutes
        const targetEndMinutes = targetStartMinutes + targetDuration

        // Find all scheduled quests for the target date
        const dateStart = new Date(targetDate)
        dateStart.setHours(0, 0, 0, 0)

        const dateEnd = new Date(targetDate)
        dateEnd.setHours(23, 59, 59, 999)

        const query = {
            userId,
            isScheduled: true,
            isCompleted: false,
            scheduledDate: {
                $gte: dateStart,
                $lte: dateEnd
            }
        }

        // Exclude current quest if updating
        if (excludeQuestId) {
            query._id = { $ne: excludeQuestId }
        }

        const existingQuests = await Quest.find(query)

        const conflicts = []
        const stackedQuests = []

        for (const quest of existingQuests) {
            if (!quest.scheduledTime || !quest.duration) continue

            const [questHours, questMinutes] = quest.scheduledTime.split(':').map(Number)
            const questStartMinutes = questHours * 60 + questMinutes
            const questEndMinutes = questStartMinutes + quest.duration

            // Check for overlap
            const hasOverlap = !(targetEndMinutes <= questStartMinutes || targetStartMinutes >= questEndMinutes)

            if (hasOverlap) {
                const overlapType = getOverlapType(
                    targetStartMinutes, targetEndMinutes,
                    questStartMinutes, questEndMinutes
                )

                conflicts.push({
                    quest: {
                        id: quest._id.toString(),
                        title: quest.title,
                        scheduledTime: quest.scheduledTime,
                        duration: quest.duration,
                        difficulty: quest.difficulty
                    },
                    overlapType,
                    overlapMinutes: calculateOverlapMinutes(
                        targetStartMinutes, targetEndMinutes,
                        questStartMinutes, questEndMinutes
                    )
                })
            }

            // Check for exact time match (stacking)
            if (quest.scheduledTime === targetTime) {
                stackedQuests.push({
                    id: quest._id.toString(),
                    title: quest.title,
                    duration: quest.duration,
                    difficulty: quest.difficulty
                })
            }
        }

        // Suggest alternative time slots if conflicts exist
        const suggestions = conflicts.length > 0 ?
            await suggestAlternativeSlots(userId, targetDate, targetDuration, existingQuests) :
            []

        return {
            hasConflicts: conflicts.length > 0,
            hasStackedQuests: stackedQuests.length > 0,
            conflicts,
            stackedQuests,
            suggestions,
            totalConflicts: conflicts.length,
            worstOverlap: conflicts.length > 0 ?
                Math.max(...conflicts.map(c => c.overlapMinutes)) : 0
        }

    } catch (error) {
        console.error('❌ Error detecting quest overlap:', error)
        throw error
    }
}

/**
 * Determines the type of overlap between two time ranges
 */
const getOverlapType = (start1, end1, start2, end2) => {
    if (start1 === start2 && end1 === end2) return 'EXACT_MATCH'
    if (start1 === start2) return 'SAME_START'
    if (end1 === end2) return 'SAME_END'
    if (start1 <= start2 && end1 >= end2) return 'CONTAINS'
    if (start2 <= start1 && end2 >= end1) return 'CONTAINED'
    if (start1 < start2 && end1 > start2) return 'OVERLAPS_END'
    if (start2 < start1 && end2 > start1) return 'OVERLAPS_START'
    return 'PARTIAL'
}

/**
 * Calculates the number of overlapping minutes
 */
const calculateOverlapMinutes = (start1, end1, start2, end2) => {
    const overlapStart = Math.max(start1, start2)
    const overlapEnd = Math.min(end1, end2)
    return Math.max(0, overlapEnd - overlapStart)
}

/**
 * Suggests alternative time slots when conflicts exist
 */
const suggestAlternativeSlots = async (userId, targetDate, targetDuration, existingQuests) => {
    const suggestions = []
    const occupiedSlots = existingQuests
        .filter(q => q.scheduledTime && q.duration)
        .map(q => {
            const [hours, minutes] = q.scheduledTime.split(':').map(Number)
            const start = hours * 60 + minutes
            return {
                start,
                end: start + q.duration
            }
        })
        .sort((a, b) => a.start - b.start)

    // Generate suggestions throughout the day (6 AM to 11 PM)
    const dayStart = 6 * 60 // 6:00 AM
    const dayEnd = 23 * 60 // 11:00 PM

    let currentSlot = dayStart
    let suggestionCount = 0

    while (currentSlot + targetDuration <= dayEnd && suggestionCount < 5) {
        const slotEnd = currentSlot + targetDuration

        // Check if this slot conflicts with any existing quest
        const hasConflict = occupiedSlots.some(slot =>
            !(slotEnd <= slot.start || currentSlot >= slot.end)
        )

        if (!hasConflict) {
            const hours = Math.floor(currentSlot / 60)
            const minutes = currentSlot % 60
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

            suggestions.push({
                time: timeString,
                slot: currentSlot,
                available: true,
                reason: 'No conflicts detected'
            })
            suggestionCount++
        }

        // Move to next 30-minute slot
        currentSlot += 30
    }

    return suggestions
}

/**
 * Get all quests for a specific time slot (for stacking display)
 */
const getQuestsAtTimeSlot = async (userId, targetDate, targetTime) => {
    try {
        const dateStart = new Date(targetDate)
        dateStart.setHours(0, 0, 0, 0)

        const dateEnd = new Date(targetDate)
        dateEnd.setHours(23, 59, 59, 999)

        const quests = await Quest.find({
            userId,
            isScheduled: true,
            isCompleted: false,
            scheduledDate: {
                $gte: dateStart,
                $lte: dateEnd
            },
            scheduledTime: targetTime
        }).sort({ createdAt: 1 }) // Oldest first for consistent stacking order

        return quests.map(quest => ({
            id: quest._id.toString(),
            title: quest.title,
            description: quest.description,
            duration: quest.duration,
            difficulty: quest.difficulty,
            targetStat: quest.targetStat,
            experienceReward: quest.experienceReward
        }))

    } catch (error) {
        console.error('❌ Error getting quests at time slot:', error)
        throw error
    }
}

export {
    detectQuestOverlap,
    getQuestsAtTimeSlot,
    getOverlapType,
    calculateOverlapMinutes
}