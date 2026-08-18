const fs = require('node:fs');
const csv = require('csv-parser');

const MAX_ROWS = Number(process.env.MAX_CSV_ROWS || 50000);
const MAX_ROW_BYTES = Number(process.env.MAX_CSV_ROW_BYTES || 1024 * 1024);

function rowToText(row) {
  return Object.entries(row)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
    .map(([key, value]) => `${key}: ${String(value).trim()}`)
    .join(', ');
}

module.exports = function parseCsv(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    let rowCount = 0;
    let columnCount = 0;
    let settled = false;
    const stream = fs.createReadStream(filePath);

    function fail(error) {
      if (settled) return;
      settled = true;
      stream.destroy();
      reject(error);
    }

    stream
      .pipe(csv({
        maxRowBytes: MAX_ROW_BYTES,
        mapHeaders: ({ header }) => String(header || '').replace(/^\uFEFF/, '').trim()
      }))
      .on('headers', (headers) => {
        columnCount = headers.length;
      })
      .on('data', (row) => {
        rowCount += 1;
        if (rowCount > MAX_ROWS) {
          fail(Object.assign(new Error(`CSV exceeds the ${MAX_ROWS} row limit`), {
            status: 413,
            code: 'CSV_ROW_LIMIT'
          }));
          return;
        }

        const text = rowToText(row);
        if (text) {
          results.push({
            text,
            metadata: {
              sourceType: 'csv',
              rowNumber: rowCount
            }
          });
        }
      })
      .on('end', () => {
        if (settled) return;
        settled = true;
        results.forEach((result) => {
          result.metadata.totalRows = rowCount;
          result.metadata.columnCount = columnCount;
        });
        resolve(results);
      })
      .on('error', fail);
  });
};
