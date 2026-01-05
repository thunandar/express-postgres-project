/**
 * Database setup script for tests
 * Run this before tests to ensure schema exists
 */

// Load test environment
require('dotenv').config({ path: '.env.test' });

const { sequelize } = require('../src/models');

async function setupTestDatabase() {
  try {
    console.log('Setting up test database schema...');

    // Sync all models to create tables
    await sequelize.sync({ force: false });

    console.log('✓ Test database schema ready');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error setting up test database:', error.message);
    process.exit(1);
  }
}

setupTestDatabase();
