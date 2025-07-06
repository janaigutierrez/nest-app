import { validator } from "common"
import logic from "../../../logics/index.js"

const getAllQuests = async (req, res, next) => {
    try {
        const userId = req.user.id

        validator.id(userId)

        const questsList = await logic.getAllQuests(userId)

        res.status(200).json({
            success: true,
            data: { quests: questsList }
        })
    } catch (error) {
        next(error)
    }
}

export default getAllQuests