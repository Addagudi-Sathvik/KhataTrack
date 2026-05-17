import Budget from '../models/Budget.js';
import Category from '../models/Category.js';
import Expense from '../models/Expense.js';
import Notification from '../models/Notification.js';
import { buildInsights } from '../services/insightService.js';
import { createCsvReport, createExcelReport, createPdfReport } from '../services/reportService.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { emitToUser } from '../sockets/index.js';
import { maybeCreateBudgetAlert } from '../utils/budgetAlerts.js';

function buildFilter(query, userId) {
  const filter = { user: userId };
  if (query.category) filter.category = query.category;
  if (query.type) filter.type = query.type;
  if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
  if (query.search) filter.$text = { $search: query.search };

  const dateFilter = {};
  const year = query.year ? Number(query.year) : null;
  const month = query.month ? Number(query.month) : null;

  if (query.from) {
    const from = new Date(query.from);
    if (Number.isNaN(from.getTime())) throw new AppError('Invalid from date', 400);
    dateFilter.$gte = from;
  }
  if (query.to) {
    const to = new Date(query.to);
    if (Number.isNaN(to.getTime())) throw new AppError('Invalid to date', 400);
    dateFilter.$lte = to;
  }
  if (query.year && (!Number.isInteger(year) || year < 1970 || year > 3000)) {
    throw new AppError('Invalid year', 400);
  }
  if (query.month && (!Number.isInteger(month) || month < 1 || month > 12)) {
    throw new AppError('Invalid month', 400);
  }
  if (query.month && !query.year) {
    throw new AppError('Year is required when filtering by month', 400);
  }
  if (query.year) {
    dateFilter.$gte = new Date(year, month ? month - 1 : 0, 1);
    dateFilter.$lt = new Date(year, month ? month : 12, 1);
  }
  if (Object.keys(dateFilter).length) filter.date = dateFilter;

  return filter;
}

export const listExpenses = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 12);
  const sortBy = req.query.sortBy || 'date';
  const order = req.query.order === 'asc' ? 1 : -1;
  const filter = buildFilter(req.query, req.user.id);

  const [items, total] = await Promise.all([
    Expense.find(filter).sort({ [sortBy]: order }).skip((page - 1) * limit).limit(limit),
    Expense.countDocuments(filter)
  ]);

  res.json({ success: true, items, page, pages: Math.ceil(total / limit), total });
});

export const createExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.create({ ...req.body, user: req.user.id });
  await maybeCreateBudgetAlert(req, expense);
  emitToUser(req, 'expense:created', expense);
  res.status(201).json({ success: true, expense });
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, {
    new: true,
    runValidators: true
  });
  if (!expense) throw new AppError('Transaction not found', 404);
  emitToUser(req, 'expense:updated', expense);
  res.json({ success: true, expense });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!expense) throw new AppError('Transaction not found', 404);
  emitToUser(req, 'expense:deleted', { id: req.params.id });
  res.json({ success: true, message: 'Transaction deleted' });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({ ...req.body, user: req.user.id });
  res.status(201).json({ success: true, category });
});

export const dashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

  const [summary, daily, categories, budgets, insights, recent, todaySpend, prevMonthSpend, incomeVsExpense] =
    await Promise.all([
    Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: monthStart } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]),
    Expense.aggregate([
      { $match: { user: req.user._id, type: 'expense', date: { $gte: monthStart } } },
      { $group: { _id: { $dayOfMonth: '$date' }, total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]),
    Expense.aggregate([
      { $match: { user: req.user._id, type: 'expense', date: { $gte: monthStart } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]),
    Budget.find({ user: req.user.id, month: now.getMonth() + 1, year: now.getFullYear() }),
    buildInsights(req.user._id),
    Expense.find({ user: req.user.id }).sort({ date: -1 }).limit(10),
    Expense.aggregate([
      { $match: { user: req.user._id, type: 'expense', date: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Expense.aggregate([
      { $match: { user: req.user._id, type: 'expense', date: { $gte: prevMonthStart, $lt: prevMonthEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: yearStart } } },
      {
        $group: {
          _id: { month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.month': 1 } }
    ])
  ]);

  const income = summary.find((item) => item._id === 'income')?.total || 0;
  const expenses = summary.find((item) => item._id === 'expense')?.total || 0;
  const todayTotal = todaySpend[0]?.total || 0;
  const prevMonthTotal = prevMonthSpend[0]?.total || 0;
  const monthlyVariance = prevMonthTotal
    ? Math.round(((expenses - prevMonthTotal) / prevMonthTotal) * 100)
    : 0;

  const yearlyExpenses = await Expense.aggregate([
    { $match: { user: req.user._id, type: 'expense', date: { $gte: yearStart } } },
    { $group: { _id: { $month: '$date' }, total: { $sum: '$amount' } } },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    summary: {
      balance: income - expenses,
      income,
      expenses,
      savings: income - expenses,
      todaySpending: todayTotal,
      monthlyVariance,
      remainingBudget: Math.max(budgets.reduce((sum, b) => sum + b.amount, 0) - expenses, 0),
      globalMonthlyBudget: req.user.globalMonthlyBudget || 0
    },
    incomeVsExpense,
    daily,
    yearlyExpenses,
    categories,
    budgets,
    insights,
    recent
  });
});

export const notifications = asyncHandler(async (req, res) => {
  const items = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(30);
  res.json({ success: true, items });
});

export const reportPdf = asyncHandler(async (req, res) => {
  const expenses = await Expense.find(buildFilter(req.query, req.user.id)).sort({ date: -1 });
  const summary = expenses.reduce(
    (acc, item) => {
      acc[item.type === 'income' ? 'income' : 'expenses'] += item.amount;
      acc.savings = acc.income - acc.expenses;
      return acc;
    },
    { income: 0, expenses: 0, savings: 0 }
  );
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=expense-report.pdf');
  const doc = createPdfReport(expenses, summary);
  doc.pipe(res);
  doc.end();
});

export const reportExcel = asyncHandler(async (req, res) => {
  const expenses = await Expense.find(buildFilter(req.query, req.user.id)).sort({ date: -1 });
  const buffer = await createExcelReport(expenses);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=expense-report.xlsx');
  res.send(buffer);
});

export const reportCsv = asyncHandler(async (req, res) => {
  const expenses = await Expense.find(buildFilter(req.query, req.user.id)).sort({ date: -1 });
  const csv = createCsvReport(expenses);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=expense-report.csv');
  res.send(csv);
});
