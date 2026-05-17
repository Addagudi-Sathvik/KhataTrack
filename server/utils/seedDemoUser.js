import User from '../models/User.js';
import logger from './logger.js';

export async function seedDemoUser() {
  if (process.env.SEED_DEMO_USER !== 'true') return;

  const email = process.env.DEMO_EMAIL || 'demo@example.com';
  const password = process.env.DEMO_PASSWORD || 'Password123';
  const exists = await User.findOne({ email });

  if (exists) {
    logger.info(`Demo user ready: ${email}`);
    return;
  }

  await User.create({
    name: 'Demo User',
    email,
    password,
    isEmailVerified: true,
    monthlyIncomeTarget: 75000,
    savingsGoal: 15000
  });

  logger.info(`Demo user created: ${email}`);
}
