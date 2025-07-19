// src/logic/quest/questGenerator.js
// Frontend logic for quest generation

import { detectRitualCategory, calculateSmartXP, formatCategoryName } from '../../utils/aiDetection'

export class FrontendQuestGenerator {
    constructor() {
        this.apiBaseUrl = '/api/quests'
    }

    // Manual Quest Generation (Frontend logic)
    async generateQuestManually(userInput) {
        try {
            // Basic manual quest structure
            const quest = {
                title: this.cleanTitle(userInput),
                description: `Complete: ${userInput}`,
                targetStat: this.detectStat(userInput),
                difficulty: this.calculateDifficulty(userInput),
                experienceReward: this.calculateXP(userInput),
                generatedBy: 'manual',
                tags: ['manual']
            }

            return quest
        } catch (error) {
            throw new Error(`Manual generation failed: ${error.message}`)
        }
    }

    // AI Quest Generation (Frontend logic + API call)
    async generateQuestWithAI(userInput) {
        try {
            // Try smart detection first
            const detection = detectRitualCategory(userInput)

            if (!detection.shouldUseFallback && detection.match) {
                // Use smart detection for single quest
                const tasks = [userInput.trim()]
                const xpCalculation = calculateSmartXP(tasks, detection.match)
                const calculation = xpCalculation[0]

                return {
                    title: this.enhanceTitle(userInput, detection.match.category),
                    description: `AI-enhanced ${formatCategoryName(detection.match.category).toLowerCase()} quest`,
                    targetStat: calculation.stat,
                    difficulty: this.difficultyFromMinutes(calculation.minutes),
                    experienceReward: calculation.xp,
                    generatedBy: 'ai-smart',
                    category: detection.match.category,
                    confidence: detection.match.confidence,
                    tags: ['ai-enhanced', 'smart-detection']
                }
            } else {
                // Fallback to backend AI
                const response = await fetch(`${this.apiBaseUrl}/generate-ai`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ prompt: userInput })
                })

                if (!response.ok) {
                    throw new Error(`AI generation failed: ${response.statusText}`)
                }

                const aiQuest = await response.json()
                return {
                    ...aiQuest.data.quest,
                    generatedBy: 'ai-backend',
                    tags: ['ai-generated', 'backend-ai']
                }
            }
        } catch (error) {
            // Final fallback to manual
            console.warn('AI generation failed, falling back to manual:', error.message)
            return this.generateQuestManually(userInput)
        }
    }

    // Helper Methods
    cleanTitle(input) {
        // Clean and format title
        let title = input.trim()

        // Capitalize first letter
        title = title.charAt(0).toUpperCase() + title.slice(1)

        // Limit length
        if (title.length > 50) {
            title = title.substring(0, 47) + '...'
        }

        return title
    }

    enhanceTitle(input, category) {
        const prefixes = {
            WORKOUT: ['💪 ', '🏋️ ', '🔥 '],
            STUDY: ['📚 ', '🧠 ', '📖 '],
            SHOPPING: ['🛒 ', '🛍️ ', '📦 '],
            FOOD_PREP: ['🍳 ', '👨‍🍳 ', '🥘 '],
            CLEANING: ['🧹 ', '✨ ', '🏠 '],
            WORK: ['💼 ', '⚡ ', '🎯 '],
            PERSONAL_CARE: ['🧘 ', '✨ ', '🌟 ']
        }

        const categoryPrefixes = prefixes[category] || ['🎯 ']
        const randomPrefix = categoryPrefixes[Math.floor(Math.random() * categoryPrefixes.length)]

        return randomPrefix + this.cleanTitle(input)
    }

    detectStat(input) {
        const text = input.toLowerCase()

        // Strength keywords
        if (/gym|ejercicio|deporte|entrenar|músculo|correr|workout|exercise|lift|strength/i.test(text)) {
            return 'STRENGTH'
        }

        // Dexterity keywords  
        if (/cocinar|arte|música|crear|craft|cook|art|music|create|dexterity/i.test(text)) {
            return 'DEXTERITY'
        }

        // Wisdom keywords
        if (/estudiar|leer|aprender|examen|curso|libro|study|read|learn|book|wisdom/i.test(text)) {
            return 'WISDOM'
        }

        // Charisma keywords
        if (/hablar|social|reunión|llamar|presentar|talk|social|meeting|call|present|charisma/i.test(text)) {
            return 'CHARISMA'
        }

        return null
    }

    calculateDifficulty(input) {
        const text = input.toLowerCase()
        const length = input.length

        // Difficulty indicators
        if (/quick|easy|simple|rápido|fácil|simple/i.test(text) || length < 20) {
            return 'Easy'
        }

        if (/hard|difficult|challenge|difícil|desafío|reto/i.test(text) || length > 100) {
            return 'Hard'
        }

        if (/epic|massive|huge|épico|masivo|enorme/i.test(text) || length > 200) {
            return 'Epic'
        }

        return 'Medium'
    }

    difficultyFromMinutes(minutes) {
        if (minutes < 10) return 'Easy'
        if (minutes < 30) return 'Medium'
        if (minutes < 60) return 'Hard'
        return 'Epic'
    }

    calculateXP(input) {
        const difficulty = this.calculateDifficulty(input)
        const stat = this.detectStat(input)

        const baseXP = {
            'Easy': 5,
            'Medium': 10,
            'Hard': 15,
            'Epic': 25
        }

        let xp = baseXP[difficulty] || 10

        // Stat bonus
        if (stat) {
            xp += 5
        }

        return xp
    }
}

// Export singleton instance
export const questGenerator = new FrontendQuestGenerator()