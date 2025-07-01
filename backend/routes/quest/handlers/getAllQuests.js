import { validator } from "common"
import logic from "../../../logics/index.js"

const getAllQuests = async (req, res, next) => {
    try {
        const userId = req.user.id

        const quests = await logic.getAllQuests(userId)

        res.status(200).json({ quests })
    } catch (error) {
        next(error)
    }
}

export default getAllQuests