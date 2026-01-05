const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validatePagination, validateProductId } = require('../middleware/validation');
const { requireAuth, requireRole } = require('../middleware/auth');

// All user routes require authentication
router.use(requireAuth);

// Change password - any authenticated user
router.post('/change-password', userController.changePassword);

// Admin only routes
router.get('/', validatePagination, requireRole('admin'), userController.getAllUsers);
router.get('/:id', validateProductId, requireRole('admin'), userController.getUserById);
router.put('/:id', validateProductId, requireRole('admin'), userController.updateUser);
router.delete('/:id', validateProductId, requireRole('admin'), userController.deleteUser);

module.exports = router;