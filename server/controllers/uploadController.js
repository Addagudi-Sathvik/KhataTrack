import { uploadBuffer } from '../services/cloudinaryService.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

export const uploadProfile = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Image file is required', 400);
  const uploaded = await uploadBuffer(req.file.buffer, 'khatatrack/profiles');
  if (uploaded.url) {
    req.user.avatar = uploaded.url;
    await req.user.save();
  }
  res.json({ success: true, url: uploaded.url, message: uploaded.message });
});

export const uploadReceipt = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Receipt image is required', 400);
  const uploaded = await uploadBuffer(req.file.buffer, 'khatatrack/receipts');
  res.json({ success: true, url: uploaded.url, message: uploaded.message });
});
