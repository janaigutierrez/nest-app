import getAllQuests from "./getAllQuests"

const getCompletedQuests = async () => {
    const data = await getAllQuests()
    const allQuests = data.quests || []
    return { ...data, quests: allQuests.filter(quest => quest.completed) }
}

export default getCompletedQuests