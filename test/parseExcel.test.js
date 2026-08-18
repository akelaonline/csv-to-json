const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const XLSX = require('xlsx');
const parseExcel = require('../utils/parseExcel');

async function buildWorkbook(directory, extension, bookType) {
  const workbook = XLSX.utils.book_new();
  const first = XLSX.utils.aoa_to_sheet([
    ['name', 'role'],
    ['Ada Lovelace', 'Mathematician'],
    ['Alan Turing', 'Computer scientist']
  ]);
  const second = XLSX.utils.aoa_to_sheet([
    ['city', 'country'],
    ['Buenos Aires', 'Argentina']
  ]);
  XLSX.utils.book_append_sheet(workbook, first, 'People');
  XLSX.utils.book_append_sheet(workbook, second, 'Places');

  const filePath = path.join(directory, `sample${extension}`);
  XLSX.writeFile(workbook, filePath, { bookType });
  return filePath;
}

test('parses every sheet in XLSX', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-data-prep-xlsx-'));
  const filePath = await buildWorkbook(directory, '.xlsx', 'xlsx');
  const result = await parseExcel(filePath, { extension: '.xlsx' });

  assert.equal(result.length, 3);
  assert.equal(result[0].metadata.sheetName, 'People');
  assert.equal(result[2].metadata.sheetName, 'Places');
  assert.equal(result[0].metadata.sourceType, 'xlsx');
  assert.match(result[0].text, /Ada Lovelace/);

  await fs.rm(directory, { recursive: true, force: true });
});

test('keeps legacy XLS support using current SheetJS CE', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-data-prep-xls-'));
  const filePath = await buildWorkbook(directory, '.xls', 'biff8');
  const result = await parseExcel(filePath, { extension: '.xls' });

  assert.equal(result.length, 3);
  assert.equal(result[0].metadata.sourceType, 'xls');
  assert.match(result[2].text, /Argentina/);

  await fs.rm(directory, { recursive: true, force: true });
});
