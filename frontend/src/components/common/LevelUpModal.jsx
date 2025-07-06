import { useQuests } from '../../context/QuestContext'

const LevelUpModal = () => {
    const { showLevelUpModal, levelUpData, closeLevelUpModal } = useQuests()

    if (!showLevelUpModal || !levelUpData) return null

    const { oldLevel, newLevel, newUnlocks = [] } = levelUpData

    const getUnlockEmoji = (unlock) => {
        const emojiMap = {
            'Dark Mode': '🌙',
            'AI Quest Generation': '🤖',
            'Streak Counter': '🔥',
            'Library Theme': '📚',
            'Mystic Theme': '🔮',
            'Medieval Theme': '🏰',
            'Warrior Theme': '⚔️',
            'Academy Theme': '🏛️',
            'Avatar Warrior': '👨‍⚔️',
            'Avatar Scholar': '👨‍🎓',
            'Avatar Leader': '👑',
            'Avatar Artisan': '👨‍🎨'
        }
        return emojiMap[unlock] || '✨'
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full text-center relative overflow-hidden">

                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 opacity-10 animate-pulse"></div>

                <div className="relative z-10">
                    <div className="text-6xl mb-4 animate-bounce">🎉</div>

                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        LEVEL UP!
                    </h2>

                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                                Level {oldLevel}
                            </div>
                        </div>

                        <div className="text-3xl text-purple-500 animate-pulse">
                            ➜
                        </div>

                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                Level {newLevel}
                            </div>
                        </div>
                    </div>

                    {newUnlocks.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                🔓 New Unlocks:
                            </h3>
                            <div className="space-y-2">
                                {newUnlocks.map((unlock, index) => (
                                    <div
                                        key={index}
                                        className="bg-purple-50 dark:bg-purple-900 p-3 rounded-lg border border-purple-200 dark:border-purple-700"
                                    >
                                        <div className="font-medium text-purple-800 dark:text-purple-200">
                                            {getUnlockEmoji(unlock)} {unlock}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={closeLevelUpModal}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-full transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                        Continue Adventure! 🚀
                    </button>
                </div>
            </div>
        </div>
    )
}

export default LevelUpModal