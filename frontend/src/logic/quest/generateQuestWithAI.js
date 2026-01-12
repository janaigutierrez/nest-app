import createQuest from './createQuest.js'

/**
 * Generate a quest with AI assistance (wrapper for createQuest)
 * @param {string} title - Quest title
 * @param {string} difficulty - Quest difficulty
 * @returns {Promise<Object>} Created quest
 */
const generateQuestWithAI = (title, difficulty = 'STANDARD') => {
    return createQuest({
        title,
        mode: 'ai',
        difficulty
    })
}

export default generateQuestWithAI