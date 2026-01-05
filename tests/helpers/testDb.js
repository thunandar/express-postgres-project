const { sequelize } = require('../../src/models');

/**
 * PRODUCTION-GRADE PARALLEL TEST ISOLATION
 *
 * Uses TRUNCATE with proper safeguards for parallel execution.
 * This is a pragmatic approach used by many production systems when
 * transaction rollback isn't feasible (e.g., testing HTTP endpoints).
 *
 * HOW IT WORKS:
 * 1. Database schema created once at global setup
 * 2. Each test file has isolated beforeEach/afterEach
 * 3. Tests within a file run sequentially, but files run in parallel
 * 4. TRUNCATE CASCADE handles all foreign key relationships
 * 5. RESTART IDENTITY ensures clean auto-increment values
 *
 * BENEFITS:
 * ✅ Reliable - works with HTTP requests and all test types
 * ✅ Simple - no complex transaction management
 * ✅ Parallel - test files run in parallel via Jest workers
 * ✅ Fast - TRUNCATE is much faster than DELETE
 * ✅ Safe - CASCADE prevents foreign key errors
 */

/**
 * Clean database using TRUNCATE CASCADE
 * Safe to call even if tables don't exist yet
 */
const cleanDatabase = async () => {
  try {
    // Use lowercase table names as they appear in PostgreSQL
    await sequelize.query(
      'TRUNCATE TABLE users, products, product_images RESTART IDENTITY CASCADE',
      { raw: true }
    );
  } catch (error) {
    // Silently ignore if tables don't exist yet (during setup)
    if (!error.message.includes('does not exist')) {
      console.error('Error cleaning database:', error.message);
      throw error;
    }
  }
};

/**
 * Close database connection
 */
const closeDatabase = async () => {
  await sequelize.close();
};

/**
 * Sync database (create tables if not exist)
 */
const syncDatabase = async () => {
  await sequelize.sync({ force: false });
};

module.exports = {
  cleanDatabase,
  closeDatabase,
  syncDatabase,
};
