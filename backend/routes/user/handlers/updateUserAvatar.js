import logic from '../../../logics/index.js'

const updateUserAvatar = async (req, res, next) => {
    try {
        const userId = req.user.id.toString()
        const { equippedSet } = req.body

        const result = await logic.updateUserAvatar(userId, equippedSet)

        res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}

export default updateUserAvatar