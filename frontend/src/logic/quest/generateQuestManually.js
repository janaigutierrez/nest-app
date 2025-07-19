import createQuest from './createQuest.js'

/**
 * Generate a quest manually (wrapper for createQuest)
 * @param {string} title - Quest title
 * @param {string} difficulty - Quest difficulty
 * @returns {Promise<Object>} Created quest
 */
const generateQuestManually = (title, difficulty = 'STANDARD') => {
    return createQuest({
        title,
        mode: 'manual',
        difficulty
    })
}

export default generateQuestManually