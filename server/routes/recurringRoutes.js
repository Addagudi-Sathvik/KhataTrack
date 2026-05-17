import express from 'express';
import Recurring from '../models/Recurring.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const items = await Recurring.find({ user: req.user.id }).sort({ dayOfMonth: 1 });
    res.json({ success: true, items });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const item = await Recurring.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, item });
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const item = await Recurring.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, {
      new: true,
      runValidators: true
    });
    if (!item) throw new AppError('Recurring payment not found', 404);
    res.json({ success: true, item });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const item = await Recurring.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!item) throw new AppError('Recurring payment not found', 404);
    res.json({ success: true, message: 'Recurring payment deleted' });
  })
);

export default router;
