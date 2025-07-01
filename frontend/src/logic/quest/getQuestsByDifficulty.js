import getAllQuests from "./getAllQuests"

const getQuestsByDifficulty = async (difficulty) => {
    const data = await getAllQuests()
    const allQuests = data.quests || []
    return { ...data, quests: allQuests.filter(quest => quest.difficulty === difficulty) }
}

export default getQuestsByDifficulty