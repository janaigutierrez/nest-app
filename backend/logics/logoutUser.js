import jwt from 'jsonwebtoken'
import TokenBlacklist from '../models/TokenBlacklist.js'
import { errors, validator } from 'common'

const logoutUser = async (token, userId) => {
    validator.text(token, 500, 10, 'token')
    validator.id(userId, 'userId')

    try {
        const decoded = jwt.decode(token)

        if (!decoded || !decoded.exp) {
            throw new errors.ValidationError('Invalid token format')
        }

        const existingBlacklist = await TokenBlacklist.findOne({ token })
        if (existingBlacklist) {
            return {
                message: 'Logout successful',
                tokenInvalidated: true
            }
        }

        await TokenBlacklist.create({
            token,
            userId,
            expiresAt: new Date(decoded.exp * 1000)
        })

        return {
            message: 'Logout successful',
            tokenInvalidated: true
        }

    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            return {
                message: 'Logout successful',
                tokenInvalidated: true
            }
        }
        throw error
    }
}

export default logoutUser