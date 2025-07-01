import getAllQuests from "./getAllQuests"

const getActiveQuests = async () => {
    const data = await getAllQuests()
    const allQuests = data.quests || []
    return { ...data, quests: allQuests.filter(quest => !quest.completed) }
}

export default getActiveQuests