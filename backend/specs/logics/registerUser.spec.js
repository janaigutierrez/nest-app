import { after, before, afterEach, describe, it } from "mocha"
import { expect } from "chai"
import { errors } from "common"
import 'dotenv/config'
import mongoose from 'mongoose'
import User from "../../models/User.js"
import registerUser from "../../logics/registerUser.js"

describe('registerUser', () => {
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

    it('GIVEN valid user data WHEN called registerUser THEN creates user and returns user data with token', () => {
        const username = 'testuser'
        const email = 'test@example.com'
        const password = 'Test123!'

        return registerUser(username, email, password)
            .then(result => {
                expect(result).to.be.an('object')
                expect(result).to.have.property('user')
                expect(result).to.have.property('token')

                expect(result.user).to.be.an('object')
                expect(result.user).to.have.property('id')
                expect(result.user.username).to.equal('testuser')
                expect(result.user.email).to.equal('test@example.com')
                expect(result.user.totalXP).to.equal(0)
                expect(result.user.currentLevel).to.equal(1)
                expect(result.user.stats).to.be.an('object')

                expect(result.token).to.be.a('string')
                expect(result.token.split('.')).to.have.length(3) // JWT format
            })
    })

    it('GIVEN duplicate email WHEN called registerUser THEN throws DuplicateError', () => {
        const userData = {
            username: 'existinguser',
            email: 'existing@example.com',
            password: 'Existing123!'
        }

        return User.create(userData)
            .then(() => {
                return registerUser('newuser', 'existing@example.com', 'New123!')
                    .catch(error => {
                        expect(error).to.be.instanceOf(errors.DuplicateError)
                        expect(error.message).to.be.a('string')
                        expect(error.message).to.equal('user already exists')
                    })
            })
    })

    it('GIVEN duplicate username WHEN called registerUser THEN throws DuplicateError', () => {
        const userData = {
            username: 'existinguser',
            email: 'existing@example.com',
            password: 'Existing123!'
        }

        return User.create(userData)
            .then(() => {
                return registerUser('existinguser', 'new@example.com', 'New123!')
                    .catch(error => {
                        expect(error).to.be.instanceOf(errors.DuplicateError)
                        expect(error.message).to.be.a('string')
                        expect(error.message).to.equal('user already exists')
                    })
            })
    })

    it('GIVEN user is successfully created WHEN checking database THEN user exists with hashed password', () => {
        const username = 'testuser'
        const email = 'test@example.com'
        const password = 'Test123!'

        return registerUser(username, email, password)
            .then(result => {
                return User.findById(result.user.id)
                    .then(userInDb => {
                        expect(userInDb).to.not.be.null
                        expect(userInDb.username).to.equal('testuser')
                        expect(userInDb.email).to.equal('test@example.com')
                        expect(userInDb.password).to.not.equal('Test123!') // Hashed
                        expect(userInDb.password).to.be.a('string')
                        expect(userInDb.password.length).to.be.greaterThan(10)
                    })
            })
    })
})