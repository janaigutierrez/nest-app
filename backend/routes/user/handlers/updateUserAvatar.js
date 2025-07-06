import logic from '../../../logics/index.js'

const updateUserAvatar = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { equippedSet } = req.body

        const result = await logic.updateUserAvatar(userId, equippedSet)

        res.status(200).json({
            success: true,
            message: 'Updated successfully'
        })
    } catch (error) {
        next(error)
    }
}

export default updateUserAvatar