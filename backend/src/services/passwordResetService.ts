import crypto from 'crypto';
import { query, queryOne, getClient } from '../db/connection';
import { hashPassword } from '../utils/password';
import { hashRefreshToken } from '../utils/jwt';
import { config } from '../config';
import { sendPasswordResetEmail } from './emailService';
import { User } from './authService';

export interface PasswordResetToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
  updated_at: Date;
  email?: string; // Optional, populated when joining with users table
}

/**
 * Generate a secure random token for password reset
 * Returns the raw token (to be sent to user) and its hash (to be stored)
 */
export const generateResetToken = (): { token: string; tokenHash: string } => {
  // Generate a cryptographically secure random token (64 bytes = 128 hex characters)
  const token = crypto.randomBytes(64).toString('hex');
  // Hash the token using SHA256 (same pattern as refresh tokens)
  const tokenHash = hashRefreshToken(token);
  return { token, tokenHash };
};

/**
 * Request a password reset
 * Always returns success to prevent user enumeration
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  // Find user by email
  const user = await queryOne<User>(
    'SELECT id, email FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  );

  // Always return success to prevent user enumeration
  // If user doesn't exist, we still return success but don't send email
  if (!user) {
    // Log telemetry (not exposed to user)
    console.log('[INFO] Password reset requested for non-existent email:', email);
    return;
  }

  // Generate reset token
  const { token, tokenHash } = generateResetToken();

  // Calculate expiration time
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + config.passwordReset.tokenTTLHours);

  // Store token hash in database
  await query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, tokenHash, expiresAt]
  );

  // Send password reset email
  const emailResult = await sendPasswordResetEmail(user.email, token);

  // Log telemetry
  if (emailResult.success) {
    console.log('[INFO] Password reset email sent:', {
      userId: user.id,
      email: user.email,
      messageId: emailResult.messageId,
    });
  } else {
    console.error('[ERROR] Password reset email failed:', {
      userId: user.id,
      email: user.email,
      error: emailResult.error,
    });
    // Note: We don't throw an error here to maintain generic response
    // The email failure is logged for telemetry but user still gets success response
  }
};

/**
 * Confirm password reset and update password
 */
export const confirmPasswordReset = async (
  token: string,
  newPassword: string
): Promise<void> => {
  // Hash the provided token to compare with stored hash
  const tokenHash = hashRefreshToken(token);

  // Find token in database
  const resetToken = await queryOne<PasswordResetToken>(
    `SELECT prt.*, u.email
     FROM password_reset_tokens prt
     JOIN users u ON prt.user_id = u.id
     WHERE prt.token_hash = $1 AND prt.used = FALSE`,
    [tokenHash]
  );

  if (!resetToken) {
    const error: any = new Error('Invalid or expired reset token');
    error.statusCode = 400;
    error.code = 'invalid_token';
    throw error;
  }

  // Check if token is expired
  const now = new Date();
  if (new Date(resetToken.expires_at) < now) {
    // Mark as used even though expired (cleanup)
    await query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE id = $1',
      [resetToken.id]
    );

    const error: any = new Error('Invalid or expired reset token');
    error.statusCode = 400;
    error.code = 'expired_token';
    throw error;
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update user password and mark token as used in a transaction
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Update password
    await client.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, resetToken.user_id]
    );

    // Invalidate refresh token (force re-login after password change)
    // This enforces single-session policy: password change invalidates all sessions
    await client.query(
      'UPDATE users SET refresh_token = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [resetToken.user_id]
    );

    // Mark reset token as used
    await client.query(
      'UPDATE password_reset_tokens SET used = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [resetToken.id]
    );

    await client.query('COMMIT');

    // Log successful password reset
    console.log('[INFO] Password reset successful:', {
      userId: resetToken.user_id,
      email: resetToken.email,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

