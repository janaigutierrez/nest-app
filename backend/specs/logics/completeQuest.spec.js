import { after, before, afterEach, describe, it } from "mocha"
import { expect } from "chai"
import 'dotenv/config'
import mongoose from 'mongoose'
import Quest from "../../models/Quest.js"
import User from "../../models/User.js"
import completeQuest from "../../logics/completeQuest.js"
import { errors } from "common"

describe('completeQuest', () => {
    let userId
    let anotherUserId
    let questId
    let completedQuestId

    before(() => {
        return mongoose.connect(process.env.MONGO_URL, {
            dbName: process.env.MONGO_DB_TEST
        })
    })

    after(() => {
        return mongoose.disconnect()
    })

    beforeEach(() => {
        const userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'Test123!',
            totalXP: 0,  // FIX: Use totalXP not totalExperience
            stats: {
                STRENGTH: 0,
                DEXTERITY: 0,
                WISDOM: 0,
                CHARISMA: 0
            }
        }

        const anotherUserData = {
            username: 'anotheruser',
            email: 'another@example.com',
            password: 'Test123!',
            totalXP: 0,  // FIX: Use totalXP not totalExperience
            stats: {
                STRENGTH: 0,
                DEXTERITY: 0,
                WISDOM: 0,
                CHARISMA: 0
            }
        }

        return Promise.all([
            User.create(userData),
            User.create(anotherUserData)
        ])
            .then(([createdUser, createdAnotherUser]) => {
                userId = createdUser._id.toString()
                anotherUserId = createdAnotherUser._id.toString()

                const questData = {
                    title: 'Test Quest',
                    description: 'A test quest for strength',
                    difficulty: 'STANDARD',
                    experienceReward: 60,  // STANDARD (50) + targetStat bonus (10)
                    targetStat: 'STRENGTH',
                    userId: userId,
                    isCompleted: false
                }

                const completedQuestData = {
                    title: 'Already Completed Quest',
                    description: 'This quest is already done',
                    difficulty: 'QUICK',
                    experienceReward: 25,  // QUICK (25) + no bonus (no targetStat)
                    targetStat: 'DEXTERITY',
                    userId: userId,
                    isCompleted: true,
                    completedAt: new Date()
                }

                return Promise.all([
                    Quest.create(questData),
                    Quest.create(completedQuestData)
                ])
            })
            .then(([createdQuest, createdCompletedQuest]) => {
                questId = createdQuest._id.toString()
                completedQuestId = createdCompletedQuest._id.toString()
            })
    })

    afterEach(() => {
        return Promise.all([
            Quest.deleteMany(),
            User.deleteMany()
        ])
    })

    it('GIVEN valid userId and questId WHEN called completeQuest THEN completes quest and updates user stats', () => {
        return completeQuest(userId, questId)
            .then(result => {
                expect(result).to.be.an('object')
                expect(result).to.have.property('updatedQuest')
                expect(result).to.have.property('updatedUser')
                expect(result).to.have.property('xpGained')
                expect(result).to.have.property('statGained')
                expect(result).to.have.property('levelUp')
                expect(result).to.have.property('newLevel')

                // Check quest completion
                expect(result.updatedQuest.isCompleted).to.equal(true)
                expect(result.updatedQuest.completedAt).to.be.a('date')

                // Check XP gain (STANDARD = 50 + 10 bonus for targetStat)
                expect(result.xpGained).to.equal(60)
                expect(result.statGained).to.equal(25)

                // Check user updates (60 XP not enough to level up from level 1)
                expect(result.updatedUser.totalXP).to.equal(60)  // FIX: totalXP
                expect(result.updatedUser.stats.STRENGTH).to.equal(25)
                expect(result.levelUp).to.equal(false) // 60 XP < 100 XP needed for level 2
                expect(result.newLevel).to.equal(1)
            })
    })

    it('GIVEN user with high XP WHEN completing quest THEN triggers level up', () => {
        // Set user close to level up (Level 2 requires 100 XP)
        return User.findByIdAndUpdate(userId, { totalXP: 50 })  // FIX: totalXP
            .then(() => completeQuest(userId, questId))
            .then(result => {
                expect(result.levelUp).to.equal(true)
                expect(result.newLevel).to.equal(2) // Should reach level 2
                expect(result.updatedUser.totalXP).to.equal(110) // FIX: totalXP
            })
    })

    it('GIVEN quest with no targetStat WHEN completing quest THEN only gains XP', () => {
        const noStatQuestData = {
            title: 'No Stat Quest',
            description: 'Quest without target stat',
            difficulty: 'QUICK',
            experienceReward: 25, // QUICK (25) + no bonus
            targetStat: null,
            userId: userId,
            isCompleted: false
        }

        return Quest.create(noStatQuestData)
            .then(createdQuest => completeQuest(userId, createdQuest._id.toString()))
            .then(result => {
                expect(result.xpGained).to.equal(25) // No targetStat bonus
                expect(result.updatedUser.totalXP).to.equal(25)  // FIX: totalXP
                expect(result.updatedUser.stats.STRENGTH).to.equal(0)
                expect(result.updatedUser.stats.DEXTERITY).to.equal(0)
                expect(result.updatedUser.stats.WISDOM).to.equal(0)
                expect(result.updatedUser.stats.CHARISMA).to.equal(0)
            })
    })

    it('GIVEN invalid userId WHEN called completeQuest THEN throws validation error', () => {
        return completeQuest('invalid-id', questId)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.include('user ID is not a valid id')
            })
    })

    it('GIVEN invalid questId WHEN called completeQuest THEN throws validation error', () => {
        return completeQuest(userId, 'invalid-id')
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.include('quest ID is not a valid id')
            })
    })

    it('GIVEN non-existent questId WHEN called completeQuest THEN throws ExistenceError', () => {
        const fakeQuestId = new mongoose.Types.ObjectId().toString()

        return completeQuest(userId, fakeQuestId)
            .catch(error => {
                expect(error).to.be.instanceOf(errors.ExistenceError)
                expect(error.message).to.equal('quest not found')
            })
    })

    it('GIVEN non-existent userId WHEN called completeQuest THEN throws ExistenceError', () => {
        const fakeUserId = new mongoose.Types.ObjectId().toString()

        // First create a quest for the fake user to avoid AuthorizationError
        const fakeUserQuestData = {
            title: 'Fake User Quest',
            description: 'Quest for non-existent user',
            difficulty: 'STANDARD',
            experienceReward: 50,
            targetStat: 'STRENGTH',
            userId: fakeUserId,
            isCompleted: false
        }

        return Quest.create(fakeUserQuestData)
            .then(createdQuest => completeQuest(fakeUserId, createdQuest._id.toString()))
            .catch(error => {
                expect(error).to.be.instanceOf(errors.ExistenceError)
                expect(error.message).to.equal('user not found')
            })
    })

    it('GIVEN quest belonging to another user WHEN called completeQuest THEN throws AuthorizationError', () => {
        return completeQuest(anotherUserId, questId)
            .catch(error => {
                expect(error).to.be.instanceOf(errors.AuthorizationError)
                expect(error.message).to.equal('quest does not belong to user')
            })
    })

    it('GIVEN already completed quest WHEN called completeQuest THEN throws DuplicateError', () => {
        return completeQuest(userId, completedQuestId)
            .catch(error => {
                expect(error).to.be.instanceOf(errors.DuplicateError)
                expect(error.message).to.equal('quest already completed')
            })
    })

    it('GIVEN quest with WISDOM targetStat WHEN completing quest THEN updates WISDOM stat', () => {
        const wisdomQuestData = {
            title: 'Study Quest',
            description: 'Read and learn',
            difficulty: 'LONG',
            experienceReward: 110, // LONG (100) + bonus (10)
            targetStat: 'WISDOM',
            userId: userId,
            isCompleted: false
        }

        return Quest.create(wisdomQuestData)
            .then(createdQuest => completeQuest(userId, createdQuest._id.toString()))
            .then(result => {
                expect(result.updatedUser.stats.WISDOM).to.equal(25)
                expect(result.updatedUser.stats.STRENGTH).to.equal(0)
                expect(result.xpGained).to.equal(110) // LONG = 100 + 10 bonus
            })
    })
})