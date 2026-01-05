const { User } = require('../models');
const { Op } = require('sequelize');
const { NotFoundError, BadRequestError } = require('../utils/errors');

class UserService {
  /**
   * Get all users with pagination and filters
   */
  static async getAllUsers(page = 1, limit = 10, filters = {}) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const where = {};

    // Role filter
    if (filters.role) {
      where.role = filters.role;
    }

    // Search by name or email
    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { email: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }

    // Sort options
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder ? filters.sortOrder.toUpperCase() : 'DESC';

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: limitNum,
      offset: offset,
      order: [[sortBy, sortOrder]],
      attributes: { exclude: ['password', 'refreshToken'] }
    });

    return {
      users: rows,
      totalPages: Math.ceil(count / limitNum) || 0,
      currentPage: pageNum,
      totalUsers: count,
      filters: filters
    };
  }

  /**
   * Get a single user by ID
   */
  static async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'refreshToken'] }
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Update user
   */
  static async updateUser(id, userData) {
    const user = await User.findByPk(id);

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    // Don't allow password update through this endpoint
    const { password, refreshToken, ...updateData } = userData;

    // Update user data
    await user.update(updateData);

    // Return updated user without sensitive data
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password', 'refreshToken'] }
    });

    return updatedUser;
  }

  /**
   * Delete a user
   */
  static async deleteUser(id) {
    const user = await User.findByPk(id);

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    await user.destroy();

    return { message: 'User deleted successfully' };
  }

  /**
   * Change user password
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    // Update password (will be hashed by model hook)
    await user.update({ password: newPassword });

    return { message: 'Password changed successfully' };
  }
}

module.exports = UserService;