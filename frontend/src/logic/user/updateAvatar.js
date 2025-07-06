import { errors } from "common"
import getLoggedUserId from "../helpers/getLoggedUserId"

const updateAvatar = (equippedSet) => {
    const validSets = ['base', 'warrior', 'scholar', 'leader', 'artisan']

    if (!validSets.includes(equippedSet)) {
        throw new errors.ValidationError(`Invalid avatar set. Valid sets: ${validSets.join(', ')}`)
    }

    const id = getLoggedUserId()

    if (!id) {
        throw new errors.AuthError('user not logged in')
    }

    return fetch(`${import.meta.env.VITE_API_URL}/api/users/avatar`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${id}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            equippedSet
        })
    })
        .catch(error => { throw new errors.ConnectionError(error.message) })
        .then((response) => {
            if (response.status === 200) {
                return response.json().then(data => data)
            } else {
                return response.json().then(body => {
                    throw new errors[body.name](body.message)
                })
            }
        })
}

export default updateAvatar