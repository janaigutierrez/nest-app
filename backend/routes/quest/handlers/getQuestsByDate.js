import { validator } from 'common'
import logic from '../../../logics/index.js'

const getQuestsByDate = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { date } = req.query

        validator.id(userId, 'userId')

        if (!date) {
            return res.status(400).json({
                success: false,
                error: 'Date parameter is required'
            })
        }

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