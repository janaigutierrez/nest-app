import { errors, validator, rules } from 'common'
import Quest from '../models/Quest.js'
import { AIService } from '../utils/aiService/index.js'

/**
 * Create a new quest for a user (AI or Manual)
 * @param {string} userId - User ID from JWT
 * @param {Object} questData - Quest creation data
 * @returns {Object} Created quest
 */

export const createQuest = async (userId, questData) => {
    validator.id(userId, 'userId')

    const { title, useAI, difficulty = 'STANDARD' } = questData

    validator.text(title, 100, 3, 'title')

    let questInfo

    if (useAI) {
        try {
            questInfo = await AIService.generateQuest(title, null, difficulty)
        } catch (error) {
            console.error('AI generation failed, using fallback:', error)
            const detectedStat = rules.STAT_RULES.detectStatFromDescription(title)
            const baseXP = rules.QUEST_REWARDS.BASE_XP[difficulty] || 50
            const bonusXP = detectedStat ? 10 : 0

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
    } else {
        const detectedStat = rules.STAT_RULES.detectStatFromDescription(title)
        const baseXP = rules.QUEST_REWARDS.BASE_XP[difficulty] || 50
        const bonusXP = detectedStat ? 10 : 0

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
    }

    const quest = new Quest({
        ...questInfo,
        userId,
        isCompleted: false,
        completedAt: null,
        isDaily: false
    })

    try {
        const savedQuest = await quest.save()
        return savedQuest
    } catch (error) {
        console.error('Error saving quest to MongoDB:', error)
        throw new errors.ValidationError('Failed to save quest to database')
    }
}

export default createQuest