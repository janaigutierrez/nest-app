import { validator } from "common"
import logic from "../../../logics/index.js"

const loginUser = async (req, res, next) => {
    const { email, password } = req.body

    try {
        validator.email(email)
        validator.password(password)

        const result = await logic.loginUser(email, password)

        res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}

export default loginUser