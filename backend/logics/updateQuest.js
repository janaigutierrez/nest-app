import { errors, validator } from 'common'
import Quest from '../models/Quest.js'

const updateQuest = async (userId, questId, updateData) => {
    validator.id(userId, 'userId')
    validator.id(questId, 'questId')

    const {
        title,
        description,
        difficulty,
        scheduledTime,
        scheduledDate,
        duration,
        isScheduled
    } = updateData

    if (title !== undefined) validator.text(title, 120, 3, 'title')
    if (description !== undefined) validator.text(description, 500, 0, 'description')
    if (difficulty !== undefined && !['QUICK', 'STANDARD', 'LONG', 'EPIC'].includes(difficulty)) {
        throw new errors.ValidationError('Invalid difficulty')
    }
    if (scheduledTime !== undefined && scheduledTime !== null && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(scheduledTime)) {
        throw new errors.ValidationError('Invalid time format. Use HH:MM')
    }
    if (duration !== undefined && (duration < 5 || duration > 480)) {
        throw new errors.ValidationError('Duration must be between 5 and 480 minutes')
    }

    const existingQuest = await Quest.findOne({ _id: questId, userId })

    if (!existingQuest) {
        throw new errors.ExistenceError('Quest not found')
    }

    if (existingQuest.isCompleted) {
        throw new errors.ValidationError('Cannot update completed quest')
    }

    const updateFields = {}
    if (title !== undefined) updateFields.title = title.trim()
    if (description !== undefined) updateFields.description = description.trim()
    if (difficulty !== undefined) updateFields.difficulty = difficulty
    if (scheduledTime !== undefined) {
        if (scheduledTime === null) {
            updateFields.scheduledTime = null
        } else {
            const [hours, minutes] = scheduledTime.split(':')
            updateFields.scheduledTime = `${hours.padStart(2, '0')}:${minutes}`
        }
    }
    if (scheduledDate !== undefined) {
        if (scheduledDate === null) {
            updateFields.scheduledDate = null
        } else {
            const date = new Date(scheduledDate)
            if (isNaN(date.getTime())) {
                throw new errors.ValidationError('Invalid date format')
            }
            updateFields.scheduledDate = date
        }
    }
    if (duration !== undefined) updateFields.duration = duration
    if (isScheduled !== undefined) updateFields.isScheduled = Boolean(isScheduled)

    const updatedQuest = await Quest.findByIdAndUpdate(
        questId,
        updateFields,
        { new: true, runValidators: true }
    )

    return {
        id: updatedQuest._id.toString(),
        title: updatedQuest.title,
        description: updatedQuest.description,
        difficulty: updatedQuest.difficulty,
        experienceReward: updatedQuest.experienceReward,
        targetStat: updatedQuest.targetStat,
        generatedBy: updatedQuest.generatedBy,
        tags: updatedQuest.tags,
        epicElements: updatedQuest.epicElements,
        aiMetadata: updatedQuest.aiMetadata,
        userId: updatedQuest.userId,
        isCompleted: updatedQuest.isCompleted,
        completedAt: updatedQuest.completedAt,
        isDaily: updatedQuest.isDaily,
        isScheduled: updatedQuest.isScheduled,
        scheduledDate: updatedQuest.scheduledDate,
        scheduledTime: updatedQuest.scheduledTime,
        duration: updatedQuest.duration,
        createdAt: updatedQuest.createdAt,
        updatedAt: updatedQuest.updatedAt
    }
}

export default updateQuest
