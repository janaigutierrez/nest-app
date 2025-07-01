import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { STAT_RULES, XP_RULES } from '../../common/constants/gameRules.js'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [20, 'Username must be less than 20 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },

    totalXP: {
        type: Number,
        default: 0,
        min: 0
    },

    stats: {
        STRENGTH: {
            type: Number,
            default: 0,
            min: 0
        },
        DEXTERITY: {
            type: Number,
            default: 0,
            min: 0
        },
        WISDOM: {
            type: Number,
            default: 0,
            min: 0
        },
        CHARISMA: {
            type: Number,
            default: 0,
            min: 0
        }
    },

    unlockedFeatures: [{
        feature: {
            type: String,
            required: true
        },
        unlockedAt: {
            type: Date,
            default: Date.now
        }
    }],

    avatar: {
        equippedSet: {
            type: String,
            enum: ['base', 'warrior', 'scholar', 'leader', 'artisan'],
            default: 'base'
        },
        equippedItems: {
            head: {
                type: String,
                default: null
            },
            body: {
                type: String,
                default: null
            },
            accessory: {
                type: String,
                default: null
            },
            weapon: {
                type: String,
                default: null
            }
        }
    },

    preferences: {
        theme: {
            type: String,
            enum: ['default', 'dark', 'library', 'mystic', 'medieval', 'warrior', 'academy'],
            default: 'default'
        },
        motivationalQuotes: {
            type: Boolean,
            default: false
        }
    },

    streaks: {
        currentStreak: {
            type: Number,
            default: 0
        },
        longestStreak: {
            type: Number,
            default: 0
        },
        lastQuestDate: {
            type: Date,
            default: null
        }
    },

    isActive: {
        type: Boolean,
        default: true
    },

    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

userSchema.virtual('currentLevel').get(function () {
    return XP_RULES.getLevelFromXP(this.totalXP)
})

userSchema.virtual('xpToNextLevel').get(function () {
    return XP_RULES.getXPToNextLevel(this.totalXP)
})

userSchema.virtual('statLevels').get(function () {
    return {
        STRENGTH: STAT_RULES.getStatLevel(this.stats.STRENGTH),
        DEXTERITY: STAT_RULES.getStatLevel(this.stats.DEXTERITY),
        WISDOM: STAT_RULES.getStatLevel(this.stats.WISDOM),
        CHARISMA: STAT_RULES.getStatLevel(this.stats.CHARISMA)
    }
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()

    try {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
        next()
    } catch (error) {
        next(error)
    }
})

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.addXP = function (xpAmount) {
    this.totalXP += xpAmount
    return this.save()
}

userSchema.methods.addStatProgress = function (statName, points = STAT_RULES.STAT_POINTS_PER_QUEST) {
    if (!this.stats[statName]) {
        throw new Error(`Invalid stat: ${statName}`)
    }
    this.stats[statName] += points
    return this.save()
}

userSchema.methods.updateStreak = function () {
    const today = new Date()
    const lastQuest = this.streaks.lastQuestDate

    if (!lastQuest) {
        this.streaks.currentStreak = 1
        this.streaks.lastQuestDate = today
    } else {
        const daysSinceLastQuest = Math.floor((today - lastQuest) / (1000 * 60 * 60 * 24))

        if (daysSinceLastQuest === 1) {
            this.streaks.currentStreak += 1
            this.streaks.lastQuestDate = today
        } else if (daysSinceLastQuest > 1) {
            this.streaks.currentStreak = 1
            this.streaks.lastQuestDate = today
        }
    }

    if (this.streaks.currentStreak > this.streaks.longestStreak) {
        this.streaks.longestStreak = this.streaks.currentStreak
    }

    return this.save()
}

userSchema.methods.toJSON = function () {
    const userObject = this.toObject()
    delete userObject.password
    return userObject
}

const User = mongoose.model('User', userSchema)

export default mongoose.models.User || mongoose.model('User', userSchema)