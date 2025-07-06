import Quest from '../models/Quest.js'
import { validator, errors } from 'common'

const deleteQuest = async (userId, questId) => {
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
        throw new errors.ValidationError('cannot delete completed quest')
    }

    await Quest.findByIdAndDelete(questId)

    return quest
}

export default deleteQuest