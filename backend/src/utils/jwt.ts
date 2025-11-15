import jwt from "jsonwebtoken";
import { config } from "../config";
import crypto from "crypto";

export interface TokenPayload {
  userId: string;
  email: string;
}

/**
 * Generate a JWT access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessTokenExpiry,
  } as jwt.SignOptions);
};

/**
 * Generate a refresh token (random string, not JWT)
 * This will be stored in the database and set as HttpOnly cookie
 */
export const generateRefreshToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Verify and decode a JWT access token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

/**
 * Hash a refresh token for storage in database
 * We store a hash to prevent token theft from database
 */
export const hashRefreshToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
