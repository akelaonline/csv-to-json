const fs = require('node:fs/promises');
const { PDFParse } = require('pdf-parse');
const chunkText = require('./chunkText');

module.exports = async function parsePdf(filePath, options = {}) {
  const buffer = await fs.readFile(filePath);
  const parser = new PDFParse({ data: buffer });

  try {
    // pdf-parse may transfer ownership of typed-array data to its worker.
    // Load/extract sequentially on the same parser instance instead of
    // starting concurrent operations that can race over transferable data.
    const textResult = await parser.getText();
    const infoResult = await parser.getInfo();

    const text = String(textResult.text || '').trim();
    const chunks = chunkText(text, {
      chunkSize: options.chunkSize || 1200,
      overlap: options.overlap ?? 120
    });

    return chunks.map((chunk, index) => ({
      text: chunk,
      metadata: {
        sourceType: 'pdf',
        pageCount: infoResult.total || null,
        chunkIndex: index,
        totalChunks: chunks.length,
        author: infoResult.infoData?.Author || null,
        title: infoResult.infoData?.Title || null,
        characterCount: chunk.length
      }
    }));
  } catch (error) {
    throw Object.assign(new Error(`Error parsing PDF file: ${error.message}`), {
      status: 422,
      code: 'PDF_PARSE_ERROR'
    });
  } finally {
    await parser.destroy().catch(() => {});
  }
};
