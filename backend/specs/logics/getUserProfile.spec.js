import { after, before, afterEach, describe, it } from "mocha"
import { expect } from "chai"
import { errors } from "common"
import 'dotenv/config'
import mongoose from 'mongoose'
import User from "../../models/User.js"
import getUserProfile from "../../logics/getUserProfile.js"

describe('getUserProfile', () => {
    before(() => {
        return mongoose.connect(process.env.MONGO_URL, {
            dbName: process.env.MONGO_DB_TEST
        })
    })

    after(() => {
        return mongoose.disconnect()
    })

    afterEach(() => {
        return User.deleteMany()
    })

    it('GIVEN a user id that exists in the DB WHEN called getUserProfile THEN returns the user profile data', () => {
        const userData = {
            username: 'testuser',
            password: 'Test123!',
            email: 'test@example.com',
            totalXP: 0,
            currentLevel: 1,
            stats: {
                STRENGTH: 25,
                DEXTERITY: 50,
                WISDOM: 75,
                CHARISMA: 25
            },
            preferences: {
                theme: 'dark',
                notifications: true
            }
        }

        return User.create(userData)
            .then(createdUser => {
                const userId = createdUser._id.toString()
                return getUserProfile(userId)
                    .then(profile => {
                        expect(profile).to.be.an('object')
                        expect(profile.id).to.equal(createdUser._id.toString())
                        expect(profile.username).to.equal('testuser')
                        expect(profile.email).to.equal('test@example.com')
                        expect(profile.totalXP).to.equal(0)
                        expect(profile.currentLevel).to.equal(1)
                        expect(profile.stats).to.be.an('object')
                        expect(profile.stats.STRENGTH).to.equal(25)
                        expect(profile.preferences).to.be.an('object')
                        expect(profile.preferences.theme).to.equal('dark')
                        expect(profile.createdAt).to.be.a('date')
                        expect(profile.updatedAt).to.be.a('date')
                    })
            })
    })

    it('GIVEN a user id that does not exist in the DB WHEN called getUserProfile THEN throws ExistenceError', () => {
        const randomId = new mongoose.Types.ObjectId()

        return getUserProfile(randomId.toString())
            .catch(error => {
                expect(error).to.be.instanceOf(errors.ExistenceError)
                expect(error.message).to.be.a('string')
                expect(error.message).to.equal('user not found')
            })
    })

    it('GIVEN an invalid user id format WHEN called getUserProfile THEN throws ContentError', () => {
        const invalidId = 'invalid-id-format'

        return getUserProfile(invalidId)
            .catch(error => {
                expect(error).to.be.instanceOf(errors.ContentError)
                expect(error.message).to.be.a('string')
                expect(error.message).to.equal('Invalid user ID format')
            })
    })
})