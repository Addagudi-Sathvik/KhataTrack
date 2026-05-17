import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true, index: true },
    date: { type: Date, required: true, default: Date.now, index: true },
    description: { type: String, required: true, trim: true, maxlength: 180 },
    merchant: { type: String, trim: true, maxlength: 120 },
    attachmentUrl: String,
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank', 'wallet', 'other'],
      default: 'upi'
    },
    type: { type: String, enum: ['expense', 'income'], default: 'expense', index: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    notes: { type: String, maxlength: 800 },
    recurring: {
      enabled: { type: Boolean, default: false },
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly', null], default: null },
      nextRunAt: Date
    },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'BudgetGroup', index: true }
  },
  { timestamps: true }
);

expenseSchema.index({ user: 1, date: -1, category: 1, type: 1 });
expenseSchema.index({ description: 'text', category: 'text', tags: 'text' });

export default mongoose.model('Expense', expenseSchema);
