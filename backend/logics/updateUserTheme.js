import { errors, validator, rules } from 'common'
import User from '../models/User.js'

const updateUserTheme = async (userId, theme) => {
    validator.id(userId, 'userId')
    validator.text(theme, 20, 3, 'theme')

    const validThemes = ['default', 'dark', 'library', 'mystic', 'medieval', 'warrior', 'academy']
    if (!validThemes.includes(theme)) {
        throw new errors.ValidationError(`Invalid theme. Valid themes: ${validThemes.join(', ')}`)
    }

    const user = await User.findById(userId)
    if (!user) {
        throw new errors.ExistenceError('User not found')
    }

    if (!user.preferences) {
        user.preferences = {}
    }
    user.preferences.theme = theme
    await user.save()

    return {
        message: 'Theme updated successfully',
        theme: user.preferences.theme,
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
export default updateUserTheme