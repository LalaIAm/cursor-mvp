// Test setup file
// This runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://user:password@localhost:5432/tarotlyfe_test';

