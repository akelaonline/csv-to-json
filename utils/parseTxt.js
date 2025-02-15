const fs = require('fs').promises;

module.exports = async function parseTxt(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    
    // Split the content into chunks of approximately 1000 characters
    // trying to break at natural boundaries (periods)
    const chunks = [];
    let currentChunk = '';
    const sentences = data.split(/(?<=\.)\s+/);
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > 1000) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks.map((chunk, index) => ({
      text: chunk,
      metadata: {
        sourceType: 'txt',
        chunkIndex: index,
        totalChunks: chunks.length,
        characterCount: chunk.length
      }
    }));
  } catch (error) {
    throw new Error(`Error parsing TXT file: ${error.message}`);
  }
};
