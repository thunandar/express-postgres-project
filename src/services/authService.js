const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { UnauthorizedError, BadRequestError, ValidationError } = require('../utils/errors');

class AuthService {
  /**
   * Register a new user
   */
  static async register(userData) {
    const { email, password, name, role = 'user' } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestError('Email already registered');
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    // Save refresh token to database
    await user.update({ refreshToken });

    return {
      user,
      accessToken,
      refreshToken
    };
  }

  /**
   * Login user
   */
  static async login(email, password) {
    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    // Save refresh token to database
    await user.update({ refreshToken });

    return {
      user,
      accessToken,
      refreshToken
    };
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token required');
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

      // Find user with this refresh token
      const user = await User.findOne({
        where: {
          id: decoded.userId,
          refreshToken: refreshToken
        }
      });

      if (!user) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Generate new access token
      const newAccessToken = this.generateAccessToken(user.id);

      return {
        accessToken: newAccessToken
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Invalid refresh token');
      }
      throw error;
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  static async logout(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Remove refresh token
    await user.update({ refreshToken: null });

    return { message: 'Logged out successfully' };
  }

  /**
   * Get current user
   */
  static async getCurrentUser(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return user;
  }

  /**
   * Generate access token (short-lived)
   */
  static generateAccessToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES || '15m' }
    );
  }

  /**
   * Generate refresh token (long-lived)
   */
  static generateRefreshToken(userId) {
    return jwt.sign(
      { userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES || '30d' }
    );
  }
}

module.exports = AuthService;
