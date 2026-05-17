import Expense from '../models/Expense.js';
import { scanReceiptBuffer } from '../services/ocrService.js';
import { categorizeExpenseText, chatWithContext } from '../services/geminiService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const parseText = asyncHandler(async (req, res) => {
  const parsed = await categorizeExpenseText(req.body.text);
  res.json({ success: true, parsed });
});

export const chat = asyncHandler(async (req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const transactions = await Expense.find({ user: req.user.id, date: { $gte: since } })
    .sort({ date: -1 })
    .limit(200)
    .select('amount category type description merchant date paymentMethod');

  const context = transactions
    .map((t) => `${t.date.toISOString().slice(0, 10)} | ${t.type} | ${t.category} | ${t.merchant || t.description} | ${t.amount}`)
    .join('\n');

  const reply = await chatWithContext(req.body.message, context || 'No transactions in the last 30 days.');
  res.json({ success: true, reply });
});

export const scanReceipt = asyncHandler(async (req, res) => {
  const result = await scanReceiptBuffer(req.file.buffer);
  res.json({ success: true, ...result });
});
