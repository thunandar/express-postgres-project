const multer = require('multer');
const path = require('path');
const fs = require('fs');
const s3Service = require('../services/s3Service');

const isProduction = process.env.NODE_ENV === 'production';

// Create uploads directory if it doesn't exist (for local development)
const uploadDir = path.join(__dirname, '../uploads');
if (!isProduction && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage based on environment
let storage;

if (isProduction) {
  // In production, use memory storage (files will be uploaded to S3)
  storage = multer.memoryStorage();
} else {
  // In development, use disk storage (local files)
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
      cb(null, `product-${uniqueSuffix}-${safeName}${ext}`);
    }
  });
}

// File filter for security
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'), false);
  }
};

// Configure multer with security limits
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5 // Allow up to 5 images per product
  },
  fileFilter: fileFilter
});

// Middleware to handle single file upload (backward compatible)
const uploadProductImage = upload.single('image');

// Middleware to handle multiple file uploads (up to 5 images)
const uploadProductImages = upload.array('images', 5);

// Generate public URL for the image
const getImageUrl = (req, filename) => {
  if (!filename) return null;

  if (isProduction) {
    // In production, filename is actually the full S3 URL
    return filename;
  }

  // In development, generate local URL
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

// Generate public URLs for multiple images
const getImageUrls = (req, filenames) => {
  if (!filenames || !Array.isArray(filenames)) return [];
  return filenames.map(filename => getImageUrl(req, filename));
};

// Utility to delete image file
const deleteImageFile = async (filename) => {
  if (!filename) return false;

  try {
    if (isProduction) {
      // In production, delete from S3
      const key = s3Service.getKeyFromUrl(filename);
      return await s3Service.deleteFromS3(key);
    } else {
      // In development, delete local file
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
  return false;
};

// Utility to delete multiple image files
const deleteImageFiles = async (filenames) => {
  if (!filenames || !Array.isArray(filenames)) return false;

  if (isProduction) {
    // In production, bulk delete from S3
    const keys = filenames.map(url => s3Service.getKeyFromUrl(url)).filter(Boolean);
    return await s3Service.deleteMultipleFromS3(keys);
  } else {
    // In development, delete local files
    let deletedCount = 0;
    for (const filename of filenames) {
      if (await deleteImageFile(filename)) {
        deletedCount++;
      }
    }
    return deletedCount;
  }
};

// Process uploaded files (upload to S3 in production)
const processUploadedFiles = async (files) => {
  if (!files || files.length === 0) return [];

  if (isProduction) {
    // Upload files to S3
    const uploadResults = await s3Service.uploadMultipleToS3(files);
    return uploadResults.map((result, index) => ({
      filename: result.url,  // Store S3 URL as filename
      s3Key: result.key,     // Store S3 key for deletion
      url: result.url
    }));
  } else {
    // Files are already saved locally by multer
    return files.map(file => ({
      filename: file.filename,
      url: file.filename  // Will be converted to full URL by getImageUrl
    }));
  }
};

module.exports = {
  uploadProductImage,      // Single image upload
  uploadProductImages,     // Multiple images upload (NEW)
  getImageUrl,             // Single image URL
  getImageUrls,            // Multiple image URLs (NEW)
  deleteImageFile,         // Delete single image
  deleteImageFiles,        // Delete multiple images (NEW)
  processUploadedFiles,    // Process uploads (S3 or local)
  isProduction             // Export for testing
};
