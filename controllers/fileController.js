const path = require('node:path');
const fs = require('node:fs/promises');
const parseExcel = require('../utils/parseExcel');
const parseCsv = require('../utils/parseCsv');
const parseTxt = require('../utils/parseTxt');
const parsePdf = require('../utils/parsePdf');
const { validateFileContent } = require('../utils/validateFile');

const parsers = {
  '.xlsx': parseExcel,
  '.xls': parseExcel,
  '.csv': parseCsv,
  '.txt': parseTxt,
  '.pdf': parsePdf
};

function httpError(status, message, code) {
  return Object.assign(new Error(message), { status, code });
}

function parseInteger(value, fallback, min, max, name) {
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw httpError(400, `${name} must be between ${min} and ${max}`, 'INVALID_OPTION');
  }
  return parsed;
}

function sanitizeFilename(filename) {
  return path.basename(filename)
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .slice(0, 200) || 'uploaded-file';
}

async function safeDelete(filePath) {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Failed to delete temporary upload ${filePath}:`, error.message);
    }
  }
}

exports.handleFileUpload = async (req, res, next) => {
  const filePath = req.file?.path;

  try {
    if (!req.file) {
      throw httpError(400, 'No file uploaded', 'NO_FILE');
    }

    const extension = path.extname(req.file.originalname).toLowerCase();
    const parser = parsers[extension];

    if (!parser) {
      throw httpError(400, 'Unsupported file format', 'UNSUPPORTED_FORMAT');
    }

    await validateFileContent(filePath, extension);

    const chunkSize = parseInteger(req.query.chunkSize, 1200, 400, 8000, 'chunkSize');
    const overlap = parseInteger(req.query.overlap, 120, 0, Math.min(1500, chunkSize - 1), 'overlap');
    const format = String(req.query.format || 'json').toLowerCase();

    if (!['json', 'jsonl'].includes(format)) {
      throw httpError(400, 'format must be json or jsonl', 'INVALID_FORMAT');
    }

    const parsedItems = await parser(filePath, { chunkSize, overlap, extension });

    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      throw httpError(422, 'The file did not contain extractable data', 'EMPTY_RESULT');
    }

    const uploadedAt = new Date().toISOString();
    const filename = sanitizeFilename(req.file.originalname);

    const finalResult = parsedItems.map((item, index) => ({
      id: `doc_${String(index + 1).padStart(6, '0')}`,
      text: String(item.text || ''),
      metadata: {
        ...item.metadata,
        filename,
        uploadDate: uploadedAt,
        sizeBytes: req.file.size
      }
    }));

    res.set('X-Document-Count', String(finalResult.length));

    if (format === 'jsonl') {
      res.type('application/x-ndjson');
      return res.send(`${finalResult.map((item) => JSON.stringify(item)).join('\n')}\n`);
    }

    return res.json(finalResult);
  } catch (error) {
    return next(error);
  } finally {
    await safeDelete(filePath);
  }
};
