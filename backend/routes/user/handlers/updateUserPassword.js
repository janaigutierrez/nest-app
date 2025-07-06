import { validator } from "common"
import logic from "../../../logics/index.js"

const updateUserPassword = async (req, res, next) => {
    try {
        const userId = req.user._id.toString()
        const { currentPassword, newPassword } = req.body

        validator.password(currentPassword, 'current password')
        validator.password(newPassword, 'new password')

        const result = await logic.updateUserPassword(userId, currentPassword, newPassword)

        res.status(200).json({
            success: true,
            message: 'Updated successfully'
        })
    } catch (error) {
        next(error)
    }
}

export default updateUserPassword