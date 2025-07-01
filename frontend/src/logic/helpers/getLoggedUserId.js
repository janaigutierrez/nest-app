const getLoggedUserId = () => {
    const token = localStorage.getItem('authToken')
    if (!token) return null

    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const currentTime = Math.floor(Date.now() / 1000)

        if (payload.exp && payload.exp < currentTime) {
            localStorage.removeItem('authToken')
            return null
        }

        return token
    } catch {
        localStorage.removeItem('authToken')
        return null
    }
}

export const isAuthenticated = () => {
    return getLoggedUserId() !== null
}

export const setAuthToken = (token) => {
    localStorage.setItem('authToken', token)
}

export const clearAuthToken = () => {
    localStorage.removeItem('authToken')
}

export default getLoggedUserId