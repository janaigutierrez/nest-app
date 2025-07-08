import { createContext, useContext, useState, useEffect } from 'react'
import { rules } from 'common'
import logics from '../logic'
import { useAuth } from './AuthContext'
import { useNotifications } from './NotificationContext'
import getLoggedUserId from '../logic/helpers/getLoggedUserId'

const QuestContext = createContext()

export const useQuests = () => {
    const context = useContext(QuestContext)
    if (!context) {
        throw new Error('useQuests must be used within a QuestProvider')
    }
    return context
}

export const QuestProvider = ({ children }) => {
    const [isQuestModalOpen, setIsQuestModalOpen] = useState(false)
    const [quests, setQuests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [showLevelUpModal, setShowLevelUpModal] = useState(false)
    const [levelUpData, setLevelUpData] = useState(null)

    const { user, refreshUserData } = useAuth()
    const { showSuccess, showError } = useNotifications()

    useEffect(() => {
        initializeData()
    }, [])

    const initializeData = async () => {
        try {
            setLoading(true)
            setError(null)
            await loadQuestsData()
        } catch (error) {
            console.error('Error initializing data:', error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const loadQuestsData = async () => {
        const userId = getLoggedUserId()

        if (!userId) {
            setQuests([])
            return
        }

        try {
            const response = await logics.quest.getAllQuests()
            const questsArray = response || []
            const validQuests = questsArray.filter(quest => quest && quest.id)
            setQuests(validQuests)
        } catch (error) {
            setQuests([])
            throw error
        }
    }

    const isFeatureUnlocked = (featureName) => {
        if (!user) return false
        return rules.UNLOCK_RULES.isUnlocked(featureName, user.currentLevel)
    }

    const getNextUnlock = () => {
        if (!user) return null
        return rules.UNLOCK_RULES.getNextUnlock(user.currentLevel)
    }

    const handleLevelUp = (levelUpInfo) => {
        setLevelUpData(levelUpInfo)
        setShowLevelUpModal(true)
        showSuccess(`🎉 Level Up! Welcome to Level ${levelUpInfo.newLevel}!`)
    }

    const closeLevelUpModal = () => {
        setShowLevelUpModal(false)
        setLevelUpData(null)
    }

    const addQuest = async (questData) => {
        try {
            setError(null)
            const createdQuest = await logics.quest.createQuest(questData)


            setQuests(prev => {
                const prevArray = Array.isArray(prev) ? prev : []
                return [createdQuest, ...prevArray]
            })
            setIsQuestModalOpen(false)
            showSuccess('🎉 Quest created successfully!')
            return createdQuest
        } catch (error) {
            setError(error.message)
            showError(error.message)
            throw error
        }
    }

    const completeQuest = async (questId) => {
        try {
            setError(null)
            const result = await logics.quest.completeQuest(questId)

            setQuests(prev => {
                if (!Array.isArray(prev)) return []
                return prev.map(q => {
                    if (!q || !q.id) return q
                    return q.id === questId ? result.updatedQuest : q
                }).filter(Boolean)
            })

            await refreshUserData()

            if (result.levelUp) {
                handleLevelUp({
                    oldLevel: result.oldLevel,
                    newLevel: result.newLevel,
                    newUnlocks: result.newUnlocks || []
                })
            }

            return result
        } catch (error) {
            setError(error.message)
            showError(error.message)
            throw error
        }
    }

    const abandonQuest = async (questId) => {
        try {
            setError(null)
            await logics.quest.deleteQuest(questId)

            setQuests(prev => {
                if (!Array.isArray(prev)) return []
                return prev.filter(quest => quest && quest.id !== questId)
            })

        } catch (error) {
            setError(error.message)
            showError(error.message)
            throw error
        }
    }

    const getActiveQuests = () => {
        if (!Array.isArray(quests)) return []
        return quests.filter(quest => quest && !quest.isCompleted)
    }

    const getCompletedQuests = () => {
        if (!Array.isArray(quests)) return []
        return quests.filter(quest => quest && quest.isCompleted)
    }

    const getQuestsByDifficulty = (difficulty) => {
        if (!Array.isArray(quests)) return []
        return quests.filter(quest => quest && quest.difficulty === difficulty)
    }

    const getQuestsByStat = (stat) => {
        if (!Array.isArray(quests)) return []
        return quests.filter(quest => quest && quest.targetStat === stat)
    }

    const openQuestModal = () => setIsQuestModalOpen(true)
    const closeQuestModal = () => setIsQuestModalOpen(false)
    const clearError = () => setError(null)

    const refreshQuests = async () => {
        try {
            await loadQuestsData()
        } catch (error) {
            console.error('Error refreshing quests:', error)
        }
    }

    const value = {
        quests,
        loading,
        error,
        isQuestModalOpen,
        showLevelUpModal,
        levelUpData,
        addQuest,
        completeQuest,
        abandonQuest,
        refreshQuests,
        getActiveQuests,
        getCompletedQuests,
        getQuestsByDifficulty,
        getQuestsByStat,
        isFeatureUnlocked,
        getNextUnlock,
        openQuestModal,
        closeQuestModal,
        closeLevelUpModal,
        clearError
    }

    return (
        <QuestContext.Provider value={value}>
            {children}
        </QuestContext.Provider>
    )
}