const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {
  validateFileContent,
  isZipSignature,
  isCompoundFileSignature,
  looksLikeText
} = require('../utils/validateFile');

test('recognizes ZIP signatures used by XLSX', () => {
  assert.equal(isZipSignature(Buffer.from([0x50, 0x4b, 0x03, 0x04])), true);
  assert.equal(isZipSignature(Buffer.from([0x25, 0x50, 0x44, 0x46])), false);
});

test('recognizes Compound File signatures used by XLS', () => {
  assert.equal(isCompoundFileSignature(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])), true);
  assert.equal(isCompoundFileSignature(Buffer.from([0x50, 0x4b, 0x03, 0x04])), false);
});

test('rejects binary bytes as text', () => {
  assert.equal(looksLikeText(Buffer.from('hello,world\n')), true);
  assert.equal(looksLikeText(Buffer.from([0x68, 0x00, 0x69])), false);
});

test('validates PDF magic bytes', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-data-prep-'));
  const validPath = path.join(directory, 'valid.pdf');
  const invalidPath = path.join(directory, 'invalid.pdf');

  await fs.writeFile(validPath, '%PDF-1.7\nplaceholder');
  await fs.writeFile(invalidPath, 'not a pdf');

  await assert.doesNotReject(() => validateFileContent(validPath, '.pdf'));
  await assert.rejects(() => validateFileContent(invalidPath, '.pdf'), /not a valid PDF header/);

  await fs.rm(directory, { recursive: true, force: true });
});
