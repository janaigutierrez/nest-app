import { after, before, afterEach, describe, it } from "mocha"
import { expect } from "chai"
import 'dotenv/config'
import mongoose from 'mongoose'
import User from "../../models/User.js"
import updateUserUsername from "../../logics/updateUserUsername.js"
import { errors } from "common"

describe('updateUserUsername', () => {
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

    it('GIVEN valid new username WHEN called updateUserUsername THEN updates successfully', () => {
        return updateUserUsername(userId, 'newusername')
            .then(result => {
                expect(result.message).to.equal('Username updated successfully')
                expect(result.username).to.equal('newusername')
            })
    })

    it('GIVEN duplicate username WHEN called updateUserUsername THEN throws DuplicateError', () => {
        return User.create({ username: 'existing', email: 'existing@test.com', password: 'Test123!' })
            .then(() => updateUserUsername(userId, 'existing'))
            .catch(error => {
                expect(error).to.be.instanceOf(errors.DuplicateError)
            })
    })

    it('GIVEN invalid userId WHEN called updateUserUsername THEN throws error', () => {
        return updateUserUsername('invalid-id', 'newusername')
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
            })
    })

    it('GIVEN empty username WHEN called updateUserUsername THEN throws error', () => {
        return updateUserUsername(userId, '')
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
            })
    })
})