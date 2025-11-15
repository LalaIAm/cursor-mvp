import { Router, Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { requestPasswordReset, confirmPasswordReset } from '../services/passwordResetService';
import { validate } from '../middleware/validation';
import { registerSchema, loginSchema, passwordResetRequestSchema, passwordResetConfirmSchema } from '../utils/validation';
import { config } from '../config';

const router = Router();

// Async error wrapper for Express 4
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validate(registerSchema), asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  
  // Log successful registration (without sensitive data)
  console.log(`[INFO] User registered: ${result.user.email}`);

  res.status(201).json({
    message: 'User registered successfully',
    user: result.user,
  });
}));

/**
 * POST /api/auth/login
 * Login user and issue tokens
 */
router.post('/login', validate(loginSchema), asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);

  // Set refresh token as HttpOnly cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    domain: config.cookie.domain,
    path: config.cookie.path,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  });

  // Log successful login (without sensitive data)
  console.log(`[INFO] User logged in: ${result.user.email}`);

  res.status(200).json({
    message: 'Login successful',
    user: result.user,
    accessToken: result.accessToken,
  });
}));

/**
 * POST /api/auth/password-reset/request
 * Request a password reset
 * Always returns generic success to prevent user enumeration
 * 
 * TODO: Add rate limiting middleware to prevent abuse:
 * - Limit requests per IP address (e.g., 5 requests per hour)
 * - Limit requests per email address (e.g., 3 requests per hour)
 * - Consider using express-rate-limit or similar middleware
 */
router.post('/password-reset/request', validate(passwordResetRequestSchema), asyncHandler(async (req: Request, res: Response) => {
  await requestPasswordReset(req.body.email);

  // Always return generic success response (even if email doesn't exist)
  // This prevents user enumeration attacks
  res.status(200).json({
    message: 'If an account exists with this email, a password reset link has been sent.',
  });
}));

/**
 * POST /api/auth/password-reset/confirm
 * Confirm password reset and update password
 */
router.post('/password-reset/confirm', validate(passwordResetConfirmSchema), asyncHandler(async (req: Request, res: Response) => {
  await confirmPasswordReset(req.body.token, req.body.newPassword);

  res.status(200).json({
    message: 'Password has been reset successfully. Please log in with your new password.',
  });
}));

export default router;

