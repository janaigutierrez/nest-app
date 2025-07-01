import { QuestGenerator } from './questGenerator.js'
import { StatDetector } from './statDetector.js'
import { QuestEnhancer } from './questEnhancer.js'
import { XPCalculator } from './XPCalculator.js'
import { FallbackSystem } from './fallbackSystem.js'

export class AIService {
    /**
     * Generate quest using AI
     * @param {string} userPrompt - User input for quest generation
     * @param {string|null} preferredStat - Optional preferred stat
     * @param {string} difficulty - Quest difficulty (QUICK, STANDARD, LONG, EPIC)
     * @returns {Promise<Object>} Generated quest object
     */

    static async generateQuest(userPrompt, preferredStat = null, difficulty = 'STANDARD') {
        try {
            const generator = new QuestGenerator()
            return await generator.generateQuest(userPrompt, preferredStat, difficulty)
        } catch (error) {
            console.error('AIService.generateQuest failed:', error.message)
            return FallbackSystem.generateQuest(userPrompt, preferredStat, difficulty)
        }
    }

    /**
     * Detect stat from quest description
     * @param {string} text - Text to analyze
     * @returns {string|null} Detected stat or null
     */
    static detectQuestStat(text) {
        return StatDetector.detectQuestStat(text)
    }

    /**
     * Enhance manual quest with auto-detection and XP calculation
     * @param {Object} questData - Raw quest data
     * @returns {Object} Enhanced quest data
     */
    static enhanceManualQuest(questData) {
        return QuestEnhancer.enhanceManual(questData)
    }

    /**
     * Calculate quest XP with bonuses
     * @param {number} baseXP - Base XP amount
     * @param {boolean} isDaily - Daily quest bonus
     * @param {string|null} targetStat - Stat bonus
     * @returns {number} Calculated XP
     */
    static calculateQuestXP(baseXP, isDaily = false, targetStat = null) {
        return XPCalculator.calculateQuestXP(baseXP, isDaily, targetStat)
    }

    /**
     * Get base XP for difficulty level
     * @param {string} difficulty - Quest difficulty
     * @returns {number} Base XP amount
     */
    static getBaseXP(difficulty) {
        return XPCalculator.getBaseXP(difficulty)
    }

    /**
     * Generate quest using only fallback system (for testing)
     * @param {string} userPrompt - User input
     * @param {string|null} preferredStat - Preferred stat
     * @param {string} difficulty - Quest difficulty
     * @returns {Object} Generated quest
     */
    static generateFallbackQuest(userPrompt, preferredStat = null, difficulty = 'STANDARD') {
        return FallbackSystem.generateQuest(userPrompt, preferredStat, difficulty)
    }
}

/**
 * Default export for backward compatibility
 */
export default AIService

/**
 * Named exports for direct access to subsystems (advanced usage)
 */
export {
    QuestGenerator,
    StatDetector,
    QuestEnhancer,
    XPCalculator,
    FallbackSystem
}