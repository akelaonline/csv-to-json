const XLSX = require('xlsx');

const MAX_ROWS = Number(process.env.MAX_XLSX_ROWS || 50000);
const MAX_SHEETS = Number(process.env.MAX_XLSX_SHEETS || 25);

function normalizeCellValue(value) {
  if (value === undefined || value === null) return '';
  if (value instanceof Date) return value.toISOString();
  return String(value).trim();
}

module.exports = async function parseExcel(filePath, options = {}) {
  let workbook;

  try {
    workbook = XLSX.readFile(filePath, {
      cellDates: true,
      dense: true,
      sheetRows: MAX_ROWS + 2
    });
  } catch (error) {
    throw Object.assign(new Error(`Error parsing spreadsheet: ${error.message}`), {
      status: 422,
      code: 'SPREADSHEET_PARSE_ERROR'
    });
  }

  if (!Array.isArray(workbook.SheetNames) || workbook.SheetNames.length === 0) {
    return [];
  }

  if (workbook.SheetNames.length > MAX_SHEETS) {
    throw Object.assign(new Error(`Workbook exceeds the ${MAX_SHEETS} sheet limit`), {
      status: 413,
      code: 'XLSX_SHEET_LIMIT'
    });
  }

  const results = [];
  let processedRows = 0;

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
      defval: '',
      blankrows: false
    });

    if (rows.length < 2) continue;

    const headers = rows[0].map((header, index) => normalizeCellValue(header) || `Column${index + 1}`);
    const sheetResults = [];

    for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
      processedRows += 1;
      if (processedRows > MAX_ROWS) {
        throw Object.assign(new Error(`Workbook exceeds the ${MAX_ROWS} data-row limit`), {
          status: 413,
          code: 'XLSX_ROW_LIMIT'
        });
      }

      const row = rows[rowIndex];
      const parts = [];

      for (let column = 0; column < headers.length; column += 1) {
        const value = normalizeCellValue(row[column]);
        if (value) parts.push(`${headers[column]}: ${value}`);
      }

      if (parts.length === 0) continue;

      sheetResults.push({
        text: parts.join(', '),
        metadata: {
          sourceType: options.extension === '.xls' ? 'xls' : 'xlsx',
          sheetName,
          rowNumber: rowIndex + 1,
          columnCount: headers.length
        }
      });
    }

    const totalRows = sheetResults.length;
    sheetResults.forEach((item) => {
      item.metadata.totalRowsInSheet = totalRows;
    });
    results.push(...sheetResults);
  }

  return results;
};
