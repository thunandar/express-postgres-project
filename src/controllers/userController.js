const UserService = require('../services/userService');

const userController = {
  /**
   * Get all users
   * GET /api/users
   */
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, search, ...filters } = req.query;

      const result = await UserService.getAllUsers(page, limit, { search, ...filters });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a single user by ID
   * GET /api/users/:id
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update user
   * PUT /api/users/:id
   */
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const userData = req.body;

      const user = await UserService.updateUser(id, userData);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete user
   * DELETE /api/users/:id
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      const result = await UserService.deleteUser(id);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Change password
   * POST /api/users/change-password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const result = await UserService.changePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;