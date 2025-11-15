import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Invalid email format').toLowerCase().trim();

/**
 * Password validation schema
 * Minimum 8 characters, at least one uppercase, one lowercase, one number
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Registration request schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Login request schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

