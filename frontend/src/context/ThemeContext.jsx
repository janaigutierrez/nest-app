import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import updateTheme from '../logic/user/updateTheme'

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
    const { user } = useAuth()
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'default')

    useEffect(() => {
        if (user?.preferences?.theme) {
            const userTheme = user.preferences.theme
            setTheme(userTheme)
            localStorage.setItem('theme', userTheme)
            document.documentElement.setAttribute('data-theme', userTheme)
        }
    }, [user])

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    const changeTheme = async (newTheme) => {
        setTheme(newTheme)

        if (user) {
            try {
                await updateTheme(newTheme)
                console.log(`Theme '${newTheme}' synced to backend`)
            } catch (error) {
                console.error('Failed to sync theme to backend:', error)
            }
        }
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme: changeTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}