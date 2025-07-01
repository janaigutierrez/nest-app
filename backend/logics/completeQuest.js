import Quest from '../models/Quest.js'
import User from '../models/User.js'
import { validator, errors, rules } from 'common'

const completeQuest = async (userId, questId) => {
    validator.id(userId, 'user ID')
    validator.id(questId, 'quest ID')

    // Find quest and verify ownership
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

    // Find user
    const user = await User.findById(userId)
    if (!user) {
        throw new errors.ExistenceError('user not found')
    }

    // Calculate XP and stat gains
    const xpGained = quest.experienceReward
    const statGained = rules.STAT_RULES.STAT_POINTS_PER_QUEST

    // Update user stats and XP - FIX: Use totalXP not totalExperience
    const oldLevel = rules.XP_RULES.getLevelFromXP(user.totalXP)
    user.totalXP += xpGained  // FIX: totalXP not totalExperience

    if (quest.targetStat) {
        user.stats[quest.targetStat] += statGained
    }

    const newLevel = rules.XP_RULES.getLevelFromXP(user.totalXP)  // FIX: totalXP
    const levelUp = newLevel > oldLevel
    // Note: currentLevel is a virtual field, so we don't set it directly

    // Mark quest as completed
    quest.isCompleted = true
    quest.completedAt = new Date()

    // Save both documents
    await Promise.all([user.save(), quest.save()])

    return {
        updatedQuest: quest,
        updatedUser: user,
        xpGained,
        statGained,
        levelUp,
        newLevel
    }
}

export default completeQuest