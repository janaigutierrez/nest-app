import { after, before, beforeEach, afterEach, describe, it } from "mocha"
import { expect } from "chai"
import { errors } from "common"
import 'dotenv/config'
import mongoose from 'mongoose'
import User from "../../models/User.js"
import Quest from "../../models/Quest.js"
import createQuest from "../../logics/createQuest.js"

describe('createQuest', () => {
    let validUserId

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
            password: 'hashedpassword',
            totalXP: 0,
            currentLevel: 1,
            stats: { STRENGTH: 0, DEXTERITY: 0, WISDOM: 0, CHARISMA: 0 }
        }

        return User.create(userData)
            .then(createdUser => {
                validUserId = createdUser._id.toString()
            })
    })

    afterEach(() => {
        return Promise.all([User.deleteMany(), Quest.deleteMany()])
    })

    it('GIVEN valid manual quest WHEN createQuest THEN creates successfully', () => {
        const questData = {
            title: 'Go to gym and workout',
            description: 'Test description',
            difficulty: 'STANDARD',
            useAI: false
        }

        return createQuest(validUserId, questData)
            .then(result => {
                expect(result).to.be.an('object')
                expect(result.title).to.equal('Go to gym and workout')
                expect(result.generatedBy).to.equal('user')
                expect(result.targetStat).to.equal('STRENGTH')
                expect(result.experienceReward).to.be.a('number')
                expect(result.id).to.exist
            })
    })

    it('GIVEN AI quest WHEN createQuest THEN creates with AI or fallback', function () {
        this.timeout(10000)

        const questData = {
            title: 'workout at gym',
            useAI: true,
            difficulty: 'STANDARD'
        }

        return createQuest(validUserId, questData)
            .then(result => {
                expect(result).to.be.an('object')
                expect(['ai', 'epic_fallback', 'user']).to.include(result.generatedBy)
                expect(result.title).to.be.a('string')
                expect(result.id).to.exist
            })
    })

    it('GIVEN invalid userId WHEN createQuest THEN throws validation error', () => {
        const questData = { title: 'Test', useAI: false }

        return createQuest('invalid-id', questData)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.include('userId')
            })
    })

    it('GIVEN non-existent user WHEN createQuest THEN throws ExistenceError', () => {
        const fakeUserId = new mongoose.Types.ObjectId().toString()
        const questData = { title: 'Test', useAI: false }

        return createQuest(fakeUserId, questData)
            .catch(error => {
                expect(error).to.be.instanceOf(errors.ExistenceError)
            })
    })

    it('GIVEN empty title WHEN createQuest THEN throws validation error', () => {
        const questData = { title: '', useAI: false }

        return createQuest(validUserId, questData)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.include('120 is empty')
            })
    })

    it('GIVEN valid quest WHEN createQuest THEN calculates XP correctly', () => {
        const questData = {
            title: 'Valid Task',
            difficulty: 'STANDARD',
            useAI: false
        }

        return createQuest(validUserId, questData)
            .then(result => {
                expect(result.experienceReward).to.be.a('number')
                expect(result.experienceReward).to.be.greaterThan(0)
            })
    })
})