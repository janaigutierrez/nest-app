import Quest from '../models/Quest.js'
import User from '../models/User.js'
import { validator, errors, rules } from 'common'

const completeQuest = async (userId, questId) => {
    validator.id(userId, 'user ID')
    validator.id(questId, 'quest ID')

    const quest = await Quest.findById(questId)
    if (!quest) {
        throw new errors.ExistenceError('quest not found')
    }

    if (quest.userId.toString() !== userId) {
        throw new errors.AuthorizationError('quest does not belong to user')
    }

    if (quest.isCompleted) {
        throw new errors.DuplicateError('quest already completed')
    }

    const user = await User.findById(userId)
    if (!user) {
        throw new errors.ExistenceError('user not found')
    }

    const xpGained = quest.experienceReward
    const statGained = rules.STAT_RULES.STAT_POINTS_PER_QUEST

    const oldLevel = rules.XP_RULES.getLevelFromXP(user.totalXP)
    user.totalXP += xpGained

    if (quest.targetStat) {
        user.stats[quest.targetStat] += statGained
    }

    const newLevel = rules.XP_RULES.getLevelFromXP(user.totalXP)
    const levelUp = newLevel > oldLevel

    quest.isCompleted = true
    quest.completedAt = new Date()

    await Promise.all([user.save(), quest.save()])

    return {
        updatedQuest: {
            id: quest._id.toString(),
            title: quest.title,
            description: quest.description,
            difficulty: quest.difficulty,
            experienceReward: quest.experienceReward,
            targetStat: quest.targetStat,
            generatedBy: quest.generatedBy,
            tags: quest.tags,
            epicElements: quest.epicElements,
            aiMetadata: quest.aiMetadata,
            userId: quest.userId,
            isCompleted: quest.isCompleted,
            completedAt: quest.completedAt,
            isDaily: quest.isDaily,
            createdAt: quest.createdAt,
            updatedAt: quest.updatedAt
        },
        updatedUser: {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            totalXP: user.totalXP,
            currentLevel: user.currentLevel,
            stats: user.stats,
            theme: user.theme,
            avatar: user.avatar,
            xpToNextLevel: user.xpToNextLevel
        },
        xpGained,
        statGained,
        levelUp,
        newLevel,
        oldLevel
    }
}

export default completeQuest