import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError, asyncHandler } from './errorHandler.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : req.cookies?.accessToken;

  if (!token) throw new AppError('Authentication required', 401);

  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  const user = await User.findById(decoded.id).select('-password -refreshTokenHash');
  if (!user || !user.isActive) throw new AppError('Invalid session', 401);

  req.user = user;
  next();
});
