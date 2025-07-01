import { describe, it } from "mocha"
import { expect } from "chai"

const XP_RULES = {
    BASE_LEVELS: [0, 0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700],
    MAX_LEVEL: 10,

    getLevelFromXP(xp) {
        for (let i = this.BASE_LEVELS.length - 1; i >= 1; i--) {
            if (xp >= this.BASE_LEVELS[i]) return i
        }
        return 1
    },

    getXPToNextLevel(xp) {
        const currentLevel = this.getLevelFromXP(xp)
        if (currentLevel >= this.MAX_LEVEL) return 0
        return this.BASE_LEVELS[currentLevel + 1] - xp
    },

    isMaxLevel(level) {
        return level >= this.MAX_LEVEL
    }
}

const STAT_RULES = {
    STAT_LEVELS: [0, 25, 60, 120, 200, 300, 430, 590, 780, 1000, 1250],
    MAX_STAT_LEVEL: 10,

    STATS: {
        STRENGTH: { keywords: ['gym', 'exercise', 'workout', 'fitness', 'run', 'sport'] },
        DEXTERITY: { keywords: ['art', 'draw', 'paint', 'craft', 'music', 'cook'] },
        WISDOM: { keywords: ['study', 'learn', 'read', 'book', 'research', 'code'] },
        CHARISMA: { keywords: ['talk', 'social', 'people', 'friend', 'call', 'meeting'] }
    },

    getStatLevel(statPoints) {
        for (let index = this.STAT_LEVELS.length - 1; index >= 0; index--) {
            if (statPoints >= this.STAT_LEVELS[index]) {
                return Math.max(1, Math.min(10, index + 1))
            }
        }
        return 1
    },

    getPointsToNextStatLevel(statPoints) {
        const currentLevel = this.getStatLevel(statPoints)
        if (currentLevel >= this.MAX_STAT_LEVEL) return 0
        return this.STAT_LEVELS[currentLevel] - statPoints
    },

    getStatLevelProgress(statPoints) {
        const currentLevel = this.getStatLevel(statPoints)
        if (currentLevel >= this.MAX_STAT_LEVEL) return 100
        const currentLevelPoints = this.STAT_LEVELS[currentLevel]
        const nextLevelPoints = this.STAT_LEVELS[currentLevel + 1]
        const pointsInCurrentLevel = statPoints - currentLevelPoints
        const pointsNeededForLevel = nextLevelPoints - currentLevelPoints
        return Math.max(0, Math.min(100, (pointsInCurrentLevel / pointsNeededForLevel) * 100))
    },

    isMaxStatLevel(level) {
        return level >= this.MAX_STAT_LEVEL
    },

    detectStatFromDescription(text) {
        const words = text.toLowerCase().split(/\s+/)
        const statCounts = {}

        for (const [stat, config] of Object.entries(this.STATS)) {
            statCounts[stat] = 0
            for (const keyword of config.keywords) {
                if (words.some(word => word.includes(keyword))) {
                    statCounts[stat]++
                }
            }
        }

        const maxCount = Math.max(...Object.values(statCounts))
        if (maxCount === 0) return null
        return Object.keys(statCounts).find(stat => statCounts[stat] === maxCount)
    }
}

const QUEST_REWARDS = {
    BASE_XP: { QUICK: 25, STANDARD: 50, LONG: 100, EPIC: 200 }
}

const UNLOCK_RULES = {
    GLOBAL_UNLOCKS: {
        2: ['DARK_MODE'],
        3: ['AI_QUEST_GENERATION'],
        5: ['LIBRARY_THEME'],
        7: ['MYSTIC_THEME'],
        10: ['AVATAR_SETS', 'FINAL_TITLES']
    },

    isUnlocked(featureName, userLevel) {
        if (XP_RULES.isMaxLevel(userLevel)) return true
        for (const [level, features] of Object.entries(this.GLOBAL_UNLOCKS)) {
            if (features.includes(featureName) && userLevel >= parseInt(level)) {
                return true
            }
        }
        return false
    },

    getUnlockedFeatures(userLevel) {
        if (XP_RULES.isMaxLevel(userLevel)) {
            return ['DARK_MODE', 'AI_QUEST_GENERATION', 'LIBRARY_THEME', 'MYSTIC_THEME', 'AVATAR_SETS', 'FINAL_TITLES']
        }
        const unlocked = []
        for (const [level, features] of Object.entries(this.GLOBAL_UNLOCKS)) {
            if (userLevel >= parseInt(level)) {
                unlocked.push(...features)
            }
        }
        return unlocked
    },

    getNextUnlock(userLevel) {
        if (XP_RULES.isMaxLevel(userLevel)) return null
        for (const [level, features] of Object.entries(this.GLOBAL_UNLOCKS)) {
            if (parseInt(level) > userLevel) {
                return { level: parseInt(level), features }
            }
        }
        return null
    }
}

describe('gameRules - Sistema Híbrido', () => {

    describe('XP_RULES', () => {
        it('GIVEN 0 XP WHEN getLevelFromXP THEN returns level 1', () => {
            expect(XP_RULES.getLevelFromXP(0)).to.equal(1)
        })

        it('GIVEN 100 XP WHEN getLevelFromXP THEN returns level 2', () => {
            expect(XP_RULES.getLevelFromXP(100)).to.equal(2)
        })

        it('GIVEN 250 XP WHEN getLevelFromXP THEN returns level 3', () => {
            expect(XP_RULES.getLevelFromXP(250)).to.equal(3)
        })

        it('GIVEN level 1 user WHEN getXPToNextLevel THEN returns correct amount', () => {
            expect(XP_RULES.getXPToNextLevel(50)).to.equal(50) // 100 - 50
        })

        it('GIVEN max level WHEN isMaxLevel THEN returns true', () => {
            expect(XP_RULES.isMaxLevel(10)).to.equal(true)
        })
    })

    describe('STAT_RULES - Sistema Híbrido', () => {
        it('GIVEN 0 points WHEN getStatLevel THEN returns level 1', () => {
            expect(STAT_RULES.getStatLevel(0)).to.equal(1)
        })

        it('GIVEN 24 points WHEN getStatLevel THEN returns level 1', () => {
            expect(STAT_RULES.getStatLevel(24)).to.equal(1)
        })

        it('GIVEN 25 points WHEN getStatLevel THEN returns level 2', () => {
            expect(STAT_RULES.getStatLevel(25)).to.equal(2)
        })

        it('GIVEN 59 points WHEN getStatLevel THEN returns level 2', () => {
            expect(STAT_RULES.getStatLevel(59)).to.equal(2)
        })

        it('GIVEN 60 points WHEN getStatLevel THEN returns level 3', () => {
            expect(STAT_RULES.getStatLevel(60)).to.equal(3)
        })

        it('GIVEN 1250 points WHEN getStatLevel THEN returns level 10', () => {
            expect(STAT_RULES.getStatLevel(1250)).to.equal(10)
        })

        it('GIVEN 25 points WHEN getPointsToNextStatLevel THEN returns 35', () => {
            expect(STAT_RULES.getPointsToNextStatLevel(25)).to.equal(35)
        })

        it('GIVEN max level WHEN getPointsToNextStatLevel THEN returns 0', () => {
            expect(STAT_RULES.getPointsToNextStatLevel(1250)).to.equal(0)
        })
    })

    describe('STAT_RULES - Detection', () => {
        it('GIVEN gym text WHEN detectStatFromDescription THEN returns STRENGTH', () => {
            expect(STAT_RULES.detectStatFromDescription('go to gym')).to.equal('STRENGTH')
        })

        it('GIVEN study text WHEN detectStatFromDescription THEN returns WISDOM', () => {
            expect(STAT_RULES.detectStatFromDescription('study math')).to.equal('WISDOM')
        })

        it('GIVEN art text WHEN detectStatFromDescription THEN returns DEXTERITY', () => {
            expect(STAT_RULES.detectStatFromDescription('draw art')).to.equal('DEXTERITY')
        })

        it('GIVEN social text WHEN detectStatFromDescription THEN returns CHARISMA', () => {
            expect(STAT_RULES.detectStatFromDescription('talk to people')).to.equal('CHARISMA')
        })

        it('GIVEN no keywords WHEN detectStatFromDescription THEN returns null', () => {
            expect(STAT_RULES.detectStatFromDescription('random text')).to.equal(null)
        })
    })

    describe('QUEST_REWARDS', () => {
        it('GIVEN QUICK difficulty WHEN checking BASE_XP THEN returns 25', () => {
            expect(QUEST_REWARDS.BASE_XP.QUICK).to.equal(25)
        })

        it('GIVEN EPIC difficulty WHEN checking BASE_XP THEN returns 200', () => {
            expect(QUEST_REWARDS.BASE_XP.EPIC).to.equal(200)
        })
    })

    describe('UNLOCK_RULES', () => {
        it('GIVEN level 2 WHEN isUnlocked DARK_MODE THEN returns true', () => {
            expect(UNLOCK_RULES.isUnlocked('DARK_MODE', 2)).to.equal(true)
        })

        it('GIVEN level 1 WHEN isUnlocked DARK_MODE THEN returns false', () => {
            expect(UNLOCK_RULES.isUnlocked('DARK_MODE', 1)).to.equal(false)
        })

        it('GIVEN level 3 WHEN getUnlockedFeatures THEN returns correct features', () => {
            const features = UNLOCK_RULES.getUnlockedFeatures(3)
            expect(features).to.include('DARK_MODE')
            expect(features).to.include('AI_QUEST_GENERATION')
        })

        it('GIVEN max level WHEN isUnlocked any feature THEN returns true', () => {
            expect(UNLOCK_RULES.isUnlocked('DARK_MODE', 10)).to.equal(true)
        })
    })

    describe('Edge Cases', () => {
        it('GIVEN negative points WHEN getStatLevel THEN returns level 1', () => {
            expect(STAT_RULES.getStatLevel(-10)).to.equal(1)
        })

        it('GIVEN very high points WHEN getStatLevel THEN returns max level', () => {
            expect(STAT_RULES.getStatLevel(9999)).to.equal(10)
        })
    })
})