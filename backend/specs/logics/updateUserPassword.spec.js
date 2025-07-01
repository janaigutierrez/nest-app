import { after, before, afterEach, describe, it } from "mocha"
import { expect } from "chai"
import 'dotenv/config'
import mongoose from 'mongoose'
import User from "../../models/User.js"
import updateUserPassword from "../../logics/updatePassword.js"
import { errors } from "common"

describe('updateUserPassword', () => {
    let userId
    const originalPassword = 'OldPassword123!'

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
            password: originalPassword
        }

        return User.create(userData)
            .then(createdUser => {
                userId = createdUser._id.toString()
            })
    })

    afterEach(() => {
        return User.deleteMany()
    })

    it('GIVEN valid passwords WHEN called updateUserPassword THEN updates successfully', () => {
        return updateUserPassword(userId, originalPassword, 'NewPassword123!')
            .then(result => {
                expect(result.message).to.equal('Password updated successfully')
            })
    })

    it('GIVEN wrong current password WHEN called updateUserPassword THEN throws AuthError', () => {
        return updateUserPassword(userId, 'WrongPassword123!', 'NewPassword123!')
            .catch(error => {
                expect(error).to.be.instanceOf(errors.AuthError)
            })
    })

    it('GIVEN same passwords WHEN called updateUserPassword THEN throws ValidationError', () => {
        return updateUserPassword(userId, originalPassword, originalPassword)
            .catch(error => {
                expect(error).to.be.instanceOf(errors.ValidationError)
            })
    })
})