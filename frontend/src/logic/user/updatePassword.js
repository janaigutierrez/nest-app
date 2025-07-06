import { errors, validator } from "common"
import getLoggedUserId from "../helpers/getLoggedUserId"

const updatePassword = ({ currentPassword, newPassword, confirmPassword }) => {
    validator.password(currentPassword, 'current password')
    validator.password(newPassword, 'new password')

    if (newPassword !== confirmPassword) {
        throw new errors.ValidationError('New passwords do not match')
    }

    if (currentPassword === newPassword) {
        throw new errors.ValidationError('New password must be different from current password')
    }

    const id = getLoggedUserId()

    if (!id) {
        throw new errors.AuthError('user not logged in')
    }

    return fetch(`${import.meta.env.VITE_API_URL}/api/users/change-password`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${id}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            currentPassword,
            newPassword
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

export default updatePassword