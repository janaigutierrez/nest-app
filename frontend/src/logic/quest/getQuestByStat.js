import getAllQuests from "./getAllQuests"

const getQuestsByStat = async (targetStat) => {
    const data = await getAllQuests()
    const allQuests = data.quests || []
    return { ...data, quests: allQuests.filter(quest => quest.targetStat === targetStat) }
}

export default getQuestsByStat