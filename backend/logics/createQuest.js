import { errors, validator, rules } from 'common'
import Quest from '../models/Quest.js'
import { AIService } from '../utils/aiService/index.js'

/**
 * Create a new quest for a user (AI, Manual, or Ritual)
 * @param {string} userId - User ID from JWT
 * @param {Object} questData - Quest creation data
 * @returns {Object} Created quest
 */

export const createQuest = async (userId, questData) => {
    validator.id(userId, 'userId')

    const {
        title,
        useAI,
        mode,
        difficulty = 'STANDARD',
        isScheduled = false,
        scheduledDate = null,
        scheduledTime = null,
        duration = 30,
        steps
    } = questData

    validator.text(title, 100, 3, 'title')

    // Determine the creation mode (backward compatibility with useAI)
    let creationMode = mode
    if (!mode && useAI !== undefined) {
        creationMode = useAI ? 'ai' : 'manual'
    }
    if (!creationMode) {
        creationMode = 'manual'
    }

    const validModes = ['manual', 'ai', 'ritual']
    if (!validModes.includes(creationMode)) {
        throw new errors.ValidationError(`Invalid mode: ${creationMode}. Must be one of: ${validModes.join(', ')}`)
    }

    // Validate scheduling fields
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

    // Common calculations
    const detectedStat = rules.STAT_RULES.detectStatFromDescription(title)
    const baseXP = rules.QUEST_REWARDS.BASE_XP[difficulty] || 50
    const bonusXP = detectedStat ? 10 : 0

    let questInfo

    switch (creationMode) {
        case 'ai':
            try {
                questInfo = await AIService.generateQuest(title, null, difficulty)
            } catch (error) {
                console.error('AI generation failed, using fallback:', error.message)
                questInfo = {
                    title: title.trim(),
                    description: 'Quest created with epic fallback system',
                    difficulty,
                    experienceReward: baseXP + bonusXP,
                    targetStat: detectedStat,
                    generatedBy: 'epic_fallback',
                    tags: ['fallback'],
                    epicElements: null,
                    aiMetadata: { prompt: title.trim() }
                }
            }
            break

        case 'ritual':
            if (!steps || !Array.isArray(steps) || steps.length === 0) {
                throw new errors.ValidationError('Ritual mode requires steps array')
            }

            const totalXP = steps.reduce((sum, step) => sum + (step.xpReward || 10), 0)

            questInfo = {
                title: title.trim(),
                description: `Ritual with ${steps.length} steps`,
                difficulty,
                experienceReward: Math.min(totalXP, rules.QUEST_REWARDS.BASE_XP.EPIC || 200),
                targetStat: detectedStat,
                generatedBy: 'ritual',
                tags: ['ritual', 'template'],
                epicElements: { steps },
                aiMetadata: null
            }
            break

        case 'manual':
        default:
            questInfo = {
                title: title.trim(),
                description: '',
                difficulty,
                experienceReward: baseXP + bonusXP,
                targetStat: detectedStat,
                generatedBy: 'user',
                tags: ['manual'],
                epicElements: null,
                aiMetadata: null
            }
            break
    }

    const quest = new Quest({
        ...questInfo,
        userId,
        isCompleted: false,
        completedAt: null,
        isDaily: false,
        isScheduled,
        scheduledDate: isScheduled ? new Date(scheduledDate) : null,
        scheduledTime: isScheduled ? scheduledTime : null,
        duration: isScheduled ? duration : 30
    })

    try {
        const savedQuest = await quest.save()
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
        console.error('Error saving quest to MongoDB:', error.message)
        throw new errors.ValidationError('Failed to save quest to database')
    }
}

export default createQuest
