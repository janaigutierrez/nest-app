import { errors } from "common"
import getLoggedUserId from "../helpers/getLoggedUserId"

const updateQuest = (questId, updateData) => {
    const id = getLoggedUserId()

    if (!id) {
        throw new errors.AuthError('user not logged in')
    }

    if (!questId) {
        throw new errors.ValidationError('Quest ID is required')
    }

    return fetch(`${import.meta.env.VITE_API_URL}/api/quests/${questId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${id}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    })
        .catch(error => { throw new errors.ConnectionError(error.message) })
        .then((response) => {
            if (response.status === 200) {
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

export default updateQuest