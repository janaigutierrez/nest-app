import { after, before, afterEach, beforeEach, describe, it } from "mocha"
import { expect } from "chai"
import 'dotenv/config'
import mongoose from 'mongoose'
import User from "../../models/User.js"
import Quest from "../../models/Quest.js"
import getQuestsByDate from "../../logics/getQuestsByDate.js"

describe('getQuestsByDate', () => {
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

    const targetDate = '2025-08-22'
    const targetDateObj = new Date(targetDate)

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

                // Create quests for target date
                const questsForTargetDate = [
                    {
                        title: 'Morning Workout',
                        description: 'Early morning fitness',
                        difficulty: 'STANDARD',
                        experienceReward: 30,
                        targetStat: 'STRENGTH',
                        userId: createdUser._id,
                        isCompleted: false,
                        isScheduled: true,
                        scheduledTime: '09:00',
                        scheduledDate: targetDateObj,
                        duration: 60
                    },
                    {
                        title: 'Afternoon Meeting',
                        description: 'Important business meeting',
                        difficulty: 'STANDARD',
                        experienceReward: 25,
                        targetStat: 'CHARISMA',
                        userId: createdUser._id,
                        isCompleted: false,
                        isScheduled: true,
                        scheduledTime: '14:30',
                        scheduledDate: targetDateObj,
                        duration: 90
                    },
                    {
                        title: 'Evening Study',
                        description: 'Reading and learning',
                        difficulty: 'LONG',
                        experienceReward: 40,
                        targetStat: 'WISDOM',
                        userId: createdUser._id,
                        isCompleted: false,
                        isScheduled: true,
                        scheduledTime: '19:00',
                        scheduledDate: targetDateObj,
                        duration: 120
                    }
                ]

                // Create quests for different date (should not appear)
                const questsForDifferentDate = [
                    {
                        title: 'Different Day Quest',
                        description: 'This should not appear',
                        difficulty: 'QUICK',
                        experienceReward: 15,
                        targetStat: 'DEXTERITY',
                        userId: createdUser._id,
                        isCompleted: false,
                        isScheduled: true,
                        scheduledTime: '10:00',
                        scheduledDate: new Date('2025-08-23'),
                        duration: 30
                    }
                ]

                // Create unscheduled quest (should not appear)
                const unscheduledQuest = {
                    title: 'Unscheduled Quest',
                    description: 'No specific time',
                    difficulty: 'STANDARD',
                    experienceReward: 20,
                    targetStat: 'STRENGTH',
                    userId: createdUser._id,
                    isCompleted: false,
                    isScheduled: false,
                    scheduledDate: targetDateObj,
                    duration: 45
                }

                // Create quest for another user (should not appear)
                const anotherUserQuest = {
                    title: 'Another User Quest',
                    description: 'Different user quest',
                    difficulty: 'STANDARD',
                    experienceReward: 30,
                    targetStat: 'STRENGTH',
                    userId: createdAnotherUser._id,
                    isCompleted: false,
                    isScheduled: true,
                    scheduledTime: '11:00',
                    scheduledDate: targetDateObj,
                    duration: 60
                }

                return Promise.all([
                    ...questsForTargetDate.map(q => Quest.create(q)),
                    ...questsForDifferentDate.map(q => Quest.create(q)),
                    Quest.create(unscheduledQuest),
                    Quest.create(anotherUserQuest)
                ])
            })
    })

    afterEach(() => {
        return Promise.all([
            User.deleteMany(),
            Quest.deleteMany()
        ])
    })

    // ✅ SUCCESSFUL RETRIEVAL TESTS
    it('GIVEN valid userId and date WHEN called getQuestsByDate THEN returns scheduled quests for that date', () => {
        return getQuestsByDate(userId, targetDate)
            .then(result => {
                expect(result).to.be.an('array')
                expect(result).to.have.length(3)

                // Verify all returned quests are for the correct user and date
                result.forEach(quest => {
                    expect(quest.isScheduled).to.equal(true)
                    expect(quest.scheduledDate).to.be.a('date')
                    expect(quest.scheduledDate.toISOString().split('T')[0]).to.equal(targetDate)
                })

                // Verify sorting by scheduledTime
                expect(result[0].scheduledTime).to.equal('09:00')
                expect(result[1].scheduledTime).to.equal('14:30')
                expect(result[2].scheduledTime).to.equal('19:00')

                // Verify quest details
                expect(result[0].title).to.equal('Morning Workout')
                expect(result[1].title).to.equal('Afternoon Meeting')
                expect(result[2].title).to.equal('Evening Study')
            })
    })

    it('GIVEN date with no scheduled quests WHEN called getQuestsByDate THEN returns empty array', () => {
        const emptyDate = '2025-08-25'

        return getQuestsByDate(userId, emptyDate)
            .then(result => {
                expect(result).to.be.an('array')
                expect(result).to.have.length(0)
            })
    })

    it('GIVEN different user WHEN called getQuestsByDate THEN returns only their quests', () => {
        return getQuestsByDate(anotherUserId, targetDate)
            .then(result => {
                expect(result).to.be.an('array')
                expect(result).to.have.length(1)
                expect(result[0].title).to.equal('Another User Quest')
            })
    })

    it('GIVEN date string in different format WHEN called getQuestsByDate THEN parses correctly', () => {
        const isoDateString = '2025-08-22T00:00:00.000Z'

        return getQuestsByDate(userId, isoDateString)
            .then(result => {
                expect(result).to.be.an('array')
                expect(result).to.have.length(3)
            })
    })

    it('GIVEN quest response format WHEN called getQuestsByDate THEN returns all required fields', () => {
        return getQuestsByDate(userId, targetDate)
            .then(result => {
                const quest = result[0]

                // Verify all expected fields are present
                expect(quest).to.have.property('id')
                expect(quest).to.have.property('title')
                expect(quest).to.have.property('description')
                expect(quest).to.have.property('difficulty')
                expect(quest).to.have.property('experienceReward')
                expect(quest).to.have.property('targetStat')
                expect(quest).to.have.property('isCompleted')
                expect(quest).to.have.property('scheduledTime')
                expect(quest).to.have.property('duration')
                expect(quest).to.have.property('generatedBy')
                expect(quest).to.have.property('isScheduled')
                expect(quest).to.have.property('scheduledDate')
                expect(quest).to.have.property('tags')
                expect(quest).to.have.property('createdAt')
                expect(quest).to.have.property('updatedAt')

                // Verify types
                expect(quest.id).to.be.a('string')
                expect(quest.title).to.be.a('string')
                expect(quest.experienceReward).to.be.a('number')
                expect(quest.isCompleted).to.be.a('boolean')
                expect(quest.isScheduled).to.be.a('boolean')
                expect(quest.scheduledDate).to.be.a('date')
            })
    })

    // ❌ VALIDATION ERROR TESTS
    it('GIVEN invalid userId WHEN called getQuestsByDate THEN throws validation error', () => {
        return getQuestsByDate('invalid-id', targetDate)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('userId is not a valid id')
            })
    })

    it('GIVEN empty userId WHEN called getQuestsByDate THEN throws validation error', () => {
        return getQuestsByDate('', targetDate)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('userId is empty')
            })
    })

    it('GIVEN null date WHEN called getQuestsByDate THEN throws validation error', () => {
        return getQuestsByDate(userId, null)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Date is required')
            })
    })

    it('GIVEN undefined date WHEN called getQuestsByDate THEN throws validation error', () => {
        return getQuestsByDate(userId, undefined)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Date is required')
            })
    })

    it('GIVEN empty date string WHEN called getQuestsByDate THEN throws validation error', () => {
        return getQuestsByDate(userId, '')
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Date is required')
            })
    })

    it('GIVEN invalid date format WHEN called getQuestsByDate THEN throws validation error', () => {
        return getQuestsByDate(userId, 'not-a-date')
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Invalid date format')
            })
    })

    it('GIVEN malformed date string WHEN called getQuestsByDate THEN throws validation error', () => {
        return getQuestsByDate(userId, '2025-13-45')
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Invalid date format')
            })
    })

    // ⚡ EDGE CASES & FILTERING TESTS
    it('GIVEN date range crossing midnight WHEN called getQuestsByDate THEN returns quests within full day', () => {
        // This test ensures the day boundary logic works correctly
        const lateNightQuest = {
            title: 'Late Night Quest',
            description: 'Very late quest',
            difficulty: 'QUICK',
            experienceReward: 10,
            targetStat: 'DEXTERITY',
            userId: new mongoose.Types.ObjectId(userId),
            isCompleted: false,
            isScheduled: true,
            scheduledTime: '23:59',
            scheduledDate: targetDateObj,
            duration: 30
        }

        return Quest.create(lateNightQuest)
            .then(() => getQuestsByDate(userId, targetDate))
            .then(result => {
                expect(result).to.have.length(4)
                const lastQuest = result[result.length - 1]
                expect(lastQuest.scheduledTime).to.equal('23:59')
                expect(lastQuest.title).to.equal('Late Night Quest')
            })
    })

    it('GIVEN mixed scheduled and unscheduled quests WHEN called getQuestsByDate THEN returns only scheduled', () => {
        return getQuestsByDate(userId, targetDate)
            .then(result => {
                // Should only return the 3 scheduled quests, not the unscheduled one
                expect(result).to.have.length(3)
                result.forEach(quest => {
                    expect(quest.isScheduled).to.equal(true)
                })

                // Verify unscheduled quest is not included
                const titles = result.map(q => q.title)
                expect(titles).to.not.include('Unscheduled Quest')
            })
    })

    it('GIVEN user with no quests WHEN called getQuestsByDate THEN returns empty array', () => {
        const newUserData = {
            username: 'newuser',
            email: 'new@example.com',
            password: 'NewPass123!',
            totalXP: 0,
            currentLevel: 1,
            stats: { STRENGTH: 0, DEXTERITY: 0, WISDOM: 0, CHARISMA: 0 }
        }

        return User.create(newUserData)
            .then(newUser => getQuestsByDate(newUser._id.toString(), targetDate))
            .then(result => {
                expect(result).to.be.an('array')
                expect(result).to.have.length(0)
            })
    })
})