import User from '../models/User.js';
import { sendEmail } from '../services/emailService.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { hashToken, randomToken, signAccessToken, signRefreshToken } from '../utils/tokenUtils.js';
import { clearRefreshCookie, getRefreshToken, setRefreshCookie } from '../utils/cookieUtils.js';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function authPayload(user) {
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      avatar: user.avatar,
      savingsGoal: user.savingsGoal,
      globalMonthlyBudget: user.globalMonthlyBudget,
      isEmailVerified: user.isEmailVerified
    },
    accessToken: signAccessToken(user.id)
  };
}

function issueSession(res, user, refreshToken) {
  setRefreshCookie(res, refreshToken);
  return { success: true, ...authPayload(user) };
}

export const register = asyncHandler(async (req, res) => {
  const exists = await User.findOne({ email: req.body.email });
  if (exists) throw new AppError('Email is already registered', 409);

  const verificationToken = randomToken();
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    emailVerificationToken: hashToken(verificationToken),
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000
  });
  const refreshToken = signRefreshToken(user.id);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your KhataTrack email',
    html: `<p>Welcome, ${user.name}. Verify your account here: <a href="${verifyUrl}">${verifyUrl}</a></p>`
  });

  res.status(201).json(issueSession(res, user, refreshToken));
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new AppError('Invalid email or password', 401);
  }
  const refreshToken = signRefreshToken(user.id);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  res.json(issueSession(res, user, refreshToken));
});

export const googleLogin = asyncHandler(async (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) throw new AppError('Google login is not configured', 503);
  const ticket = await googleClient.verifyIdToken({
    idToken: req.body.credential,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  const profile = ticket.getPayload();
  let user = await User.findOne({ email: profile.email });

  if (!user) {
    user = await User.create({
      name: profile.name,
      email: profile.email,
      avatar: profile.picture,
      googleId: profile.sub,
      provider: 'google',
      isEmailVerified: Boolean(profile.email_verified)
    });
  } else {
    user.googleId = user.googleId || profile.sub;
    user.avatar = user.avatar || profile.picture;
    user.isEmailVerified = user.isEmailVerified || Boolean(profile.email_verified);
  }

  const refreshToken = signRefreshToken(user.id);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  res.json(issueSession(res, user, refreshToken));
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = getRefreshToken(req);
  if (!refreshToken) throw new AppError('Refresh token required', 401);
  const jwt = await import('jsonwebtoken');
  const decoded = jwt.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || user.refreshTokenHash !== hashToken(refreshToken)) throw new AppError('Invalid refresh token', 401);
  const nextRefreshToken = signRefreshToken(user.id);
  user.refreshTokenHash = hashToken(nextRefreshToken);
  await user.save();
  res.json(issueSession(res, user, nextRefreshToken));
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    emailVerificationToken: hashToken(req.params.token),
    emailVerificationExpires: { $gt: Date.now() }
  });
  if (!user) throw new AppError('Verification link is invalid or expired', 400);
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
  res.json({ success: true, message: 'Email verified' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    const token = randomToken();
    user.passwordResetToken = hashToken(token);
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000;
    await user.save();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendEmail({ to: user.email, subject: 'Reset your password', html: `<a href="${resetUrl}">${resetUrl}</a>` });
  }
  res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    passwordResetToken: hashToken(req.params.token),
    passwordResetExpires: { $gt: Date.now() }
  });
  if (!user) throw new AppError('Reset link is invalid or expired', 400);
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json({ success: true, message: 'Password updated' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  Object.assign(req.user, {
    name: req.body.name ?? req.user.name,
    currency: req.body.currency ?? req.user.currency,
    monthlyIncomeTarget: req.body.monthlyIncomeTarget ?? req.user.monthlyIncomeTarget,
    savingsGoal: req.body.savingsGoal ?? req.user.savingsGoal,
    globalMonthlyBudget: req.body.globalMonthlyBudget ?? req.user.globalMonthlyBudget
  });
  await req.user.save();
  res.json({ success: true, user: req.user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword))) throw new AppError('Current password is incorrect', 400);
  user.password = req.body.password;
  await user.save();
  res.json({ success: true, message: 'Password changed' });
});

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { $unset: { refreshTokenHash: 1 } });
  clearRefreshCookie(res);
  res.json({ success: true, message: 'Logged out' });
});
