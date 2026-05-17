import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

export const corsConfig = {
  origin: process.env.CLIENT_URL?.split(',') || 'http://localhost:5173',
  credentials: true
};

export const corsOptions = cors(corsConfig);

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  message: { success: false, message: 'Too many auth attempts. Please try again later.' }
});

export function applySecurity(app) {
  app.use(helmet());
  app.use(corsOptions);
  app.use(apiLimiter);
  app.use(mongoSanitize());
  app.use(hpp());
}
