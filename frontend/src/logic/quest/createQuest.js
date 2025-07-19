import { errors, validator } from "common"
import getLoggedUserId from "../helpers/getLoggedUserId"

/**
 * Create a quest with backward compatibility
 * @param {Object} questData - Quest creation data
 * @param {string} questData.title - Quest title
 * @param {string} [questData.mode] - Creation mode: 'manual', 'ai', 'ritual'
 * @param {boolean} [questData.useAI] - Legacy parameter (deprecated, use mode instead)
 * @param {string} [questData.difficulty] - Quest difficulty
 * @param {Array} [questData.steps] - Steps for ritual mode
 * @returns {Promise<Object>} Created quest
 */
const createQuest = (questData) => {
    const { title, mode, useAI, difficulty = 'STANDARD', steps } = questData

    validator.text(title, 200, 3, 'quest title')
    validator.difficulty(difficulty, 'difficulty')

    const id = getLoggedUserId()

    if (!id) {
        throw new errors.AuthError('user not logged in')
    }

    // Determine final mode (with backward compatibility)
    let finalMode = mode
    if (!mode && useAI !== undefined) {
        finalMode = useAI ? 'ai' : 'manual'
    }
    if (!finalMode) {
        finalMode = 'manual' // Default
    }

    // Validate mode
    const validModes = ['manual', 'ai', 'ritual']
    if (!validModes.includes(finalMode)) {
        throw new errors.ValidationError(`Invalid mode: ${finalMode}. Must be one of: ${validModes.join(', ')}`)
    }

    // Prepare request body
    const requestBody = {
        title: title.trim(),
        mode: finalMode,
        difficulty
    }

    // Add steps for ritual mode
    if (finalMode === 'ritual' && steps) {
        requestBody.steps = steps
    }

    // Add legacy useAI for backward compatibility (optional)
    if (useAI !== undefined) {
        requestBody.useAI = useAI
    }

    return fetch(`${import.meta.env.VITE_API_URL}/api/quests/create`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${id}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
        .catch(error => { throw new errors.ConnectionError(error.message) })
        .then((response) => {
            if (response.status === 201) {
                return response.json().then(data => data.data.quest)
            } else {
                return response.json().then(body => {
                    const errorMessage = body.error || body.message || 'Unknown error occurred'

                    const ErrorClass = errors[body.name] || errors.ServerError
                    throw new ErrorClass(errorMessage)
                })
            }
        })
}

export default createQuest