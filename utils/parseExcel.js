const XLSX = require('xlsx');

module.exports = function parseExcel(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (data.length < 2) {
        throw new Error('Excel file is empty or has no data rows');
      }

      const headers = data[0];
      const rows = data.slice(1);

      const result = rows.map(row => {
        const textParts = [];
        row.forEach((cell, i) => {
          if (cell !== undefined && cell !== null) {
            textParts.push(`${headers[i] || `Column${i+1}`}: ${cell}`);
          }
        });

        return {
          text: textParts.join(', '),
          metadata: {
            sourceType: 'excel',
            sheetName: sheetName,
            rowCount: rows.length,
            columnCount: headers.length
          }
        };
      });

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};
