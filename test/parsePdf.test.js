const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const parsePdf = require('../utils/parsePdf');

function buildMinimalPdf(text) {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  ];

  const escapedText = text.replace(/([\\()])/g, '\\$1');
  const stream = `BT\n/F1 18 Tf\n72 720 Td\n(${escapedText}) Tj\nET\n`;
  objects.push(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`);

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets[index + 1] = Buffer.byteLength(pdf);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'ascii');
}

test('extracts text from a valid PDF and returns PDF metadata', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-data-prep-pdf-'));
  const filePath = path.join(directory, 'sample.pdf');
  await fs.writeFile(filePath, buildMinimalPdf('Hello from a valid PDF'));

  t.after(async () => {
    await fs.rm(directory, { recursive: true, force: true });
  });

  const result = await parsePdf(filePath, { chunkSize: 1200, overlap: 120 });

  assert.equal(Array.isArray(result), true);
  assert.equal(result.length, 1);
  assert.match(result[0].text, /Hello from a valid PDF/);
  assert.equal(result[0].metadata.sourceType, 'pdf');
  assert.equal(result[0].metadata.pageCount, 1);
  assert.equal(result[0].metadata.totalChunks, 1);
});
