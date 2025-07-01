import { errors, validator } from 'common'
import User from '../models/User.js'
import bcrypt from 'bcrypt'

const updateUserPassword = async (userId, currentPassword, newPassword) => {
    validator.id(userId, 'userId')
    validator.password(currentPassword, 'current password')
    validator.password(newPassword, 'new password')

    if (currentPassword === newPassword) {
        throw new errors.ValidationError('New password must be different from current password')
    }

    const user = await User.findById(userId).select('+password')
    if (!user) {
        throw new errors.ExistenceError('User not found')
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
        throw new errors.AuthError('Current password is incorrect')
    }

    user.password = newPassword
    await user.save()

    return {
        message: 'Password updated successfully',
        user: user.toJSON()
    }
}

export default updateUserPassword