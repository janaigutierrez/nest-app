import { after, before, afterEach, describe, it } from "mocha"
import { expect } from "chai"
import 'dotenv/config'
import mongoose from 'mongoose'
import Quest from "../../models/Quest.js"
import User from "../../models/User.js"
import deleteQuest from "../../logics/deleteQuest.js"
import { errors } from "common"

describe('deleteQuest', () => {
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
            password: 'Test123!'
        }

        const anotherUserData = {
            username: 'anotheruser',
            email: 'another@example.com',
            password: 'Test123!'
        }

        return Promise.all([
            User.create(userData),
            User.create(anotherUserData)
        ])
            .then(([createdUser, createdAnotherUser]) => {
                userId = createdUser._id.toString()
                anotherUserId = createdAnotherUser._id.toString()

                const questData = {
                    title: 'Deletable Quest',
                    description: 'A quest that can be deleted',
                    difficulty: 'STANDARD',
                    experienceReward: 50,
                    targetStat: 'STRENGTH',
                    userId: userId,
                    isCompleted: false
                }

                const completedQuestData = {
                    title: 'Completed Quest',
                    description: 'This quest is completed and cannot be deleted',
                    difficulty: 'QUICK',
                    experienceReward: 25,
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

    it('GIVEN valid userId and questId WHEN called deleteQuest THEN deletes quest successfully', () => {
        return deleteQuest(userId, questId)
            .then(deletedQuest => {
                expect(deletedQuest).to.be.an('object')
                expect(deletedQuest.title).to.equal('Deletable Quest')
                expect(deletedQuest.isCompleted).to.equal(false)

                return Quest.findById(questId)
            })
            .then(foundQuest => {
                expect(foundQuest).to.be.null
            })
    })

    it('GIVEN invalid userId WHEN called deleteQuest THEN throws validation error', () => {
        return deleteQuest('invalid-id', questId)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.include('user ID is not a valid id')
            })
    })

    it('GIVEN invalid questId WHEN called deleteQuest THEN throws validation error', () => {
        return deleteQuest(userId, 'invalid-id')
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.include('quest ID is not a valid id')
            })
    })

    it('GIVEN non-existent questId WHEN called deleteQuest THEN throws ExistenceError', () => {
        const fakeQuestId = new mongoose.Types.ObjectId().toString()

        return deleteQuest(userId, fakeQuestId)
            .catch(error => {
                expect(error).to.be.instanceOf(errors.ExistenceError)
                expect(error.message).to.equal('quest not found')
            })
    })

    it('GIVEN quest belonging to another user WHEN called deleteQuest THEN throws AuthorizationError', () => {
        return deleteQuest(anotherUserId, questId)
            .catch(error => {
                expect(error).to.be.instanceOf(errors.AuthorizationError)
                expect(error.message).to.equal('quest does not belong to user')
            })
    })

    it('GIVEN completed quest WHEN called deleteQuest THEN throws ValidationError', () => {
        return deleteQuest(userId, completedQuestId)
            .catch(error => {
                expect(error).to.be.instanceOf(errors.ValidationError)
                expect(error.message).to.equal('cannot delete completed quest')
            })
    })

    it('GIVEN quest with different targetStats WHEN called deleteQuest THEN deletes successfully regardless of stat', () => {
        const wisdomQuestData = {
            title: 'Wisdom Quest',
            description: 'A quest for wisdom',
            difficulty: 'EPIC',
            experienceReward: 200,
            targetStat: 'WISDOM',
            userId: userId,
            isCompleted: false
        }

        const charismaQuestData = {
            title: 'Charisma Quest',
            description: 'A quest for charisma',
            difficulty: 'LONG',
            experienceReward: 100,
            targetStat: 'CHARISMA',
            userId: userId,
            isCompleted: false
        }

        return Promise.all([
            Quest.create(wisdomQuestData),
            Quest.create(charismaQuestData)
        ])
            .then(([wisdomQuest, charismaQuest]) => {
                return Promise.all([
                    deleteQuest(userId, wisdomQuest._id.toString()),
                    deleteQuest(userId, charismaQuest._id.toString())
                ])
            })
            .then(([deletedWisdomQuest, deletedCharismaQuest]) => {
                expect(deletedWisdomQuest.targetStat).to.equal('WISDOM')
                expect(deletedCharismaQuest.targetStat).to.equal('CHARISMA')

                return Promise.all([
                    Quest.findById(deletedWisdomQuest._id),
                    Quest.findById(deletedCharismaQuest._id)
                ])
            })
            .then(([wisdomQuest, charismaQuest]) => {
                expect(wisdomQuest).to.be.null
                expect(charismaQuest).to.be.null
            })
    })

    it('GIVEN daily quest WHEN called deleteQuest THEN deletes successfully', () => {
        const dailyQuestData = {
            title: 'Daily Task',
            description: 'A daily quest',
            difficulty: 'QUICK',
            experienceReward: 30,
            targetStat: 'DEXTERITY',
            userId: userId,
            isCompleted: false,
            isDaily: true
        }

        return Quest.create(dailyQuestData)
            .then(createdDailyQuest => deleteQuest(userId, createdDailyQuest._id.toString()))
            .then(deletedQuest => {
                expect(deletedQuest.isDaily).to.equal(true)
                expect(deletedQuest.title).to.equal('Daily Task')

                return Quest.findById(deletedQuest._id)
            })
            .then(foundQuest => {
                expect(foundQuest).to.be.null
            })
    })
})