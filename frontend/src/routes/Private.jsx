import { Routes, Route } from "react-router-dom"
import { QuestProvider } from "../context/QuestContext"
import Header from "../components/common/Header"
import NotFound from "./NotFound"
import Dashboard from "../pages/private/Dashboard"
import MyQuests from "../pages/private/MyQuests"
import Stats from "../pages/private/Stats"
import Profile from "../pages/private/Profile"

const Private = ({ setRefreshHeader, logout }) => {
    return (
        <QuestProvider>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/my-quests" element={<MyQuests />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/profile" element={<Profile updateHeader={setRefreshHeader} />} />
                <Route path="/*" element={<NotFound />} />
            </Routes>
        </QuestProvider>
    )
}

export default Private