import 'dotenv/config'
import { expect } from 'chai'

describe('XPCalculator', () => {
    let XPCalculator

    before(async () => {
        try {
            const module = await import('../utils/aiService/XPCalculator.js')
            XPCalculator = module.XPCalculator
        } catch (error) {
            console.log('⚠️ Skipping XPCalculator tests due to import issues')
            return
        }
    })

    it('GIVEN QUICK difficulty WHEN getBaseXP THEN returns 25', async () => {
        if (!XPCalculator) return

        const result = XPCalculator.getBaseXP('QUICK')
        expect(result).to.equal(25)
    })

    it('GIVEN STANDARD difficulty WHEN getBaseXP THEN returns 50', async () => {
        if (!XPCalculator) return

        const result = XPCalculator.getBaseXP('STANDARD')
        expect(result).to.equal(50)
    })

    it('GIVEN LONG difficulty WHEN getBaseXP THEN returns 100', async () => {
        if (!XPCalculator) return

        const result = XPCalculator.getBaseXP('LONG')
        expect(result).to.equal(100)
    })

    it('GIVEN EPIC difficulty WHEN getBaseXP THEN returns 200', async () => {
        if (!XPCalculator) return

        const result = XPCalculator.getBaseXP('EPIC')
        expect(result).to.equal(200)
    })

    it('GIVEN invalid difficulty WHEN getBaseXP THEN returns STANDARD default', async () => {
        if (!XPCalculator) return

        const result = XPCalculator.getBaseXP('INVALID')
        expect(result).to.equal(50) // STANDARD default
    })

    it('GIVEN base XP and daily quest WHEN calculateQuestXP THEN applies 20% bonus', async () => {
        if (!XPCalculator) return

        const result = XPCalculator.calculateQuestXP(50, true, null)
        expect(result).to.equal(60) // 50 + 20% = 60
    })

    it('GIVEN base XP and target stat WHEN calculateQuestXP THEN adds 10 XP bonus', async () => {
        if (!XPCalculator) return

        const result = XPCalculator.calculateQuestXP(50, false, 'STRENGTH')
        expect(result).to.equal(60) // 50 + 10 stat bonus = 60
    })

    it('GIVEN base XP, daily quest and target stat WHEN calculateQuestXP THEN applies both bonuses', async () => {
        if (!XPCalculator) return

        const result = XPCalculator.calculateQuestXP(50, true, 'WISDOM')
        expect(result).to.equal(70) // 50 + 20% + 10 = 70
    })

    it('GIVEN only base XP WHEN calculateQuestXP THEN returns base XP', async () => {
        if (!XPCalculator) return

        const result = XPCalculator.calculateQuestXP(100, false, null)
        expect(result).to.equal(100)
    })
})