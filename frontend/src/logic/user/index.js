import getUserProfile from './getUserProfile'
import loginUser from './loginUser'
import logoutUser from './logoutUser'
import registerUser from './registerUser'
import updateAvatar from './updateAvatar'
import updateEmail from './updateEmail'
import updatePassword from './updatePassword'
import updateTheme from './updateTheme'
import updateUsername from './updateUsername'

const user = {
    getUserProfile,
    loginUser,
    logoutUser,
    registerUser,
    updateEmail,
    updatePassword,
    updateTheme,
    updateUsername,
    updateAvatar
}

export default user