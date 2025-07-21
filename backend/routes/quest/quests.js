import express from "express";
import handlers from './handlers/index.js'
import { protect } from "../../middleware/auth.js";

const router = express.Router()

router.get('/', protect, handlers.getAllQuests)
router.get('/by-date', protect, handlers.getQuestsByDate)

router.post('/create', protect, handlers.createQuest)

router.put('/:id/complete', protect, handlers.completeQuest)

router.delete('/:id', protect, handlers.deleteQuest)

export default router