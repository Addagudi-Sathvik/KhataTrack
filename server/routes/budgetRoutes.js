import express from 'express';
import { deleteBudget, listBudgets, setGlobalBudget, upsertBudget } from '../controllers/budgetController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', listBudgets);
router.post('/', upsertBudget);
router.patch('/global', setGlobalBudget);
router.delete('/:id', deleteBudget);

export default router;
