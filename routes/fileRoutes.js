const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const express = require('express');
const multer = require('multer');
const fileController = require('../controllers/fileController');

const router = express.Router();
const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads'));

fs.mkdirSync(uploadDir, { recursive: true, mode: 0o700 });

const mimeTypesByExtension = {
  '.xlsx': new Set([
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/octet-stream'
  ]),
  '.xls': new Set([
    'application/vnd.ms-excel',
    'application/octet-stream'
  ]),
  '.csv': new Set([
    'text/csv',
    'application/csv',
    'text/plain',
    'application/vnd.ms-excel'
  ]),
  '.txt': new Set(['text/plain', 'application/octet-stream']),
  '.pdf': new Set(['application/pdf', 'application/octet-stream'])
};

function uploadError(message, code = 'INVALID_UPLOAD') {
  return Object.assign(new Error(message), { status: 400, code });
}

const storage = multer.diskStorage({
  destination(req, file, callback) { // eslint-disable-line no-unused-vars
    callback(null, uploadDir);
  },
  filename(req, file, callback) { // eslint-disable-line no-unused-vars
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomUUID()}${extension}`);
  }
});

function fileFilter(req, file, callback) { // eslint-disable-line no-unused-vars
  const extension = path.extname(file.originalname).toLowerCase();
  const allowedMimes = mimeTypesByExtension[extension];

  if (!allowedMimes) {
    return callback(uploadError('Unsupported file format. Use XLSX, XLS, CSV, TXT or PDF.'));
  }

  if (!allowedMimes.has(file.mimetype)) {
    return callback(uploadError(`Unexpected MIME type for ${extension}: ${file.mimetype}`));
  }

  return callback(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE_BYTES || 10 * 1024 * 1024),
    files: 1,
    fields: 10,
    parts: 12
  }
});

router.post('/upload', upload.single('file'), fileController.handleFileUpload);

module.exports = router;
