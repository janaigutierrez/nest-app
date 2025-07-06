import { useState, useEffect } from "react"
import logics from "./logic"
import { useLocation, useNavigate } from "react-router-dom"
import Private from "./routes/Private"
import Public from "./routes/Public"
import { isAuthenticated } from "./logic/helpers/getLoggedUserId"
import LevelUpModal from './components/common/LevelUpModal'
import './index.css'
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
        <>
            {isUserLogged ? (
                <Private
                    setRefreshHeader={setRefreshHeader}
                    logout={onLogoutClick}
                />
            ) : (
                <Public setRefreshHeader={setRefreshHeader} />
            )}

            {isUserLogged && <LevelUpModal />}
        </>
    )
}

export default App