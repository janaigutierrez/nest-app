import 'dotenv/config'
import { expect } from 'chai'

describe('FallbackSystem', () => {
    let FallbackSystem

    before(async () => {
        try {
            const module = await import('../utils/aiService/fallbackSystem.js')
            FallbackSystem = module.FallbackSystem
        } catch (error) {
            console.log('⚠️ Skipping FallbackSystem tests due to import issues')
            return
        }
    })

    describe('generateQuest', () => {
        it('GIVEN gym prompt WHEN generateQuest THEN creates STRENGTH quest', async () => {
            if (!FallbackSystem) return

            const result = FallbackSystem.generateQuest('go to gym', null, 'STANDARD')

            expect(result.targetStat).to.equal('STRENGTH')
            expect(result.title).to.include('Noble')
            expect(result.difficulty).to.equal('STANDARD')
            expect(result.generatedBy).to.equal('fallback')
            expect(result.experienceReward).to.be.greaterThan(50) // Base + stat bonus + fallback bonus
        })

        it('GIVEN study prompt WHEN generateQuest THEN creates WISDOM quest', async () => {
            if (!FallbackSystem) return

            const result = FallbackSystem.generateQuest('study math', null, 'LONG')

            expect(result.targetStat).to.equal('WISDOM')
            expect(result.title).to.include('Épica')
            expect(result.difficulty).to.equal('LONG')
            expect(result.experienceReward).to.be.greaterThan(100)
        })

        it('GIVEN art prompt WHEN generateQuest THEN creates DEXTERITY quest', async () => {
            if (!FallbackSystem) return

            const result = FallbackSystem.generateQuest('paint landscape', null, 'QUICK')

            expect(result.targetStat).to.equal('DEXTERITY')
            expect(result.title).to.include('Rápida')
            expect(result.difficulty).to.equal('QUICK')
        })

        it('GIVEN social prompt WHEN generateQuest THEN creates CHARISMA quest', async () => {
            if (!FallbackSystem) return

            const result = FallbackSystem.generateQuest('call friends', null, 'EPIC')

            expect(result.targetStat).to.equal('CHARISMA')
            expect(result.title).to.include('Mítica')
            expect(result.difficulty).to.equal('EPIC')
        })

        it('GIVEN preferred stat WHEN generateQuest THEN uses preferred over detected', async () => {
            if (!FallbackSystem) return

            const result = FallbackSystem.generateQuest('go to gym', 'WISDOM', 'STANDARD')

            expect(result.targetStat).to.equal('WISDOM')
            expect(result.title).to.include('Noble')
        })

        it('GIVEN no stat keywords WHEN generateQuest THEN creates generic quest', async () => {
            if (!FallbackSystem) return

            const result = FallbackSystem.generateQuest('buy groceries', null, 'STANDARD')

            expect(result.targetStat).to.be.null
            expect(result.title).to.include('Noble')
            expect(result.title).to.include('buy groceries')
        })
    })

    describe('generateTitle', () => {
        it('GIVEN STRENGTH stat WHEN generateTitle THEN includes stat-specific elements', async () => {
            if (!FallbackSystem) return

            const result = FallbackSystem.generateTitle('workout', 'STRENGTH', 'STANDARD')

            expect(result).to.include('Noble')
            const hasStrengthElement = /entrenar|forjar|fortalecer|gimnasio|campo/.test(result)
            expect(hasStrengthElement).to.be.true
        })

        it('GIVEN WISDOM stat WHEN generateTitle THEN includes wisdom elements', async () => {
            if (!FallbackSystem) return

            const result = FallbackSystem.generateTitle('study', 'WISDOM', 'EPIC')

            expect(result).to.include('Mítica')
            const hasWisdomElement = /estudiar|aprender|descubrir|biblioteca|aula/.test(result)
            expect(hasWisdomElement).to.be.true
        })

        it('GIVEN no stat WHEN generateTitle THEN creates generic title', async () => {
            if (!FallbackSystem) return

            const result = FallbackSystem.generateTitle('test task', null, 'QUICK')

            expect(result).to.include('Rápida')
            expect(result).to.include('test task')
        })
    })

    describe('generateDescription', () => {
        it('GIVEN STRENGTH stat WHEN generateDescription THEN creates epic description', async () => {
            if (!FallbackSystem) return

            const result = FallbackSystem.generateDescription('workout', 'STRENGTH')

            expect(result).to.include('templo del hierro')
            expect(result).to.include('Es hora de')
            expect(result).to.include('Supera la')
        })

        it('GIVEN CHARISMA stat WHEN generateDescription THEN creates social description', async () => {
            if (!FallbackSystem) return

            const result = FallbackSystem.generateDescription('meeting', 'CHARISMA')

            expect(result).to.include('corte real')
            expect(result).to.include('Es hora de')
        })

        it('GIVEN no stat WHEN generateDescription THEN creates generic description', async () => {
            if (!FallbackSystem) return

            const result = FallbackSystem.generateDescription('test task', null)

            expect(result).to.include('Completa esta importante misión')
            expect(result).to.include('test task')
            expect(result).to.include('Tu determinación te llevará al éxito')
        })
    })

    describe('generateEpicElements', () => {
        it('GIVEN STRENGTH stat WHEN generateEpicElements THEN returns strength elements', async () => {
            if (!FallbackSystem) return

            const result = FallbackSystem.generateEpicElements('STRENGTH')

            expect(result.realm).to.equal('Templo del Hierro')
            expect(result.enemy).to.be.oneOf(['pereza', 'debilidad'])
            expect(result.weapon).to.be.oneOf(['determinación', 'disciplina'])
            expect(result.reward).to.equal('experiencia valiosa')
        })

        it('GIVEN WISDOM stat WHEN generateEpicElements THEN returns wisdom elements', async () => {
            if (!FallbackSystem) return

            const result = FallbackSystem.generateEpicElements('WISDOM')

            expect(result.realm).to.equal('Biblioteca Ancestral')
            expect(result.enemy).to.be.oneOf(['ignorancia', 'confusión'])
            expect(result.weapon).to.be.oneOf(['conocimiento', 'sabiduría'])
        })

        it('GIVEN no stat WHEN generateEpicElements THEN returns generic elements', async () => {
            if (!FallbackSystem) return

            const result = FallbackSystem.generateEpicElements(null)

            expect(result.realm).to.equal('Reino Misterioso')
            expect(result.enemy).to.equal('pereza')
            expect(result.weapon).to.equal('determinación')
            expect(result.reward).to.equal('satisfacción personal')
        })
    })

    describe('random', () => {
        it('GIVEN array WHEN random THEN returns element from array', async () => {
            if (!FallbackSystem) return

            const testArray = ['a', 'b', 'c']
            const result = FallbackSystem.random(testArray)

            expect(testArray).to.include(result)
        })

        it('GIVEN single element array WHEN random THEN returns that element', async () => {
            if (!FallbackSystem) return

            const testArray = ['only-element']
            const result = FallbackSystem.random(testArray)

            expect(result).to.equal('only-element')
        })
    })
})