import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { BUDGET_ALERT_THRESHOLDS } from '../config/constants.js';
import { emitToUser } from '../sockets/index.js';

async function spendForCategory(userId, category, monthStart, monthEnd) {
  const [row] = await Expense.aggregate([
    {
      $match: {
        user: userId,
        category,
        type: 'expense',
        date: { $gte: monthStart, $lt: monthEnd }
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  return row?.total || 0;
}

async function emitThresholdAlert(req, { category, percent, threshold, scope }) {
  const key = `${scope}:${category || 'global'}:${threshold}`;
  const recent = await Notification.findOne({
    user: req.user.id,
    type: 'budget',
    'metadata.alertKey': key,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });
  if (recent) return;

  const notification = await Notification.create({
    user: req.user.id,
    type: 'budget',
    title: 'Budget alert',
    message: `${category || 'Monthly'} budget reached ${percent}% (threshold ${threshold}%).`,
    metadata: { category, percent, threshold, alertKey: key, scope }
  });
  emitToUser(req, 'notification:new', notification);
}

export async function maybeCreateBudgetAlert(req, expense) {
  if (expense.type !== 'expense') return;

  const date = new Date(expense.date);
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);

  const budget = await Budget.findOne({
    user: req.user.id,
    category: expense.category,
    month,
    year
  });

  if (budget) {
    const spent = await spendForCategory(req.user._id, expense.category, monthStart, monthEnd);
    const percent = Math.round((spent / budget.amount) * 100);
    for (const threshold of BUDGET_ALERT_THRESHOLDS) {
      if (percent >= threshold) {
        await emitThresholdAlert(req, { category: expense.category, percent, threshold, scope: 'category' });
      }
    }
  }

  const user = await User.findById(req.user.id);
  if (user?.globalMonthlyBudget > 0) {
    const [monthSpend] = await Expense.aggregate([
      { $match: { user: req.user._id, type: 'expense', date: { $gte: monthStart, $lt: monthEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const percent = Math.round(((monthSpend?.total || 0) / user.globalMonthlyBudget) * 100);
    for (const threshold of BUDGET_ALERT_THRESHOLDS) {
      if (percent >= threshold) {
        await emitThresholdAlert(req, { category: null, percent, threshold, scope: 'global' });
      }
    }
  }
}
