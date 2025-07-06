import { errors } from "common"
import getLoggedUserId from "../helpers/getLoggedUserId"

const getAllQuests = () => {
    const id = getLoggedUserId()

    if (!id) {
        throw new errors.AuthError('user not logged in')
    }

    return fetch(`${import.meta.env.VITE_API_URL}/api/quests`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${id}`,
            'Content-Type': 'application/json'
        }
    })
        .catch(error => { throw new errors.ConnectionError(error.message) })
        .then((response) => {
            if (response.status === 200) {
                return response.json().then(data => data.data.quests)
            } else {
                return response.json().then(body => {
                    const ErrorClass = errors[body.name] || errors.ServerError
                    throw new ErrorClass(body.message)

                })
            }
        })
}

export default getAllQuests