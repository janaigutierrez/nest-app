import { errors, validator } from "common"

const register = ({ username, email, password, confirmPassword }) => {
    validator.username(username, 'username')
    validator.email(email, 'email')
    validator.password(password, 'password')

    if (password !== confirmPassword) {
        throw new errors.ValidationError('Passwords do not match')
    }

    return fetch(`${import.meta.env.VITE_API_URL}/api/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password
        })
    })
        .catch(error => { throw new errors.ConnectionError(error.message) })
        .then((response) => {
            if (response.status === 201) {
                return response.json().then(data => {
                    localStorage.setItem('authToken', data.data.token)
                    return data.data
                })
            } else {
                return response.json().then(body => {
                    const ErrorClass = errors[body.name] || errors.ServerError
                    throw new ErrorClass(body.message)
                })
            }
        })
}

export default register