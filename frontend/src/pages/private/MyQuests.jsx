import Header from '../../components/common/Header'
import QuestModal from '../../components/quest/QuestModal'
import QuestList from '../../components/quest/QuestList'
import { useQuests } from '../../context/QuestContext'

function MyQuests() {
    const {
        quests,
        isQuestModalOpen,
        addQuest,
        openQuestModal,
        closeQuestModal
    } = useQuests()

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-4xl">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">My Quests</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your epic quests</p>
                </div>

                <QuestList
                    quests={quests}
                    onOpenModal={openQuestModal}
                />
            </main>

            {isQuestModalOpen && (
                <QuestModal
                    isOpen={isQuestModalOpen}
                    onClose={closeQuestModal}
                    onAddQuest={addQuest}
                />
            )}
        </div>
    )
}

export default MyQuests