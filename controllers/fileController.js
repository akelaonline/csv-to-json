const path = require('path');
const fs = require('fs').promises;
const parseExcel = require('../utils/parseExcel');
const parseCsv = require('../utils/parseCsv');
const parseTxt = require('../utils/parseTxt');
const parsePdf = require('../utils/parsePdf');

exports.handleFileUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    
    let jsonResult;

    // Process file based on extension
    switch (ext) {
      case '.xlsx':
      case '.xls':
        jsonResult = await parseExcel(filePath);
        break;
      case '.csv':
        jsonResult = await parseCsv(filePath);
        break;
      case '.txt':
        jsonResult = await parseTxt(filePath);
        break;
      case '.pdf':
        jsonResult = await parsePdf(filePath);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported file format' });
    }

    // Transform to final format with IDs
    const finalResult = jsonResult.map((item, index) => ({
      id: `doc_${index}`,
      text: item.text,
      metadata: {
        ...item.metadata,
        filename: req.file.originalname,
        uploadDate: new Date().toISOString()
      }
    }));

    // Clean up: delete the temporary file
    await fs.unlink(filePath);

    return res.json(finalResult);

  } catch (error) {
    console.error('Error processing file:', error);
    return res.status(500).json({ 
      error: 'Error processing file',
      details: error.message 
    });
  }
};
