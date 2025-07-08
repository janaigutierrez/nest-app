import { validator } from "common"
import logic from "../../../logics/index.js"

const updateUserUsername = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { username } = req.body

        validator.username(username)

        const result = await logic.updateUserUsername(userId, username)

        res.status(200).json({
            success: true,
            message: 'Updated successfully'
        })
    } catch (error) {
        next(error)
    }
}

export default updateUserUsername