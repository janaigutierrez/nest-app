import { useState } from 'react'
import Header from '../../components/common/Header'
import DailyAgendaView from '../../components/common/DailyAgendaView'
import WeeklyAgendaView from '../../components/common/WeeklyAgendaView'
import QuestModal from '../../components/quest/QuestModal'
import { useQuests } from '../../context/QuestContext'

function Agenda() {
    const { isQuestModalOpen, closeQuestModal } = useQuests()
    const [viewMode, setViewMode] = useState('daily') // 'daily' or 'weekly'

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Quest Agenda
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Plan your quests and manage your time effectively
                            </p>
                        </div>
                        
                        {/* View Toggle */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('daily')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                    viewMode === 'daily'
                                        ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            >
                                📅 Daily
                            </button>
                            <button
                                onClick={() => setViewMode('weekly')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                    viewMode === 'weekly'
                                        ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            >
                                🗓️ Weekly
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-200px)]">
                    {viewMode === 'daily' ? <DailyAgendaView /> : <WeeklyAgendaView />}
                </div>
            </main>

            {/* Quest Modal */}
            {isQuestModalOpen && (
                <QuestModal
                    isOpen={isQuestModalOpen}
                    onClose={closeQuestModal}
                />
            )}
        </div>
    )
}

export default Agenda