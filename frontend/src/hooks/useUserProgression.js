import { rules } from 'common'

export const useUserProgression = (user) => {
    if (!user) {
        return {
            currentLevel: 1,
            currentXP: 0,
            xpToNext: 100,
            isMaxLevel: false,
            progressPercentage: 0
        }
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

    return { currentLevel, currentXP, xpToNext, isMaxLevel, progressPercentage }
}