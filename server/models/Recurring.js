import mongoose from 'mongoose';

const recurringSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    type: { type: String, enum: ['expense', 'income'], default: 'expense' },
    paymentMethod: { type: String, enum: ['cash', 'bank', 'upi', 'card', 'wallet', 'other'], default: 'upi' },
    dayOfMonth: { type: Number, required: true, min: 1, max: 28 },
    isActive: { type: Boolean, default: true },
    lastRunAt: Date
  },
  { timestamps: true }
);

export default mongoose.model('Recurring', recurringSchema);
