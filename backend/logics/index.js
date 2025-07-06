import completeQuest from './completeQuest.js'
import createQuest from './createQuest.js'
import deleteQuest from './deleteQuest.js'
import getAllQuests from './getAllQuests.js'
import getUserProfile from './getUserProfile.js'
import loginUser from './loginUser.js'
import logoutUser from './logoutUser.js'
import registerUser from './registerUser.js'
import updateUserPassword from './updatePassword.js'
import updateUserAvatar from './updateUserAvatar.js'
import updateUserEmail from './updateUserEmail.js'
import updateUserTheme from './updateUserTheme.js'
import updateUserUsername from './updateUserUsername.js'

const logic = {
    loginUser,
    registerUser,
    getUserProfile,
    getAllQuests,
    completeQuest,
    deleteQuest,
    updateUserAvatar,
    logoutUser,
    updateUserEmail,
    updateUserPassword,
    updateUserTheme,
    updateUserUsername,
    createQuest,
}

export default logic