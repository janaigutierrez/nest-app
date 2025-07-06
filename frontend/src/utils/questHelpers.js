import { rules } from 'common'

/**
 * Get emoji for a specific stat
 */
export const getStatEmoji = (stat) => {
    if (!stat) return '❓'
    return rules.STAT_RULES.STATS[stat]?.emoji || '❓'
}

/**
 * Get Tailwind classes for difficulty badge
 */
export const getDifficultyColor = (difficulty) => {
    const colors = {
        'EASY': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'STANDARD': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        'HARD': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        'EPIC': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    }
    return colors[difficulty] || colors['STANDARD']
}

/**
 * Hybrid time display: relative for recent, exact for old
 * - < 24h: "X hours ago" (urgency)
 * - 1-7 days: "X days ago" (motivation)
 * - > 7 days: exact date (info)
 */
export const getTimeDisplay = (createdAt) => {
    const now = new Date()
    const questDate = new Date(createdAt)
    const diffMs = now - questDate
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 24) {
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffMs / (1000 * 60))
            return diffMinutes <= 1 ? 'just now' : `${diffMinutes} minutes ago`
        }
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
    }

    if (diffDays <= 7) {
        return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`
    }

    return `${questDate.toLocaleDateString()} at ${questDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })}`
}