import logic from '../../../logics/index.js'

const completeQuest = async (req, res, next) => {
    try {
        const { id: questId } = req.params
        const userId = req.user.id

        const result = await logic.completeQuest(userId, questId)
        res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        next(error)
    }
}

export default completeQuest