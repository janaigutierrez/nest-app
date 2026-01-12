import createQuest from './createQuest.js'

/**
 * Create a ritual quest with steps (wrapper for createQuest)
 * @param {string} title - Ritual title
 * @param {Array} steps - Array of ritual steps
 * @param {string} difficulty - Quest difficulty
 * @returns {Promise<Object>} Created ritual quest
 */
const createRitual = (title, steps, difficulty = 'STANDARD') => {
    return createQuest({
        title,
        mode: 'ritual',
        difficulty,
        steps
    })
}

export default createRitual