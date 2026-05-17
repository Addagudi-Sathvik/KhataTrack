import express from 'express';
import {
  createCategory,
  createExpense,
  dashboard,
  deleteExpense,
  listExpenses,
  notifications,
  reportCsv,
  reportExcel,
  reportPdf,
  updateExpense
} from '../controllers/expenseController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { expenseRules, listRules } from '../validations/expenseValidation.js';

const router = express.Router();

router.use(protect);
router.get('/dashboard', dashboard);
router.get('/notifications', notifications);
router.get('/reports/pdf', reportPdf);
router.get('/reports/excel', reportExcel);
router.get('/reports/csv', reportCsv);
router.route('/expenses').get(listRules, validate, listExpenses).post(expenseRules, validate, createExpense);
router.route('/expenses/:id').patch(expenseRules, validate, updateExpense).delete(deleteExpense);
router.post('/categories', createCategory);

export default router;
