import { StatDetector } from './statDetector.js'
import { XPCalculator } from './XPCalculator.js'

export class QuestEnhancer {
    static enhanceManual(questData) {
        const enhanced = { ...questData }

        if (!enhanced.targetStat) {
            enhanced.targetStat = StatDetector.detectQuestStat(
                `${enhanced.title} ${enhanced.description || ''}`
            )
        }

        if (enhanced.targetStat) {
            const baseXP = XPCalculator.getBaseXP(enhanced.difficulty)
            enhanced.experienceReward = XPCalculator.calculateQuestXP(
                baseXP, enhanced.isDaily || false, enhanced.targetStat
            )
        }

        enhanced.enhancedBy = 'manual_enhancer'
        enhanced.enhancedAt = new Date()

        return enhanced
    }

    static enhanceAI(aiQuest, originalPrompt) {
        const enhanced = { ...aiQuest }

        if (!enhanced.title || enhanced.title.length < 3) {
            enhanced.title = `Misión: ${originalPrompt}`
        }

        if (!enhanced.description) {
            enhanced.description = `Completa esta importante misión: ${originalPrompt}`
        }

        const validDifficulties = ['QUICK', 'STANDARD', 'LONG', 'EPIC']
        if (!validDifficulties.includes(enhanced.difficulty)) {
            enhanced.difficulty = 'STANDARD'
        }

        if (!enhanced.tags || !Array.isArray(enhanced.tags)) {
            enhanced.tags = ['ai-generated']
        }

        enhanced.enhancedBy = 'ai_enhancer'
        enhanced.enhancedAt = new Date()

        return enhanced
    }
}