import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { sendOtp, verifyOtp, logout } from '../controllers/authController.js';

const router = Router();

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to user's email
 * @access  Public
 */
router.post(
  '/send-otp',
  validate([
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
  ]),
  sendOtp
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and generate JWT session token
 * @access  Public
 */
router.post(
  '/verify-otp',
  validate([
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be exactly 6 characters')
      .isNumeric()
      .withMessage('OTP must be numeric'),
  ]),
  verifyOtp
);

/**
 * @route   POST /api/auth/logout
 * @desc    Stateless logout (client drops token)
 * @access  Private (Protected)
 */
router.post('/logout', authMiddleware, logout);

export default router;
