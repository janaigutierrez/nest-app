const quests = {
    createQuest: (quest) => {
        const questsJson = localStorage.quests
        let quests = questsJson ? JSON.parse(questsJson) : []

        quest.id = Date.now().toString()
        quest.createdAt = new Date()
        quest.updatedAt = new Date()
        quest.completed = false
        quest.completedAt = null

        if (!quest.experienceReward) quest.experienceReward = 50
        if (!quest.difficulty) quest.difficulty = 'STANDARD'
        if (!quest.targetStat) quest.targetStat = null
        if (!quest.generatedBy) quest.generatedBy = 'manual'

        quests.push(quest)
        localStorage.setItem('quests', JSON.stringify(quests))
        return quest
    },

    findQuestById: (id) => {
        const questsJson = localStorage.quests
        if (!questsJson) return undefined
        const quests = JSON.parse(questsJson)
        const questFound = quests.find(quest => quest.id === id)
        return questFound
    },

    retrieveQuests: () => {
        const quests = localStorage.quests ? JSON.parse(localStorage.getItem("quests")) : []
        return quests
    },

    retrieveActiveQuests: () => {
        const quests = localStorage.quests ? JSON.parse(localStorage.getItem("quests")) : []
        return quests.filter(quest => !quest.completed)
    },

    retrieveCompletedQuests: () => {
        const quests = localStorage.quests ? JSON.parse(localStorage.getItem("quests")) : []
        return quests.filter(quest => quest.completed)
    },

    retrieveQuestsByDifficulty: (difficulty) => {
        const quests = localStorage.quests ? JSON.parse(localStorage.getItem("quests")) : []
        return quests.filter(quest => quest.difficulty === difficulty)
    },

    retrieveQuestsByStat: (targetStat) => {
        const quests = localStorage.quests ? JSON.parse(localStorage.getItem("quests")) : []
        return quests.filter(quest => quest.targetStat === targetStat)
    },

    updateQuestById: (id, newQuestData) => {
        const quests = localStorage.quests ? JSON.parse(localStorage.getItem("quests")) : []
        const questIndex = quests.findIndex(quest => quest.id === id)
        if (questIndex === -1) {
            return null
        }

        const updatedQuest = {
            ...quests[questIndex],
            ...newQuestData,
            id: quests[questIndex].id,
            createdAt: quests[questIndex].createdAt,
            updatedAt: new Date()
        }

        quests[questIndex] = updatedQuest
        localStorage.quests = JSON.stringify(quests)
        return updatedQuest
    },

    completeQuestById: (id) => {
        const quests = localStorage.quests ? JSON.parse(localStorage.getItem("quests")) : []
        const questIndex = quests.findIndex(quest => quest.id === id)
        if (questIndex === -1) {
            return null
        }

        if (quests[questIndex].completed) {
            return quests[questIndex]
        }

        quests[questIndex].completed = true
        quests[questIndex].completedAt = new Date()
        quests[questIndex].updatedAt = new Date()

        localStorage.quests = JSON.stringify(quests)
        return quests[questIndex]
    },

    uncompleteQuestById: (id) => {
        const quests = localStorage.quests ? JSON.parse(localStorage.getItem("quests")) : []
        const questIndex = quests.findIndex(quest => quest.id === id)
        if (questIndex === -1) {
            return null
        }

        if (!quests[questIndex].completed) {
            return quests[questIndex]
        }

        quests[questIndex].completed = false
        quests[questIndex].completedAt = null
        quests[questIndex].updatedAt = new Date()

        localStorage.quests = JSON.stringify(quests)
        return quests[questIndex]
    },

    deleteQuestById: (id) => {
        const quests = localStorage.quests ? JSON.parse(localStorage.getItem("quests")) : []
        const questIndex = quests.findIndex(quest => quest.id === id)
        if (questIndex === -1) {
            return false
        }

        quests.splice(questIndex, 1)
        localStorage.quests = JSON.stringify(quests)
        return true
    },

    getQuestStats: () => {
        const quests = localStorage.quests ? JSON.parse(localStorage.getItem("quests")) : []
        const totalQuests = quests.length
        const completedQuests = quests.filter(q => q.completed).length
        const totalXP = quests.filter(q => q.completed).reduce((sum, q) => sum + (q.experienceReward || 0), 0)

        return {
            totalQuests,
            completedQuests,
            activeQuests: totalQuests - completedQuests,
            totalXP,
            completionRate: totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0
        }
    },

    getAllQuests: () => {
        const quests = localStorage.quests ? JSON.parse(localStorage.getItem("quests")) : []
        return quests
    },

    clearAllQuests: () => {
        localStorage.removeItem('quests')
        return true
    }
}

export default quests