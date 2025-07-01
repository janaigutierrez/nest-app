import { createContext, useContext, useState, useEffect } from 'react'
import { rules } from 'common'
import logics from '../logic'
import { useAuth } from './AuthContext'
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

    const { user, refreshUserData } = useAuth()

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
        try {
            // ✅ FIX: Verificar si hay usuario antes de cargar
            const userId = getLoggedUserId()
            if (!userId) {
                console.log('🔍 No user logged in, skipping quest load')
                setQuests([])
                return
            }

            const response = await logics.quest.getAllQuests()
            const questsArray = response.quests || response
            setQuests(questsArray)
        } catch (error) {
            // ✅ FIX: Solo mostrar error si hay usuario logueado
            const userId = getLoggedUserId()
            if (userId) {
                console.error('Error loading quests:', error)
            } else {
                console.log('🔍 Quest load failed - user not logged in (expected after logout)')
            }
            setQuests([])

            // ✅ FIX: Solo throw error si hay usuario (error inesperado)
            if (userId) {
                throw error
            }
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

    const addQuest = async (questData) => {
        try {
            setError(null)
            const response = await logics.quest.createQuest(questData)
            const createdQuest = response.quest

            setQuests(prev => {
                const prevArray = Array.isArray(prev) ? prev : (prev?.quests || [])
                return [createdQuest, ...prevArray]
            })

            setIsQuestModalOpen(false)
            return createdQuest
        } catch (error) {
            console.error('❌ Error creating quest:', error)
            setError(error.message)
            throw error
        }
    }

    const completeQuest = async (questId) => {
        try {
            setError(null)
            const result = await logics.quest.completeQuest(questId)

            setQuests(prev => prev.map(q =>
                q._id === questId ? result.updatedQuest : q
            ))

            await refreshUserData()

            if (result.levelUp) {
                console.log(`🎉 LEVEL UP! Welcome to Level ${result.updatedUser.level}!`)
                // TODO: level up modal 
            }

            return result
        } catch (error) {
            console.error('❌ Error completing quest:', error)
            setError(error.message)
            throw error
        }
    }

    const abandonQuest = async (questId) => {
        try {
            setError(null)
            const deleted = await logics.quest.deleteQuest(questId)

            setQuests(prev => prev.filter(quest => quest._id !== questId))

            return deleted
        } catch (error) {
            console.error('❌ Error abandoning quest:', error)
            setError(error.message)
            throw error
        }
    }

    const updateQuest = async (questId, updates) => {
        try {
            setError(null)
            const updatedQuest = await logics.quest.updateQuest(questId, updates)

            setQuests(prev => prev.map(q =>
                q._id === questId ? updatedQuest : q
            ))

            return updatedQuest
        } catch (error) {
            console.error('❌ Error updating quest:', error)
            setError(error.message)
            throw error
        }
    }

    const uncompleteQuest = async (questId) => {
        try {
            setError(null)
            const result = await logics.quest.uncompleteQuest(questId)

            setQuests(prev => prev.map(q =>
                q._id === questId ? result.updatedQuest : q
            ))

            await refreshUserData()

            return result
        } catch (error) {
            console.error('❌ Error uncompleting quest:', error)
            setError(error.message)
            throw error
        }
    }

    const getActiveQuests = async () => {
        try {
            return await logics.quest.getActiveQuests()
        } catch (error) {
            console.error('❌ Error getting active quests:', error)
            return []
        }
    }

    const getCompletedQuests = async () => {
        try {
            return await logics.quest.getCompletedQuests()
        } catch (error) {
            console.error('❌ Error getting completed quests:', error)
            return []
        }
    }

    const getQuestsByDifficulty = async (difficulty) => {
        try {
            return await logics.quest.getQuestsByDifficulty(difficulty)
        } catch (error) {
            console.error('❌ Error getting quests by difficulty:', error)
            return []
        }
    }

    const getQuestsByStat = async (stat) => {
        try {
            return await logics.quest.getQuestsByStat(stat)
        } catch (error) {
            console.error('❌ Error getting quests by stat:', error)
            return []
        }
    }

    const openQuestModal = () => setIsQuestModalOpen(true)
    const closeQuestModal = () => setIsQuestModalOpen(false)

    const clearError = () => setError(null)

    const value = {
        quests,
        loading,
        error,
        isQuestModalOpen,

        isFeatureUnlocked,
        getNextUnlock,
        addQuest,
        completeQuest,
        abandonQuest,
        updateQuest,
        uncompleteQuest,
        getActiveQuests,
        getCompletedQuests,
        getQuestsByDifficulty,
        getQuestsByStat,
        openQuestModal,
        closeQuestModal,
        clearError
    }

    return (
        <QuestContext.Provider value={value}>
            {children}
        </QuestContext.Provider>
    )
}