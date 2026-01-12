import Header from '../../components/common/Header'
import Avatar from '../../components/common/Avatar'
import RadialMenuSystem from '../../components/common/RadialMenuSystem'
import LevelProgress from '../../components/user/LevelProgress'
import StatsGrid from '../../components/user/StatsGrid'
import { useAuth } from '../../context/AuthContext'
import { useQuests } from '../../context/QuestContext'
import { useUserProgression } from '../../hooks/useUserProgression'
import QuestModal from '../../components/quest/QuestModal'
import RitualBuilder from '../../components/templates/ritual-wizard/RitualBuilder'
import logics from '../../logic'
import { useState } from 'react'

function Dashboard() {
  const { user, loading } = useAuth()
  const { openQuestModal, closeQuestModal, isQuestModalOpen, addQuest } = useQuests()
  const [isRitualBuilderOpen, setIsRitualBuilderOpen] = useState(false)
  const [selectedQuestMode, setSelectedQuestMode] = useState('manual') // 'manual' or 'ai'

  const userProgression = useUserProgression(user)

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

  const handleSaveRitual = async (ritualData) => {
    try {
      console.log('🎯 Ritual created:', ritualData)

      // Usar la nueva función createRitual
      await logics.quest.createRitual(ritualData)

      alert(`✅ Ritual "${ritualData.title}" created!`)
      setIsRitualBuilderOpen(false)
    } catch (error) {
      console.error('Error creating ritual:', error)
      alert(`❌ Error creating ritual: ${error.message}`)
    }
  }

  // Quest handlers with mode selection
  const handleQuickQuest = () => {
    setSelectedQuestMode('manual')
    openQuestModal()
  }

  const handleAIQuest = () => {
    setSelectedQuestMode('ai')
    openQuestModal()
  }

  const handleRitualQuest = () => {
    setIsRitualBuilderOpen(true)
  }

  // Check if AI features are unlocked
  const aiUnlocked = user?.level > 3

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* User Avatar Section */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="w-52 h-52 mx-auto rounded-full bg-white dark:bg-gray-800 border-4 border-purple-300 dark:border-purple-600 shadow-lg flex items-center justify-center transition-colors">
              <Avatar user={user} size="large" />
            </div>
            <h2 className="text-2xl font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100">{user.username}</h2>
            <p className="text-gray-600 dark:text-gray-400">Level {userProgression.currentLevel} Adventurer</p>

            {/* AI Unlock Status */}
            {!aiUnlocked && (
              <div className="mt-2">
                <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-3 py-1 rounded-full">
                  🔒 AI Features unlock at Level 4
                </span>
              </div>
            )}
          </div>

          <LevelProgress userProgression={userProgression} />
        </div>

        {/* Stats Grid */}
        <StatsGrid user={user} />
      </main>

      {/* Radial Menu System */}
      <RadialMenuSystem
        onQuickQuest={handleQuickQuest}
        onAIQuest={handleAIQuest}
        onRitualQuest={handleRitualQuest}
        aiUnlocked={aiUnlocked}
        userLevel={user?.level || 1}
      />

      {/* Modals */}
      {isQuestModalOpen && (
        <QuestModal
          isAI={selectedQuestMode === 'ai'}
          userLevel={user?.level || 1}
        />
      )}

      {isRitualBuilderOpen && (
        <RitualBuilder
          isOpen={isRitualBuilderOpen}
          onClose={() => setIsRitualBuilderOpen(false)}
          onSave={handleSaveRitual}
        />
      )}
    </div>
  )
}

export default Dashboard