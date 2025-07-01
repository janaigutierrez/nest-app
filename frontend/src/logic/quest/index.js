import completeQuest from "./completeQuest"
import createQuest from "./createQuest"
import deleteQuest from "./deleteQuest"
import getActiveQuests from "./getActiveQuests"
import getAllQuests from "./getAllQuests"
import getCompletedQuests from "./getCompletedQuests"
import getQuestsByStat from "./getQuestByStat"
import getQuestsByDifficulty from "./getQuestsByDifficulty"
import uncompleteQuest from "./uncompleteQuest"
import updateQuest from "./updateQuest"

const quest = {
    getActiveQuests,
    getAllQuests,
    getCompletedQuests,
    getQuestsByDifficulty,
    getQuestsByStat,
    deleteQuest,
    createQuest,
    updateQuest,
    completeQuest,
    getCompletedQuests,
    uncompleteQuest
}

export default quest