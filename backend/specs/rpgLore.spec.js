import 'dotenv/config'
import { expect } from 'chai'

describe('rpgLore', () => {
    let LORE, DIFFICULTY

    before(async () => {
        try {
            const module = await import('../utils/aiService/rpgLore.js')
            LORE = module.LORE
            DIFFICULTY = module.DIFFICULTY
        } catch (error) {
            return
        }
    })

    describe('LORE constants', () => {
        it('GIVEN LORE object WHEN accessing STRENGTH THEN has correct properties', async () => {
            if (!LORE) return

            expect(LORE.STRENGTH).to.exist
            expect(LORE.STRENGTH).to.have.property('realm')
            expect(LORE.STRENGTH).to.have.property('actions')
            expect(LORE.STRENGTH).to.have.property('enemies')
            expect(LORE.STRENGTH).to.have.property('weapons')
            expect(LORE.STRENGTH).to.have.property('places')
        })

        it('GIVEN LORE.STRENGTH WHEN checking realm THEN equals Templo del Hierro', async () => {
            if (!LORE) return

            expect(LORE.STRENGTH.realm).to.equal('Templo del Hierro')
        })

        it('GIVEN LORE.STRENGTH WHEN checking actions THEN contains workout verbs', async () => {
            if (!LORE) return

            expect(LORE.STRENGTH.actions).to.be.an('array')
            expect(LORE.STRENGTH.actions).to.include('entrenar')
            expect(LORE.STRENGTH.actions).to.include('forjar')
            expect(LORE.STRENGTH.actions).to.include('fortalecer')
        })

        it('GIVEN LORE.DEXTERITY WHEN checking realm THEN equals Taller de Creación', async () => {
            if (!LORE) return

            expect(LORE.DEXTERITY.realm).to.equal('Taller de Creación')
        })

        it('GIVEN LORE.DEXTERITY WHEN checking actions THEN contains creative verbs', async () => {
            if (!LORE) return

            expect(LORE.DEXTERITY.actions).to.be.an('array')
            expect(LORE.DEXTERITY.actions).to.include('crear')
            expect(LORE.DEXTERITY.actions).to.include('craftear')
            expect(LORE.DEXTERITY.actions).to.include('perfeccionar')
        })

        it('GIVEN LORE.WISDOM WHEN checking realm THEN equals Biblioteca Ancestral', async () => {
            if (!LORE) return

            expect(LORE.WISDOM.realm).to.equal('Biblioteca Ancestral')
        })

        it('GIVEN LORE.WISDOM WHEN checking actions THEN contains learning verbs', async () => {
            if (!LORE) return

            expect(LORE.WISDOM.actions).to.be.an('array')
            expect(LORE.WISDOM.actions).to.include('estudiar')
            expect(LORE.WISDOM.actions).to.include('aprender')
            expect(LORE.WISDOM.actions).to.include('descubrir')
        })

        it('GIVEN LORE.CHARISMA WHEN checking realm THEN equals Corte Real', async () => {
            if (!LORE) return

            expect(LORE.CHARISMA.realm).to.equal('Corte Real')
        })

        it('GIVEN LORE.CHARISMA WHEN checking actions THEN contains social verbs', async () => {
            if (!LORE) return

            expect(LORE.CHARISMA.actions).to.be.an('array')
            expect(LORE.CHARISMA.actions).to.include('inspirar')
            expect(LORE.CHARISMA.actions).to.include('conectar')
            expect(LORE.CHARISMA.actions).to.include('liderar')
        })

        it('GIVEN all LORE stats WHEN checking structure THEN all have required properties', async () => {
            if (!LORE) return

            const stats = ['STRENGTH', 'DEXTERITY', 'WISDOM', 'CHARISMA']

            stats.forEach(stat => {
                expect(LORE[stat]).to.exist

                expect(LORE[stat]).to.have.property('realm')
                expect(LORE[stat].realm).to.be.a('string')

                expect(LORE[stat]).to.have.property('actions')
                expect(LORE[stat].actions).to.be.an('array')

                expect(LORE[stat]).to.have.property('enemies')
                expect(LORE[stat].enemies).to.be.an('array')

                expect(LORE[stat]).to.have.property('weapons')
                expect(LORE[stat].weapons).to.be.an('array')

                expect(LORE[stat]).to.have.property('places')
                expect(LORE[stat].places).to.be.an('array')
            })
        })
    })

    describe('DIFFICULTY constants', () => {
        it('GIVEN DIFFICULTY object WHEN accessing QUICK THEN has correct properties', async () => {
            if (!DIFFICULTY) return

            expect(DIFFICULTY.QUICK).to.exist
            expect(DIFFICULTY.QUICK).to.have.property('prefix')
            expect(DIFFICULTY.QUICK).to.have.property('intensity')
        })

        it('GIVEN DIFFICULTY.QUICK WHEN checking values THEN has correct prefix and intensity', async () => {
            if (!DIFFICULTY) return

            expect(DIFFICULTY.QUICK.prefix).to.equal('Rápida')
            expect(DIFFICULTY.QUICK.intensity).to.equal('misión')
        })

        it('GIVEN DIFFICULTY.STANDARD WHEN checking values THEN has correct prefix and intensity', async () => {
            if (!DIFFICULTY) return

            expect(DIFFICULTY.STANDARD.prefix).to.equal('Noble')
            expect(DIFFICULTY.STANDARD.intensity).to.equal('aventura')
        })

        it('GIVEN DIFFICULTY.LONG WHEN checking values THEN has correct prefix and intensity', async () => {
            if (!DIFFICULTY) return

            expect(DIFFICULTY.LONG.prefix).to.equal('Épica')
            expect(DIFFICULTY.LONG.intensity).to.equal('campaña')
        })

        it('GIVEN DIFFICULTY.EPIC WHEN checking values THEN has correct prefix and intensity', async () => {
            if (!DIFFICULTY) return

            expect(DIFFICULTY.EPIC.prefix).to.equal('Mítica')
            expect(DIFFICULTY.EPIC.intensity).to.equal('saga')
        })

        it('GIVEN all DIFFICULTY levels WHEN checking structure THEN all have prefix and intensity', async () => {
            if (!DIFFICULTY) return

            const levels = ['QUICK', 'STANDARD', 'LONG', 'EPIC']
            levels.forEach(level => {
                expect(DIFFICULTY[level]).to.exist
                expect(DIFFICULTY[level]).to.have.property('prefix')
                expect(DIFFICULTY[level]).to.have.property('intensity')
                expect(DIFFICULTY[level].prefix).to.be.a('string')
                expect(DIFFICULTY[level].intensity).to.be.a('string')
            })
        })
    })
})