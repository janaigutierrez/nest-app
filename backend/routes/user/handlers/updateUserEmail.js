import { validator } from "common"
import logic from "../../../logics/index.js"

const updateUserEmail = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { email } = req.body

        validator.email(email)

        const result = await logic.updateUserEmail(userId, email)

        res.status(200).json({
            success: true,
            message: 'Updated successfully'
        })
    } catch (error) {
        next(error)
    }
}

export default updateUserEmail