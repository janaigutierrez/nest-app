export const useStatInfo = (user) => {
    const getStatInfo = (statName) => {
        if (!user) {
            return {
                points: 0,
                level: 1,
                pointsToNext: 100,
                progress: 0,
                isMaxLevel: false
            }
        }

        const points = user.stats?.[statName] || 0

        // 🔧 SIMPLE SYSTEM: Each level = 100 points
        const level = Math.floor(points / 100) + 1
        const isMaxLevel = level >= 10 // Max level 10

        const pointsInCurrentLevel = points % 100
        const progress = pointsInCurrentLevel // 0-99 becomes 0-99%
        const pointsToNext = 100 - pointsInCurrentLevel

        console.log(`${statName} SIMPLE:`, {
            points,
            level,
            pointsInCurrentLevel,
            progress,
            pointsToNext,
            isMaxLevel
        })

        return { points, level, pointsToNext, progress, isMaxLevel }
    }

    return { getStatInfo }
}