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

    // Support both old useAI and new mode parameter for backward compatibility
    const {
        title,
        useAI,
        mode,
        difficulty = 'STANDARD',
        steps // For future ritual support
    } = questData

    validator.text(title, 100, 3, 'title')

    // Determine the creation mode (backward compatibility)
    let creationMode = mode
    if (!mode && useAI !== undefined) {
        creationMode = useAI ? 'ai' : 'manual'
    }
    if (!creationMode) {
        creationMode = 'manual' // Default fallback
    }

    // Validate mode
    const validModes = ['manual', 'ai', 'ritual']
    if (!validModes.includes(creationMode)) {
        throw new errors.ValidationError(`Invalid mode: ${creationMode}. Must be one of: ${validModes.join(', ')}`)
    }

    // Common calculations (avoid repetition)
    const detectedStat = rules.STAT_RULES.detectStatFromDescription(title)
    const baseXP = rules.QUEST_REWARDS.BASE_XP[difficulty] || 50
    const bonusXP = detectedStat ? 10 : 0

    let questInfo

    switch (creationMode) {
        case 'ai':
            try {
                questInfo = await AIService.generateQuest(title, null, difficulty)
            } catch (error) {
                console.error('AI generation failed, using fallback:', error)
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
            // Future implementation for ritual quests
            if (!steps || !Array.isArray(steps) || steps.length === 0) {
                throw new errors.ValidationError('Ritual mode requires steps array')
            }

            // Calculate total XP from steps
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
        isDaily: false
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
            createdAt: savedQuest.createdAt,
            updatedAt: savedQuest.updatedAt
        }
    } catch (error) {
        console.error('Error saving quest to MongoDB:', error)
        throw new errors.ValidationError('Failed to save quest to database')
    }
}

export default createQuest