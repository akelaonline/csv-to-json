# 🚀 File to OpenAI-Compatible JSON Converter

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2014.0.0-brightgreen.svg)](https://nodejs.org/)
[![Express Version](https://img.shields.io/badge/express-%5E4.18.2-blue.svg)](https://expressjs.com/)

A powerful and user-friendly web application that converts various file formats (Excel, CSV, PDF, TXT) into JSON format compatible with OpenAI's knowledge base structure. Perfect for preparing training data or creating custom knowledge bases for AI applications.

![Application Screenshot](https://via.placeholder.com/800x400.png?text=File+to+JSON+Converter)

## ✨ Features

- 📊 **Multiple Format Support**
  - Excel (.xlsx, .xls)
  - CSV files
  - PDF documents
  - Text files (.txt)

- 🎯 **Smart Conversion**
  - Intelligent text chunking for large documents
  - Maintains document structure
  - Preserves metadata
  - Generates unique document IDs

- 💅 **Modern UI/UX**
  - Clean, responsive design
  - Real-time file information
  - Progress feedback
  - Error handling with clear messages

- 🛠 **Developer Friendly**
  - Well-structured codebase
  - Modular architecture
  - Easy to extend
  - Comprehensive documentation

## 🚦 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 14.0.0 or higher)
- npm (usually comes with Node.js)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/akelaonline/csv-to-json.git
   cd csv-to-json
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   Open your browser and navigate to:
   ```
   http://localhost:3001
   ```

## 💡 Usage

### Web Interface

1. Click the "Choose File" button to select your file
2. Select any supported file (Excel, CSV, PDF, or TXT)
3. Click "Convert to JSON" to process the file
4. View the converted JSON in the result area
5. Use the "Download JSON" button to save the result

### API Endpoints

#### POST /api/files/upload
Upload and convert a file to JSON format.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: 
  - file: Your file (Excel, CSV, PDF, or TXT)

**Response:**
```json
[
  {
    "id": "doc_0",
    "text": "Extracted content from the file",
    "metadata": {
      "sourceType": "excel|csv|pdf|txt",
      "filename": "original_filename.ext",
      "uploadDate": "2025-02-15T19:17:53.000Z",
      // Additional metadata specific to file type
    }
  }
]
```

## 📋 Output Format

The converter generates JSON in the following structure:

```json
[
  {
    "id": "doc_0",
    "text": "Content chunk 1",
    "metadata": {
      "sourceType": "excel",
      "filename": "example.xlsx",
      "uploadDate": "2025-02-15T19:17:53.000Z",
      "sheetName": "Sheet1",
      "rowCount": 100,
      "columnCount": 5
    }
  },
  {
    "id": "doc_1",
    "text": "Content chunk 2",
    "metadata": {
      // Metadata varies by file type
    }
  }
]
```

### Metadata by File Type

#### Excel (.xlsx, .xls)
- sourceType: "excel"
- sheetName: Name of the worksheet
- rowCount: Number of rows
- columnCount: Number of columns

#### CSV
- sourceType: "csv"
- rowCount: Number of rows
- columnCount: Number of columns
- rowNumber: Position in original file

#### PDF
- sourceType: "pdf"
- pageCount: Total pages
- author: Document author (if available)
- title: Document title (if available)
- chunkIndex: Position in chunked content
- totalChunks: Total number of chunks

#### TXT
- sourceType: "txt"
- chunkIndex: Position in chunked content
- totalChunks: Total number of chunks
- characterCount: Length of chunk

## 🔍 Technical Details

### Architecture

```
├── index.js           # Application entry point
├── routes/           
│   └── fileRoutes.js  # Route definitions
├── controllers/      
│   └── fileController.js  # Request handling logic
├── utils/            
│   ├── parseExcel.js  # Excel file parser
│   ├── parseCsv.js    # CSV file parser
│   ├── parsePdf.js    # PDF file parser
│   └── parseTxt.js    # Text file parser
└── public/           
    └── index.html     # Web interface
```

### Key Dependencies

- **express**: Web application framework
- **multer**: File upload handling
- **xlsx**: Excel file parsing
- **csv-parser**: CSV file parsing
- **pdf-parse**: PDF file parsing

## 🛡️ Security Considerations

- File size limit: 5MB
- Supported file types only
- Temporary file cleanup
- Error handling for malformed files
- No system file access outside upload directory

## 🔄 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

Need help? Have questions? Here's how to get support:

- Create an [Issue](https://github.com/akelaonline/csv-to-json/issues)
- Email: [your-email@example.com]
- Documentation: [Wiki](https://github.com/akelaonline/csv-to-json/wiki)

## 🌟 Acknowledgments

- Thanks to all contributors
- Inspired by OpenAI's knowledge base format
- Built with modern web technologies

## 📈 Roadmap

- [ ] Add support for more file formats
- [ ] Implement batch processing
- [ ] Add custom chunking options
- [ ] Create API authentication
- [ ] Add file compression support
- [ ] Implement real-time conversion progress
- [ ] Add custom metadata fields

---

Made with ❤️ by [Your Name/Team]
