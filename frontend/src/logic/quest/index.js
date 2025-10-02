import completeQuest from "./completeQuest"
import createQuest from "./createQuest"
import deleteQuest from "./deleteQuest"
import getAllQuests from "./getAllQuests"
import getQuestsByDate from "./getQuestsByDate"
import updateQuest from "./updateQuest"

const quest = {
    getAllQuests,
    deleteQuest,
    createQuest,
    completeQuest,
    getQuestsByDate,
    updateQuest
}

export default quest