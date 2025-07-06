import { createContext, useContext, useState, useEffect } from 'react'
import logics from '../logic'
import getLoggedUserId from '../logic/helpers/getLoggedUserId'
import { errors } from 'common'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadUserData()
    }, [])

    const loadUserData = async () => {
        try {
            const userId = getLoggedUserId()

            if (userId) {
                const userProfile = await logics.user.getUserProfile()
                setUser(userProfile)
            } else {
                setUser(null)
            }
        } catch (error) {
            try {
                if (error && typeof error.constructor === 'function') {
                    if (error instanceof errors.AuthError) {
                        setUser(null)
                    } else if (error instanceof errors.ExistenceError) {
                        console.error('❌ User not found:', error.message)
                        setUser(null)
                    } else if (error instanceof errors.ConnectionError) {
                        console.error('🌐 Connection error:', error.message)
                        setUser(null)
                    } else {
                        console.error('❌ Error loading user data:', error.message)
                        setUser(null)
                    }
                } else {
                    console.error('❌ Unknown error loading user data:', error)
                    setUser(null)
                }
            } catch (checkError) {
                console.error('❌ Error in error handling:', checkError)
                setUser(null)
            }
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        await logics.user.logoutUser()
        setUser(null)
        window.location.href = '/'
    }

    const refreshUserData = async () => {
        try {
            const userId = getLoggedUserId()
            if (userId) {
                const userProfile = await logics.user.getUserProfile()
                setUser(userProfile)
            }
        } catch (error) {
            try {
                if (error && typeof error.constructor === 'function' && error instanceof errors.AuthError) {
                    setUser(null)
                } else {
                    console.error('❌ Error refreshing user data:', error.message)
                }
            } catch (checkError) {
                console.error('❌ Error in refresh error handling:', checkError)
                setUser(null)
            }
        }
    }

    const updateUserStats = (newXP, newStats) => {
        setUser(prev => ({
            ...prev,
            totalXP: newXP,
            stats: newStats
        }))
    }

    const updateUserAvatar = async (equippedSet) => {
        try {
            const response = await logics.user.updateAvatar(equippedSet)

            setUser(prev => ({
                ...prev,
                avatar: {
                    ...prev.avatar,
                    equippedSet
                }
            }))

            return response
        } catch (error) {
            console.error('❌ Error updating avatar:', error)
            throw error
        }
    }

    const value = {
        user,
        loading,
        logout,
        refreshUserData,
        updateUserStats,
        updateUserAvatar
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your adventure...</p>
                </div>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}