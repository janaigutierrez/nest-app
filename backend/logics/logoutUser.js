import jwt from 'jsonwebtoken'
import TokenBlacklist from '../models/TokenBlacklist.js'
import { errors, validator } from 'common'

const logoutUser = async (token, userId) => {
    validator.text(token, 500, 10, 'token')
    validator.id(userId, 'userId')

    try {
        // Decodificar token para obtener expiración
        const decoded = jwt.decode(token)

        if (!decoded || !decoded.exp) {
            throw new errors.ValidationError('Invalid token format')
        }

        // Verificar que el token no esté ya en blacklist
        const existingBlacklist = await TokenBlacklist.findOne({ token })
        if (existingBlacklist) {
            // Si ya está en blacklist, considerarlo éxito (idempotente)
            return {
                message: 'Logout successful',
                tokenInvalidated: true
            }
        }

        // Añadir token a blacklist
        await TokenBlacklist.create({
            token,
            userId,
            expiresAt: new Date(decoded.exp * 1000) // JWT exp está en segundos, MongoDB necesita milisegundos
        })

        return {
            message: 'Logout successful',
            tokenInvalidated: true
        }

    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            // Si hay duplicate key, significa que ya estaba en blacklist
            return {
                message: 'Logout successful',
                tokenInvalidated: true
            }
        }
        throw error
    }
}

export default logoutUser