const cloudinary = require('cloudinary').v2;

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload a file buffer directly to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      folder: 'locallie/issues',
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 900, crop: 'limit', quality: 'auto:good' }
      ],
      ...options
    };

    const uploadStream = cloudinary.uploader.upload_stream(defaultOptions, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    uploadStream.end(buffer);
  });
};

/**
 * Upload a base64 data URL to Cloudinary (fallback for legacy requests)
 * @param {string} dataUrl - base64 data URL string
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadBase64 = (dataUrl, options = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      dataUrl,
      {
        folder: 'locallie/issues',
        resource_type: 'auto',
        transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto:good' }],
        ...options
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
};

/**
 * Delete an asset from Cloudinary by public_id
 */
const deleteAsset = (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

module.exports = { cloudinary, uploadBuffer, uploadBase64, deleteAsset };
