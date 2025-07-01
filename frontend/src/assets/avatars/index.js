import { rules } from 'common'

export const avatarSets = {
    base: {
        idle: ['/character/sprite_80.png'],
        walk: [
            '/character/sprite_80.png',
            '/character/sprite_81.png',
            '/character/sprite_82.png',
            '/character/sprite_83.png',
            '/character/sprite_84.png',
            '/character/sprite_82.png'
        ]
    },

    warrior: {
        idle: ['/character/warrior/sprite_78.png'],
        walk: [
            '/character/warrior/sprite_78.png',
            '/character/warrior/sprite_79.png',
            '/character/warrior/sprite_80.png',
            '/character/warrior/sprite_81.png',
            '/character/warrior/sprite_82.png',
            '/character/warrior/sprite_83.png',
            '/character/warrior/sprite_84.png',
            '/character/warrior/sprite_85.png',
            '/character/warrior/sprite_86.png'
        ]
    },

    scholar: {
        idle: ['/character/mage/sprite_78.png'],
        walk: [
            '/character/mage/sprite_78.png',
            '/character/mage/sprite_79.png',
            '/character/mage/sprite_80.png',
            '/character/mage/sprite_81.png',
            '/character/mage/sprite_82.png',
            '/character/mage/sprite_83.png',
            '/character/mage/sprite_84.png',
            '/character/mage/sprite_85.png',
            '/character/mage/sprite_86.png'
        ]
    },

    leader: {
        idle: ['/character/king/sprite_78.png'],
        walk: [
            '/character/king/sprite_78.png',
            '/character/king/sprite_79.png',
            '/character/king/sprite_80.png',
            '/character/king/sprite_81.png',
            '/character/king/sprite_82.png',
            '/character/king/sprite_83.png',
            '/character/king/sprite_84.png',
            '/character/king/sprite_85.png',
            '/character/king/sprite_86.png'
        ]
    },

    artisan: {
        idle: ['/character/craftman/sprite_78.png'],
        walk: [
            '/character/craftman/sprite_78.png',
            '/character/craftman/sprite_79.png',
            '/character/craftman/sprite_80.png',
            '/character/craftman/sprite_81.png',
            '/character/craftman/sprite_82.png',
            '/character/craftman/sprite_83.png',
            '/character/craftman/sprite_84.png',
            '/character/craftman/sprite_85.png',
            '/character/craftman/sprite_86.png'
        ]
    }
}

export const avatarSetInfo = {
    base: {
        name: 'Adventurer',
        title: 'Wanderer of the Wild Paths',
        description: 'A humble beginning for every hero',
        unlockLevel: 0,
        stat: null,
        emoji: '🧑'
    },
    warrior: {
        name: 'Legendary Warrior',
        title: 'Guard of the Stone Bastion',
        description: 'Golden armor of the mighty',
        unlockLevel: 10,
        stat: 'STRENGTH',
        emoji: '⚔️'
    },
    scholar: {
        name: 'Grand Scholar',
        title: 'Hermit of the Shattered Peak',
        description: 'Robes of ancient wisdom',
        unlockLevel: 10,
        stat: 'WISDOM',
        emoji: '🧙‍♂️'
    },
    artisan: {
        name: 'Master Artisan',
        title: 'Forgemaster of the Iron Valley',
        description: 'Tools of the skilled craftsman',
        unlockLevel: 10,
        stat: 'DEXTERITY',
        emoji: '🎨'
    },
    leader: {
        name: 'Supreme Leader',
        title: 'Guide of the Elder Council',
        description: 'Regalia of true leadership',
        unlockLevel: 10,
        stat: 'CHARISMA',
        emoji: '👑'
    }
}

export const getAvatarSprites = (setName, animationType = 'walk') => {
    const targetSet = avatarSets[setName] || avatarSets.base
    return targetSet[animationType] || targetSet.walk || targetSet.idle
}

export const getStaticAvatarSprite = (user) => {
    if (!user) return '/character/sprite_80.png'

    const equippedSet = user.avatar?.equippedSet || 'base'

    if (equippedSet !== 'base' && !isSetUnlocked(equippedSet, user)) {
        return '/character/sprite_80.png'
    }

    const sprites = getAvatarSprites(equippedSet, 'idle')
    return sprites[0]
}

export const isSetUnlocked = (setKey, user) => {
    if (setKey === 'base') return true
    if (!user?.stats) return false

    const setInfo = avatarSetInfo[setKey]
    if (!setInfo?.stat) return false

    const statLevel = rules.STAT_RULES.getStatLevel(user.stats[setInfo.stat] || 0)
    return statLevel >= setInfo.unlockLevel
}

export const getUnlockedSets = (user) => {
    if (!user) return ['base']

    const unlockedSets = ['base']

    Object.keys(avatarSetInfo).forEach(setKey => {
        if (setKey !== 'base' && isSetUnlocked(setKey, user)) {
            unlockedSets.push(setKey)
        }
    })

    return unlockedSets
}

export const getCurrentAvatarInfo = (user) => {
    if (!user) return avatarSetInfo.base

    const equippedSet = user.avatar?.equippedSet || 'base'

    if (!isSetUnlocked(equippedSet, user)) {
        return avatarSetInfo.base
    }

    return avatarSetInfo[equippedSet]
}