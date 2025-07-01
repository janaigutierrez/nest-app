import { STAT_RULES } from '../../../common/constants/gameRules.js'

export class StatDetector {
    static detectQuestStat(text) {
        // Try gameRules first
        const gameRulesStat = STAT_RULES.detectStatFromDescription(text)
        if (gameRulesStat) return gameRulesStat

        // Simple fallback
        const lower = text.toLowerCase()

        if (/gym|ejercicio|deporte|entrenar|músculo|correr|caminar/.test(lower)) return 'STRENGTH'
        if (/arte|cocinar|música|crear|manualidad|dibujar|pintar/.test(lower)) return 'DEXTERITY'
        if (/estudiar|leer|aprender|examen|curso|libro|investigar/.test(lower)) return 'WISDOM'
        if (/hablar|social|reunión|llamar|presentar|conversar|conocer/.test(lower)) return 'CHARISMA'

        return null
    }
}