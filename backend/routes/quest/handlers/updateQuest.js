import logic from '../../../logics/index.js'

const updateQuest = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { id: questId } = req.params

        const updatedQuest = await logic.updateQuest(userId, questId, req.body)

        res.status(200).json({
            success: true,
            data: { quest: updatedQuest }
        })
    } catch (error) {
        next(error)
    }
}

export default updateQuest
