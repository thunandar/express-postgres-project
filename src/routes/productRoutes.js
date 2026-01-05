const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const {
  validateProduct,
  validateSearch,
  validatePagination,
  validateProductId,
  validateFilters
} = require('../middleware/validation');
const { uploadProductImages } = require('../middleware/imageUpload');
const { requireAuth, requireRole } = require('../middleware/auth');

// Public routes - anyone can view products
router.get('/', validatePagination, validateFilters, productController.getAllProducts);
router.get('/search', validateSearch, validatePagination, productController.getAllProducts);
router.get('/:id', validateProductId, productController.getProductById);

// Protected routes - only admin can create, update, delete
router.post('/',
  requireAuth,
  requireRole('admin'),
  uploadProductImages,
  validateProduct,
  productController.createProduct
);

router.put('/:id',
  requireAuth,
  requireRole('admin'),
  validateProductId,
  uploadProductImages,
  validateProduct,
  productController.updateProduct
);

router.delete('/:id',
  requireAuth,
  requireRole('admin'),
  validateProductId,
  productController.deleteProduct
);

module.exports = router;