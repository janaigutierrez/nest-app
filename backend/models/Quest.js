import mongoose from 'mongoose'

const questSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Quest title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [120, 'Title must be less than 120 characters']
    },

    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description must be less than 500 characters'],
        default: ''
    },

    isDaily: {
        type: Boolean,
        default: false,
        required: true
    },

    difficulty: {
        type: String,
        enum: ['QUICK', 'STANDARD', 'LONG', 'EPIC'],
        default: 'STANDARD',
        required: true
    },

    experienceReward: {
        type: Number,
        required: [true, 'Experience reward is required'],
        min: [10, 'XP must be at least 10'],
        max: [1000, 'XP cannot exceed 1000']
    },

    targetStat: {
        type: String,
        enum: ['STRENGTH', 'DEXTERITY', 'WISDOM', 'CHARISMA', null],
        default: null
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },

    isCompleted: {
        type: Boolean,
        default: false
    },

    completedAt: {
        type: Date,
        default: null
    },

    scheduledDate: {
        type: Date,
        default: null,
        index: true
    },

    scheduledTime: {
        type: String,
        default: null,
        validate: {
            validator: function (v) {
                if (!v) return true
                return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v)
            },
            message: 'Invalid time format. Use HH:MM'
        }
    },

    duration: {
        type: Number,
        default: 30,
        min: [5, 'Duration must be at least 5 minutes'],
        max: [480, 'Duration cannot exceed 8 hours']
    },

    isScheduled: {
        type: Boolean,
        default: false,
        //index: true
    },

    generatedBy: {
        type: String,
        enum: ['user', 'ai', 'template', 'quick_add'],
        default: 'user'
    },

    aiMetadata: {
        prompt: String,
        model: String,
        generatedAt: Date
    },

    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }]
}, {
    timestamps: true
})

questSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('difficulty') || this.isModified('isDaily') || this.isModified('targetStat')) {
        const baseXP = {
            QUICK: 25,      // <30 min
            STANDARD: 50,   // 30min-2h
            LONG: 100,      // 2+ hours
            EPIC: 200       // Multi-day
        }[this.difficulty] || 50

        let totalXP = baseXP

        if (this.isDaily) {
            totalXP = Math.floor(totalXP * 1.2)
        }

        if (this.targetStat) {
            totalXP += 10
        }

        this.experienceReward = totalXP
    }
    next()
})

questSchema.pre('save', function (next) {
    if (this.isNew && !this.targetStat) {
        const text = `${this.title} ${this.description}`.toLowerCase()
        const words = text.split(/\s+/)

        const statKeywords = {
            STRENGTH: ['gym', 'exercise', 'workout', 'fitness', 'run', 'sport', 'train', 'muscle', 'physical'],
            DEXTERITY: ['art', 'draw', 'paint', 'craft', 'music', 'instrument', 'cook', 'skill', 'creative'],
            WISDOM: ['study', 'learn', 'read', 'book', 'research', 'education', 'think', 'code', 'program'],
            CHARISMA: ['talk', 'social', 'people', 'friend', 'call', 'meeting', 'presentation', 'leadership']
        }

        const statCounts = {}
        for (const [stat, keywords] of Object.entries(statKeywords)) {
            statCounts[stat] = 0
            for (const keyword of keywords) {
                if (words.some(word => word.includes(keyword))) {
                    statCounts[stat]++
                }
            }
        }

        const maxCount = Math.max(...Object.values(statCounts))
        if (maxCount > 0) {
            this.targetStat = Object.keys(statCounts).find(stat => statCounts[stat] === maxCount)
        }
    }
    next()
})

questSchema.pre('save', function (next) {
    if (this.isModified('isCompleted') && this.isCompleted && !this.completedAt) {
        this.completedAt = new Date()
    }
    next()
})

questSchema.virtual('statInfo').get(function () {
    if (!this.targetStat) return null

    const statData = {
        STRENGTH: { name: 'Strength', emoji: '💪', color: 'red' },
        DEXTERITY: { name: 'Dexterity', emoji: '🎯', color: 'green' },
        WISDOM: { name: 'Wisdom', emoji: '🧠', color: 'blue' },
        CHARISMA: { name: 'Charisma', emoji: '✨', color: 'purple' }
    }

    return statData[this.targetStat]
})

questSchema.virtual('difficultyInfo').get(function () {
    const timeEstimates = {
        QUICK: '< 30 min',
        STANDARD: '30 min - 2h',
        LONG: '2+ hours',
        EPIC: 'Multi-day'
    }

    const baseXP = {
        QUICK: 25,
        STANDARD: 50,
        LONG: 100,
        EPIC: 200
    }

    return {
        name: this.difficulty,
        baseXP: baseXP[this.difficulty],
        estimatedTime: timeEstimates[this.difficulty]
    }
})

questSchema.virtual('isOverdue').get(function () {
    if (!this.isDaily || !this.scheduledDate || this.isCompleted) return false
    return new Date() > new Date(this.scheduledDate.getTime() + 24 * 60 * 60 * 1000) // +24 hours
})

questSchema.methods.complete = async function () {
    if (this.isCompleted) {
        throw new Error('Quest is already completed')
    }

    this.isCompleted = true
    this.completedAt = new Date()

    return await this.save()
}

questSchema.methods.updateXP = function (newXP) {
    if (newXP < 10 || newXP > 1000) {
        throw new Error('XP must be between 10 and 1000')
    }
    this.experienceReward = newXP
    return this.save()
}

questSchema.methods.getScheduledDateTime = function () {
    if (!this.scheduledDate || !this.scheduledTime) return null

    const [hours, minutes] = this.scheduledTime.split(':').map(Number)
    const dateTime = new Date(this.scheduledDate)
    dateTime.setHours(hours, minutes, 0, 0)

    return dateTime
}

questSchema.methods.getEndTime = function () {
    const startTime = this.getScheduledDateTime()
    if (!startTime) return null

    return new Date(startTime.getTime() + this.duration * 60000)
}

questSchema.statics.getUserQuests = function (userId, options = {}) {
    const query = { userId }

    if (options.completed !== undefined) {
        query.isCompleted = options.completed
    }

    if (options.isDaily !== undefined) {
        query.isDaily = options.isDaily
    }

    if (options.targetStat) {
        query.targetStat = options.targetStat
    }

    let queryBuilder = this.find(query)

    if (options.limit) {
        queryBuilder = queryBuilder.limit(options.limit)
    }

    if (options.sortBy) {
        queryBuilder = queryBuilder.sort(options.sortBy)
    } else {
        queryBuilder = queryBuilder.sort({ createdAt: -1 })
    }

    return queryBuilder
}

questSchema.statics.getCompletedToday = function (userId) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return this.find({
        userId,
        isCompleted: true,
        completedAt: {
            $gte: today,
            $lt: tomorrow
        }
    })
}

questSchema.statics.getDailyQuestsForDate = function (userId, date = new Date()) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return this.find({
        userId,
        isDaily: true,
        scheduledDate: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    })
}

questSchema.statics.getQuestsByDate = function (userId, date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return this.find({
        userId,
        isScheduled: true,
        scheduledDate: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    }).sort({ scheduledTime: 1 })
}

questSchema.index({ userId: 1, isCompleted: 1 })
questSchema.index({ userId: 1, isDaily: 1 })
questSchema.index({ userId: 1, createdAt: -1 })
questSchema.index({ scheduledDate: 1 })
questSchema.index({ targetStat: 1 })

let Quest
try {
    Quest = mongoose.model('Quest')
} catch (error) {
    Quest = mongoose.model('Quest', questSchema)
}

export default Quest