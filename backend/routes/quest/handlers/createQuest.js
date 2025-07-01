import logic from '../../../logics/index.js'

const createQuest = async (req, res) => {
    try {
        const quest = await logic.createQuest(req.user.id, req.body)
        res.status(201).json({ success: true, quest })
    } catch (error) {
        res.status(400).json({ success: false, error: error.message })
    }
}

export default createQuest