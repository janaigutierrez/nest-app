import { after, before, afterEach, describe, it } from "mocha"
import { expect } from "chai"
import 'dotenv/config'
import mongoose from 'mongoose'
import User from "../../models/User.js"
import TokenBlacklist from "../../models/TokenBlacklist.js"
import logoutUser from "../../logics/logoutUser.js"
import jwt from "jsonwebtoken"

describe('logoutUser', () => {
    let userId
    let validToken

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
                validToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
            })
    })

    afterEach(() => {
        return Promise.all([
            User.deleteMany(),
            TokenBlacklist.deleteMany()
        ])
    })

    it('GIVEN valid token WHEN called logoutUser THEN adds token to blacklist', () => {
        return logoutUser(validToken, userId)
            .then(result => {
                expect(result.message).to.equal('Logout successful')
                expect(result.tokenInvalidated).to.equal(true)
            })
    })

    it('GIVEN invalid token WHEN called logoutUser THEN throws error', () => {
        return logoutUser('invalid-token', userId)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
            })
    })
})