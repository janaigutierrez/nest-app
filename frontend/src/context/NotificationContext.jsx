import { createContext, useContext, useState } from 'react'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([])

    const addNotification = (message, type = 'success') => {
        const id = Date.now() + Math.random()
        const notification = { id, message, type }

        setNotifications(prev => [...prev, notification])

        setTimeout(() => {
            removeNotification(id)
        }, 4000)
    }

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id))
    }

    const showSuccess = (message) => addNotification(message, 'success')
    const showError = (message) => addNotification(message, 'error')
    const showInfo = (message) => addNotification(message, 'info')

    return (
        <NotificationContext.Provider value={{
            notifications,
            showSuccess,
            showError,
            showInfo,
            removeNotification
        }}>
            {children}
            <NotificationContainer />
        </NotificationContext.Provider>
    )
}

function NotificationContainer() {
    const { notifications, removeNotification } = useNotifications()

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map(notification => (
                <div
                    key={notification.id}
                    className={`p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 animate-in slide-in-from-top-2 ${notification.type === 'success'
                        ? 'bg-green-500 text-white'
                        : notification.type === 'error'
                            ? 'bg-red-500 text-white'
                            : 'bg-blue-500 text-white'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span>
                                {notification.type === 'success' && '✅'}
                                {notification.type === 'error' && '❌'}
                                {notification.type === 'info' && 'ℹ️'}
                            </span>
                            <p className="font-medium">{notification.message}</p>
                        </div>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="ml-2 text-white hover:text-gray-200 text-lg"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider')
    }
    return context
}