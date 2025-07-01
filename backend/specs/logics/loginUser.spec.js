import { after, before, afterEach, describe, it } from "mocha"
import { expect } from "chai"
import { errors } from "common"
import 'dotenv/config'
import mongoose from 'mongoose'
import User from "../../models/User.js"
import loginUser from "../../logics/loginUser.js"

describe('loginUser', () => {
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

    it('GIVEN valid email and password WHEN called loginUser THEN returns user data with token', () => {
        const userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'Test123!',
            totalXP: 100,
            currentLevel: 2,
            stats: {
                STRENGTH: 25,
                DEXTERITY: 25,
                WISDOM: 25,
                CHARISMA: 25
            }
        }

        return User.create(userData)
            .then(createdUser => {
                return loginUser('test@example.com', 'Test123!')
                    .then(result => {
                        expect(result).to.be.an('object')
                        expect(result).to.have.property('user')
                        expect(result).to.have.property('token')

                        expect(result.user).to.be.an('object')
                        expect(result.user).to.have.property('id')
                        expect(result.user.username).to.equal('testuser')
                        expect(result.user.email).to.equal('test@example.com')
                        expect(result.user.totalXP).to.equal(100)
                        expect(result.user.currentLevel).to.equal(2)
                        expect(result.user.stats).to.be.an('object')

                        expect(result.token).to.be.a('string')
                        expect(result.token.split('.')).to.have.length(3)
                    })
            })
    })

    it('GIVEN email that does not exist WHEN called loginUser THEN throws ExistenceError', () => {
        return loginUser('nonexistent@example.com', 'Test123!')
            .catch(error => {
                expect(error).to.be.instanceOf(errors.ExistenceError)
                expect(error.message).to.be.a('string')
                expect(error.message).to.equal('user not found')
            })
    })

    it('GIVEN valid email but wrong password WHEN called loginUser THEN throws AuthError', () => {
        const userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'Test123!'
        }

        return User.create(userData)
            .then(() => {
                return loginUser('test@example.com', 'WrongPassword!')
                    .catch(error => {
                        expect(error).to.be.instanceOf(errors.AuthError)
                        expect(error.message).to.be.a('string')
                        expect(error.message).to.equal('invalid credentials')
                    })
            })
    })

    it('GIVEN valid email but empty password WHEN called loginUser THEN throws AuthError', () => {
        const userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'Test123!'
        }

        return User.create(userData)
            .then(() => {
                return loginUser('test@example.com', '')
                    .catch(error => {
                        expect(error).to.be.instanceOf(errors.AuthError)
                        expect(error.message).to.be.a('string')
                        expect(error.message).to.equal('invalid credentials')
                    })
            })
    })

    it('GIVEN case-insensitive email WHEN called loginUser THEN login works correctly', () => {
        const userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'Test123!'
        }

        return User.create(userData)
            .then(() => {
                return loginUser('TEST@EXAMPLE.COM', 'Test123!')
                    .then(result => {
                        expect(result).to.be.an('object')
                        expect(result.user.email).to.equal('test@example.com')
                    })
            })
    })
})