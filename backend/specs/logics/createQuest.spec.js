import { after, before, beforeEach, afterEach, describe, it } from "mocha"
import { expect } from "chai"
import 'dotenv/config'
import mongoose from 'mongoose'
import Quest from "../../models/Quest.js"
import User from "../../models/User.js"
import createQuest from "../../logics/createQuest.js"
import { rules } from 'common'
import { AIService } from "../../utils/aiService/index.js"

describe('createQuest', () => {
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
        return Promise.all([
            Quest.deleteMany(),
            User.deleteMany()
        ])
    })

    it('GIVEN valid data with AI WHEN called createQuest THEN creates AI quest', async () => {
        const questData = {
            title: 'Go to gym',
            useAI: true,
            difficulty: 'STANDARD'
        }

        const quest = await createQuest(userId, questData)

        expect(quest.userId.toString()).to.equal(userId)
        expect(quest.isCompleted).to.be.false
        expect(quest.isDaily).to.be.false

        expect(['ai', 'epic_fallback']).to.include(quest.generatedBy)
        expect(quest.experienceReward).to.be.a('number')
        expect(quest.experienceReward).to.be.greaterThan(0)

        expect(quest.title).to.be.a('string')
        expect(quest.title.length).to.be.greaterThan(0)
    })

    it('GIVEN valid data without AI WHEN called createQuest THEN creates manual quest', async () => {
        const questData = {
            title: 'Read a book about wisdom',
            useAI: false,
            difficulty: 'QUICK'
        }

        const quest = await createQuest(userId, questData)

        expect(quest.title).to.equal('Read a book about wisdom')
        expect(quest.generatedBy).to.equal('user')
        expect(quest.difficulty).to.equal('QUICK')
        expect(quest.tags).to.include('manual')

        const expectedBaseXP = rules.QUEST_REWARDS.BASE_XP.QUICK
        const expectedBonusXP = quest.targetStat ? 10 : 0
        expect(quest.experienceReward).to.equal(expectedBaseXP + expectedBonusXP)

        expect(quest.targetStat).to.equal('WISDOM')
    })

    it('GIVEN quest with strength keywords WHEN created manually THEN detects STRENGTH stat', async () => {
        const questData = {
            title: 'Go to gym and lift weights',
            useAI: false,
            difficulty: 'STANDARD'
        }

        const quest = await createQuest(userId, questData)

        expect(quest.targetStat).to.equal('STRENGTH')
        expect(quest.experienceReward).to.equal(60)
    })

    it('GIVEN quest with no stat keywords WHEN created manually THEN no targetStat', async () => {
        const questData = {
            title: 'Do something random',
            useAI: false,
            difficulty: 'STANDARD'
        }

        const quest = await createQuest(userId, questData)

        expect(quest.targetStat).to.be.null
        expect(quest.experienceReward).to.equal(50)
    })

    it('GIVEN empty title WHEN called createQuest THEN throws error', async () => {
        const questData = {
            title: '',
            useAI: false
        }

        try {
            await createQuest(userId, questData)
            expect.fail('Should have thrown an error')
        } catch (error) {
            expect(error.message).to.equal('Quest title is required')
        }
    })

    it('GIVEN whitespace-only title WHEN called createQuest THEN throws error', async () => {
        const questData = {
            title: '   ',
            useAI: false
        }

        try {
            await createQuest(userId, questData)
            expect.fail('Should have thrown an error')
        } catch (error) {
            expect(error.message).to.equal('Quest title is required')
        }
    })

    it('GIVEN missing userId WHEN called createQuest THEN throws error', async () => {
        const questData = {
            title: 'Test quest',
            useAI: false
        }

        try {
            await createQuest(null, questData)
            expect.fail('Should have thrown an error')
        } catch (error) {
            expect(error.message).to.equal('User ID is required')
        }
    })

    it('GIVEN undefined userId WHEN called createQuest THEN throws error', async () => {
        const questData = {
            title: 'Test quest',
            useAI: false
        }

        try {
            await createQuest(undefined, questData)
            expect.fail('Should have thrown an error')
        } catch (error) {
            expect(error.message).to.equal('User ID is required')
        }
    })

    it('GIVEN different difficulty levels WHEN creating quests THEN calculates correct XP', async () => {
        const difficulties = ['QUICK', 'STANDARD', 'LONG', 'EPIC']
        const expectedXP = {
            QUICK: 25,
            STANDARD: 50,
            LONG: 100,
            EPIC: 200
        }

        for (const difficulty of difficulties) {
            const questData = {
                title: 'Test quest no keywords',
                useAI: false,
                difficulty
            }

            const quest = await createQuest(userId, questData)
            expect(quest.experienceReward).to.equal(expectedXP[difficulty])

            await Quest.findByIdAndDelete(quest._id)
        }
    })

    it('GIVEN AI fails WHEN creating quest with AI THEN uses fallback system', async () => {
        const originalGenerate = AIService.generateQuest
        AIService.generateQuest = async () => {
            throw new Error('AI service unavailable')
        }

        const questData = {
            title: 'Exercise at gym',
            useAI: true,
            difficulty: 'STANDARD'
        }

        try {
            const quest = await createQuest(userId, questData)

            expect(quest.generatedBy).to.equal('epic_fallback')
            expect(quest.description).to.equal('Quest created with epic fallback system')
            expect(quest.targetStat).to.equal('STRENGTH')
            expect(quest.experienceReward).to.equal(60)
            expect(quest.tags).to.include('fallback')
        } finally {
            AIService.generateQuest = originalGenerate
        }
    })

    it('GIVEN database save fails WHEN creating quest THEN throws error', async () => {
        const invalidUserId = 'not-a-valid-objectid'

        const questData = {
            title: 'Test quest',
            useAI: false,
            difficulty: 'QUICK'
        }

        try {
            await createQuest(invalidUserId, questData)
            expect.fail('Should have thrown an error')
        } catch (error) {
            expect(error.message).to.equal('Failed to save quest to database')
        }
    })

    it('GIVEN AI fails with EPIC difficulty WHEN creating quest THEN calculates correct XP', async () => {
        const originalGenerate = AIService.generateQuest
        AIService.generateQuest = async () => {
            throw new Error('AI service unavailable')
        }

        const questData = {
            title: 'Epic programming challenge',
            useAI: true,
            difficulty: 'EPIC'
        }

        try {
            const quest = await createQuest(userId, questData)

            expect(quest.generatedBy).to.equal('epic_fallback')
            expect(quest.experienceReward).to.equal(210)
            expect(quest.targetStat).to.equal('WISDOM')
        } finally {
            AIService.generateQuest = originalGenerate
        }
    })
})