const logout = async () => {
    const token = localStorage.getItem('authToken')

    localStorage.removeItem('authToken')

    if (token) {
        try {
            fetch(`${import.meta.env.VITE_API_URL}/api/users/logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            }).catch(() => { })
        } catch {
            // Silently handle logout errors
        }
    }

    return true
}

export default logout