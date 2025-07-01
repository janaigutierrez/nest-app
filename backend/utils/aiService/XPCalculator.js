import { QUEST_REWARDS } from '../../../common/constants/gameRules.js'

export class XPCalculator {
    static getBaseXP(difficulty) {
        return QUEST_REWARDS.BASE_XP[difficulty] || QUEST_REWARDS.BASE_XP.STANDARD
    }

    static calculateQuestXP(baseXP, isDaily = false, targetStat = null) {
        let xp = baseXP

        if (isDaily) xp += Math.floor(baseXP * 0.2) // +20%
        if (targetStat) xp += 10 // +10 stat bonus

        return xp
    }
}