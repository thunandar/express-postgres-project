const { Product, ProductImage } = require('../models');
const { Op } = require('sequelize');
const { NotFoundError } = require('../utils/errors');
const { deleteImageFiles } = require('../middleware/imageUpload');

class ProductService {
  /**
   * Get all products with pagination and optional filters
   * Validation for page/limit/filters is handled by middleware
   */
  static async getAllProducts(page = 1, limit = 10, filters = {}) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const where = {};

    // Category filter (supports multiple categories)
    if (filters.category) {
      const categories = filters.category.split(',').map(c => c.trim());
      where.category = categories.length > 1 ? { [Op.in]: categories } : categories[0];
    }

    // Price range filter
    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) {
        where.price[Op.gte] = parseFloat(filters.minPrice);
      }
      if (filters.maxPrice) {
        where.price[Op.lte] = parseFloat(filters.maxPrice);
      }
    }

    // Stock filter
    if (filters.inStock !== undefined) {
      where.stock = filters.inStock === 'true' ? { [Op.gt]: 0 } : { [Op.eq]: 0 };
    }

    // Sort options
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder ? filters.sortOrder.toUpperCase() : 'DESC';

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit: limitNum,
      offset: offset,
      order: [[sortBy, sortOrder]],
      include: [{
        model: ProductImage,
        as: 'images',
        attributes: ['id', 'imageUrl', 'imageFilename', 'isPrimary', 'sortOrder'],
        required: false,
        order: [['sortOrder', 'ASC']]
      }],
      distinct: true
    });

    return {
      products: rows,
      totalPages: Math.ceil(count / limitNum) || 0,
      currentPage: pageNum,
      totalProducts: count,
      filters: filters
    };
  }

  /**
   * Get a single product by ID
   */
  static async getProductById(id) {
    const product = await Product.findByPk(id, {
      include: [{
        model: ProductImage,
        as: 'images',
        attributes: ['id', 'imageUrl', 'imageFilename', 'isPrimary', 'sortOrder'],
        order: [['sortOrder', 'ASC']]
      }]
    });

    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    return product;
  }

  /**
   * Search products by name or description
   * Validation for searchTerm is handled by middleware
   */
  static async searchProducts(searchTerm, page = 1, limit = 10) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await Product.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      },
      limit: limitNum,
      offset: offset,
      order: [['createdAt', 'DESC']],
      include: [{
        model: ProductImage,
        as: 'images',
        attributes: ['id', 'imageUrl', 'imageFilename', 'isPrimary', 'sortOrder'],
        required: false,
        order: [['sortOrder', 'ASC']]
      }],
      distinct: true
    });

    return {
      products: rows,
      totalPages: Math.ceil(count / limitNum) || 0,
      currentPage: pageNum,
      totalProducts: count,
      searchTerm
    };
  }

  /**
   * Create a new product with images
   * Validation is handled by middleware and Sequelize model
   */
  static async createProduct(productData, imageData = []) {
    // Create product
    const product = await Product.create(productData);

    // Create associated images if provided
    if (imageData.length > 0) {
      const imagesWithProductId = imageData.map(img => ({
        ...img,
        productId: product.id
      }));
      await ProductImage.bulkCreate(imagesWithProductId);
    }

    // Return product with images
    return await this.getProductById(product.id);
  }

  /**
   * Update an existing product
   */
  static async updateProduct(id, productData, imageData = []) {
    const product = await Product.findByPk(id, {
      include: [{
        model: ProductImage,
        as: 'images'
      }]
    });

    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    // Update product data
    await product.update(productData);

    // If new images provided, delete old images and add new ones
    if (imageData.length > 0) {
      // Get old image filenames for cleanup
      const oldImageFilenames = product.images.map(img => img.imageFilename);

      // Delete old image records from DB
      await ProductImage.destroy({ where: { productId: id } });

      // Delete old image files from disk
      if (oldImageFilenames.length > 0) {
        deleteImageFiles(oldImageFilenames);
      }

      // Create new image records
      const imagesWithProductId = imageData.map(img => ({
        ...img,
        productId: id
      }));
      await ProductImage.bulkCreate(imagesWithProductId);
    }

    // Return updated product with images
    return await this.getProductById(id);
  }

  /**
   * Delete a product
   */
  static async deleteProduct(id) {
    const product = await Product.findByPk(id, {
      include: [{
        model: ProductImage,
        as: 'images'
      }]
    });

    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    // Get image filenames before deletion
    const imageFilenames = product.images.map(img => img.imageFilename);

    // Delete product (CASCADE will delete images from DB)
    await product.destroy();

    // Delete image files from disk
    if (imageFilenames.length > 0) {
      deleteImageFiles(imageFilenames);
    }

    return { message: 'Product deleted successfully' };
  }
}

module.exports = ProductService;