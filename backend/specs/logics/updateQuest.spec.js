import { after, before, afterEach, beforeEach, describe, it } from "mocha"
import { expect } from "chai"
import 'dotenv/config'
import mongoose from 'mongoose'
import User from "../../models/User.js"
import Quest from "../../models/Quest.js"
import updateQuest from "../../logics/updateQuest.js"
import { errors } from "common"
const { NotFoundError, ValidationError, AuthError } = errors

describe('updateQuest', () => {
    let userId
    let anotherUserId
    let questId
    let anotherUserQuestId
    let completedQuestId

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

    const questData = {
        title: 'Original Quest Title',
        description: 'Original description',
        difficulty: 'STANDARD',
        experienceReward: 30,
        targetStat: 'STRENGTH',
        isCompleted: false,
        isScheduled: true,
        scheduledTime: '09:00',
        scheduledDate: new Date('2025-08-22'),
        duration: 60
    }

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

                const questForUser = { ...questData, userId: createdUser._id }
                const questForAnotherUser = { ...questData, userId: createdAnotherUser._id, title: 'Another User Quest' }
                const completedQuestForUser = {
                    ...questData,
                    userId: createdUser._id,
                    title: 'Completed Quest',
                    isCompleted: true,
                    completedAt: new Date()
                }

                return Promise.all([
                    Quest.create(questForUser),
                    Quest.create(questForAnotherUser),
                    Quest.create(completedQuestForUser)
                ])
            })
            .then(([createdQuest, createdAnotherQuest, completedQuest]) => {
                questId = createdQuest._id.toString()
                anotherUserQuestId = createdAnotherQuest._id.toString()
                completedQuestId = completedQuest._id.toString()
            })
    })

    afterEach(() => {
        return Promise.all([
            User.deleteMany(),
            Quest.deleteMany()
        ])
    })

    // ✅ SUCCESSFUL UPDATE TESTS
    it('GIVEN valid quest update data WHEN called updateQuest THEN updates successfully', () => {
        const updateData = {
            title: 'Updated Quest Title',
            description: 'Updated description',
            scheduledTime: '14:30',
            duration: 90
        }

        return updateQuest(userId, questId, updateData)
            .then(result => {
                expect(result).to.be.an('object')
                expect(result.id).to.equal(questId)
                expect(result.title).to.equal('Updated Quest Title')
                expect(result.description).to.equal('Updated description')
                expect(result.scheduledTime).to.equal('14:30')
                expect(result.duration).to.equal(90)

                return Quest.findById(questId)
            })
            .then(quest => {
                expect(quest.title).to.equal('Updated Quest Title')
                expect(quest.scheduledTime).to.equal('14:30')
                expect(quest.duration).to.equal(90)
                expect(quest.updatedAt).to.be.a('date')
            })
    })

    it('GIVEN only scheduledTime update WHEN called updateQuest THEN updates only that field', () => {
        const updateData = { scheduledTime: '16:45' }

        return updateQuest(userId, questId, updateData)
            .then(result => {
                expect(result.scheduledTime).to.equal('16:45')
                expect(result.title).to.equal('Original Quest Title')
                expect(result.duration).to.equal(60)

                return Quest.findById(questId)
            })
            .then(quest => {
                expect(quest.scheduledTime).to.equal('16:45')
                expect(quest.title).to.equal('Original Quest Title')
            })
    })

    it('GIVEN time normalization WHEN called updateQuest THEN normalizes time format', () => {
        const updateData = { scheduledTime: '9:05' }

        return updateQuest(userId, questId, updateData)
            .then(result => {
                expect(result.scheduledTime).to.equal('09:05')
                return Quest.findById(questId)
            })
            .then(quest => {
                expect(quest.scheduledTime).to.equal('09:05')
            })
    })

    it('GIVEN difficulty update WHEN called updateQuest THEN updates difficulty', () => {
        const updateData = { difficulty: 'EPIC' }

        return updateQuest(userId, questId, updateData)
            .then(result => {
                expect(result.difficulty).to.equal('EPIC')
                return Quest.findById(questId)
            })
            .then(quest => {
                expect(quest.difficulty).to.equal('EPIC')
            })
    })

    it('GIVEN empty update data WHEN called updateQuest THEN updates only updatedAt', () => {
        const updateData = {}

        return updateQuest(userId, questId, updateData)
            .then(result => {
                expect(result.title).to.equal('Original Quest Title')
                expect(result.description).to.equal('Original description')
                return Quest.findById(questId)
            })
            .then(quest => {
                expect(quest.title).to.equal('Original Quest Title')
                expect(quest.updatedAt).to.be.a('date')
            })
    })

    // ❌ VALIDATION ERROR TESTS
    it('GIVEN invalid userId WHEN called updateQuest THEN throws validation error', () => {
        const updateData = { title: 'New Title' }

        return updateQuest('invalid-id', questId, updateData)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('userId is not a valid id')
            })
    })

    it('GIVEN invalid questId WHEN called updateQuest THEN throws validation error', () => {
        const updateData = { title: 'New Title' }

        return updateQuest(userId, 'invalid-id', updateData)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('questId is not a valid id')
            })
    })

    it('GIVEN title too short WHEN called updateQuest THEN throws validation error', () => {
        const updateData = { title: 'Hi' }

        return updateQuest(userId, questId, updateData)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.include('must be at least 3 characters')
            })
    })

    it('GIVEN title too long WHEN called updateQuest THEN throws validation error', () => {
        const updateData = { title: 'A'.repeat(121) }

        return updateQuest(userId, questId, updateData)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.include('cannot exceed 120 characters')
            })
    })

    it('GIVEN invalid time format WHEN called updateQuest THEN throws validation error', () => {
        const updateData = { scheduledTime: '25:70' }

        return updateQuest(userId, questId, updateData)
            .catch(error => {
                expect(error).to.be.instanceOf(errors.ValidationError)
                expect(error.message).to.equal('Invalid time format. Use HH:MM')
            })
    })

    it('GIVEN duration too short WHEN called updateQuest THEN throws validation error', () => {
        const updateData = { duration: 3 }

        return updateQuest(userId, questId, updateData)
            .catch(error => {
                expect(error).to.be.instanceOf(errors.ValidationError)
                expect(error.message).to.equal('Duration must be between 5 and 480 minutes')
            })
    })

    it('GIVEN invalid difficulty WHEN called updateQuest THEN throws validation error', () => {
        const updateData = { difficulty: 'IMPOSSIBLE' }

        return updateQuest(userId, questId, updateData)
            .catch(error => {
                expect(error).to.be.instanceOf(errors.ValidationError)
                expect(error.message).to.equal('Invalid difficulty')
            })
    })

    it('GIVEN invalid date format WHEN called updateQuest THEN throws validation error', () => {
        const updateData = { scheduledDate: 'not-a-date' }

        return updateQuest(userId, questId, updateData)
            .catch(error => {
                expect(error).to.be.instanceOf(errors.ValidationError)
                expect(error.message).to.equal('Invalid date format')
            })
    })

    // 🚫 AUTHORIZATION TESTS
    it('GIVEN quest belonging to another user WHEN called updateQuest THEN throws NotFoundError', () => {
        const updateData = { title: 'Hacked Title' }

        return updateQuest(userId, anotherUserQuestId, updateData)
            .catch(error => {
                expect(error).to.be.instanceOf(errors.NotFoundError)
                expect(error.message).to.equal('Quest not found')
            })
    })

    it('GIVEN non-existent questId WHEN called updateQuest THEN throws NotFoundError', () => {
        const fakeQuestId = new mongoose.Types.ObjectId().toString()
        const updateData = { title: 'New Title' }

        return updateQuest(userId, fakeQuestId, updateData)
            .catch(error => {
                expect(error).to.be.instanceOf(errors.NotFoundError)
                expect(error.message).to.equal('Quest not found')
            })
    })

    it('GIVEN completed quest WHEN called updateQuest THEN throws validation error', () => {
        const updateData = { title: 'Should Not Update' }

        return updateQuest(userId, completedQuestId, updateData)
            .catch(error => {
                expect(error).to.be.instanceOf(errors.ValidationError)
                expect(error.message).to.equal('Cannot update completed quest')
            })
    })

    // ⚡ EDGE CASES & REAL SCENARIOS
    it('GIVEN undefined values in update data WHEN called updateQuest THEN ignores undefined fields', () => {
        const updateData = {
            title: 'New Title',
            description: undefined,
            scheduledTime: '15:00',
            difficulty: undefined
        }

        return updateQuest(userId, questId, updateData)
            .then(result => {
                expect(result.title).to.equal('New Title')
                expect(result.description).to.equal('Original description')
                expect(result.scheduledTime).to.equal('15:00')
                expect(result.difficulty).to.equal('STANDARD')
            })
    })

    it('GIVEN drag and drop scenario WHEN called updateQuest THEN updates time correctly', () => {
        const updateData = { scheduledTime: '14:30' }

        return updateQuest(userId, questId, updateData)
            .then(result => {
                expect(result.scheduledTime).to.equal('14:30')
                expect(result.duration).to.equal(60)
                expect(result.title).to.equal('Original Quest Title')
            })
    })

    it('GIVEN cross-day drag WHEN called updateQuest THEN updates both date and time', () => {
        const updateData = {
            scheduledTime: '08:15',
            scheduledDate: '2025-08-23'
        }

        return updateQuest(userId, questId, updateData)
            .then(result => {
                expect(result.scheduledTime).to.equal('08:15')
                expect(result.scheduledDate).to.be.a('date')
                return Quest.findById(questId)
            })
            .then(quest => {
                expect(quest.scheduledDate.toISOString().split('T')[0]).to.equal('2025-08-23')
            })
    })
})