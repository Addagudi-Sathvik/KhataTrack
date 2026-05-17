import { body, query } from 'express-validator';

export const expenseRules = [
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('description').trim().isLength({ min: 2, max: 180 }).withMessage('Description must be 2-180 characters'),
  body('date').optional().isISO8601().withMessage('Date must be valid'),
  body('type').optional().isIn(['expense', 'income']).withMessage('Invalid transaction type'),
  body('paymentMethod').optional().isIn(['cash', 'card', 'upi', 'bank', 'wallet', 'other']).withMessage('Invalid payment method')
];

export const listRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sortBy').optional().isIn(['date', 'amount', 'category', 'createdAt']),
  query('order').optional().isIn(['asc', 'desc'])
];
