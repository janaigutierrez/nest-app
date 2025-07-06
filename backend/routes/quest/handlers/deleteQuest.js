import logic from '../../../logics/index.js'

const deleteQuest = async (req, res, next) => {
    try {
        const { id: questId } = req.params
        const userId = req.user.id

        await logic.deleteQuest(userId, questId)
        res.status(200).json({
            success: true,
            message: 'Quest deleted successfully'
        })
    } catch (error) {
        next(error)
    }
}

export default deleteQuest