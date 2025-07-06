import logic from "../../../logics/index.js"

const updateUserTheme = async (req, res, next) => {
    try {
        const userId = req.user.id.toString()
        const { theme } = req.body

        const validThemes = ['default', 'dark', 'library', 'mystic', 'medieval', 'warrior', 'academy']
        if (!validThemes.includes(theme)) {
            throw new Error(`Invalid theme. Valid themes: ${validThemes.join(', ')}`)
        }

        const result = await logic.updateUserTheme(userId, theme)

        res.status(200).json({
            success: true,
            message: 'Updated successfully'
        })
    } catch (error) {
        next(error)
    }
}

export default updateUserTheme