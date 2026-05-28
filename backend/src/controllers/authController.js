import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { sendOtpEmail } from '../utils/email.js';

/**
 * @desc    Generate and save a 6-digit OTP for the user, logging it to the console in development
 * @route   POST /api/auth/send-otp
 */
export const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Generate a cryptographically random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP expiration to 10 minutes in the future
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const userId = uuidv4();

    // Upsert into users table
    const query = `
      INSERT INTO users (id, email, otp, otp_expires_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email)
      DO UPDATE SET otp = $3, otp_expires_at = $4
    `;

    await pool.query(query, [userId, email, otp, otpExpiresAt]);

    // Send the real email
    await sendOtpEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: 'OTP sent',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Verify OTP and return a JWT access token on success
 * @route   POST /api/auth/verify-otp
 */
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Check user existence
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = userResult.rows[0];

    // Check if OTP exists
    if (!user.otp) {
      return res.status(401).json({
        success: false,
        message: 'No OTP on record',
      });
    }

    // Verify OTP matches
    if (user.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Check expiration
    const expiryDate = new Date(user.otp_expires_at);
    if (expiryDate < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'OTP has expired',
      });
    }

    // Success: Clear OTP fields
    await pool.query(
      'UPDATE users SET otp = NULL, otp_expires_at = NULL WHERE id = $1',
      [user.id]
    );

    // Sign JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Stateless logout (client drops the token)
 * @route   POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logged out',
    });
  } catch (error) {
    return next(error);
  }
};
