import Header from '../../components/common/Header'
import DailyAgendaView from '../../components/common/DailyAgendaView'
import QuestModal from '../../components/quest/QuestModal'
import { useQuests } from '../../context/QuestContext'

function Agenda() {
    const { isQuestModalOpen, closeQuestModal } = useQuests()

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Daily Agenda
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Plan your quests and manage your time effectively
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-200px)]">
                    <DailyAgendaView />
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