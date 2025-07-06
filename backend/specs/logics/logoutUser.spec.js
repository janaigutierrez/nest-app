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

                return TokenBlacklist.findOne({ token: validToken })
            })
            .then(blacklistedToken => {
                expect(blacklistedToken).to.exist
                expect(blacklistedToken.token).to.equal(validToken)
                expect(blacklistedToken.userId.toString()).to.equal(userId)
            })
    })

    it('GIVEN invalid token format WHEN called logoutUser THEN throws error', () => {
        return logoutUser('invalid-token', userId)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.include('token')
            })
    })

    it('GIVEN empty token WHEN called logoutUser THEN throws validation error', () => {
        return logoutUser('', userId)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
            })
    })

    it('GIVEN null token WHEN called logoutUser THEN throws validation error', () => {
        return logoutUser(null, userId)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
            })
    })

    it('GIVEN undefined token WHEN called logoutUser THEN throws validation error', () => {
        return logoutUser(undefined, userId)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
            })
    })

    it('GIVEN expired token WHEN called logoutUser THEN throws error', () => {
        const expiredToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '-1h' })

        return logoutUser(expiredToken, userId)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.include('expired')
            })
    })

    it('GIVEN token with wrong signature WHEN called logoutUser THEN throws error', () => {
        const wrongToken = jwt.sign({ userId }, 'wrong-secret', { expiresIn: '7d' })

        return logoutUser(wrongToken, userId)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.include('signature')
            })
    })

    it('GIVEN already blacklisted token WHEN called logoutUser THEN handles gracefully', () => {
        return logoutUser(validToken, userId)
            .then(() => {
                return logoutUser(validToken, userId)
            })
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
            })
    })

    it('GIVEN token without userId in payload WHEN called logoutUser THEN throws error', () => {
        const tokenWithoutUserId = jwt.sign({ someOtherField: 'value' }, process.env.JWT_SECRET, { expiresIn: '7d' })

        return logoutUser(tokenWithoutUserId, userId)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
            })
    })

    it('GIVEN valid token with different userId WHEN called logoutUser THEN throws authorization error', () => {
        const differentUserId = new mongoose.Types.ObjectId().toString()
        const tokenWithDifferentUser = jwt.sign({ userId: differentUserId }, process.env.JWT_SECRET, { expiresIn: '7d' })

        return logoutUser(tokenWithDifferentUser, userId)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
            })
    })

    it('GIVEN invalid userId format WHEN called logoutUser THEN throws validation error', () => {
        return logoutUser(validToken, 'invalid-user-id')
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
            })
    })

    it('GIVEN successful logout WHEN checking blacklist THEN token exists with correct expiry', () => {
        return logoutUser(validToken, userId)
            .then(() => {
                return TokenBlacklist.findOne({ token: validToken })
            })
            .then(blacklistedToken => {
                expect(blacklistedToken).to.exist
                expect(blacklistedToken.expiresAt).to.be.a('date')
                expect(blacklistedToken.expiresAt).to.be.greaterThan(new Date())
            })
    })
})