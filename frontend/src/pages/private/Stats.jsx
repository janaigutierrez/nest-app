import Header from '../../components/common/Header'
import { useAuth } from '../../context/AuthContext'
import { useQuests } from '../../context/QuestContext'

function Stats() {
    const { user } = useAuth()
    const { quests } = useQuests()

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-pulse text-gray-600 dark:text-gray-300">Loading stats...</div>
            </div>
        )
    }

    const totalQuests = quests.length
    const completedQuests = quests.filter(q => q.isCompleted).length
    // const totalXP = quests.reduce((sum, q) => sum + (q.experienceReward || 0), 0) // TODO: Use this for detailed stats
    const completionRate = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-4xl">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Stats</h1>
                    <p className="text-gray-600 dark:text-gray-400">Your progress overview</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center transition-colors">
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">{totalQuests}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Quests</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center transition-colors">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{completedQuests}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center transition-colors">
                        <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">{user.totalXP || 0}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total XP</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center transition-colors">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{completionRate}%</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                    </div>
                </div>

                {totalQuests === 0 && (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center transition-colors">
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">No stats yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Create and complete quests to see your progress</p>
                    </div>
                )}
            </main>
        </div>
    )
}

export default Stats