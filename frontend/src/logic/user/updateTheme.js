import { errors } from "common"
import getLoggedUserId from "../helpers/getLoggedUserId"

const updateTheme = (theme) => {
    const validThemes = ['default', 'dark', 'library', 'mystic', 'medieval', 'warrior', 'academy']

    if (!validThemes.includes(theme)) {
        throw new errors.ValidationError(`Invalid theme. Valid themes: ${validThemes.join(', ')}`)
    }

    const id = getLoggedUserId()

    if (!id) {
        throw new errors.AuthError('user not logged in')
    }

    return fetch(`${import.meta.env.VITE_API_URL}/api/users/theme`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${id}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            theme
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

export default updateTheme