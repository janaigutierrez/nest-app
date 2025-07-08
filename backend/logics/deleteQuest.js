import Quest from '../models/Quest.js'
import { validator, errors } from 'common'

const deleteQuest = async (userId, questId) => {
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
        throw new errors.ValidationError('cannot delete completed quest')
    }

    await Quest.findByIdAndDelete(questId)

    return {
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
    }
}

export default deleteQuest