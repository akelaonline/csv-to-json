const fs = require('fs');
const csv = require('csv-parser');

module.exports = function parseCsv(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    let rowCount = 0;
    let columnCount = 0;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        rowCount++;
        // Get column count from first row
        if (rowCount === 1) {
          columnCount = Object.keys(data).length;
        }

        const text = Object.entries(data)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');

        results.push({
          text,
          metadata: {
            sourceType: 'csv',
            rowNumber: rowCount
          }
        });
      })
      .on('end', () => {
        // Add final metadata to each result
        results.forEach(result => {
          result.metadata.totalRows = rowCount;
          result.metadata.columnCount = columnCount;
        });
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};
