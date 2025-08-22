import { validator } from 'common'
import logic from '../../../logics/index.js'

const updateQuest = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { questId } = req.params
        const updateData = req.body

        validator.id(userId, 'userId')
        validator.id(questId, 'questId')

        const quest = await logic.updateQuest(userId, questId, updateData)

        res.status(200).json({
            success: true,
            data: { quest }
        })
    } catch (error) {
        next(error)
    }
}

export default updateQuest