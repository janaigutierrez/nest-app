import mongoose from 'mongoose'

const tokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

tokenBlacklistSchema.index({ token: 1, expiresAt: 1 })

const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema)

export default TokenBlacklist