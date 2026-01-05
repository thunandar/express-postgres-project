const AuthService = require('../../src/services/authService');
const { User } = require('../../src/models');
const { cleanDatabase, closeDatabase } = require('../helpers/testDb');
const jwt = require('jsonwebtoken');

describe('AuthService', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const result = await AuthService.register(userData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(userData.email);
      expect(result.user.name).toBe(userData.name);
      expect(result.user.role).toBe('user'); // Default role
    });

    it('should hash the password when creating user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const result = await AuthService.register(userData);

      // Password should be hashed, not plain text
      expect(result.user.password).not.toBe(userData.password);
    });

    it('should not expose password in user object', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const result = await AuthService.register(userData);
      const userJson = result.user.toJSON();

      expect(userJson).not.toHaveProperty('password');
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      await AuthService.register(userData);

      // Try to register with same email
      await expect(AuthService.register(userData)).rejects.toThrow('Email already registered');
    });

    it('should create admin user if role is specified', async () => {
      const userData = {
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin User',
        role: 'admin'
      };

      const result = await AuthService.register(userData);

      expect(result.user.role).toBe('admin');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await AuthService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
    });

    it('should login successfully with correct credentials', async () => {
      const result = await AuthService.login('test@example.com', 'password123');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw error with invalid email', async () => {
      await expect(
        AuthService.login('wrong@example.com', 'password123')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error with invalid password', async () => {
      await expect(
        AuthService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should generate valid JWT tokens', async () => {
      const result = await AuthService.login('test@example.com', 'password123');

      // Verify access token
      const decodedAccess = jwt.verify(result.accessToken, process.env.JWT_SECRET);
      expect(decodedAccess).toHaveProperty('userId');

      // Verify refresh token
      const decodedRefresh = jwt.verify(result.refreshToken, process.env.REFRESH_TOKEN_SECRET);
      expect(decodedRefresh).toHaveProperty('userId');
    });
  });

  describe('refreshAccessToken', () => {
    let refreshToken;
    let userId;

    beforeEach(async () => {
      const result = await AuthService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
      refreshToken = result.refreshToken;
      userId = result.user.id;
    });

    it('should generate new access token with valid refresh token', async () => {
      const result = await AuthService.refreshAccessToken(refreshToken);

      expect(result).toHaveProperty('accessToken');

      // Verify new access token
      const decoded = jwt.verify(result.accessToken, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(userId);
    });

    it('should throw error with invalid refresh token', async () => {
      const invalidToken = 'invalid.token.here';

      await expect(
        AuthService.refreshAccessToken(invalidToken)
      ).rejects.toThrow();
    });

    it('should throw error if refresh token is missing', async () => {
      await expect(
        AuthService.refreshAccessToken(null)
      ).rejects.toThrow('Refresh token required');
    });
  });

  describe('logout', () => {
    let userId;

    beforeEach(async () => {
      const result = await AuthService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
      userId = result.user.id;
    });

    it('should logout user and clear refresh token', async () => {
      const result = await AuthService.logout(userId);

      expect(result).toHaveProperty('message');

      // Verify refresh token is cleared
      const user = await User.findByPk(userId);
      expect(user.refreshToken).toBeNull();
    });

    it('should throw error if user not found', async () => {
      await expect(
        AuthService.logout(99999)
      ).rejects.toThrow('User not found');
    });
  });
});
