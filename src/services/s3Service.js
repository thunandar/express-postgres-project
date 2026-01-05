const { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const path = require('path');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

/**
 * Upload a single file to S3
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} originalName - Original filename
 * @param {string} mimeType - File mime type
 * @returns {Promise<{key: string, url: string}>}
 */
const uploadToS3 = async (fileBuffer, originalName, mimeType) => {
  // Generate unique filename
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const ext = path.extname(originalName);
  const safeName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '-');
  const key = `products/product-${uniqueSuffix}-${safeName}${ext}`;

  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
    // Make objects publicly readable
    ACL: 'public-read'
  };

  try {
    const upload = new Upload({
      client: s3Client,
      params: uploadParams
    });

    await upload.done();

    // Return the S3 URL
    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

    return { key, url };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

/**
 * Upload multiple files to S3
 * @param {Array} files - Array of files from multer
 * @returns {Promise<Array<{key: string, url: string}>>}
 */
const uploadMultipleToS3 = async (files) => {
  const uploadPromises = files.map(file =>
    uploadToS3(file.buffer, file.originalname, file.mimetype)
  );

  return Promise.all(uploadPromises);
};

/**
 * Delete a single file from S3
 * @param {string} key - S3 object key
 * @returns {Promise<boolean>}
 */
const deleteFromS3 = async (key) => {
  if (!key) return false;

  try {
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: key
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
    return true;
  } catch (error) {
    console.error('S3 Delete Error:', error);
    return false;
  }
};

/**
 * Delete multiple files from S3
 * @param {Array<string>} keys - Array of S3 object keys
 * @returns {Promise<number>} - Number of successfully deleted files
 */
const deleteMultipleFromS3 = async (keys) => {
  if (!keys || keys.length === 0) return 0;

  try {
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: keys.map(key => ({ Key: key })),
        Quiet: false
      }
    };

    const result = await s3Client.send(new DeleteObjectsCommand(deleteParams));
    return result.Deleted ? result.Deleted.length : 0;
  } catch (error) {
    console.error('S3 Bulk Delete Error:', error);
    return 0;
  }
};

/**
 * Extract S3 key from URL
 * @param {string} url - S3 URL
 * @returns {string|null} - S3 key or null
 */
const getKeyFromUrl = (url) => {
  if (!url) return null;

  try {
    // Extract key from S3 URL
    // Format: https://bucket-name.s3.region.amazonaws.com/key
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // Remove leading slash
  } catch (error) {
    console.error('Invalid S3 URL:', url);
    return null;
  }
};

module.exports = {
  uploadToS3,
  uploadMultipleToS3,
  deleteFromS3,
  deleteMultipleFromS3,
  getKeyFromUrl,
  s3Client
};
