import express from 'express';
import {
  changePassword,
  forgotPassword,
  googleLogin,
  login,
  logout,
  me,
  refresh,
  register,
  resetPassword,
  updateProfile,
  verifyEmail
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/security.js';
import { loginRules, passwordRules, registerRules } from '../validations/authValidation.js';

const router = express.Router();

router.post('/register', authLimiter, registerRules, validate, register);
router.post('/signup', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/google', authLimiter, googleLogin);
router.post('/refresh', refresh);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', passwordRules, validate, resetPassword);
router.get('/me', protect, me);
router.patch('/profile', protect, updateProfile);
router.patch('/change-password', protect, passwordRules, validate, changePassword);
router.post('/logout', protect, logout);

export default router;
