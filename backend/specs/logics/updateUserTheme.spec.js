import { after, before, afterEach, describe, it } from "mocha"
import { expect } from "chai"
import 'dotenv/config'
import mongoose from 'mongoose'
import User from "../../models/User.js"
import updateUserTheme from "../../logics/updateUserTheme.js"
import { errors } from "common"

describe('updateUserTheme', () => {
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
            })
    })

    afterEach(() => {
        return User.deleteMany()
    })

    it('GIVEN valid theme WHEN called updateUserTheme THEN updates successfully', () => {
        return updateUserTheme(userId, 'dark')
            .then(result => {
                expect(result.message).to.equal('Theme updated successfully')
                expect(result.theme).to.equal('dark')
                expect(result).to.have.property('user')
            })
    })

    it('GIVEN library theme WHEN called updateUserTheme THEN updates successfully', () => {
        return updateUserTheme(userId, 'library')
            .then(result => {
                expect(result.theme).to.equal('library')
            })
    })

    it('GIVEN invalid theme WHEN called updateUserTheme THEN throws ValidationError', () => {
        return updateUserTheme(userId, 'invalid-theme')
            .catch(error => {
                expect(error).to.be.instanceOf(errors.ValidationError)
                expect(error.message).to.include('Invalid theme')
            })
    })

    it('GIVEN non-existent user WHEN called updateUserTheme THEN throws ExistenceError', () => {
        const fakeId = new mongoose.Types.ObjectId().toString()

        return updateUserTheme(fakeId, 'dark')
            .catch(error => {
                expect(error).to.be.instanceOf(errors.ExistenceError)
                expect(error.message).to.equal('User not found')
            })
    })

    it('GIVEN invalid userId WHEN called updateUserTheme THEN throws validation error', () => {
        return updateUserTheme('invalid-id', 'dark')
            .catch(error => {
                expect(error.message).to.include('userId')
            })
    })
})