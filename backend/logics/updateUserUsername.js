import { errors, validator } from 'common'
import User from '../models/User.js'

const updateUserUsername = async (userId, newUsername) => {
    validator.id(userId, 'userId')
    validator.username(newUsername, 'username')

    const user = await User.findById(userId)
    if (!user) {
        throw new errors.ExistenceError('User not found')
    }

    const existingUser = await User.findOne({
        username: newUsername.trim(),
        _id: { $ne: userId }
    })

    if (existingUser) {
        throw new errors.DuplicateError('Username already taken')
    }

    user.username = newUsername.trim()
    await user.save()

    return {
        message: 'Username updated successfully',
        username: user.username,
        user: {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            totalXP: user.totalXP,
            currentLevel: user.currentLevel,
            stats: user.stats,
            theme: user.theme,
            avatar: user.avatar,
            xpToNextLevel: user.xpToNextLevel,
            preferences: user.preferences,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    }
}

export default updateUserUsername