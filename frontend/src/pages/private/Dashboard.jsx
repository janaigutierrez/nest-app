import Header from '../../components/common/Header'
import Avatar from '../../components/common/Avatar'
import { useAuth } from '../../context/AuthContext'
import { useQuests } from '../../context/QuestContext'
import QuestModal from '../../components/quest/QuestModal'
import { rules } from 'common'

function Dashboard() {
  const { user, loading } = useAuth()
  const { openQuestModal, closeQuestModal, isQuestModalOpen, addQuest } = useQuests()

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your adventure...</p>
        </div>
      </div>
    )
  }

  const currentLevel = user.currentLevel || 1
  const currentXP = user.totalXP || 0
  const xpToNext = rules.XP_RULES.getXPToNextLevel(currentXP)
  const isMaxLevel = rules.XP_RULES.isMaxLevel(currentLevel)

  let progressPercentage = 0
  if (!isMaxLevel && currentLevel < rules.XP_RULES.BASE_LEVELS.length - 1) {
    const currentLevelXP = rules.XP_RULES.BASE_LEVELS[currentLevel] || 0
    const nextLevelXP = rules.XP_RULES.BASE_LEVELS[currentLevel + 1] || 0

    const xpInCurrentLevel = currentXP - currentLevelXP
    const xpNeededForLevel = nextLevelXP - currentLevelXP

    if (xpNeededForLevel > 0) {
      progressPercentage = Math.max(0, Math.min(100, (xpInCurrentLevel / xpNeededForLevel) * 100))
    }

  } else {
    progressPercentage = 100
  }

  // 🚀 NUEVO: Calcular stats con sistema híbrido
  const getStatInfo = (statName) => {
    const points = user.stats?.[statName] || 0
    const level = rules.STAT_RULES.getStatLevel(points)
    const pointsToNext = rules.STAT_RULES.getPointsToNextStatLevel(points)
    const progress = rules.STAT_RULES.getStatLevelProgress(points)
    const isMaxLevel = rules.STAT_RULES.isMaxStatLevel(level)

    return { points, level, pointsToNext, progress, isMaxLevel }
  }

  const stats = [
    { key: 'STRENGTH', name: 'Strength', emoji: '💪', color: 'red' },
    { key: 'DEXTERITY', name: 'Dexterity', emoji: '🎯', color: 'green' },
    { key: 'WISDOM', name: 'Wisdom', emoji: '🧠', color: 'blue' },
    { key: 'CHARISMA', name: 'Charisma', emoji: '✨', color: 'purple' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="w-52 h-52 mx-auto rounded-full bg-white dark:bg-gray-800 border-4 border-purple-300 dark:border-purple-600 shadow-lg flex items-center justify-center transition-colors">
              <Avatar user={user} size="large" />
            </div>
            <h2 className="text-2xl font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100">{user.username}</h2>
            <p className="text-gray-600 dark:text-gray-400">Level {user.currentLevel || user.level || 1} Adventurer</p>
          </div>

          <div className="max-w-md mx-auto mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Level {currentLevel}</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {isMaxLevel ? 'MAX LEVEL' : `Level ${currentLevel + 1}`}
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-purple-500 dark:bg-purple-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">{currentXP} XP</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isMaxLevel ? 'Max Level Reached!' : `${xpToNext} XP to go`}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {stats.map(({ key, name, emoji, color }) => {
            const statInfo = getStatInfo(key)
            const colorClasses = {
              red: 'text-red-600 dark:text-red-400',
              green: 'text-green-600 dark:text-green-400',
              blue: 'text-blue-600 dark:text-blue-400',
              purple: 'text-purple-600 dark:text-purple-400'
            }
            const bgClasses = {
              red: 'bg-red-500 dark:bg-red-400',
              green: 'bg-green-500 dark:bg-green-400',
              blue: 'bg-blue-500 dark:bg-blue-400',
              purple: 'bg-purple-500 dark:bg-purple-400'
            }

            return (
              <div key={key} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{emoji}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{name}</span>
                  </div>
                  <span className={`text-sm font-bold ${colorClasses[color]}`}>
                    Level {statInfo.level}
                  </span>
                </div>

                {!statInfo.isMaxLevel ? (
                  <>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${bgClasses[color]}`}
                        style={{ width: `${statInfo.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{statInfo.points} points</span>
                      <span>{statInfo.pointsToNext} to Level {statInfo.level + 1}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className={`text-sm font-bold ${colorClasses[color]} mb-1`}>
                      ⭐ MAX LEVEL ⭐
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {statInfo.points} points mastered
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>

      <button
        onClick={openQuestModal}
        className="fixed bottom-6 left-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center text-2xl z-50"
        title="Create new quest"
      >
        +
      </button>

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

export default Dashboard