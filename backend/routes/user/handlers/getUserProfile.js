import { validator } from "common"
import logic from "../../../logics/index.js"

const getUserProfile = async (req, res, next) => {
    try {
        const { userId } = req.params
        validator.id(userId)

        const userProfile = await logic.getUserProfile(userId)

        res.status(200).json({
            success: true,
            data: { profile: userProfile }
        })
    } catch (error) {
        next(error)
    }
}

export default getUserProfile