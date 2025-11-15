import { Router, Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { validate } from '../middleware/validation';
import { registerSchema, loginSchema } from '../utils/validation';
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

export default router;

