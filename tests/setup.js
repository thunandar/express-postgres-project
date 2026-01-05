// Test environment setup - MUST be first, before any other imports
require('dotenv').config({ path: '.env.test' });

// Verify test environment is loaded
if (!process.env.JWT_SECRET || process.env.JWT_SECRET !== 'test-jwt-secret-key') {
  console.error('ERROR: Test environment not properly configured!');
  console.error('JWT_SECRET:', process.env.JWT_SECRET);
  process.exit(1);
}

// Increase timeout for database operations
jest.setTimeout(15000);

// Initialize database schema before all tests
const { sequelize } = require('../src/models');

beforeAll(async () => {
  // Force sync to drop and recreate all tables - ensures clean state
  // This runs ONCE at the start of the entire test suite
  await sequelize.sync({ force: true });
});

// Global test cleanup
afterAll(async () => {
  // Allow time for async operations to complete
  await new Promise(resolve => setTimeout(resolve, 500));
});
