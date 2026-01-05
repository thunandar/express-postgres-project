const ProductService = require('../services/productService');
const { getImageUrl, processUploadedFiles, deleteImageFiles } = require('../middleware/imageUpload');

// Helper function to handle multiple image uploads
const handleImageUploads = async (req) => {
  if (!req.files || req.files.length === 0) {
    return [];
  }

  // Process files (upload to S3 in production, or use local files)
  const processedFiles = await processUploadedFiles(req.files);

  return processedFiles.map((file, index) => ({
    imageUrl: getImageUrl(req, file.filename),
    imageFilename: file.filename,
    isPrimary: index === 0, // First image is primary
    sortOrder: index
  }));
};

// Helper function to cleanup uploaded files on error
const cleanupUploadedFiles = async (req) => {
  if (req.files && req.files.length > 0) {
    const processedFiles = await processUploadedFiles(req.files);
    const filenames = processedFiles.map(file => file.filename);
    await deleteImageFiles(filenames);
  }
};

const productController = {
  async getAllProducts(req, res, next) {
    try {
      const { page = 1, limit = 10, search, ...filters } = req.query;

      let result;
      if (search) {
        result = await ProductService.searchProducts(search, page, limit);
      } else {
        result = await ProductService.getAllProducts(page, limit, filters);
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);
      
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  },

  async createProduct(req, res, next) {
    try {
      const productData = req.body;

      // Prepare image data from uploaded files
      const imageData = await handleImageUploads(req);

      // Create product with images
      const product = await ProductService.createProduct(productData, imageData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      // Clean up uploaded files if there was an error
      await cleanupUploadedFiles(req);
      next(error);
    }
  },

  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const productData = req.body;

      // Prepare new image data if files uploaded
      const imageData = await handleImageUploads(req);

      // Update product with new images
      const product = await ProductService.updateProduct(id, productData, imageData);

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      // Clean up uploaded files if there was an error
      await cleanupUploadedFiles(req);
      next(error);
    }
  },

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;

      // Delete product (images will be auto-deleted due to CASCADE)
      const result = await ProductService.deleteProduct(id);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = productController;