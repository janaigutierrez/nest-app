import { validator } from 'common'
import Quest from '../models/Quest.js'

const getQuestsByDate = async (userId, dateStr) => {
    validator.id(userId, 'userId')

    if (!dateStr) {
        throw new Error('Date is required')
    }

    try {
        const targetDate = new Date(dateStr)

        if (isNaN(targetDate.getTime())) {
            throw new Error('Invalid date format')
        }

        console.log('🔧 Backend getQuestsByDate called with:')
        console.log('  - userId:', userId)
        console.log('  - dateStr:', dateStr)
        console.log('  - targetDate parsed:', targetDate)

        const startOfDay = new Date(targetDate)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(targetDate)
        endOfDay.setHours(23, 59, 59, 999)

        const query = {
            userId,
            isScheduled: true,
            scheduledDate: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }

        const quests = await Quest.find(query).sort({ scheduledTime: 1 })

        console.log('🔧 Quests found for date:', quests.length)
        console.log('🔧 Quest details:', quests.map(q => ({
            id: q._id,
            title: q.title,
            isScheduled: q.isScheduled,
            scheduledDate: q.scheduledDate,
            scheduledTime: q.scheduledTime
        })))

        return quests.map(quest => ({
            id: quest._id.toString(),
            title: quest.title,
            description: quest.description,
            difficulty: quest.difficulty,
            experienceReward: quest.experienceReward,
            targetStat: quest.targetStat,
            isCompleted: quest.isCompleted,
            scheduledTime: quest.scheduledTime,
            duration: quest.duration,
            generatedBy: quest.generatedBy,
            isScheduled: quest.isScheduled,
            scheduledDate: quest.scheduledDate,
            tags: quest.tags,
            createdAt: quest.createdAt,
            updatedAt: quest.updatedAt
        }))

    } catch (error) {
        console.error('❌ Error in getQuestsByDate logic:', error)
        throw error
    }
}

export default getQuestsByDate