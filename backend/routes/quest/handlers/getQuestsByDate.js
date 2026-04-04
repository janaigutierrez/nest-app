import logic from '../../../logics/index.js'

const getQuestsByDate = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { date } = req.query

        const quests = await logic.getQuestsByDate(userId, date)

        res.status(200).json({
            success: true,
            data: { quests }
        })
    } catch (error) {
        next(error)
    }
}

export default getQuestsByDate
