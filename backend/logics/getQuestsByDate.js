import { errors, validator } from 'common'
import Quest from '../models/Quest.js'

const getQuestsByDate = async (userId, dateStr) => {
    validator.id(userId, 'userId')

    if (!dateStr) {
        throw new errors.ValidationError('Date is required')
    }

    const targetDate = new Date(dateStr)

    if (isNaN(targetDate.getTime())) {
        throw new errors.ValidationError('Invalid date format')
    }

    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    const quests = await Quest.find({
        userId,
        isScheduled: true,
        scheduledDate: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    }).sort({ scheduledTime: 1 })

    return quests.map(quest => ({
        id: quest._id.toString(),
        title: quest.title,
        description: quest.description,
        difficulty: quest.difficulty,
        experienceReward: quest.experienceReward,
        targetStat: quest.targetStat,
        isCompleted: quest.isCompleted,
        isScheduled: quest.isScheduled,
        scheduledDate: quest.scheduledDate,
        scheduledTime: quest.scheduledTime,
        duration: quest.duration,
        generatedBy: quest.generatedBy,
        tags: quest.tags,
        createdAt: quest.createdAt,
        updatedAt: quest.updatedAt
    }))
}

export default getQuestsByDate
