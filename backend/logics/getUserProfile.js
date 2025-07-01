import { errors } from "common"
import User from "../models/User.js"

const getUserProfile = async (userId) => {
    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new errors.ExistenceError('user not found')
        }

        return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            totalXP: user.totalXP,
            currentLevel: user.currentLevel,
            stats: user.stats,
            preferences: user.preferences,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }

    } catch (error) {
        if (error.name === 'ExistenceError') {
            throw error
        }
        if (error.name === 'CastError') {
            throw new errors.ContentError('Invalid user ID format')
        }
        throw new errors.ServerError(error.message)
    }
}

export default getUserProfile