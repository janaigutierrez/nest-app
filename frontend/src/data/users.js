const users = {
    findUserById: (id) => {
        const usersJson = localStorage.users
        if (!usersJson) return undefined
        const users = JSON.parse(usersJson)
        const userFound = users.find(user => user.id === id)
        return userFound
    },

    findUserByEmail: (email) => {
        const usersJson = localStorage.users
        if (!usersJson) return undefined
        const users = JSON.parse(usersJson)
        const userFound = users.find(user => user.email === email)
        return userFound
    },

    findUserByUsername: (username) => {
        const usersJson = localStorage.users
        if (!usersJson) return undefined
        const users = JSON.parse(usersJson)
        const userFound = users.find(user => user.username === username)
        return userFound
    },

    createUser: (user) => {
        const usersJson = localStorage.users
        let users;
        if (!usersJson) {
            users = []
        } else {
            users = JSON.parse(usersJson)
        }

        user.id = Date.now().toString()
        user.createdAt = new Date()
        user.updatedAt = new Date()

        if (!user.totalXP) user.totalXP = 0
        if (!user.currentLevel) user.currentLevel = 1
        if (!user.stats) {
            user.stats = {
                STRENGTH: 0,
                DEXTERITY: 0,
                WISDOM: 0,
                CHARISMA: 0
            }
        }
        if (!user.preferences) {
            user.preferences = {
                theme: 'default',
                notifications: true,
                motivationalQuotes: false,
                language: 'en'
            }
        }

        users.push(user)
        localStorage.setItem('users', JSON.stringify(users))
        return user
    },

    updateUserById: (id, newUserData) => {
        const users = localStorage.users ? JSON.parse(localStorage.getItem("users")) : [];
        const userIndex = users.findIndex(user => user.id === id)
        if (userIndex === -1) {
            return null
        }

        const updatedUser = {
            ...users[userIndex],
            ...newUserData,
            id: users[userIndex].id,
            createdAt: users[userIndex].createdAt,
            updatedAt: new Date()
        }

        users[userIndex] = updatedUser
        localStorage.users = JSON.stringify(users)
        return updatedUser
    },

    updateUserStats: (id, statUpdates) => {
        const users = localStorage.users ? JSON.parse(localStorage.getItem("users")) : [];
        const userIndex = users.findIndex(user => user.id === id)
        if (userIndex === -1) {
            return null
        }

        users[userIndex].stats = {
            ...users[userIndex].stats,
            ...statUpdates
        }
        users[userIndex].updatedAt = new Date()

        localStorage.users = JSON.stringify(users)
        return users[userIndex]
    },

    updateUserXP: (id, xpGain) => {
        const users = localStorage.users ? JSON.parse(localStorage.getItem("users")) : [];
        const userIndex = users.findIndex(user => user.id === id)
        if (userIndex === -1) {
            return null
        }

        users[userIndex].totalXP += xpGain
        users[userIndex].updatedAt = new Date()

        localStorage.users = JSON.stringify(users)
        return users[userIndex]
    },

    updateUserLevel: (id, newLevel) => {
        const users = localStorage.users ? JSON.parse(localStorage.getItem("users")) : [];
        const userIndex = users.findIndex(user => user.id === id)
        if (userIndex === -1) {
            return null
        }

        users[userIndex].currentLevel = newLevel
        users[userIndex].updatedAt = new Date()

        localStorage.users = JSON.stringify(users)
        return users[userIndex]
    },

    updatePassword: (id, newPasswordHash) => {
        const users = localStorage.users ? JSON.parse(localStorage.getItem("users")) : [];
        const userIndex = users.findIndex(user => user.id === id)
        if (userIndex === -1) return null

        users[userIndex].password = newPasswordHash
        users[userIndex].updatedAt = new Date()

        localStorage.users = JSON.stringify(users)
        return users[userIndex]
    },

    updatePreferences: (id, newPreferences) => {
        const users = localStorage.users ? JSON.parse(localStorage.getItem("users")) : [];
        const userIndex = users.findIndex(user => user.id === id)
        if (userIndex === -1) return null

        users[userIndex].preferences = {
            ...users[userIndex].preferences,
            ...newPreferences
        }
        users[userIndex].updatedAt = new Date()

        localStorage.users = JSON.stringify(users)
        return users[userIndex]
    },

    resetUserProgress: (id) => {
        const users = localStorage.users ? JSON.parse(localStorage.getItem("users")) : [];
        const userIndex = users.findIndex(user => user.id === id)
        if (userIndex === -1) return null

        users[userIndex].totalXP = 0
        users[userIndex].currentLevel = 1
        users[userIndex].stats = {
            STRENGTH: 0,
            DEXTERITY: 0,
            WISDOM: 0,
            CHARISMA: 0
        }
        users[userIndex].updatedAt = new Date()

        localStorage.users = JSON.stringify(users)

        localStorage.removeItem('quests')

        return users[userIndex]
    },

    deleteUserById: (id) => {
        const users = localStorage.users ? JSON.parse(localStorage.getItem("users")) : [];
        const userIndex = users.findIndex(user => user.id === id)
        if (userIndex === -1) {
            return false
        }

        users.splice(userIndex, 1)
        localStorage.users = JSON.stringify(users)
        return true
    },

    logout: () => {
        localStorage.removeItem('currentUserId')
        localStorage.removeItem('authToken')
    },

    getAllUsers: () => {
        const users = localStorage.users ? JSON.parse(localStorage.getItem("users")) : []
        return users
    },

    clearAllUsers: () => {
        localStorage.removeItem('users')
        localStorage.removeItem('currentUserId')
        localStorage.removeItem('authToken')
        return true
    }
}

export default users