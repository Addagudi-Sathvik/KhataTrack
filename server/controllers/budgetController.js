import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { emitToUser } from '../sockets/index.js';

export const listBudgets = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = Number(req.query.month || now.getMonth() + 1);
  const year = Number(req.query.year || now.getFullYear());
  const items = await Budget.find({ user: req.user.id, month, year }).sort({ category: 1 });
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);
  const spend = await Expense.aggregate([
    { $match: { user: req.user._id, type: 'expense', date: { $gte: monthStart, $lt: monthEnd } } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } }
  ]);
  const spendByCategory = new Map(spend.map((row) => [row._id, row.total]));
  const enriched = items.map((budget) => {
    const spent = spendByCategory.get(budget.category) || 0;
    return {
      ...budget.toObject(),
      spent,
      progress: budget.amount ? Math.min(100, Math.round((spent / budget.amount) * 100)) : 0
    };
  });
  res.json({ success: true, items: enriched, globalMonthlyBudget: req.user.globalMonthlyBudget || 0 });
});

export const upsertBudget = asyncHandler(async (req, res) => {
  const now = new Date();
  const budget = await Budget.findOneAndUpdate(
    {
      user: req.user.id,
      category: req.body.category,
      month: req.body.month || now.getMonth() + 1,
      year: req.body.year || now.getFullYear()
    },
    { ...req.body, user: req.user.id },
    { upsert: true, new: true, runValidators: true }
  );
  emitToUser(req, 'budget:updated', budget);
  res.json({ success: true, budget });
});

export const setGlobalBudget = asyncHandler(async (req, res) => {
  req.user.globalMonthlyBudget = req.body.amount;
  await req.user.save();
  res.json({ success: true, globalMonthlyBudget: req.user.globalMonthlyBudget });
});

export const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!budget) throw new AppError('Budget not found', 404);
  emitToUser(req, 'budget:deleted', { id: req.params.id });
  res.json({ success: true, message: 'Budget deleted' });
});
