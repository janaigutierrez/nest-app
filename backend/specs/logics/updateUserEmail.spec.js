import { after, before, afterEach, describe, it } from "mocha"
import { expect } from "chai"
import 'dotenv/config'
import mongoose from 'mongoose'
import User from "../../models/User.js"
import updateUserEmail from "../../logics/updateUserEmail.js"
import { errors } from "common"

describe('updateUserEmail', () => {
    let userId
    let anotherUserId
    const originalEmail = 'test@example.com'
    const originalPassword = 'TestPassword123!'

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
            email: originalEmail,
            password: originalPassword
        }

        const anotherUserData = {
            username: 'anotheruser',
            email: 'another@example.com',
            password: 'AnotherPass123!'
        }

        return Promise.all([
            User.create(userData),
            User.create(anotherUserData)
        ])
            .then(([createdUser, createdAnotherUser]) => {
                userId = createdUser._id.toString()
                anotherUserId = createdAnotherUser._id.toString()
            })
    })

    afterEach(() => {
        return User.deleteMany()
    })

    it('GIVEN valid new email and correct password WHEN called updateUserEmail THEN updates successfully', () => {
        const newEmail = 'newemail@example.com'

        return updateUserEmail(userId, newEmail, originalPassword)
            .then(result => {
                expect(result).to.be.an('object')
                expect(result.message).to.equal('Email updated successfully')

                return User.findById(userId)
            })
            .then(user => {
                expect(user.email).to.equal('newemail@example.com')
            })
    })

    it('GIVEN wrong password WHEN called updateUserEmail THEN throws AuthError', () => {
        const newEmail = 'newemail@example.com'
        const wrongPassword = 'WrongPassword123!'

        return updateUserEmail(userId, newEmail, wrongPassword)
            .catch(error => {
                expect(error).to.be.instanceOf(errors.AuthError)
                expect(error.message).to.equal('incorrect password')
            })
    })

    it('GIVEN same email as current WHEN called updateUserEmail THEN throws DuplicateError', () => {
        return updateUserEmail(userId, originalEmail, originalPassword)
            .catch(error => {
                expect(error).to.be.instanceOf(errors.DuplicateError)
                expect(error.message).to.equal('new email is the same as current email')
            })
    })

    it('GIVEN email already used by another user WHEN called updateUserEmail THEN throws DuplicateError', () => {
        const existingEmail = 'another@example.com'

        return updateUserEmail(userId, existingEmail, originalPassword)
            .catch(error => {
                expect(error).to.be.instanceOf(errors.DuplicateError)
                expect(error.message).to.equal('Email already in use')
            })
    })

    it('GIVEN invalid email format WHEN called updateUserEmail THEN throws Error', () => {
        const invalidEmail = 'notanemail'

        return updateUserEmail(userId, invalidEmail, originalPassword)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('email is not valid')
            })
    })

    it('GIVEN empty email WHEN called updateUserEmail THEN throws Error', () => {
        return updateUserEmail(userId, '', originalPassword)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('email is empty')
            })
    })

    it('GIVEN null email WHEN called updateUserEmail THEN throws Error', () => {
        return updateUserEmail(userId, null, originalPassword)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('email is not a string')
            })
    })

    it('GIVEN empty password WHEN called updateUserEmail THEN throws ValidationError', () => {
        const newEmail = 'newemail@example.com'

        return updateUserEmail(userId, newEmail, '')
            .catch(error => {
                expect(error).to.be.instanceOf(errors.ValidationError)
                expect(error.message).to.include('password is required')
            })
    })

    it('GIVEN non-existent userId WHEN called updateUserEmail THEN throws ExistenceError', () => {
        const fakeUserId = new mongoose.Types.ObjectId().toString()
        const newEmail = 'newemail@example.com'

        return updateUserEmail(fakeUserId, newEmail, originalPassword)
            .catch(error => {
                expect(error).to.be.instanceOf(errors.ExistenceError)
                expect(error.message).to.equal('User not found')
            })
    })

    it('GIVEN invalid userId format WHEN called updateUserEmail THEN throws Error', () => {
        const invalidUserId = 'not-a-valid-id'
        const newEmail = 'newemail@example.com'

        return updateUserEmail(invalidUserId, newEmail, originalPassword)
            .catch(error => {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('userId is not a valid id')
            })
    })

    it('GIVEN email with spaces WHEN called updateUserEmail THEN trims and updates', () => {
        const emailWithSpaces = 'newemail@example.com'

        return updateUserEmail(userId, emailWithSpaces, originalPassword)
            .then(result => {
                expect(result.message).to.equal('Email updated successfully')
                return User.findById(userId)
            })
            .then(user => {
                expect(user.email).to.equal('newemail@example.com')
            })
    })

    it('GIVEN uppercase email WHEN called updateUserEmail THEN converts to lowercase and updates', () => {
        const uppercaseEmail = 'NEWEMAIL@EXAMPLE.COM'

        return updateUserEmail(userId, uppercaseEmail, originalPassword)
            .then(result => {
                expect(result.message).to.equal('Email updated successfully')
                return User.findById(userId)
            })
            .then(user => {
                expect(user.email).to.equal('newemail@example.com')
            })
    })
})