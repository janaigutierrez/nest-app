import { errors } from "common"
import Quest from "../models/Quest.js"

const getAllQuests = async (userId) => {
    try {
        const quests = await Quest.find({ userId })
            .sort({ createdAt: -1 })

        return quests.map(quest => ({
            id: quest._id.toString(),
            title: quest.title,
            description: quest.description,
            targetStat: quest.targetStat,
            difficulty: quest.difficulty,
            experienceReward: quest.experienceReward,
            isDaily: quest.isDaily,
            isCompleted: quest.isCompleted,
            generatedBy: quest.generatedBy,
            aiMetadata: quest.aiMetadata,
            createdAt: quest.createdAt,
            completedAt: quest.completedAt
        }))
    } catch (error) {
        throw new errors.ServerError(error.message)
    }
}

export default getAllQuests