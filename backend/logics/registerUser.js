import { errors } from "common"
import User from "../models/User.js"
import jwt from "jsonwebtoken"

const registerUser = async (username, email, password) => {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
        throw new errors.DuplicateError('user already exists')
    }

    const newUser = new User({
        username,
        email,
        password: password
    })

    const savedUser = await newUser.save()

    const token = jwt.sign(
        { userId: savedUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )

    const userResponse = {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        totalXP: savedUser.totalXP,
        currentLevel: savedUser.currentLevel,
        stats: savedUser.stats
    }

    return { user: userResponse, token }
}

export default registerUser