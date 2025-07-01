import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QuestProvider } from '../context/QuestContext'

import Dashboard from '../pages/private/Dashboard'
import MyQuests from '../pages/private/MyQuests'
import Stats from '../pages/private/Stats'
import Profile from '../pages/private/Profile'

function AppRouter() {
    return (
        <Router>
            <QuestProvider>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/my-quests" element={<MyQuests />} />
                    <Route path="/stats" element={<Stats />} />
                    <Route path="/profile" element={<Profile />} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </QuestProvider>
        </Router>
    )
}

export default AppRouter