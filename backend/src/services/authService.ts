import { query, queryOne } from "../db/connection";
import { hashPassword, verifyPassword } from "../utils/password";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/jwt";
import { RegisterInput, LoginInput } from "../utils/validation";

export interface User {
  id: string;
  email: string;
  password_hash: string;
  refresh_token: string | null;
  subscription_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * Register a new user
 */
export const registerUser = async (
  input: RegisterInput
): Promise<{ user: { id: string; email: string } }> => {
  // Check if user already exists
  const existingUser = await queryOne<User>(
    "SELECT id FROM users WHERE email = $1",
    [input.email]
  );

  if (existingUser) {
    const error: any = new Error("Email already registered");
    error.statusCode = 409;
    error.code = "duplicate_email";
    throw error;
  }

  // Hash password
  const passwordHash = await hashPassword(input.password);

  // Insert user
  // Note: We still check for existing user above for better error messages,
  // but the database unique constraint is the ultimate protection against race conditions
  try {
    const result = await queryOne<User>(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, created_at, updated_at`,
      [input.email, passwordHash]
    );

    if (!result) {
      const error: any = new Error("Failed to create user");
      error.statusCode = 500;
      error.code = "server_error";
      throw error;
    }

    return {
      user: {
        id: result.id,
        email: result.email,
      },
    };
  } catch (error: any) {
    // Handle race condition: if two requests arrive simultaneously,
    // the second INSERT will fail with a unique constraint violation
    // PostgreSQL error code '23505' = unique_violation
    // Also check constraint name or error message for additional safety
    if (
      error.code === "23505" ||
      error.constraint === "users_email_key" ||
      (error.message &&
        error.message.includes("duplicate key value") &&
        error.message.includes("email"))
    ) {
      const duplicateError: any = new Error("Email already registered");
      duplicateError.statusCode = 409;
      duplicateError.code = "duplicate_email";
      throw duplicateError;
    }
    // Re-throw other errors
    throw error;
  }
};

/**
 * Login user and generate tokens
 */
export const loginUser = async (input: LoginInput): Promise<AuthResult> => {
  // Find user by email
  const user = await queryOne<User>(
    "SELECT id, email, password_hash FROM users WHERE email = $1",
    [input.email]
  );

  if (!user) {
    const error: any = new Error("Invalid email or password");
    error.statusCode = 401;
    error.code = "invalid_credentials";
    throw error;
  }

  // Verify password
  const isValidPassword = await verifyPassword(
    input.password,
    user.password_hash
  );

  if (!isValidPassword) {
    const error: any = new Error("Invalid email or password");
    error.statusCode = 401;
    error.code = "invalid_credentials";
    throw error;
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);

  // Store refresh token hash in database
  // This supports single-session enforcement (new login invalidates previous session)
  await query(
    "UPDATE users SET refresh_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
    [refreshTokenHash, user.id]
  );

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
};
