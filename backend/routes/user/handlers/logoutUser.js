import logic from '../../../logics/index.js'

const logoutUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            })
        }

        const token = authHeader.split(' ')[1]
        const userId = req.user.id.toString()

        const result = await logic.logoutUser(token, userId)

        res.status(200).json({
            success: true,
            ...result
        })

    } catch (error) {
        next(error)
    }
}

export default logoutUser