import { json, Router } from "express"
import handlers from './handlers/index.js'
import { protect } from "../../middleware/auth.js"

const jsonBodyParser = json()
const userRouter = Router()

userRouter.post('/login', jsonBodyParser, handlers.loginUser)
userRouter.post('/register', jsonBodyParser, handlers.registerUser)
userRouter.post('/logout', protect, handlers.logoutUser)

userRouter.get('/profile/:userId', protect, handlers.getUserProfile)

userRouter.put('/avatar', protect, jsonBodyParser, handlers.updateUserAvatar)
userRouter.put('/email', protect, jsonBodyParser, handlers.updateUserEmail)
userRouter.put('/change-password', protect, jsonBodyParser, handlers.updateUserPassword)
userRouter.put('/theme', protect, jsonBodyParser, handlers.updateUserTheme)
userRouter.put('/username', protect, jsonBodyParser, handlers.updateUserUsername)


export default userRouter 