import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { rules } from 'common'
import { useState, useRef, useEffect } from 'react'

const Header = () => {
    const { user, logout } = useAuth()
    const { theme, toggleDarkMode, setTheme } = useTheme()
    const location = useLocation()
    const navigate = useNavigate()
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    const getStaticAvatarSprite = (user) => {
        const spriteId = user?.avatarId || 80
        return `/character/sprite_${spriteId}.png`
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (!user) {
        return (
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <img
                                src="/icon.png"
                                alt="Nest Logo"
                                className="w-8 h-8 mr-3"
                            />
                            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">Nest</span>
                        </div>
                    </div>
                </div>
            </header>
        )
    }

    const isActive = (path) => location.pathname === path

    const isDarkModeUnlocked = rules.UNLOCK_RULES.isUnlocked('DARK_MODE', user.currentLevel || 1)

    const handleProfileClick = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen)
    }

    const handleProfileNavigate = () => {
        navigate('/profile')
        setIsProfileDropdownOpen(false)
    }

    const handleNotifications = () => {
        // TODO: Implement notifications system
        console.log('Opening notifications...')
        alert('Notifications feature coming soon! 🔔')
        setIsProfileDropdownOpen(false)
    }

    // Mock function to get notifications (replace with real logic later)
    const getNotifications = () => {
        // Mock notifications for testing - replace with real API call
        return [
            // Uncomment these for testing:
            // {
            //     id: 1,
            //     type: 'quest_reminder',
            //     title: 'Quest reminder',
            //     message: 'Your "Morning Workout" quest starts in 15 minutes',
            //     time: '2 min ago',
            //     isRead: false,
            //     icon: '⏰'
            // },
            // {
            //     id: 2,
            //     type: 'achievement',
            //     title: 'Achievement unlocked!',
            //     message: 'You've completed 5 strength quests this week',
            //     time: '1 hour ago',
            //     isRead: false,
            //     icon: '🏆'
            // },
            // {
            //     id: 3,
            //     type: 'level_up',
            //     title: 'Level up!',
            //     message: 'Congratulations! You reached level 8',
            //     time: '2 hours ago',
            //     isRead: true,
            //     icon: '⭐'
            // }
        ]
    }

    const markNotificationAsRead = (notificationId) => {
        // TODO: Implement mark as read functionality
        console.log('Marking notification as read:', notificationId)
    }

    const handleLogoutWithConfirm = () => {
        if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            logout()
            setIsProfileDropdownOpen(false)
        }
    }

    // Mock function to simulate notification count (replace with real logic later)
    const getNotificationCount = () => {
        // Count unread notifications
        return getNotifications().filter(n => !n.isRead).length
    }

    const notificationCount = getNotificationCount()

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <img
                            src="/icon.png"
                            alt="Nest Logo"
                            className="w-8 h-8 mr-3"
                        />
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">Nest</span>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        <Link
                            to="/"
                            className={`font-medium transition-colors ${isActive('/')
                                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                                : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                                }`}
                        >
                            🏠 Dashboard
                        </Link>
                        <Link
                            to="/my-quests"
                            className={`font-medium transition-colors ${isActive('/my-quests')
                                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                                : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                                }`}
                        >
                            📜 My Quests
                        </Link>
                        <Link
                            to="/agenda"
                            className={`font-medium transition-colors ${isActive('/agenda')
                                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                                : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                                }`}
                        >
                            📅 Agenda
                        </Link>
                        <Link
                            to="/stats"
                            className={`font-medium transition-colors ${isActive('/stats')
                                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                                : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                                }`}
                        >
                            📊 Stats
                        </Link>
                    </nav>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Theme Toggle */}
                        {isDarkModeUnlocked ? (
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                title="Toggle Dark Mode"
                            >
                                {theme === 'dark' ? (
                                    <span className="text-yellow-500 text-lg">☀️</span>
                                ) : (
                                    <span className="text-gray-600 text-lg">🌙</span>
                                )}
                            </button>
                        ) : (
                            <div
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed"
                                title={`Dark Mode unlocks at Level 2 (Current: Level ${user.currentLevel || 1})`}
                            >
                                <span className="text-gray-400 text-lg">🔒</span>
                            </div>
                        )}

                        {/* User Info - Hidden on smaller screens to save space */}
                        <div className="text-right hidden lg:block">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Level {user.currentLevel || 1} • {user.totalXP || 0} XP</div>
                        </div>

                        {/* Avatar Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={handleProfileClick}
                                className="flex items-center space-x-1 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                                title="Profile Menu"
                            >
                                <div className="w-10 h-10">
                                    <img
                                        src={getStaticAvatarSprite(user)}
                                        alt={`${user.username} avatar`}
                                        className="w-full h-full object-cover rounded-full border-2 border-purple-200 dark:border-purple-600 transition-colors group-hover:border-purple-400 dark:group-hover:border-purple-400"
                                        style={{ imageRendering: 'pixelated' }}
                                        onError={(e) => {
                                            e.target.src = '/character/sprite_80.png'
                                        }}
                                    />
                                </div>
                                {/* Dropdown Arrow */}
                                <svg
                                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 max-h-96 overflow-y-auto">
                                    {/* User Info in Dropdown (for smaller screens) */}
                                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 lg:hidden">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Level {user.currentLevel || 1} • {user.totalXP || 0} XP</div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="px-2 py-1">
                                        {/* Profile Link */}
                                        <button
                                            onClick={handleProfileNavigate}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 rounded-md"
                                        >
                                            <span>👤</span>
                                            <span>View Profile</span>
                                        </button>

                                        {/* Logout with confirmation */}
                                        <button
                                            onClick={handleLogoutWithConfirm}
                                            className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 rounded-md"
                                        >
                                            <span>🚪</span>
                                            <span>Logout</span>
                                        </button>
                                    </div>

                                    {/* Notifications Section */}
                                    <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                                        <div className="px-4 py-2 flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                                <span>🔔</span>
                                                <span>Notifications</span>
                                            </h3>
                                            {notificationCount > 0 && (
                                                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-5 text-center">
                                                    {notificationCount > 99 ? '99+' : notificationCount}
                                                </span>
                                            )}
                                        </div>

                                        {/* Notifications List */}
                                        <div className="max-h-48 overflow-y-auto">
                                            {getNotifications().length === 0 ? (
                                                <div className="px-4 py-6 text-center">
                                                    <div className="text-gray-400 dark:text-gray-500 mb-2">
                                                        <span className="text-2xl">🔕</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        No notifications for now
                                                    </p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                        You're all caught up! 🎉
                                                    </p>
                                                </div>
                                            ) : (
                                                getNotifications().map(notification => (
                                                    <NotificationItem
                                                        key={notification.id}
                                                        notification={notification}
                                                        onMarkAsRead={() => markNotificationAsRead(notification.id)}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="md:hidden mt-4 flex justify-center space-x-4">
                    <Link
                        to="/"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/')
                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        🏠
                    </Link>
                    <Link
                        to="/my-quests"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/my-quests')
                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        📜
                    </Link>
                    <Link
                        to="/agenda"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/agenda')
                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        📅
                    </Link>
                    <Link
                        to="/stats"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/stats')
                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        📊
                    </Link>
                    {/* Profile in mobile navigation */}
                    <Link
                        to="/profile"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/profile')
                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        👤
                    </Link>
                </nav>
            </div>
        </header>
    )
}

export default Header

// Notification Item Component
const NotificationItem = ({ notification, onMarkAsRead }) => {
    const getNotificationBg = (type) => {
        const colors = {
            quest_reminder: 'bg-blue-50 dark:bg-blue-900/20 border-l-blue-500',
            achievement: 'bg-yellow-50 dark:bg-yellow-900/20 border-l-yellow-500',
            level_up: 'bg-purple-50 dark:bg-purple-900/20 border-l-purple-500',
            social: 'bg-green-50 dark:bg-green-900/20 border-l-green-500',
            default: 'bg-gray-50 dark:bg-gray-700/20 border-l-gray-500'
        }
        return colors[type] || colors.default
    }

    return (
        <div
            className={`mx-2 mb-2 px-3 py-2 rounded-lg border-l-4 transition-all duration-200 cursor-pointer hover:shadow-sm ${getNotificationBg(notification.type)
                } ${notification.isRead ? 'opacity-60' : ''
                }`}
            onClick={() => !notification.isRead && onMarkAsRead()}
        >
            <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0 mt-0.5">{notification.icon}</span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {notification.title}
                        </h4>
                        {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {notification.time}
                    </p>
                </div>
            </div>
        </div>
    )
}