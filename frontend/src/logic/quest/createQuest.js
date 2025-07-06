import { errors, validator } from "common"
import getLoggedUserId from "../helpers/getLoggedUserId"

const createQuest = ({ title, useAI = false, difficulty = 'STANDARD' }) => {
    validator.text(title, 200, 3, 'quest title')
    validator.difficulty(difficulty, 'difficulty')

    const id = getLoggedUserId()

    if (!id) {
        throw new errors.AuthError('user not logged in')
    }

    return fetch(`${import.meta.env.VITE_API_URL}/api/quests/create`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${id}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: title.trim(),
            useAI,
            difficulty
        })
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