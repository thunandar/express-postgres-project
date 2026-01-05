const express = require('express');
const router = express.Router();
const productRoutes = require('./productRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');

// API routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/users', userRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;