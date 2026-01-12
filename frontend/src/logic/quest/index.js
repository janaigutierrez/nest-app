import completeQuest from "./completeQuest"
import createQuest from "./createQuest"
import createRitual from "./createRitual"
import deleteQuest from "./deleteQuest"
import generateQuestManually from "./generateQuestManually"
import generateQuestWithAI from "./generateQuestWithAI"
import getAllQuests from "./getAllQuests"
import { questGenerator } from "./questGenerator"

const quest = {
    getAllQuests,
    deleteQuest,
    createQuest,
    completeQuest,
    generateQuestManually,
    generateQuestWithAI,
    createRitual
}

export default quest