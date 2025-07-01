import Quest from '../models/Quest.js'
import { AIService } from '../utils/aiService/index.js'
import { rules } from 'common'

/**
 * Create a new quest for a user (AI or Manual)
 * @param {string} userId - User ID from JWT
 * @param {Object} questData - Quest creation data
 * @returns {Object} Created quest
 */

export const createQuest = async (userId, questData) => {
    const { title, useAI, difficulty = 'STANDARD' } = questData

    if (!title || !title.trim()) {
        throw new Error('Quest title is required')
    }

    if (!userId) {
        throw new Error('User ID is required')
    }

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
        console.error('❌ Error saving quest to MongoDB:', error)
        throw new Error('Failed to save quest to database')
    }
}

export default createQuest