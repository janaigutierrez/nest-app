import { after, before, afterEach, describe, it } from "mocha"
import { expect } from "chai"
import 'dotenv/config'
import mongoose from 'mongoose'
import Quest from "../../models/Quest.js"
import User from "../../models/User.js"
import getAllQuests from "../../logics/getAllQuests.js"

describe('getAllQuests', () => {
    let userId

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

        return User.create(userData)
            .then(createdUser => {
                userId = createdUser._id.toString()

                const questData = {
                    title: 'Test Quest',
                    difficulty: 'STANDARD',
                    experienceReward: 50,
                    targetStat: 'STRENGTH',
                    userId: userId,
                    isCompleted: false
                }

                return Quest.create(questData)
            })
    })

    afterEach(() => {
        return Promise.all([
            Quest.deleteMany(),
            User.deleteMany()
        ])
    })

    it('GIVEN user with quests WHEN called getAllQuests THEN returns user quests', () => {
        return getAllQuests(userId)
            .then(quests => {
                expect(quests).to.be.an('array')
                expect(quests).to.have.length(1)
                expect(quests[0].title).to.equal('Test Quest')
                expect(quests[0].id).to.be.a('string')
            })
    })

    it('GIVEN user with no quests WHEN called getAllQuests THEN returns empty array', () => {
        return Quest.deleteMany()
            .then(() => getAllQuests(userId))
            .then(quests => {
                expect(quests).to.be.an('array')
                expect(quests).to.have.length(0)
            })
    })
})