import cron from 'node-cron';
import Recurring from '../models/Recurring.js';
import Expense from '../models/Expense.js';
import logger from './logger.js';

export function initCronJobs() {
  cron.schedule('0 1 * * *', async () => {
    const today = new Date();
    const day = today.getDate();
    const items = await Recurring.find({ isActive: true, dayOfMonth: day });

    for (const item of items) {
      const exists = await Expense.findOne({
        user: item.user,
        description: item.description,
        amount: item.amount,
        date: { $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()) }
      });
      if (exists) continue;

      await Expense.create({
        user: item.user,
        amount: item.amount,
        category: item.category,
        description: item.description,
        type: item.type,
        paymentMethod: item.paymentMethod,
        date: today
      });
      item.lastRunAt = today;
      await item.save();
      logger.info(`Recurring transaction created for user ${item.user}`);
    }
  });
}
