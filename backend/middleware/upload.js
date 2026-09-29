const multer = require('multer');
const CloudinaryStorage = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'video/mp4',
  'video/quicktime',
];

const MAX_FILE_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB || 15);

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'nagarsetu-ai/complaints',
    resource_type: file.mimetype.startsWith('video') ? 'video' : 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov'],
    transformation: file.mimetype.startsWith('image')
      ? [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto' }]
      : undefined,
  }),
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 5,
  },
});

module.exports = upload;
