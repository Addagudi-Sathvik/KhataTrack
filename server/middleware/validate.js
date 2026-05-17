import { validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';

export function validate(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array().map((error) => error.msg).join(', '), 422);
  }
  next();
}
