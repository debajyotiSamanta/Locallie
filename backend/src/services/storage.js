/**
 * Local storage helpers — converts files/images to base64 data URLs
 * and stores them directly in MongoDB. No external storage service required.
 */

/**
 * Convert a Buffer and mimetype into a data URL.
 * Returns an object with secure_url, format, and bytes for API compatibility.
 */
const toDataUrlResult = (buffer, mimeType) => {
  const base64 = buffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64}`;
  return {
    secure_url: dataUrl,
    public_id: null,
    width: null,
    height: null,
    format: mimeType.split('/')[1] || null,
    bytes: buffer.length
  };
};

/**
 * Convert a file Buffer into a base64 data URL for MongoDB storage.
 * @param {Buffer} buffer - Raw file buffer
 * @param {object} options - { mimetype: 'image/jpeg' }
 */
const uploadBuffer = async (buffer, options = {}) => {
  const mimeType = options.mimetype || 'application/octet-stream';
  return toDataUrlResult(buffer, mimeType);
};

/**
 * Accept a base64 data URL (or raw base64 string) and normalise it
 * into the standard result shape for MongoDB storage.
 * @param {string} dataUrl - Full data URL (data:image/...;base64,...) or raw base64
 */
const uploadBase64 = async (dataUrl, _options = {}) => {
  if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
    const bytes = Math.ceil((dataUrl.length - dataUrl.indexOf(',') - 1) * 3 / 4);
    const mimeMatch = dataUrl.match(/^data:([a-zA-Z0-9\-/]+);base64,/);
    const format = mimeMatch ? mimeMatch[1].split('/')[1] : null;
    return { secure_url: dataUrl, public_id: null, width: null, height: null, format, bytes };
  }

  if (typeof dataUrl === 'string') {
    // Raw base64 without data: prefix
    const constructed = `data:application/octet-stream;base64,${dataUrl}`;
    const bytes = Math.ceil(dataUrl.length * 3 / 4);
    return { secure_url: constructed, public_id: null, width: null, height: null, format: null, bytes };
  }

  throw new Error('Invalid data provided to uploadBase64 — expected a data URL or base64 string.');
};

/**
 * No-op: kept for API compatibility. MongoDB data URLs are removed by
 * simply unsetting the field, so no separate delete step is needed.
 */
const deleteAsset = async (_publicId) => {
  return { result: 'ok' };
};

module.exports = { uploadBuffer, uploadBase64, deleteAsset };
