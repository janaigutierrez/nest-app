import { errors, validator } from "common"
import getLoggedUserId from "../helpers/getLoggedUserId"

const updateQuest = (questId, updateData) => {
    validator.id(questId, 'quest ID')

    const allowedFields = ['title', 'description']
    const providedFields = Object.keys(updateData || {})
    const invalidFields = providedFields.filter(field => !allowedFields.includes(field))

    if (invalidFields.length > 0) {
        throw new errors.ValidationError(`Only title and description can be updated. Invalid fields: ${invalidFields.join(', ')}`)
    }

    if (!updateData || providedFields.length === 0) {
        throw new errors.ValidationError('At least title or description must be provided')
    }

    if (updateData.title !== undefined) {
        validator.text(updateData.title, 200, 3, 'quest title')
    }
    if (updateData.description !== undefined) {
        validator.text(updateData.description, 500, 0, 'quest description')
    }

    const id = getLoggedUserId()

    if (!id) {
        throw new errors.AuthError('user not logged in')
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
                return response.json()
            } else {
                return response.json().then(body => {
                    throw new errors[body.name](body.message)
                })
            }
        })
}

export default updateQuest