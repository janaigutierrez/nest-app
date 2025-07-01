import { after, before, afterEach, describe, it } from "mocha"
import { expect } from "chai"
import 'dotenv/config'
import mongoose from 'mongoose'
import User from "../../models/User.js"
import updateUserAvatar from "../../logics/updateUserAvatar.js"
import { errors } from "common"

describe('updateUserAvatar', () => {
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
            password: 'Test123!',
            stats: {
                STRENGTH: 1250,
                DEXTERITY: 25,
                WISDOM: 25,
                CHARISMA: 25
            }
        }

        return User.create(userData)
            .then(createdUser => {
                userId = createdUser._id.toString()
            })
    })

    afterEach(() => {
        return User.deleteMany()
    })

    it('GIVEN valid avatar set WHEN called updateUserAvatar THEN updates successfully', () => {
        return updateUserAvatar(userId, 'base')
            .then(result => {
                expect(result.message).to.equal('Avatar updated successfully')
                expect(result.equippedSet).to.equal('base')
            })
    })

    it('GIVEN high level stats WHEN called updateUserAvatar THEN allows premium sets', () => {
        return updateUserAvatar(userId, 'warrior')
            .then(result => {
                expect(result.equippedSet).to.equal('warrior')
            })
    })

    it('GIVEN invalid avatar set WHEN called updateUserAvatar THEN throws ValidationError', () => {
        return updateUserAvatar(userId, 'invalid-set')
            .catch(error => {
                expect(error).to.be.instanceOf(errors.ValidationError)
            })
    })
})