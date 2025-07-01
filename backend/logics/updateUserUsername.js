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
        user: user.toJSON()
    }
}

export default updateUserUsername