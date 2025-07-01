import { rules } from 'common'


export const calculateLevel = (totalXP) => {
    return rules.XP_RULES.getLevelFromXP(totalXP)
}

export const calculateXPToNextLevel = (totalXP) => {
    return rules.XP_RULES.getXPToNextLevel(totalXP)
}

export const calculateStatLevel = (statPoints) => {
    return rules.STAT_RULES.getStatLevel(statPoints)
}

export const checkLevelUp = (oldXP, newXP) => {
    const oldLevel = calculateLevel(oldXP)
    const newLevel = calculateLevel(newXP)

    return {
        leveled: newLevel > oldLevel,
        oldLevel,
        newLevel
    }
}