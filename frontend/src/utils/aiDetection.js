// src/utils/aiDetection.js
// AI Detection and Smart XP Calculation System

// AI Detection Tiers System
export const AI_DETECTION_TIERS = {
    // TIER 1: Expert AI (95% success) - Very standardized vocabulary
    tier1: {
        confidence: 0.95,
        categories: {
            WORKOUT: {
                keywords: [
                    // Equipment
                    'barbell', 'dumbbell', 'bench', 'squat', 'deadlift', 'pullup', 'pushup',
                    'weights', 'gym', 'fitness', 'exercise', 'training', 'workout',
                    // Body parts
                    'chest', 'legs', 'back', 'shoulders', 'arms', 'core', 'glutes', 'biceps',
                    // Actions
                    'lift', 'press', 'curl', 'row', 'pull', 'push', 'stretch', 'cardio',
                    // Common exercises
                    'squats', 'deadlifts', 'bench press', 'overhead press', 'lunges',
                    // Prep/recovery
                    'warm up', 'cool down', 'stretch', 'foam roll', 'warmup', 'cooldown'
                ],
                xpPerMinute: 1,
                defaultDuration: 45,
                stat: 'STRENGTH',
                emoji: '💪'
            },

            SHOPPING: {
                keywords: [
                    // Food basics
                    'milk', 'bread', 'eggs', 'cheese', 'butter', 'rice', 'pasta', 'meat',
                    'chicken', 'beef', 'fish', 'vegetables', 'fruits', 'tomatoes', 'onions',
                    'groceries', 'shopping', 'store', 'supermarket',
                    // Household
                    'toilet paper', 'shampoo', 'soap', 'detergent', 'toothpaste',
                    // Common verbs
                    'buy', 'get', 'pick up', 'grab', 'purchase', 'shop'
                ],
                xpPerMinute: 0, // Shopping gets completion XP only
                defaultDuration: 30,
                stat: null,
                emoji: '🛒'
            },

            FOOD_PREP: {
                keywords: [
                    // Cooking actions
                    'chop', 'dice', 'slice', 'boil', 'fry', 'bake', 'roast', 'grill',
                    'season', 'marinate', 'prep', 'cook', 'heat', 'mix', 'stir',
                    'prepare', 'cooking', 'meal prep', 'kitchen',
                    // Kitchen tools
                    'knife', 'pan', 'oven', 'stove', 'microwave',
                    // Food prep
                    'vegetables', 'onions', 'garlic', 'chicken', 'rice', 'pasta'
                ],
                xpPerMinute: 0.8,
                defaultDuration: 30,
                stat: 'DEXTERITY',
                emoji: '🍳'
            },

            CLEANING: {
                keywords: [
                    // Actions
                    'vacuum', 'mop', 'sweep', 'dust', 'wipe', 'scrub', 'wash', 'clean',
                    'organize', 'tidy', 'make bed', 'do dishes', 'laundry', 'cleaning',
                    // Areas
                    'kitchen', 'bathroom', 'bedroom', 'living room', 'floor', 'windows',
                    // Tools
                    'vacuum cleaner', 'mop', 'broom', 'cloth', 'sponge'
                ],
                xpPerMinute: 0.5,
                defaultDuration: 20,
                stat: null,
                emoji: '🧹'
            }
        }
    },

    // TIER 2: Decent AI (70% success) - Some variability
    tier2: {
        confidence: 0.70,
        categories: {
            STUDY: {
                keywords: [
                    // Actions
                    'read', 'study', 'review', 'practice', 'memorize', 'learn', 'research',
                    'write', 'take notes', 'highlight', 'summarize', 'studying',
                    // Materials
                    'book', 'chapter', 'notes', 'flashcards', 'problems', 'exercises',
                    'homework', 'assignment', 'exam', 'test', 'textbook',
                    // Subjects (common ones)
                    'math', 'english', 'history', 'science', 'spanish', 'french',
                    'physics', 'chemistry', 'biology'
                ],
                xpPerMinute: 1.2,
                defaultDuration: 60,
                stat: 'WISDOM',
                emoji: '📚'
            },

            WORK: {
                keywords: [
                    // Communication
                    'email', 'meeting', 'call', 'presentation', 'report', 'document',
                    'spreadsheet', 'proposal', 'review', 'work', 'office',
                    // Actions
                    'analyze', 'plan', 'organize', 'schedule', 'follow up', 'update',
                    'create', 'prepare', 'send', 'respond',
                    // Tools
                    'excel', 'powerpoint', 'word', 'slack', 'zoom', 'calendar'
                ],
                xpPerMinute: 0.8,
                defaultDuration: 30,
                stat: 'WISDOM',
                emoji: '💼'
            },

            PERSONAL_CARE: {
                keywords: [
                    // Hygiene
                    'shower', 'brush teeth', 'shave', 'skincare', 'hair', 'nails',
                    'hygiene', 'grooming',
                    // Wellness
                    'meditate', 'yoga', 'stretch', 'breathe', 'relax', 'journal',
                    'vitamins', 'water', 'sleep', 'nap', 'meditation',
                    // Grooming
                    'moisturize', 'sunscreen', 'deodorant', 'cologne', 'makeup'
                ],
                xpPerMinute: 0.3,
                defaultDuration: 15,
                stat: 'CHARISMA',
                emoji: '🧘'
            }
        }
    },

    // TIER 3: Fallback to manual (30% success) - Too specific/technical
    tier3: {
        confidence: 0.30,
        categories: {
            CREATIVE: {
                keywords: [
                    'paint', 'draw', 'sketch', 'compose', 'write', 'design', 'create',
                    'photography', 'music', 'art', 'poetry', 'story', 'song'
                ],
                fallbackMessage: "Our AI just blue-screened 😅 Mind helping us out?"
            },

            TECHNICAL: {
                keywords: [
                    'code', 'programming', 'debug', 'deploy', 'server', 'database',
                    'api', 'framework', 'algorithm', 'optimize', 'configure'
                ],
                fallbackMessage: "Plot twist: You're smarter than our robot! 🧠 > 🤖"
            },

            HOBBIES: {
                keywords: [
                    'guitar', 'piano', 'gaming', 'model', 'craft', 'sewing', 'knitting',
                    'gardening', 'plants', 'aquarium', '3d print', 'electronics'
                ],
                fallbackMessage: "Houston, we have a... comprehension problem 🚀❌"
            }
        }
    }
}

// Funny fallback messages
const fallbackMessages = [
    "Oops! 🤖💔 We're not quite smart enough for that one yet...",
    "Our AI just blue-screened 😅 Mind helping us out?",
    "Plot twist: You're smarter than our robot! 🧠 > 🤖",
    "AI.exe has stopped working 🔧 Let's go manual!",
    "Houston, we have a... comprehension problem 🚀❌",
    "Our neural networks need more coffee ☕ Care to lead?"
]

// Detection Algorithm
export const detectRitualCategory = (inputText) => {
    const text = inputText.toLowerCase()
    let bestMatch = null
    let highestScore = 0
    let tier = null

    // Check each tier
    for (const [tierName, tierData] of Object.entries(AI_DETECTION_TIERS)) {
        for (const [categoryName, categoryData] of Object.entries(tierData.categories)) {
            if (!categoryData.keywords) continue // Skip tier3 categories without keywords

            // Calculate keyword match score
            const matchCount = categoryData.keywords.filter(keyword =>
                text.includes(keyword)
            ).length

            const score = matchCount / categoryData.keywords.length * tierData.confidence

            if (score > highestScore && matchCount > 0) {
                highestScore = score
                bestMatch = {
                    category: categoryName,
                    confidence: score,
                    tier: tierName,
                    data: categoryData
                }
                tier = tierName
            }
        }
    }

    return {
        match: bestMatch,
        shouldUseFallback: !bestMatch || bestMatch.confidence < 0.3,
        fallbackMessage: bestMatch && tier === 'tier3' ?
            AI_DETECTION_TIERS.tier3.categories[bestMatch.category]?.fallbackMessage ||
            fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)] :
            fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)]
    }
}

// Smart XP Calculator
export const calculateSmartXP = (tasks, category) => {
    if (!category) {
        // Default fallback for unknown categories
        return tasks.map(() => ({
            xp: 5,
            minutes: 10,
            stat: null
        }))
    }

    const { xpPerMinute, defaultDuration, stat } = category.data

    return tasks.map(task => {
        const taskLower = task.toLowerCase()

        // Estimate duration based on task complexity
        let estimatedMinutes = defaultDuration

        // Adjust based on task indicators
        if (taskLower.includes('warm up') || taskLower.includes('setup') || taskLower.includes('prepare')) {
            estimatedMinutes *= 0.6
        }
        if (taskLower.includes('cool down') || taskLower.includes('clean up') || taskLower.includes('finish')) {
            estimatedMinutes *= 0.4
        }
        if (taskLower.includes('heavy') || taskLower.includes('intense') || taskLower.includes('hard')) {
            estimatedMinutes *= 1.3
        }
        if (taskLower.includes('light') || taskLower.includes('quick') || taskLower.includes('easy')) {
            estimatedMinutes *= 0.7
        }
        if (taskLower.includes('long') || taskLower.includes('extended')) {
            estimatedMinutes *= 1.5
        }

        // Extract sets/reps for workout tasks
        const setsMatch = task.match(/(\d+)x(\d+)/)
        if (setsMatch && category.category === 'WORKOUT') {
            const sets = parseInt(setsMatch[1])
            const reps = parseInt(setsMatch[2])
            // More sets and reps = more time
            estimatedMinutes = Math.max(5, sets * 2 + reps * 0.3)
        }

        // Round minutes and calculate XP
        estimatedMinutes = Math.round(estimatedMinutes)
        const xp = Math.round(estimatedMinutes * xpPerMinute)

        return {
            xp: Math.max(0, xp),
            minutes: Math.max(1, estimatedMinutes),
            stat: stat
        }
    })
}

// Format category name for display
export const formatCategoryName = (category) => {
    if (!category) return 'General'

    const categoryMap = {
        'WORKOUT': 'Workout',
        'SHOPPING': 'Shopping',
        'FOOD_PREP': 'Cooking',
        'CLEANING': 'Cleaning',
        'STUDY': 'Study',
        'WORK': 'Work',
        'PERSONAL_CARE': 'Self Care',
        'CREATIVE': 'Creative',
        'TECHNICAL': 'Technical',
        'HOBBIES': 'Hobbies'
    }

    return categoryMap[category] || category
}

// Get category emoji
export const getCategoryEmoji = (category) => {
    for (const tierData of Object.values(AI_DETECTION_TIERS)) {
        for (const [categoryName, categoryData] of Object.entries(tierData.categories)) {
            if (categoryName === category && categoryData.emoji) {
                return categoryData.emoji
            }
        }
    }
    return '🎯' // Default emoji
}