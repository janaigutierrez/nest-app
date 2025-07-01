import { StatDetector } from './statDetector.js'
import { XPCalculator } from './xpCalculator.js'
import { LORE, DIFFICULTY } from './rpgLore.js'

export class FallbackSystem {
    static generateQuest(userPrompt, preferredStat = null, difficulty = 'STANDARD') {
        const targetStat = preferredStat || StatDetector.detectQuestStat(userPrompt)

        const title = this.generateTitle(userPrompt, targetStat, difficulty)
        const description = this.generateDescription(userPrompt, targetStat)

        const baseXP = XPCalculator.getBaseXP(difficulty)
        const experienceReward = XPCalculator.calculateQuestXP(baseXP, false, targetStat) + 5

        return {
            title,
            description,
            targetStat,
            difficulty,
            isDaily: false,
            experienceReward,
            epicElements: this.generateEpicElements(targetStat),
            tags: ['fallback', 'epic'],
            generatedBy: 'fallback',
            aiMetadata: {
                prompt: userPrompt,
                model: 'fallback-system',
                generatedAt: new Date()
            }
        }
    }

    static generateTitle(userPrompt, stat, difficulty) {
        const scale = DIFFICULTY[difficulty] || DIFFICULTY.STANDARD

        if (stat && LORE[stat]) {
            const lore = LORE[stat]
            const action = this.random(lore.actions)
            const place = this.random(lore.places)
            return `${scale.prefix} ${action} en el ${place}`
        }

        return `${scale.prefix} ${scale.intensity}: ${userPrompt}`
    }

    static generateDescription(userPrompt, stat) {
        if (stat && LORE[stat]) {
            const lore = LORE[stat]
            const action = this.random(lore.actions)
            const enemy = this.random(lore.enemies)
            const weapon = this.random(lore.weapons)

            return `Es hora de ${action} en el ${lore.realm.toLowerCase()}. Supera la ${enemy} usando tu ${weapon}.`
        }

        return `Completa esta importante misión: ${userPrompt}. Tu determinación te llevará al éxito.`
    }

    static generateEpicElements(stat) {
        if (stat && LORE[stat]) {
            const lore = LORE[stat]
            return {
                realm: lore.realm,
                enemy: this.random(lore.enemies),
                weapon: this.random(lore.weapons),
                reward: "experiencia valiosa"
            }
        }

        return {
            realm: "Reino Misterioso",
            enemy: "pereza",
            weapon: "determinación",
            reward: "satisfacción personal"
        }
    }

    static random(array) {
        return array[Math.floor(Math.random() * array.length)]
    }
}