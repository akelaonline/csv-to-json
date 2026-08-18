const fs = require('node:fs/promises');

function validationError(message, code = 'INVALID_FILE_CONTENT') {
  return Object.assign(new Error(message), { status: 400, code });
}

function isZipSignature(buffer) {
  if (buffer.length < 4) return false;
  return (
    buffer[0] === 0x50 && buffer[1] === 0x4b &&
    ((buffer[2] === 0x03 && buffer[3] === 0x04) ||
      (buffer[2] === 0x05 && buffer[3] === 0x06) ||
      (buffer[2] === 0x07 && buffer[3] === 0x08))
  );
}

function isCompoundFileSignature(buffer) {
  const signature = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
  return buffer.length >= signature.length && signature.every((byte, index) => buffer[index] === byte);
}

function looksLikeText(buffer) {
  if (buffer.length === 0) return true;
  let suspicious = 0;

  for (const byte of buffer) {
    if (byte === 0x00) return false;
    const isControl = byte < 0x09 || (byte > 0x0d && byte < 0x20);
    if (isControl) suspicious += 1;
  }

  return suspicious / buffer.length < 0.02;
}

async function readSample(filePath, maxBytes = 8192) {
  const handle = await fs.open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(maxBytes);
    const { bytesRead } = await handle.read(buffer, 0, maxBytes, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
}

async function validateFileContent(filePath, extension) {
  const sample = await readSample(filePath);

  if (sample.length === 0) {
    throw validationError('Uploaded file is empty', 'EMPTY_FILE');
  }

  switch (extension) {
    case '.pdf':
      if (sample.subarray(0, 5).toString('ascii') !== '%PDF-') {
        throw validationError('File extension is PDF but the content is not a valid PDF header');
      }
      break;
    case '.xlsx':
      if (!isZipSignature(sample)) {
        throw validationError('File extension is XLSX but the content is not an XLSX/ZIP container');
      }
      break;
    case '.xls':
      if (!isCompoundFileSignature(sample)) {
        throw validationError('File extension is XLS but the content is not an OLE/Compound File workbook');
      }
      break;
    case '.csv':
    case '.txt':
      if (!looksLikeText(sample)) {
        throw validationError('Text file contains binary data');
      }
      break;
    default:
      throw validationError('Unsupported file format', 'UNSUPPORTED_FORMAT');
  }

  return true;
}

module.exports = {
  validateFileContent,
  isZipSignature,
  isCompoundFileSignature,
  looksLikeText
};
