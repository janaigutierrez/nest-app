import { errors, validator } from 'common'
import User from '../models/User.js'

const updateUserEmail = async (userId, newEmail) => {
    validator.id(userId, 'userId')
    validator.email(newEmail, 'email')

    const user = await User.findById(userId)
    if (!user) {
        throw new errors.ExistenceError('User not found')
    }

    const existingUser = await User.findOne({
        email: newEmail.toLowerCase(),
        _id: { $ne: userId }
    })

    if (existingUser) {
        throw new errors.DuplicateError('Email already in use')
    }

    user.email = newEmail.toLowerCase()
    await user.save()

    return {
        message: 'Email updated successfully',
        email: user.email,
        user: user.toJSON()
    }
}

export default updateUserEmail