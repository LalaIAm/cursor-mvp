import request from 'supertest';
import app from '../server';
import { query, queryOne } from '../db/connection';
import { hashPassword } from '../utils/password';
import { hashRefreshToken } from '../utils/jwt';
import { generateResetToken } from '../services/passwordResetService';
import { sendPasswordResetEmail } from '../services/emailService';

// Mock email service
jest.mock('../services/emailService');
const mockSendPasswordResetEmail = sendPasswordResetEmail as jest.MockedFunction<typeof sendPasswordResetEmail>;

describe('POST /api/auth/password-reset/request', () => {
  const testUser = {
    email: 'reset@example.com',
    password: 'Test1234!',
  };

  beforeEach(async () => {
    // Clean up test data
    await query('DELETE FROM password_reset_tokens');
    await query('DELETE FROM users WHERE email = $1', [testUser.email]);
    mockSendPasswordResetEmail.mockClear();
    mockSendPasswordResetEmail.mockResolvedValue({
      success: true,
      messageId: 'test-message-id',
    });
  });

  afterEach(async () => {
    // Clean up test data
    await query('DELETE FROM password_reset_tokens');
    await query('DELETE FROM users WHERE email = $1', [testUser.email]);
  });

  it('should return generic success for existing email', async () => {
    // Create test user
    const passwordHash = await hashPassword(testUser.password);
    await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
      [testUser.email, passwordHash]
    );

    const response = await request(app)
      .post('/api/auth/password-reset/request')
      .send({ email: testUser.email })
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('If an account exists');
    
    // Verify email was sent
    expect(mockSendPasswordResetEmail).toHaveBeenCalledTimes(1);
    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
      testUser.email,
      expect.any(String)
    );

    // Verify token was stored in database
    const tokens = await query(
      'SELECT * FROM password_reset_tokens WHERE user_id = (SELECT id FROM users WHERE email = $1)',
      [testUser.email]
    );
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens[0].used).toBe(false);
  });

  it('should return generic success for non-existent email (prevent enumeration)', async () => {
    const response = await request(app)
      .post('/api/auth/password-reset/request')
      .send({ email: 'nonexistent@example.com' })
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('If an account exists');
    
    // Verify email was NOT sent for non-existent user
    expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();

    // Verify no token was stored
    const tokens = await query(
      'SELECT * FROM password_reset_tokens'
    );
    expect(tokens.length).toBe(0);
  });

  it('should return 400 for invalid email format', async () => {
    const response = await request(app)
      .post('/api/auth/password-reset/request')
      .send({ email: 'invalid-email' })
      .expect(400);

    expect(response.body.error).toHaveProperty('code', 'validation_error');
  });

  it('should return 400 for missing email', async () => {
    const response = await request(app)
      .post('/api/auth/password-reset/request')
      .send({})
      .expect(400);

    expect(response.body.error).toHaveProperty('code', 'validation_error');
  });

  it('should handle email send failure gracefully', async () => {
    // Create test user
    const passwordHash = await hashPassword(testUser.password);
    await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
      [testUser.email, passwordHash]
    );

    // Mock email failure
    mockSendPasswordResetEmail.mockResolvedValueOnce({
      success: false,
      error: 'Email service unavailable',
    });

    // Should still return success to user
    const response = await request(app)
      .post('/api/auth/password-reset/request')
      .send({ email: testUser.email })
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(mockSendPasswordResetEmail).toHaveBeenCalled();
  });
});

describe('POST /api/auth/password-reset/confirm', () => {
  const testUser = {
    email: 'confirm@example.com',
    password: 'Test1234!',
    newPassword: 'NewPassword123!',
  };

  beforeEach(async () => {
    // Clean up test data
    await query('DELETE FROM password_reset_tokens');
    await query('DELETE FROM users WHERE email = $1', [testUser.email]);
  });

  afterEach(async () => {
    // Clean up test data
    await query('DELETE FROM password_reset_tokens');
    await query('DELETE FROM users WHERE email = $1', [testUser.email]);
  });

  it('should successfully reset password with valid token', async () => {
    // Create test user
    const passwordHash = await hashPassword(testUser.password);
    const userResult = await queryOne<{ id: string }>(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [testUser.email, passwordHash]
    );
    const userId = userResult!.id;

    // Generate and store reset token
    const { token, tokenHash } = generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [userId, tokenHash, expiresAt]
    );

    // Confirm password reset
    const response = await request(app)
      .post('/api/auth/password-reset/confirm')
      .send({
        token,
        newPassword: testUser.newPassword,
      })
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Password has been reset successfully');

    // Verify password was updated
    const updatedUser = await queryOne<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );
    expect(updatedUser).not.toBeNull();

    // Verify new password works
    const { verifyPassword } = require('../utils/password');
    const isValid = await verifyPassword(testUser.newPassword, updatedUser!.password_hash);
    expect(isValid).toBe(true);

    // Verify token was marked as used
    const tokenRecord = await queryOne<{ used: boolean }>(
      'SELECT used FROM password_reset_tokens WHERE token_hash = $1',
      [tokenHash]
    );
    expect(tokenRecord?.used).toBe(true);

    // Verify refresh token was invalidated
    const userWithToken = await queryOne<{ refresh_token: string | null }>(
      'SELECT refresh_token FROM users WHERE id = $1',
      [userId]
    );
    expect(userWithToken?.refresh_token).toBeNull();
  });

  it('should return 400 for invalid token', async () => {
    const response = await request(app)
      .post('/api/auth/password-reset/confirm')
      .send({
        token: 'invalid-token',
        newPassword: testUser.newPassword,
      })
      .expect(400);

    expect(response.body.error).toHaveProperty('code', 'invalid_token');
  });

  it('should return 400 for expired token', async () => {
    // Create test user
    const passwordHash = await hashPassword(testUser.password);
    const userResult = await queryOne<{ id: string }>(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [testUser.email, passwordHash]
    );
    const userId = userResult!.id;

    // Generate and store expired reset token
    const { token, tokenHash } = generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() - 1); // Expired 1 hour ago

    await query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [userId, tokenHash, expiresAt]
    );

    // Try to confirm with expired token
    const response = await request(app)
      .post('/api/auth/password-reset/confirm')
      .send({
        token,
        newPassword: testUser.newPassword,
      })
      .expect(400);

    expect(response.body.error).toHaveProperty('code', 'expired_token');

    // Verify token was marked as used (cleanup)
    const tokenRecord = await queryOne<{ used: boolean }>(
      'SELECT used FROM password_reset_tokens WHERE token_hash = $1',
      [tokenHash]
    );
    expect(tokenRecord?.used).toBe(true);
  });

  it('should return 400 for already used token', async () => {
    // Create test user
    const passwordHash = await hashPassword(testUser.password);
    const userResult = await queryOne<{ id: string }>(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [testUser.email, passwordHash]
    );
    const userId = userResult!.id;

    // Generate and store already-used reset token
    const { token, tokenHash } = generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, used) VALUES ($1, $2, $3, $4)',
      [userId, tokenHash, expiresAt, true]
    );

    // Try to confirm with used token
    const response = await request(app)
      .post('/api/auth/password-reset/confirm')
      .send({
        token,
        newPassword: testUser.newPassword,
      })
      .expect(400);

    expect(response.body.error).toHaveProperty('code', 'invalid_token');
  });

  it('should return 400 for weak password', async () => {
    // Create test user
    const passwordHash = await hashPassword(testUser.password);
    const userResult = await queryOne<{ id: string }>(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [testUser.email, passwordHash]
    );
    const userId = userResult!.id;

    // Generate and store reset token
    const { token, tokenHash } = generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [userId, tokenHash, expiresAt]
    );

    // Try to confirm with weak password
    const response = await request(app)
      .post('/api/auth/password-reset/confirm')
      .send({
        token,
        newPassword: 'weak',
      })
      .expect(400);

    expect(response.body.error).toHaveProperty('code', 'validation_error');
  });

  it('should return 400 for missing token', async () => {
    const response = await request(app)
      .post('/api/auth/password-reset/confirm')
      .send({
        newPassword: testUser.newPassword,
      })
      .expect(400);

    expect(response.body.error).toHaveProperty('code', 'validation_error');
  });

  it('should return 400 for missing password', async () => {
    const response = await request(app)
      .post('/api/auth/password-reset/confirm')
      .send({
        token: 'some-token',
      })
      .expect(400);

    expect(response.body.error).toHaveProperty('code', 'validation_error');
  });

  it('should enforce one-time use of token', async () => {
    // Create test user
    const passwordHash = await hashPassword(testUser.password);
    const userResult = await queryOne<{ id: string }>(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [testUser.email, passwordHash]
    );
    const userId = userResult!.id;

    // Generate and store reset token
    const { token, tokenHash } = generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [userId, tokenHash, expiresAt]
    );

    // First use - should succeed
    await request(app)
      .post('/api/auth/password-reset/confirm')
      .send({
        token,
        newPassword: testUser.newPassword,
      })
      .expect(200);

    // Second use - should fail
    const response = await request(app)
      .post('/api/auth/password-reset/confirm')
      .send({
        token,
        newPassword: 'AnotherPassword123!',
      })
      .expect(400);

    expect(response.body.error).toHaveProperty('code', 'invalid_token');
  });
});

