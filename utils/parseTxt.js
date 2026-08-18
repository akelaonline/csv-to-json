const fs = require('node:fs/promises');
const chunkText = require('./chunkText');

module.exports = async function parseTxt(filePath, options = {}) {
  const data = await fs.readFile(filePath, 'utf8');
  const chunks = chunkText(data, {
    chunkSize: options.chunkSize || 1200,
    overlap: options.overlap ?? 120
  });

  return chunks.map((chunk, index) => ({
    text: chunk,
    metadata: {
      sourceType: 'txt',
      chunkIndex: index,
      totalChunks: chunks.length,
      characterCount: chunk.length
    }
  }));
};
