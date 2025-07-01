import { useState, useEffect } from "react"
import logics from "./logic"
import { useLocation, useNavigate } from "react-router-dom"
import Private from "./routes/Private"
import Public from "./routes/Public"
import { isAuthenticated } from "./logic/helpers/getLoggedUserId"
import { NotificationProvider } from './context/NotificationContext'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import './styles/themes.css'

const App = () => {
    const [refreshHeader, setRefreshHeader] = useState(Date.now())
    const [isUserLogged, setIsUserLogged] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    const onLogoutClick = () => {
        logics.user.logoutUser()
        setIsUserLogged(false)
        setRefreshHeader(Date.now())
        navigate("/")
    }

    useEffect(() => {
        const checkAuth = () => {
            const isAuth = isAuthenticated()
            setIsUserLogged(isAuth)
        }
        checkAuth()
    }, [location.pathname, refreshHeader])

    return (
        <ThemeProvider>
            <NotificationProvider>
                {isUserLogged ? (
                    <Private
                        setRefreshHeader={setRefreshHeader}
                        logout={onLogoutClick}
                    />
                ) : (
                    <>
                        <Public setRefreshHeader={setRefreshHeader} />
                    </>
                )}
            </NotificationProvider>
        </ThemeProvider>

    )
}

export default App