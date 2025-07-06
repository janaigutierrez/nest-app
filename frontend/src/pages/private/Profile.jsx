import Header from '../../components/common/Header'
import Avatar from '../../components/common/Avatar'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useNotifications } from '../../context/NotificationContext'
import { getUnlockedSets, avatarSetInfo } from '../../assets/avatars'
import { useState } from 'react'
import updateEmail from '../../logic/user/updateEmail'
import updatePassword from '../../logic/user/updatePassword'
import updateUsername from '../../logic/user/updateUsername'
import PasswordInput from '../../components/common/PasswordInput'

function Profile() {
    const { user, updateUserAvatar, logout, refreshUserData } = useAuth()
    const { theme, setTheme } = useTheme()
    const { showSuccess, showError, showInfo } = useNotifications()
    const [forms, setForms] = useState({
        username: user?.username || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)

    if (!user) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="animate-pulse text-gray-600 dark:text-gray-300">Loading...</div>
        </div>
    )

    const unlockedSets = getUnlockedSets(user)

    const handleSubmit = async (type, e) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (type === 'username') {
                await updateUsername(forms.username)
                await refreshUserData()
            } else if (type === 'email') {
                await updateEmail(forms.email)
                await refreshUserData()
            } else if (type === 'password') {
                if (forms.newPassword !== forms.confirmPassword) {
                    showError('Las contraseñas no coinciden')
                    return
                }
                await updatePassword({
                    currentPassword: forms.currentPassword,
                    newPassword: forms.newPassword,
                    confirmPassword: forms.confirmPassword
                })
                setForms({ ...forms, currentPassword: '', newPassword: '', confirmPassword: '' })
            }
            showSuccess('Actualizado correctamente')
        } catch (error) {
            showError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAvatarChange = async (setKey) => {
        try {
            await updateUserAvatar(setKey)
            showSuccess('Avatar actualizado')
        } catch (error) {
            showError(error.message)
        }
    }

    const handleThemeChange = (themeId) => {
        setTheme(themeId)
        showSuccess(`🎨 ${themeId.charAt(0).toUpperCase() + themeId.slice(1)} theme activated!`)
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center transition-colors">
                    <div className="w-20 h-20 mx-auto mb-4">
                        <Avatar user={user} size="large" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.username}</h2>
                    <p className="text-gray-600 dark:text-gray-400">Level {user.currentLevel || 1} • {user.totalXP || 0} XP</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 space-y-4 transition-colors">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">📝 Update Info</h3>

                    <form onSubmit={(e) => handleSubmit('username', e)} className="flex gap-2">
                        <input
                            value={forms.username}
                            onChange={(e) => setForms({ ...forms, username: e.target.value })}
                            placeholder="Username"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                            minLength="3" maxLength="20"
                        />
                        <button
                            disabled={loading}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-md disabled:bg-purple-400 dark:disabled:bg-purple-700 transition-colors"
                        >
                            Update
                        </button>
                    </form>

                    <form onSubmit={(e) => handleSubmit('email', e)} className="flex gap-2">
                        <input
                            type="email"
                            value={forms.email}
                            onChange={(e) => setForms({ ...forms, email: e.target.value })}
                            placeholder="Email"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                        />
                        <button
                            disabled={loading}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-md disabled:bg-purple-400 dark:disabled:bg-purple-700 transition-colors"
                        >
                            Update
                        </button>
                    </form>

                    <form onSubmit={(e) => handleSubmit('password', e)} className="space-y-2">
                        <PasswordInput
                            value={forms.currentPassword}
                            onChange={(e) => setForms({ ...forms, currentPassword: e.target.value })}
                            placeholder="Current password"
                            showRequirements={false}
                            required
                        />
                        <PasswordInput
                            value={forms.newPassword}
                            onChange={(e) => setForms({ ...forms, newPassword: e.target.value })}
                            placeholder="New password"
                            showRequirements={true}
                            required
                        />
                        <PasswordInput
                            value={forms.confirmPassword}
                            onChange={(e) => setForms({ ...forms, confirmPassword: e.target.value })}
                            placeholder="Confirm new password"
                            showRequirements={false}
                            required
                        />
                        <button
                            disabled={loading}
                            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-md disabled:bg-purple-400 dark:disabled:bg-purple-700 transition-colors"
                        >
                            Change Password
                        </button>
                    </form>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">🎭 Avatar</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {Object.entries(avatarSetInfo).map(([setKey, setInfo]) => {
                            const isUnlocked = unlockedSets.includes(setKey)
                            const isSelected = user?.avatar?.equippedSet === setKey
                            return (
                                <button
                                    key={setKey}
                                    onClick={() => isUnlocked && handleAvatarChange(setKey)}
                                    disabled={!isUnlocked}
                                    className={`p-3 rounded-lg border-2 text-center transition-all ${isSelected
                                        ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900'
                                        : isUnlocked
                                            ? 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 bg-white dark:bg-gray-700'
                                            : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-50'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">{setInfo.emoji}</div>
                                    <div className="text-xs font-medium text-gray-900 dark:text-gray-100">{setInfo.name}</div>
                                    {!isUnlocked && <div className="text-xs text-red-500 dark:text-red-400">🔒</div>}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">🎨 Themes</h3>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Current: <span className="font-medium capitalize">{theme}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'default', name: 'Default', emoji: '🌟', level: 1 },
                            { id: 'library', name: 'Library', emoji: '📚', level: 4 },
                            { id: 'mystic', name: 'Mystic', emoji: '🔮', level: 6 },
                            { id: 'medieval', name: 'Medieval', emoji: '🏰', level: 8 },
                            { id: 'warrior', name: 'Warrior', emoji: '⚔️', level: 10 },
                            { id: 'academy', name: 'Academy', emoji: '🏛️', level: 12 }
                        ].map(themeData => {
                            const isUnlocked = (user.currentLevel || 1) >= themeData.level
                            const isActive = theme === themeData.id

                            return (
                                <button
                                    key={themeData.id}
                                    onClick={() => {
                                        if (isUnlocked) {
                                            handleThemeChange(themeData.id)
                                        } else {
                                            showInfo(`${themeData.emoji} ${themeData.name} unlocks at Level ${themeData.level}`)
                                        }
                                    }}
                                    className={`p-2 text-sm border rounded-md transition-all relative ${isActive
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 ring-2 ring-purple-200 dark:ring-purple-800'
                                        : isUnlocked
                                            ? 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-purple-300 dark:hover:border-purple-600'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 opacity-50 cursor-not-allowed'
                                        }`}
                                    disabled={!isUnlocked}
                                >
                                    <div className="flex flex-col items-center">
                                        <span className="text-lg">{themeData.emoji}</span>
                                        <span className="text-xs font-medium">{themeData.name}</span>
                                        {!isUnlocked && <span className="text-xs">Lv.{themeData.level}</span>}
                                    </div>
                                    {isActive && (
                                        <div className="absolute top-1 right-1">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full border border-white dark:border-gray-800"></div>
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* Info note */}
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <strong>Note:</strong> While using a visual theme, the dark/light mode toggle will be disabled.
                        Switch back to "Default" to use dark mode.
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors">
                    <button
                        onClick={() => confirm('¿Cerrar sesión?') && logout()}
                        className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                    >
                        Log Out
                    </button>
                </div>

            </main>
        </div>
    )
}

export default Profile