import { errors, validator } from "common"
import getLoggedUserId from "../helpers/getLoggedUserId"

const updateEmail = (newEmail) => {
    validator.email(newEmail, 'email')

    const id = getLoggedUserId()

    if (!id) {
        throw new errors.AuthError('user not logged in')
    }

    return fetch(`${import.meta.env.VITE_API_URL}/api/users/email`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${id}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: newEmail.trim().toLowerCase()
        })
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

export default updateEmail