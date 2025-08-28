import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { validator } from 'common'
import logics from '../../logic'
import { useAuth } from '../../context/AuthContext'
import PasswordInput from '../../components/common/PasswordInput'

function Register() {
    const navigate = useNavigate()
    const { refreshUserData } = useAuth()
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        if (error) setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setLoading(true)
            setError('')

            validator.username(formData.username, 'username')
            validator.email(formData.email, 'email')
            validator.password(formData.password, 'password')

            if (formData.password !== formData.confirmPassword) {
                throw new Error('Passwords do not match')
            }
            await logics.user.registerUser(formData)
            await refreshUserData()
            navigate('/')

        } catch (error) {
            console.error('❌ Registration failed:', error)
            setError(error.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="text-6xl mb-4">🏠</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Begin Your Quest</h2>
                    <p className="text-gray-600">Begin your journey in the realm of Nest</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Choose a username"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <PasswordInput
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a secure password"
                                showRequirements={true}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <PasswordInput
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                showRequirements={false}
                                required
                            />
                            {formData.confirmPassword && (
                                <p className={`text-xs mt-1 ${formData.password === formData.confirmPassword
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                    }`}>
                                    {formData.password === formData.confirmPassword
                                        ? '✓ Passwords match'
                                        : '✗ Passwords do not match'
                                    }
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${loading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Creating account...
                            </span>
                        ) : (
                            'Enter the Village'
                        )}
                    </button>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
                                Log in
                            </Link>
                        </p>
                    </div>
                </form>


            </div>
        </div>
    )
}

export default Register