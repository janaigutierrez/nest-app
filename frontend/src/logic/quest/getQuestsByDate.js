import { errors } from "common"
import getLoggedUserId from "../helpers/getLoggedUserId"

const getQuestsByDate = (dateStr) => {
    const token = getLoggedUserId()

    if (!token) {
        throw new errors.AuthError('user not logged in')
    }

    if (!dateStr) {
        throw new errors.ValidationError('date is required')
    }

    return fetch(`${import.meta.env.VITE_API_URL}/api/quests/by-date?date=${encodeURIComponent(dateStr)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .catch(error => { throw new errors.ConnectionError(error.message) })
        .then(response => {
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

export default getQuestsByDate
