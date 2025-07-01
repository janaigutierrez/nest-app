import logic from '../../../logics/index.js'

const completeQuest = async (req, res) => {
    try {
        const { id: questId } = req.params
        const userId = req.user.id

        const result = await logic.completeQuest(userId, questId)
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json({ name: error.constructor.name, message: error.message })
    }
}

export default completeQuest