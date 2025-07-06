import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const PasswordInput = ({
    value,
    onChange,
    placeholder = "Enter password",
    showRequirements = false,
    name = "password",
    className = "",
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false)

    // Password strength checks
    const requirements = [
        {
            id: 'length',
            label: 'At least 8 characters',
            test: (pass) => pass.length >= 8
        },
        {
            id: 'lowercase',
            label: 'One lowercase letter',
            test: (pass) => /(?=.*[a-z])/.test(pass)
        },
        {
            id: 'uppercase',
            label: 'One uppercase letter',
            test: (pass) => /(?=.*[A-Z])/.test(pass)
        },
        {
            id: 'number',
            label: 'One number',
            test: (pass) => /(?=.*\d)/.test(pass)
        }
    ]

    const getRequirementStatus = (requirement) => {
        if (!value) return 'pending'
        return requirement.test(value) ? 'met' : 'unmet'
    }

    const allRequirementsMet = requirements.every(req => req.test(value || ''))

    return (
        <div className="space-y-2">
            {/* Password Input Field */}
            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    name={name}
                    placeholder={placeholder}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${value && allRequirementsMet
                        ? 'border-green-300 bg-green-50'
                        : value && !allRequirementsMet
                            ? 'border-orange-300 bg-orange-50'
                            : 'border-gray-300'
                        } ${className}`}
                    {...props}
                />

                {/* Show/Hide Password Button */}
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                    ) : (
                        <Eye className="h-5 w-5" />
                    )}
                </button>
            </div>

            {/* Password Requirements */}
            {showRequirements && value && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm font-medium text-gray-700 mb-2">Password requirements:</p>
                    <div className="space-y-1">
                        {requirements.map((requirement) => {
                            const status = getRequirementStatus(requirement)
                            return (
                                <div key={requirement.id} className="flex items-center space-x-2">
                                    {status === 'met' ? (
                                        <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : status === 'unmet' ? (
                                        <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : (
                                        <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                                    )}
                                    <span className={`text-sm ${status === 'met' ? 'text-green-600 line-through' :
                                        status === 'unmet' ? 'text-red-600' :
                                            'text-gray-500'
                                        }`}>
                                        {requirement.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default PasswordInput