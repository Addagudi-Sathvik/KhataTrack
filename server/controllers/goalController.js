import Goal from '../models/Goal.js';
import Notification from '../models/Notification.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { emitToUser } from '../sockets/index.js';

async function maybeNotifyGoalComplete(req, goal) {
  if (!goal.targetAmount || goal.currentAmount < goal.targetAmount) return;

  const recent = await Notification.findOne({
    user: req.user.id,
    type: 'goal',
    'metadata.goalId': goal._id,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });
  if (recent) return;

  const notification = await Notification.create({
    user: req.user.id,
    type: 'goal',
    title: 'Savings goal complete',
    message: `${goal.title} has reached its target amount.`,
    metadata: { goalId: goal._id, targetAmount: goal.targetAmount }
  });
  emitToUser(req, 'notification:new', notification);
}

export const listGoals = asyncHandler(async (req, res) => {
  const items = await Goal.find({ user: req.user.id }).sort({ targetDate: 1 });
  res.json({ success: true, items });
});

export const createGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.create({ ...req.body, user: req.user.id });
  await maybeNotifyGoalComplete(req, goal);
  res.status(201).json({ success: true, goal });
});

export const updateGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, {
    new: true,
    runValidators: true
  });
  if (!goal) throw new AppError('Savings goal not found', 404);
  await maybeNotifyGoalComplete(req, goal);
  res.json({ success: true, goal });
});

export const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!goal) throw new AppError('Savings goal not found', 404);
  res.json({ success: true, message: 'Goal deleted' });
});
