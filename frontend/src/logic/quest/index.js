import completeQuest from "./completeQuest"
import createQuest from "./createQuest"
import deleteQuest from "./deleteQuest"
import getAllQuests from "./getAllQuests"
import { questGenerator } from "./questGenerator"

const quest = {
    getAllQuests,
    deleteQuest,
    createQuest,
    completeQuest,
    questGenerator
}

export default quest