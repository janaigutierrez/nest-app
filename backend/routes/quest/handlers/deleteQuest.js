import logic from '../../../logics/index.js'

const deleteQuest = async (req, res) => {
    try {
        const { id: questId } = req.params
        const userId = req.user.id

        await logic.deleteQuest(userId, questId)
        res.status(200).json({ success: true, message: 'Quest deleted successfully' })
    } catch (error) {
        res.status(400).json({ name: error.constructor.name, message: error.message })
    }
}

export default deleteQuest