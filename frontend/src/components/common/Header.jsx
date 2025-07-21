import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { rules } from 'common'

const Header = () => {
    const { user, logout } = useAuth()
    const { theme, toggleDarkMode, setTheme } = useTheme()
    const location = useLocation()

    const getStaticAvatarSprite = (user) => {
        const spriteId = user?.avatarId || 80
        return `/character/sprite_${spriteId}.png`
    }

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
                                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 pb-1'
                                : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                                }`}
                        >
                            🏠 Dashboard
                        </Link>
                        <Link
                            to="/my-quests"
                            className={`font-medium transition-colors ${isActive('/my-quests')
                                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 pb-1'
                                : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                                }`}
                        >
                            📜 My Quests
                        </Link>
                        <Link
                            to="/agenda"
                            className={`font-medium transition-colors ${isActive('/agenda')
                                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 pb-1'
                                : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                                }`}
                        >
                            📅 Agenda
                        </Link>
                        <Link
                            to="/stats"
                            className={`font-medium transition-colors ${isActive('/stats')
                                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 pb-1'
                                : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                                }`}
                        >
                            📊 Stats
                        </Link>
                        <Link
                            to="/profile"
                            className={`font-medium transition-colors ${isActive('/profile')
                                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 pb-1'
                                : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                                }`}
                        >
                            👤 Profile
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

                        {/* User Info */}
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Level {user.currentLevel || 1} • {user.totalXP || 0} XP</div>
                        </div>

                        {/* Avatar */}
                        <div className="w-10 h-10">
                            <img
                                src={getStaticAvatarSprite(user)}
                                alt={`${user.username} avatar`}
                                className="w-full h-full object-cover rounded-full border-2 border-purple-200 dark:border-purple-600 transition-colors"
                                style={{ imageRendering: 'pixelated' }}
                                onError={(e) => {
                                    e.target.src = '/character/sprite_80.png'
                                }}
                            />
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