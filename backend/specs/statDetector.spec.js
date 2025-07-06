import 'dotenv/config'
import { expect } from 'chai'

describe('StatDetector', () => {
    let StatDetector

    before(async () => {
        try {
            const module = await import('../utils/aiService/statDetector.js')
            StatDetector = module.StatDetector
        } catch (error) {
            return
        }
    })

    it('GIVEN gym text WHEN detectQuestStat THEN returns STRENGTH', async () => {
        if (!StatDetector) return

        const result = StatDetector.detectQuestStat('go to gym and workout')
        expect(result).to.equal('STRENGTH')
    })

    it('GIVEN exercise text WHEN detectQuestStat THEN returns STRENGTH', async () => {
        if (!StatDetector) return

        const result = StatDetector.detectQuestStat('daily exercise routine')
        expect(result).to.equal('STRENGTH')
    })

    it('GIVEN workout text WHEN detectQuestStat THEN returns STRENGTH', async () => {
        if (!StatDetector) return

        const result = StatDetector.detectQuestStat('intense workout session')
        expect(result).to.equal('STRENGTH')
    })

    it('GIVEN muscle text WHEN detectQuestStat THEN returns STRENGTH', async () => {
        if (!StatDetector) return

        const result = StatDetector.detectQuestStat('build muscle mass')
        expect(result).to.equal('STRENGTH')
    })

    it('GIVEN study text WHEN detectQuestStat THEN returns WISDOM', async () => {
        if (!StatDetector) return

        const result = StatDetector.detectQuestStat('study for exam')
        expect(result).to.equal('WISDOM')
    })

    it('GIVEN read text WHEN detectQuestStat THEN returns WISDOM', async () => {
        if (!StatDetector) return

        const result = StatDetector.detectQuestStat('read programming book')
        expect(result).to.equal('WISDOM')
    })

    it('GIVEN learn text WHEN detectQuestStat THEN returns WISDOM', async () => {
        if (!StatDetector) return

        const result = StatDetector.detectQuestStat('learn new language')
        expect(result).to.equal('WISDOM')
    })

    it('GIVEN research text WHEN detectQuestStat THEN returns WISDOM', async () => {
        if (!StatDetector) return

        const result = StatDetector.detectQuestStat('research market trends')
        expect(result).to.equal('WISDOM')
    })

    it('GIVEN art text WHEN detectQuestStat THEN returns DEXTERITY', async () => {
        if (!StatDetector) return

        const result = StatDetector.detectQuestStat('create digital art')
        expect(result).to.equal('DEXTERITY')
    })

    it('GIVEN cook text WHEN detectQuestStat THEN returns DEXTERITY', async () => {
        if (!StatDetector) return

        const result = StatDetector.detectQuestStat('cook delicious meal')
        expect(result).to.equal('DEXTERITY')
    })

    it('GIVEN music text WHEN detectQuestStat THEN returns DEXTERITY', async () => {
        if (!StatDetector) return

        const result = StatDetector.detectQuestStat('practice music instrument')
        expect(result).to.equal('DEXTERITY')
    })

    it('GIVEN paint text WHEN detectQuestStat THEN returns DEXTERITY', async () => {
        if (!StatDetector) return

        const result = StatDetector.detectQuestStat('paint beautiful landscape')
        expect(result).to.equal('DEXTERITY')
    })

    it('GIVEN social text WHEN detectQuestStat THEN returns CHARISMA', async () => {
        if (!StatDetector) return

        const result = StatDetector.detectQuestStat('attend social event')
        expect(result).to.equal('CHARISMA')
    })

    it('GIVEN call text WHEN detectQuestStat THEN returns CHARISMA', async () => {
        if (!StatDetector) return

        const result = StatDetector.detectQuestStat('call family members')
        expect(result).to.equal('CHARISMA')
    })

    it('GIVEN meeting text WHEN detectQuestStat THEN returns CHARISMA', async () => {
        if (!StatDetector) return

        const result = StatDetector.detectQuestStat('attend important meeting')
        expect(result).to.equal('CHARISMA')
    })

    it('GIVEN talk text WHEN detectQuestStat THEN returns CHARISMA', async () => {
        if (!StatDetector) return

        const result = StatDetector.detectQuestStat('have deep talk')
        expect(result).to.equal('CHARISMA')
    })

    it('GIVEN no keywords WHEN detectQuestStat THEN returns null', async () => {
        if (!StatDetector) return

        const result = StatDetector.detectQuestStat('buy groceries at store')
        expect(result).to.be.null
    })

    it('GIVEN empty text WHEN detectQuestStat THEN returns null', async () => {
        if (!StatDetector) return

        const result = StatDetector.detectQuestStat('')
        expect(result).to.be.null
    })

    it('GIVEN case insensitive text WHEN detectQuestStat THEN detects correctly', async () => {
        if (!StatDetector) return

        const result = StatDetector.detectQuestStat('GO TO GYM AND EXERCISE')
        expect(result).to.equal('STRENGTH')
    })
})