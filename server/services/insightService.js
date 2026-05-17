import Expense from '../models/Expense.js';

export async function buildInsights(userId) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [categorySpend, monthTotals] = await Promise.all([
    Expense.aggregate([
      { $match: { user: userId, type: 'expense', date: { $gte: thisMonthStart } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]),
    Expense.aggregate([
      { $match: { user: userId, type: 'expense', date: { $gte: lastMonthStart } } },
      {
        $group: {
          _id: { $cond: [{ $gte: ['$date', thisMonthStart] }, 'current', 'previous'] },
          total: { $sum: '$amount' }
        }
      }
    ])
  ]);

  const current = monthTotals.find((row) => row._id === 'current')?.total || 0;
  const previous = monthTotals.find((row) => row._id === 'previous')?.total || 0;
  const trend = previous ? Math.round(((current - previous) / previous) * 100) : 0;
  const topCategory = categorySpend[0];

  return [
    topCategory && `${topCategory._id} is your highest spend category this month at ₹${Math.round(topCategory.total)}.`,
    previous > 0 && `Monthly spending is ${trend >= 0 ? 'up' : 'down'} by ${Math.abs(trend)}% compared with last month.`,
    current > 0 && `Suggested monthly budget: ₹${Math.ceil(current * 1.12 / 100) * 100}.`,
    topCategory && `Auto-category hint: similar descriptions should be tagged as ${topCategory._id}.`
  ].filter(Boolean);
}
