# AI Data Prep Converter

[![CI](https://github.com/akelaonline/csv-to-json/actions/workflows/ci.yml/badge.svg)](https://github.com/akelaonline/csv-to-json/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.3-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A compact web service for converting **XLSX, XLS, CSV, PDF and TXT** files into clean **JSON or JSONL** records for RAG pipelines, AI agents, vector databases, automation and general LLM data preparation.

> v2 removes the old claim that the output is a special "OpenAI-compatible JSON" format. The default schema is intentionally generic and portable. For OpenAI File Search, use the current vector-store/file APIs; for fine-tuning, transform data into the JSONL message schema required by the target model.

## v2 highlights

- Replaced vulnerable npm-registry `xlsx@0.18.5` with SheetJS CE `0.20.3` from the authoritative SheetJS CDN.
- Preserved legacy `.xls` support and added multi-sheet processing.
- Upgraded Multer to 2.2.0 and modernized the server stack.
- Added extension/MIME checks plus file-content signature validation.
- Guaranteed temporary-file deletion on success and failure.
- Added Helmet headers, rate limiting, timeouts and opt-in CORS.
- Added configurable chunking with overlap for PDF/TXT.
- Added JSONL output, `/health`, tests, CI and a security policy.
- Rebuilt the frontend with drag-and-drop and no third-party frontend assets.

## Supported input

| Format | Extension | Processing |
|---|---|---|
| Modern Excel workbook | `.xlsx` | Every worksheet, first row as headers |
| Legacy Excel workbook | `.xls` | Every worksheet, first row as headers |
| CSV | `.csv` | Streaming parser, one record per row |
| PDF | `.pdf` | Text extraction + configurable chunking |
| Plain text | `.txt` | Configurable chunking |

## Output schema

JSON output is an array of portable records:

```json
[
  {
    "id": "doc_000001",
    "text": "name: Ada Lovelace, role: Mathematician",
    "metadata": {
      "sourceType": "csv",
      "rowNumber": 1,
      "totalRows": 10,
      "columnCount": 2,
      "filename": "people.csv",
      "uploadDate": "2026-08-18T17:00:00.000Z",
      "sizeBytes": 2048
    }
  }
]
```

JSONL returns the same objects, one JSON object per line.

## Quick start

Requirements: Node.js **22.3+**. Node 24 is recommended for new deployments.

```bash
git clone https://github.com/akelaonline/csv-to-json.git
cd csv-to-json
npm install
npm test
npm start
```

Open `http://localhost:3001`.

The upload directory is created automatically. You do not need to create it manually.

## API

### `POST /api/files/upload`

Send `multipart/form-data` with one field named `file`.

Optional query parameters:

| Parameter | Default | Range | Description |
|---|---:|---:|---|
| `format` | `json` | `json` / `jsonl` | Response format |
| `chunkSize` | `1200` | 400–8000 | Maximum characters per PDF/TXT chunk |
| `overlap` | `120` | 0–1500 and `< chunkSize` | Approximate overlap between adjacent chunks |

Example:

```bash
curl -F "file=@document.pdf" \
  "http://localhost:3001/api/files/upload?format=jsonl&chunkSize=1600&overlap=160"
```

### `GET /health`

Returns service status, version and uptime.

```json
{
  "status": "ok",
  "service": "ai-data-prep-converter",
  "version": "2.0.0",
  "uptimeSeconds": 42
}
```

## Security defaults

The service treats uploads as **untrusted input**. Current controls include:

- 10 MB default upload limit.
- One uploaded file per request.
- Extension and MIME allowlists.
- PDF, XLSX and XLS signature checks; binary-data rejection for TXT/CSV samples.
- Cryptographically random temporary filenames.
- Temporary-file deletion in a `finally` block.
- Maximum CSV/XLS/XLSX row counts and spreadsheet sheet count.
- Helmet security headers.
- API rate limiting: 30 requests per IP per 15 minutes by default.
- CORS disabled unless `CORS_ORIGIN` is explicitly configured.
- Server request/header/keep-alive timeouts.
- Generic production responses for internal server errors.

Document parsing still carries residual risk. Run the process as a non-root user, keep dependencies patched, and isolate the service when exposing it to arbitrary public uploads.

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

## Configuration

The app reads deployment environment variables directly; a dotenv package is not required. `.env.example` documents the supported settings.

```text
PORT=3001
MAX_FILE_SIZE_BYTES=10485760
RATE_LIMIT_MAX=30
CORS_ORIGIN=https://your-app.example
TRUST_PROXY=true
MAX_CSV_ROWS=50000
MAX_XLSX_ROWS=50000
MAX_XLSX_SHEETS=25
```

`CORS_ORIGIN` accepts a comma-separated allowlist. Leave it empty for same-origin browser use. Only set `TRUST_PROXY=true` when the service actually sits behind a trusted reverse proxy.

## Architecture

```text
.
├── index.js
├── controllers/
│   └── fileController.js
├── routes/
│   └── fileRoutes.js
├── utils/
│   ├── chunkText.js
│   ├── parseCsv.js
│   ├── parseExcel.js
│   ├── parsePdf.js
│   ├── parseTxt.js
│   └── validateFile.js
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── test/
├── scripts/
└── .github/workflows/ci.yml
```

## Development and validation

```bash
npm install
npm run check
npm test
npm audit --omit=dev --audit-level=high
```

`npm run dev` uses Node's native watch mode; Nodemon is no longer required.

## Deployment notes

- Mount the temporary upload path on ephemeral storage where possible.
- Put TLS and request-body limits at the reverse proxy/load balancer too.
- Do not enable broad CORS unless there is a concrete cross-origin client requirement.
- For high-volume/public workloads, move document parsing to isolated workers or a queue instead of keeping expensive parsing in the web process.
- The in-memory rate limiter is suitable for a single process. Use a shared store when scaling horizontally.

## Dependency note

SheetJS Community Edition publishes current Node packages through its own authoritative CDN rather than the npm registry. This project intentionally pins `xlsx` to the SheetJS CE 0.20.3 tarball URL documented by SheetJS.

The old v1 `package-lock.json` was removed because it described the vulnerable/obsolete dependency graph. CI installs the pinned top-level dependencies, runs tests, and performs a production dependency audit on every pull request.

## License

MIT — see [LICENSE](LICENSE).

## Maintainer

Built and maintained by **Alejandro D. José** — [@akelaonline](https://github.com/akelaonline).

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).
