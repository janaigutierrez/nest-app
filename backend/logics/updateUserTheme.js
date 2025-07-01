import { errors, validator } from 'common'
import User from '../models/User.js'

const updateUserTheme = async (userId, theme) => {
    validator.id(userId, 'userId')

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
        user: user.toJSON()
    }
}

export default updateUserTheme