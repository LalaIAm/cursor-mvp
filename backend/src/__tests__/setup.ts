// Test setup file
// This runs before all tests

import { closePool } from "../db/connection";

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "postgresql://test_user:test_password@localhost:5432/tarotlyfe_test";
process.env.EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || "console";
process.env.EMAIL_FROM = process.env.EMAIL_FROM || "test@tarotlyfe.com";
process.env.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
process.env.PASSWORD_RESET_TOKEN_TTL_HOURS =
  process.env.PASSWORD_RESET_TOKEN_TTL_HOURS || "1";

// Global teardown to close database connections
afterAll(async () => {
  await closePool();
}, 30000); // 30 second timeout for cleanup
