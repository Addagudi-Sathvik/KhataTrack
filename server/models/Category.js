import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: '#14b8a6' },
    icon: { type: String, default: 'wallet' },
    type: { type: String, enum: ['expense', 'income'], default: 'expense' }
  },
  { timestamps: true }
);

categorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });

export default mongoose.model('Category', categorySchema);
