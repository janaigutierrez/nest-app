import { errors, validator, rules } from 'common'
import User from '../models/User.js'

const updateUserAvatar = async (userId, equippedSet) => {
    validator.id(userId, 'userId')
    validator.text(equippedSet, 20, 3, 'equippedSet')

    const validSets = ['base', 'warrior', 'scholar', 'leader', 'artisan']
    if (!validSets.includes(equippedSet)) {
        throw new errors.ValidationError(`Invalid avatar set. Valid sets: ${validSets.join(', ')}`)
    }

    const user = await User.findById(userId)
    if (!user) {
        throw new errors.ExistenceError('User not found')
    }

    if (equippedSet !== 'base') {
        const setRequirements = {
            warrior: { stat: 'STRENGTH', level: 10 },
            scholar: { stat: 'WISDOM', level: 10 },
            leader: { stat: 'CHARISMA', level: 10 },
            artisan: { stat: 'DEXTERITY', level: 10 }
        }

        const requirement = setRequirements[equippedSet]
        if (requirement) {
            const statPoints = user.stats[requirement.stat] || 0
            const statLevel = rules.STAT_RULES.getStatLevel(statPoints)

            if (statLevel < requirement.level) {
                throw new errors.ValidationError(`Avatar set '${equippedSet}' requires ${requirement.stat} level ${requirement.level}. Current level: ${statLevel}`)
            }
        }
    }

    if (!user.avatar) {
        user.avatar = {}
    }
    user.avatar.equippedSet = equippedSet

    await user.save()

    return {
        message: 'Avatar updated successfully',
        equippedSet,
        user: user.toJSON()
    }
}

export default updateUserAvatar