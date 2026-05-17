import express from 'express';
import { createGoal, deleteGoal, listGoals, updateGoal } from '../controllers/goalController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.route('/').get(listGoals).post(createGoal);
router.route('/:id').patch(updateGoal).delete(deleteGoal);

export default router;
