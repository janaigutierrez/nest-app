/**
 * AI tier detection and categorization utilities
 */

/**
 * Detect user tier based on level for AI features
 * @param {number} level - User level
 * @returns {string} User tier
 */
export const detectUserTier = (level) => {
    if (level >= 10) return 'advanced'
    if (level >= 4) return 'intermediate'
    return 'beginner'
}

/**
 * Check if AI features are unlocked for user
 * @param {number} level - User level
 * @returns {boolean} Whether AI is unlocked
 */
export const isAIUnlocked = (level) => {
    return level >= 4
}

/**
 * Get AI suggestions based on user input
 * @param {string} input - User input text
 * @returns {Object} AI suggestions
 */
export const getAISuggestions = (input) => {
    const suggestions = {
        categories: [],
        difficulty: 'STANDARD',
        estimatedTime: 30,
        stat: null
    }

    const lowerInput = input.toLowerCase()

    // Categorization
    if (lowerInput.includes('workout') || lowerInput.includes('exercise') || lowerInput.includes('gym')) {
        suggestions.categories.push('fitness')
        suggestions.stat = 'STRENGTH'
        suggestions.difficulty = 'STANDARD'
    }

    if (lowerInput.includes('study') || lowerInput.includes('learn') || lowerInput.includes('read')) {
        suggestions.categories.push('learning')
        suggestions.stat = 'WISDOM'
        suggestions.difficulty = 'LONG'
    }

    if (lowerInput.includes('social') || lowerInput.includes('talk') || lowerInput.includes('call')) {
        suggestions.categories.push('social')
        suggestions.stat = 'CHARISMA'
        suggestions.difficulty = 'QUICK'
    }

    if (lowerInput.includes('skill') || lowerInput.includes('practice') || lowerInput.includes('improve')) {
        suggestions.categories.push('skill')
        suggestions.stat = 'DEXTERITY'
    }

    return suggestions
}

/**
 * Smart categorization of quest content
 * @param {string} title - Quest title
 * @param {string} description - Quest description
 * @returns {Array} Detected categories
 */
export const smartCategorize = (title, description = '') => {
    const content = `${title} ${description}`.toLowerCase()
    const categories = []

    const categoryPatterns = {
        fitness: ['workout', 'exercise', 'gym', 'run', 'lift', 'cardio', 'strength'],
        learning: ['study', 'learn', 'read', 'course', 'book', 'research', 'practice'],
        social: ['call', 'talk', 'meet', 'friend', 'family', 'social', 'conversation'],
        creative: ['write', 'draw', 'create', 'design', 'art', 'music', 'paint'],
        productivity: ['organize', 'clean', 'plan', 'schedule', 'task', 'work', 'project'],
        health: ['doctor', 'health', 'medicine', 'checkup', 'therapy', 'meditation'],
        finance: ['budget', 'money', 'save', 'invest', 'bank', 'financial', 'expense']
    }

    Object.entries(categoryPatterns).forEach(([category, patterns]) => {
        if (patterns.some(pattern => content.includes(pattern))) {
            categories.push(category)
        }
    })

    return categories.length > 0 ? categories : ['general']
}