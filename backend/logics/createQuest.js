import { errors, validator } from 'common'
import Quest from '../models/Quest.js'

const createQuest = async (userId, questData) => {
    validator.id(userId, 'userId')

    const {
        title,
        description = '',
        difficulty = 'STANDARD',
        isScheduled = false,
        scheduledDate = null,
        scheduledTime = null,
        duration = 30,
        mode = 'manual',
        useAI = false,
        tags = []
    } = questData

    validator.text(title, 'title', 3, 120)
    if (description) validator.text(description, 'description', 0, 500)
    if (!['QUICK', 'STANDARD', 'LONG', 'EPIC'].includes(difficulty)) {
        throw new errors.ValidationError('Invalid difficulty')
    }

    if (isScheduled) {
        if (!scheduledDate) {
            throw new errors.ValidationError('Scheduled date is required when quest is scheduled')
        }
        if (!scheduledTime) {
            throw new errors.ValidationError('Scheduled time is required when quest is scheduled')
        }
        if (duration < 5 || duration > 480) {
            throw new errors.ValidationError('Duration must be between 5 and 480 minutes')
        }
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(scheduledTime)) {
            throw new errors.ValidationError('Invalid time format. Use HH:MM')
        }
    }

    const baseXP = {
        QUICK: 25,
        STANDARD: 50,
        LONG: 100,
        EPIC: 200
    }[difficulty] || 50

    const questInfo = {
        title: title.trim(),
        description,
        difficulty,
        experienceReward: baseXP,
        generatedBy: 'user',
        tags: tags.length > 0 ? tags : ['manual']
    }
    console.log('🔧 INPUT DATA RECEIVED:', {
        title,
        isScheduled,
        scheduledDate,
        scheduledTime,
        duration,
        rawQuestData: questData
    })

    const questToSave = {
        ...questInfo,
        userId,
        isCompleted: false,
        completedAt: null,
        isDaily: false,
        isScheduled: Boolean(isScheduled),
        scheduledDate: isScheduled && scheduledDate ? new Date(scheduledDate) : null,
        scheduledTime: isScheduled && scheduledTime ? scheduledTime : null,
        duration: isScheduled ? duration : 30
    }

    console.log('🔧 Creating quest with FULL data:', {
        title: questToSave.title,
        isScheduled: questToSave.isScheduled,
        scheduledDate: questToSave.scheduledDate,
        scheduledTime: questToSave.scheduledTime,
        duration: questToSave.duration,
        allFields: Object.keys(questToSave)
    })

    const quest = new Quest(questToSave)

    console.log('🔧 Quest object BEFORE save:', {
        title: quest.title,
        isScheduled: quest.isScheduled,
        scheduledDate: quest.scheduledDate,
        scheduledTime: quest.scheduledTime,
        duration: quest.duration
    })

    console.log('🔧 Creating quest with data:', {
        title: quest.title,
        isScheduled: quest.isScheduled,
        scheduledDate: quest.scheduledDate,
        scheduledTime: quest.scheduledTime,
        duration: quest.duration
    })

    try {
        const savedQuest = await quest.save()

        console.log('🔧 Quest saved successfully DETAILED:', {
            id: savedQuest._id,
            title: savedQuest.title,
            isScheduled: savedQuest.isScheduled,
            scheduledDate: savedQuest.scheduledDate,
            scheduledTime: savedQuest.scheduledTime,
            duration: savedQuest.duration,
            allSavedFields: Object.keys(savedQuest.toObject())
        })

        return {
            id: savedQuest._id.toString(),
            title: savedQuest.title,
            description: savedQuest.description,
            difficulty: savedQuest.difficulty,
            experienceReward: savedQuest.experienceReward,
            targetStat: savedQuest.targetStat,
            generatedBy: savedQuest.generatedBy,
            tags: savedQuest.tags,
            epicElements: savedQuest.epicElements,
            aiMetadata: savedQuest.aiMetadata,
            userId: savedQuest.userId,
            isCompleted: savedQuest.isCompleted,
            completedAt: savedQuest.completedAt,
            isDaily: savedQuest.isDaily,
            isScheduled: savedQuest.isScheduled,
            scheduledDate: savedQuest.scheduledDate,
            scheduledTime: savedQuest.scheduledTime,
            duration: savedQuest.duration,
            createdAt: savedQuest.createdAt,
            updatedAt: savedQuest.updatedAt
        }
    } catch (error) {
        console.error('❌ Error saving quest to MongoDB:', error)
        throw new errors.ValidationError('Failed to save quest to database')
    }
}

export default createQuest