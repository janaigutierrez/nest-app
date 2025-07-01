import { errors } from "common"
import getLoggedUserId from "../helpers/getLoggedUserId"

const getUserProfile = () => {
    const token = getLoggedUserId()
    if (!token) {
        throw new errors.AuthError('user not logged in')
    }

    const payload = JSON.parse(atob(token.split('.')[1]))
    const userId = payload.userId
    return fetch(`${import.meta.env.VITE_API_URL}/api/users/profile/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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

export default getUserProfile