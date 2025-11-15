// Test setup file
// This runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://user:password@localhost:5432/tarotlyfe_test';
process.env.EMAIL_PROVIDER = 'console';
process.env.EMAIL_FROM = 'test@tarotlyfe.com';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.PASSWORD_RESET_TOKEN_TTL_HOURS = '1';

