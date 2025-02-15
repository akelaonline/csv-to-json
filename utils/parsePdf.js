const fs = require('fs');
const pdf = require('pdf-parse');

module.exports = async function parsePdf(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    
    // Split the content into chunks of approximately 1000 characters
    // trying to break at natural boundaries (paragraphs or sentences)
    const text = data.text.replace(/\n+/g, ' ').trim();
    const chunks = [];
    let currentChunk = '';
    const paragraphs = text.split(/(?<=\.)\s+/);
    
    for (const paragraph of paragraphs) {
      if ((currentChunk + paragraph).length > 1000) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + paragraph;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks.map((chunk, index) => ({
      text: chunk,
      metadata: {
        sourceType: 'pdf',
        pageCount: data.numpages,
        chunkIndex: index,
        totalChunks: chunks.length,
        author: data.info?.Author || 'Unknown',
        title: data.info?.Title || 'Untitled',
        characterCount: chunk.length
      }
    }));
  } catch (error) {
    throw new Error(`Error parsing PDF file: ${error.message}`);
  }
};
