import { validator } from "common"
import logic from "../../../logics/index.js"

const registerUser = async (req, res, next) => {
    const { username, email, password } = req.body

    try {
        validator.username(username)
        validator.email(email)
        validator.password(password)

        const result = await logic.registerUser(username, email, password)
        res.status(201).json({
            success: true,
            data: { user: result, token }
        })
    } catch (error) {
        next(error)
    }
}

export default registerUser