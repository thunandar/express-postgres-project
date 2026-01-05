const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
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
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

// Generate public URLs for multiple images
const getImageUrls = (req, filenames) => {
  if (!filenames || !Array.isArray(filenames)) return [];
  return filenames.map(filename => getImageUrl(req, filename));
};

// Utility to delete image file
const deleteImageFile = (filename) => {
  if (!filename) return false;

  try {
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
  return false;
};

// Utility to delete multiple image files
const deleteImageFiles = (filenames) => {
  if (!filenames || !Array.isArray(filenames)) return false;

  let deletedCount = 0;
  filenames.forEach(filename => {
    if (deleteImageFile(filename)) {
      deletedCount++;
    }
  });

  return deletedCount;
};

module.exports = {
  uploadProductImage,      // Single image upload
  uploadProductImages,     // Multiple images upload (NEW)
  getImageUrl,             // Single image URL
  getImageUrls,            // Multiple image URLs (NEW)
  deleteImageFile,         // Delete single image
  deleteImageFiles         // Delete multiple images (NEW)
};
