import logic from '../../../logics/index.js'

const createQuest = async (req, res, next) => {
    try {
        const userId = req.user.id

        const quest = await logic.createQuest(userId, req.body)

        res.status(201).json({
            success: true,
            data: { quest: quest }
        })
    } catch (error) {
        next(error)
    }
}

export default createQuest