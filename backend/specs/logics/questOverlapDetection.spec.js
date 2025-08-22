import { after, before, afterEach, beforeEach, describe, it } from "mocha"
import { expect } from "chai"
import 'dotenv/config'
import mongoose from 'mongoose'
import User from "../../models/User.js"
import Quest from "../../models/Quest.js"
import {
    detectQuestOverlap,
    getQuestsAtTimeSlot,
    getOverlapType,
    calculateOverlapMinutes
} from "../../utils/questOverlapDetection.js"

describe('questOverlapDetection', () => {
    let userId
    let anotherUserId

    const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPassword123!',
        totalXP: 0,
        currentLevel: 1,
        stats: { STRENGTH: 0, DEXTERITY: 0, WISDOM: 0, CHARISMA: 0 }
    }

    const anotherUserData = {
        username: 'anotheruser',
        email: 'another@example.com',
        password: 'AnotherPass123!',
        totalXP: 0,
        currentLevel: 1,
        stats: { STRENGTH: 0, DEXTERITY: 0, WISDOM: 0, CHARISMA: 0 }
    }

    const targetDate = new Date('2025-08-22')

    before(() => {
        return mongoose.connect(process.env.MONGO_URL, {
            dbName: process.env.MONGO_DB_TEST
        })
    })

    after(() => {
        return mongoose.disconnect()
    })

    beforeEach(() => {
        return Promise.all([
            User.create(userData),
            User.create(anotherUserData)
        ])
            .then(([createdUser, createdAnotherUser]) => {
                userId = createdUser._id.toString()
                anotherUserId = createdAnotherUser._id.toString()

                // Create existing quests for overlap testing
                const existingQuests = [
                    {
                        title: 'Morning Workout',
                        description: 'Daily fitness routine',
                        difficulty: 'STANDARD',
                        experienceReward: 30,
                        targetStat: 'STRENGTH',
                        userId: createdUser._id,
                        isCompleted: false,
                        isScheduled: true,
                        scheduledTime: '09:00',
                        scheduledDate: targetDate,
                        duration: 60 // 09:00 - 10:00
                    },
                    {
                        title: 'Lunch Meeting',
                        description: 'Business lunch',
                        difficulty: 'STANDARD',
                        experienceReward: 25,
                        targetStat: 'CHARISMA',
                        userId: createdUser._id,
                        isCompleted: false,
                        isScheduled: true,
                        scheduledTime: '12:30',
                        scheduledDate: targetDate,
                        duration: 90 // 12:30 - 14:00
                    },
                    {
                        title: 'Evening Study',
                        description: 'Learning session',
                        difficulty: 'LONG',
                        experienceReward: 40,
                        targetStat: 'WISDOM',
                        userId: createdUser._id,
                        isCompleted: false,
                        isScheduled: true,
                        scheduledTime: '19:00',
                        scheduledDate: targetDate,
                        duration: 120 // 19:00 - 21:00
                    },
                    {
                        title: 'Another User Quest',
                        description: 'Different user quest',
                        difficulty: 'STANDARD',
                        experienceReward: 30,
                        targetStat: 'STRENGTH',
                        userId: createdAnotherUser._id,
                        isCompleted: false,
                        isScheduled: true,
                        scheduledTime: '09:00',
                        scheduledDate: targetDate,
                        duration: 60
                    }
                ]

                return Promise.all(existingQuests.map(q => Quest.create(q)))
            })
    })

    afterEach(() => {
        return Promise.all([
            User.deleteMany(),
            Quest.deleteMany()
        ])
    })

    describe('detectQuestOverlap', () => {
        // ✅ NO CONFLICT SCENARIOS
        it('GIVEN no existing quests WHEN detectQuestOverlap THEN returns no conflicts', () => {
            const emptyDate = new Date('2025-08-25')

            return detectQuestOverlap(userId, emptyDate, '10:00', 60)
                .then(result => {
                    expect(result.hasConflicts).to.equal(false)
                    expect(result.hasStackedQuests).to.equal(false)
                    expect(result.conflicts).to.have.length(0)
                    expect(result.stackedQuests).to.have.length(0)
                    expect(result.totalConflicts).to.equal(0)
                    expect(result.worstOverlap).to.equal(0)
                    expect(result.suggestions).to.be.an('array')
                })
        })

        it('GIVEN available time slot WHEN detectQuestOverlap THEN returns no conflicts', () => {
            return detectQuestOverlap(userId, targetDate, '11:00', 60)
                .then(result => {
                    expect(result.hasConflicts).to.equal(false)
                    expect(result.conflicts).to.have.length(0)
                    expect(result.suggestions).to.be.an('array')
                })
        })

        // 🔥 EXACT OVERLAP SCENARIOS
        it('GIVEN exact time match WHEN detectQuestOverlap THEN detects stacking', () => {
            return detectQuestOverlap(userId, targetDate, '09:00', 60)
                .then(result => {
                    expect(result.hasConflicts).to.equal(true)
                    expect(result.hasStackedQuests).to.equal(true)
                    expect(result.conflicts).to.have.length(1)
                    expect(result.stackedQuests).to.have.length(1)
                    expect(result.conflicts[0].overlapType).to.equal('EXACT_MATCH')
                    expect(result.conflicts[0].overlapMinutes).to.equal(60)
                    expect(result.stackedQuests[0].title).to.equal('Morning Workout')
                })
        })

        it('GIVEN partial overlap start WHEN detectQuestOverlap THEN detects overlap', () => {
            // New quest: 09:30 - 10:30, Existing: 09:00 - 10:00
            return detectQuestOverlap(userId, targetDate, '09:30', 60)
                .then(result => {
                    expect(result.hasConflicts).to.equal(true)
                    expect(result.conflicts).to.have.length(1)
                    expect(result.conflicts[0].overlapType).to.equal('OVERLAPS_START')
                    expect(result.conflicts[0].overlapMinutes).to.equal(30)
                    expect(result.worstOverlap).to.equal(30)
                })
        })

        it('GIVEN partial overlap end WHEN detectQuestOverlap THEN detects overlap', () => {
            // New quest: 08:30 - 09:30, Existing: 09:00 - 10:00
            return detectQuestOverlap(userId, targetDate, '08:30', 60)
                .then(result => {
                    expect(result.hasConflicts).to.equal(true)
                    expect(result.conflicts).to.have.length(1)
                    expect(result.conflicts[0].overlapType).to.equal('OVERLAPS_END')
                    expect(result.conflicts[0].overlapMinutes).to.equal(30)
                })
        })

        it('GIVEN quest contains existing WHEN detectQuestOverlap THEN detects containment', () => {
            // New quest: 08:30 - 10:30, Existing: 09:00 - 10:00
            return detectQuestOverlap(userId, targetDate, '08:30', 120)
                .then(result => {
                    expect(result.hasConflicts).to.equal(true)
                    expect(result.conflicts).to.have.length(1)
                    expect(result.conflicts[0].overlapType).to.equal('CONTAINS')
                    expect(result.conflicts[0].overlapMinutes).to.equal(60)
                })
        })

        it('GIVEN quest contained by existing WHEN detectQuestOverlap THEN detects containment', () => {
            // New quest: 12:45 - 13:15, Existing: 12:30 - 14:00
            return detectQuestOverlap(userId, targetDate, '12:45', 30)
                .then(result => {
                    expect(result.hasConflicts).to.equal(true)
                    expect(result.conflicts).to.have.length(1)
                    expect(result.conflicts[0].overlapType).to.equal('CONTAINED')
                    expect(result.conflicts[0].overlapMinutes).to.equal(30)
                })
        })

        // 🔄 MULTIPLE CONFLICTS
        it('GIVEN quest overlapping multiple existing WHEN detectQuestOverlap THEN detects all conflicts', () => {
            // New quest: 12:00 - 20:00 (overlaps lunch and evening)
            return detectQuestOverlap(userId, targetDate, '12:00', 480)
                .then(result => {
                    expect(result.hasConflicts).to.equal(true)
                    expect(result.conflicts).to.have.length(2)
                    expect(result.totalConflicts).to.equal(2)

                    // Should detect both lunch and evening conflicts
                    const conflictTitles = result.conflicts.map(c => c.quest.title)
                    expect(conflictTitles).to.include('Lunch Meeting')
                    expect(conflictTitles).to.include('Evening Study')
                })
        })

        // 🔒 USER ISOLATION
        it('GIVEN different user WHEN detectQuestOverlap THEN ignores other user quests', () => {
            // Another user should not see conflicts with main user's quests
            return detectQuestOverlap(anotherUserId, targetDate, '09:00', 60)
                .then(result => {
                    expect(result.hasConflicts).to.equal(true)
                    expect(result.conflicts).to.have.length(1)
                    expect(result.conflicts[0].quest.title).to.equal('Another User Quest')

                    // Should not see main user's Morning Workout
                    const conflictTitles = result.conflicts.map(c => c.quest.title)
                    expect(conflictTitles).to.not.include('Morning Workout')
                })
        })

        // 🔄 EXCLUDE QUEST ID (Update scenario)
        it('GIVEN excludeQuestId WHEN detectQuestOverlap THEN ignores excluded quest', () => {
            return Quest.findOne({ title: 'Morning Workout' })
                .then(existingQuest => {
                    // Should not conflict with itself when updating
                    return detectQuestOverlap(userId, targetDate, '09:00', 60, existingQuest._id.toString())
                })
                .then(result => {
                    expect(result.hasConflicts).to.equal(false)
                    expect(result.conflicts).to.have.length(0)
                })
        })

        // 💡 SUGGESTIONS
        it('GIVEN conflicts exist WHEN detectQuestOverlap THEN provides alternative suggestions', () => {
            return detectQuestOverlap(userId, targetDate, '09:00', 60)
                .then(result => {
                    expect(result.hasConflicts).to.equal(true)
                    expect(result.suggestions).to.be.an('array')
                    expect(result.suggestions.length).to.be.greaterThan(0)

                    result.suggestions.forEach(suggestion => {
                        expect(suggestion).to.have.property('time')
                        expect(suggestion).to.have.property('available')
                        expect(suggestion).to.have.property('reason')
                        expect(suggestion.available).to.equal(true)
                    })
                })
        })
    })

    describe('getQuestsAtTimeSlot', () => {
        it('GIVEN time slot with quests WHEN getQuestsAtTimeSlot THEN returns all quests at that time', () => {
            return getQuestsAtTimeSlot(userId, targetDate, '09:00')
                .then(result => {
                    expect(result).to.be.an('array')
                    expect(result).to.have.length(1)
                    expect(result[0].title).to.equal('Morning Workout')
                    expect(result[0]).to.have.property('id')
                    expect(result[0]).to.have.property('duration')
                    expect(result[0]).to.have.property('difficulty')
                })
        })

        it('GIVEN empty time slot WHEN getQuestsAtTimeSlot THEN returns empty array', () => {
            return getQuestsAtTimeSlot(userId, targetDate, '11:00')
                .then(result => {
                    expect(result).to.be.an('array')
                    expect(result).to.have.length(0)
                })
        })

        it('GIVEN different user WHEN getQuestsAtTimeSlot THEN returns only their quests', () => {
            return getQuestsAtTimeSlot(anotherUserId, targetDate, '09:00')
                .then(result => {
                    expect(result).to.have.length(1)
                    expect(result[0].title).to.equal('Another User Quest')
                })
        })
    })

    describe('getOverlapType', () => {
        it('GIVEN exact same time range WHEN getOverlapType THEN returns EXACT_MATCH', () => {
            const result = getOverlapType(540, 600, 540, 600) // 09:00-10:00 vs 09:00-10:00
            expect(result).to.equal('EXACT_MATCH')
        })

        it('GIVEN same start different end WHEN getOverlapType THEN returns SAME_START', () => {
            const result = getOverlapType(540, 600, 540, 660) // 09:00-10:00 vs 09:00-11:00
            expect(result).to.equal('SAME_START')
        })

        it('GIVEN different start same end WHEN getOverlapType THEN returns SAME_END', () => {
            const result = getOverlapType(540, 600, 480, 600) // 09:00-10:00 vs 08:00-10:00
            expect(result).to.equal('SAME_END')
        })

        it('GIVEN first contains second WHEN getOverlapType THEN returns CONTAINS', () => {
            const result = getOverlapType(540, 660, 570, 630) // 09:00-11:00 vs 09:30-10:30
            expect(result).to.equal('CONTAINS')
        })

        it('GIVEN first contained by second WHEN getOverlapType THEN returns CONTAINED', () => {
            const result = getOverlapType(570, 630, 540, 660) // 09:30-10:30 vs 09:00-11:00
            expect(result).to.equal('CONTAINED')
        })

        it('GIVEN first overlaps end of second WHEN getOverlapType THEN returns OVERLAPS_END', () => {
            const result = getOverlapType(570, 660, 540, 630) // 09:30-11:00 vs 09:00-10:30
            expect(result).to.equal('OVERLAPS_START')
        })

        it('GIVEN first overlaps start of second WHEN getOverlapType THEN returns OVERLAPS_START', () => {
            const result = getOverlapType(540, 630, 570, 660) // 09:00-10:30 vs 09:30-11:00
            expect(result).to.equal('OVERLAPS_END')
        })
    })

    describe('calculateOverlapMinutes', () => {
        it('GIVEN overlapping ranges WHEN calculateOverlapMinutes THEN returns correct overlap', () => {
            const result = calculateOverlapMinutes(540, 630, 570, 660) // 09:00-10:30 vs 09:30-11:00
            expect(result).to.equal(60) // 09:30-10:30 = 60 minutes overlap
        })

        it('GIVEN no overlap WHEN calculateOverlapMinutes THEN returns zero', () => {
            const result = calculateOverlapMinutes(540, 600, 660, 720) // 09:00-10:00 vs 11:00-12:00
            expect(result).to.equal(0)
        })

        it('GIVEN exact match WHEN calculateOverlapMinutes THEN returns full duration', () => {
            const result = calculateOverlapMinutes(540, 600, 540, 600) // 09:00-10:00 vs 09:00-10:00
            expect(result).to.equal(60)
        })

        it('GIVEN partial overlap WHEN calculateOverlapMinutes THEN returns partial duration', () => {
            const result = calculateOverlapMinutes(540, 600, 570, 630) // 09:00-10:00 vs 09:30-10:30
            expect(result).to.equal(30) // 09:30-10:00 = 30 minutes overlap
        })
    })

    // 🧪 EDGE CASES & ERROR HANDLING
    describe('Edge Cases', () => {
        it('GIVEN completed quests WHEN detectQuestOverlap THEN ignores completed quests', () => {
            const completedQuest = {
                title: 'Completed Quest',
                description: 'Already done',
                difficulty: 'STANDARD',
                experienceReward: 30,
                targetStat: 'STRENGTH',
                userId: new mongoose.Types.ObjectId(userId),
                isCompleted: true,
                completedAt: new Date(),
                isScheduled: true,
                scheduledTime: '10:00',
                scheduledDate: targetDate,
                duration: 60
            }

            return Quest.create(completedQuest)
                .then(() => detectQuestOverlap(userId, targetDate, '10:00', 60))
                .then(result => {
                    expect(result.hasConflicts).to.equal(false)
                    expect(result.conflicts).to.have.length(0)
                })
        })

        it('GIVEN quests without scheduledTime WHEN detectQuestOverlap THEN ignores malformed quests', () => {
            const malformedQuest = {
                title: 'Malformed Quest',
                description: 'Missing time data',
                difficulty: 'STANDARD',
                experienceReward: 30,
                targetStat: 'STRENGTH',
                userId: new mongoose.Types.ObjectId(userId),
                isCompleted: false,
                isScheduled: true,
                scheduledDate: targetDate
                // Missing scheduledTime and duration
            }

            return Quest.create(malformedQuest)
                .then(() => detectQuestOverlap(userId, targetDate, '10:00', 60))
                .then(result => {
                    expect(result.hasConflicts).to.equal(false)
                })
        })

        it('GIVEN very busy day WHEN detectQuestOverlap THEN provides realistic suggestions', () => {
            const busyDayQuests = [
                { time: '08:00', duration: 60 },
                { time: '10:00', duration: 90 },
                { time: '14:00', duration: 120 },
                { time: '17:00', duration: 60 },
                { time: '20:00', duration: 90 }
            ]

            const questPromises = busyDayQuests.map((q, index) => Quest.create({
                title: `Busy Quest ${index}`,
                description: 'Very busy day',
                difficulty: 'STANDARD',
                experienceReward: 30,
                targetStat: 'STRENGTH',
                userId: new mongoose.Types.ObjectId(userId),
                isCompleted: false,
                isScheduled: true,
                scheduledTime: q.time,
                scheduledDate: targetDate,
                duration: q.duration
            }))

            return Promise.all(questPromises)
                .then(() => detectQuestOverlap(userId, targetDate, '15:00', 60))
                .then(result => {
                    expect(result.hasConflicts).to.equal(true)
                    expect(result.suggestions).to.be.an('array')
                    // Should still find some available slots
                    expect(result.suggestions.length).to.be.greaterThan(0)
                })
        })
    })
})