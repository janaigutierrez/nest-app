import { errors, validator } from "common"
import getLoggedUserId from "../helpers/getLoggedUserId"

const getQuestsByDate = (date) => {
    if (!date) {
        throw new errors.ValidationError('Date is required')
    }

    const id = getLoggedUserId()

    if (!id) {
        throw new errors.AuthError('user not logged in')
    }

    let dateStr
    if (date instanceof Date) {
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        dateStr = `${year}-${month}-${day}`
    } else {
        dateStr = date
    }

    console.log('🔧 Formatted date for API:', dateStr)

    return fetch(`${import.meta.env.VITE_API_URL}/api/quests/by-date?date=${dateStr}`, {
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
                    const errorMessage = body.error || body.message || 'Unknown error occurred'
                    const ErrorClass = errors[body.name] || errors.ServerError
                    throw new ErrorClass(errorMessage)
                })
            }
        })
}

export default getQuestsByDate