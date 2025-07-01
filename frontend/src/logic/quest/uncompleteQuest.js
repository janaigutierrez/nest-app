import { errors, validator } from "common"
import getLoggedUserId from "../helpers/getLoggedUserId"

const uncompleteQuest = (questId) => {
    validator.id(questId, 'quest ID')

    const id = getLoggedUserId()

    if (!id) {
        throw new errors.AuthError('user not logged in')
    }

    return fetch(`${import.meta.env.VITE_API_URL}/api/quests/${questId}/uncomplete`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${id}`,
            'Content-Type': 'application/json'
        }
    })
        .catch(error => { throw new errors.ConnectionError(error.message) })
        .then((response) => {
            if (response.status === 200) {
                return response.json()
            } else {
                return response.json().then(body => {
                    throw new errors[body.name](body.message)
                })
            }
        })
}

export default uncompleteQuest