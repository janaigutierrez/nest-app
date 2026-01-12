import React, { useState, useEffect } from 'react'

const RadialMenuSystem = ({
    onQuickQuest,
    onAIQuest,
    onRitualQuest,
    aiUnlocked = false,
    userLevel = 1
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkDevice = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkDevice()
        window.addEventListener('resize', checkDevice)
        return () => window.removeEventListener('resize', checkDevice)
    }, [])

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }

    const closeMenu = () => {
        setIsOpen(false)
    }

    const handleOptionClick = (action, isLocked = false) => {
        if (isLocked) {
            // Show tooltip or do nothing for locked features
            return
        }

        closeMenu()
        action()
    }

    const menuOptions = [
        {
            id: 'quick',
            label: 'Quick Quest',
            emoji: '⚡',
            color: 'purple',
            action: onQuickQuest,
            locked: false,
            description: 'Create a manual quest'
        },
        {
            id: 'ai',
            label: 'AI Quest',
            emoji: '🤖',
            color: 'blue',
            action: onAIQuest,
            locked: !aiUnlocked,
            description: aiUnlocked ? 'AI-powered quest creation' : `Unlock at Level 4 (${4 - userLevel} levels to go)`
        },
        {
            id: 'ritual',
            label: 'Quest Ritual',
            emoji: '🎯',
            color: 'amber',
            action: onRitualQuest,
            locked: !aiUnlocked,
            description: aiUnlocked ? 'Create quest templates' : `Unlock at Level 4 (${4 - userLevel} levels to go)`
        }
    ]

    return (
        <>
            {/* Main FAB Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={toggleMenu}
                    className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all duration-300 ${isOpen
                            ? 'bg-red-500 hover:bg-red-600 text-white rotate-45'
                            : 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-110'
                        }`}
                >
                    {isOpen ? '×' : '+'}
                </button>
            </div>

            {/* Backdrop for mobile */}
            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-25 z-40"
                    onClick={closeMenu}
                />
            )}

            {/* Menu Options */}
            {isOpen && (
                <div className={`fixed z-40 ${isMobile
                        ? 'bottom-6 right-6'
                        : 'bottom-24 right-6'
                    }`}>

                    {isMobile ? (
                        // Mobile: Radial Layout
                        <div className="relative">
                            {menuOptions.map((option, index) => {
                                const angle = (index * 60) - 90 // Start at top, 60 degrees apart
                                const radius = 80
                                const x = Math.cos(angle * Math.PI / 180) * radius
                                const y = Math.sin(angle * Math.PI / 180) * radius

                                return (
                                    <div
                                        key={option.id}
                                        className="absolute animate-slideUpFast"
                                        style={{
                                            transform: `translate(${x}px, ${y}px)`,
                                            animationDelay: `${index * 0.1}s`
                                        }}
                                    >
                                        <button
                                            onClick={() => handleOptionClick(option.action, option.locked)}
                                            disabled={option.locked}
                                            className={`
                        w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl
                        transition-all duration-200 hover:scale-110
                        ${option.locked
                                                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
                                                    : option.color === 'purple'
                                                        ? 'bg-purple-500 hover:bg-purple-600 text-white'
                                                        : option.color === 'blue'
                                                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                                            : 'bg-amber-500 hover:bg-amber-600 text-white'
                                                }
                      `}
                                            title={option.description}
                                        >
                                            {option.locked ? '🔒' : option.emoji}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        // Desktop: Vertical List
                        <div className="flex flex-col gap-3">
                            {menuOptions.map((option, index) => (
                                <div
                                    key={option.id}
                                    className="animate-slideUpFast"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <button
                                        onClick={() => handleOptionClick(option.action, option.locked)}
                                        disabled={option.locked}
                                        className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
                      transition-all duration-200 hover:scale-105 min-w-[160px]
                      ${option.locked
                                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
                                                : option.color === 'purple'
                                                    ? 'bg-purple-500 hover:bg-purple-600 text-white'
                                                    : option.color === 'blue'
                                                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                                            }
                    `}
                                        title={option.description}
                                    >
                                        <span className="text-xl">
                                            {option.locked ? '🔒' : option.emoji}
                                        </span>
                                        <span className="font-medium text-sm">
                                            {option.label}
                                        </span>
                                        {option.locked && (
                                            <span className="text-xs opacity-75 ml-auto">
                                                Lv.4
                                            </span>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

export default RadialMenuSystem