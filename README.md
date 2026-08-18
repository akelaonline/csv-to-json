# AI Data Prep Converter

### Turn CSV, Excel, PDF and text into clean datasets for RAG, AI agents and LLM pipelines.

[![CI](https://github.com/akelaonline/csv-to-json/actions/workflows/ci.yml/badge.svg)](https://github.com/akelaonline/csv-to-json/actions/workflows/ci.yml)
[![CodeQL](https://github.com/akelaonline/csv-to-json/actions/workflows/codeql.yml/badge.svg)](https://github.com/akelaonline/csv-to-json/actions/workflows/codeql.yml)
[![Version](https://img.shields.io/badge/version-2.0.0-111827)](https://github.com/akelaonline/csv-to-json/releases)
![Node.js](https://img.shields.io/badge/Node.js-22%20%7C%2024-339933?logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-16a34a)

> Built and maintained by **Alejandro Daniel José · Akela** — [@akelaonline](https://github.com/akelaonline).

---

## Why this exists

RAG systems, agents, vector databases and automation workflows all need the same thing: **clean, predictable text records with useful metadata**.

Real source files are rarely predictable. CSV files have different delimiters, spreadsheets contain multiple sheets, PDFs lose structure, plain text can be too large for a single context window, and upload endpoints must assume every file is untrusted.

AI Data Prep Converter provides one small, self-hostable service that turns common office/document formats into portable **JSON or JSONL** without locking the output to one AI vendor.

```text
Files
  ↓
Validate
  ↓
Parse
  ↓
Chunk / Normalize
  ↓
Metadata
  ↓
JSON / JSONL
```

---

## What it converts

| Input | Extension | Processing |
|---|---|---|
| Excel workbook | `.xlsx` | Every worksheet, first row as headers |
| Legacy Excel workbook | `.xls` | Every worksheet, first row as headers |
| CSV | `.csv` | Streaming parser, one record per row |
| PDF | `.pdf` | Text extraction + configurable chunking |
| Plain text | `.txt` | Configurable chunking |

### Output

- **JSON** — portable array of records.
- **JSONL** — one record per line; useful for pipelines, ingestion and further transformation.
- Stable record structure: `id`, `text`, `metadata`.
- Source metadata including filename, source type, row/sheet/page context where available.

Example:

```json
{
  "id": "doc_000001",
  "text": "name: Ada Lovelace, role: Mathematician",
  "metadata": {
    "sourceType": "csv",
    "rowNumber": 1,
    "filename": "people.csv"
  }
}
```

---

## Built for AI workflows

Use it as a preprocessing layer for:

- RAG pipelines
- AI agents
- vector databases
- n8n / automation workflows
- search indexing
- knowledge-base ingestion
- dataset cleaning
- JSONL preparation
- vendor-specific ingestion pipelines after transformation

The project intentionally **does not** claim that its generic JSON schema is a proprietary “OpenAI-compatible” format. Generic output is easier to reuse across OpenAI, local models, vector stores, agent frameworks and custom infrastructure.

---

## Security by design

Uploads are treated as **untrusted input**.

Current controls include:

- extension + MIME allowlists
- file-content signature validation for PDF, XLSX and XLS
- binary-content rejection for TXT/CSV samples
- cryptographically random temporary filenames
- guaranteed cleanup through `finally`
- configurable file-size limits
- CSV/spreadsheet row and sheet limits
- Helmet security headers
- API rate limiting
- CORS disabled by default
- request/header/keep-alive timeouts
- generic production 5xx responses
- dependency audit in CI
- CodeQL analysis
- Dependabot dependency monitoring

See [SECURITY.md](SECURITY.md) for the disclosure policy.

> Document parsing always carries residual risk. For arbitrary public uploads, isolate the service, run it as a non-root user and place network/proxy limits in front of it.

---

## Quick start

Requirements: **Node.js 22.3+**. Node 24 is recommended for new deployments.

```bash
git clone https://github.com/akelaonline/csv-to-json.git
cd csv-to-json
npm ci
npm test
npm start
```

Open:

```text
http://localhost:3001
```

The temporary upload directory is created automatically.

---

## Docker

Build:

```bash
docker build -t ai-data-prep-converter .
```

Run:

```bash
docker run --rm -p 3001:3001 ai-data-prep-converter
```

Then open `http://localhost:3001` or call `/health`.

The container runs as a non-root user and includes a healthcheck.

---

## API

### `POST /api/files/upload`

Send `multipart/form-data` with one field named `file`.

Optional query parameters:

| Parameter | Default | Allowed | Description |
|---|---:|---:|---|
| `format` | `json` | `json`, `jsonl` | Response format |
| `chunkSize` | `1200` | 400–8000 | Maximum characters per PDF/TXT chunk |
| `overlap` | `120` | 0–1500 and `< chunkSize` | Approximate overlap between chunks |

Example:

```bash
curl -F "file=@document.pdf" \
  "http://localhost:3001/api/files/upload?format=jsonl&chunkSize=1600&overlap=160"
```

### `GET /health`

```json
{
  "status": "ok",
  "service": "ai-data-prep-converter",
  "version": "2.0.0",
  "uptimeSeconds": 42
}
```

---

## Configuration

The app reads environment variables directly. See [.env.example](.env.example).

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

`CORS_ORIGIN` accepts a comma-separated allowlist. Leave it empty for same-origin browser use.

Only enable `TRUST_PROXY=true` behind a trusted reverse proxy.

---

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
└── .github/
    ├── CODEOWNERS
    ├── dependabot.yml
    └── workflows/
        ├── ci.yml
        └── codeql.yml
```

---

## Development

```bash
npm ci
npm run check
npm test
npm audit --omit=dev --audit-level=high
```

`npm run dev` uses Node's native watch mode.

CI validates Node 22 and Node 24.

---

## Dependency policy

SheetJS Community Edition distributes current Node packages through its own authoritative CDN. This project pins SheetJS CE to a known version instead of using the obsolete npm-registry `xlsx@0.18.5` package.

Production dependencies are audited in CI. Dependabot monitors npm dependencies and GitHub Actions.

---

## Roadmap

The core converter is intentionally small. Useful next steps include:

- batch/multi-file ingestion
- worker/queue mode for high-volume parsing
- pluggable output adapters
- token-aware chunking presets
- vector-database connectors
- richer PDF structure preservation
- optional OCR worker for scanned PDFs

---

## Release history

Current stable line: **v2.0.0**.

See [CHANGELOG.md](CHANGELOG.md) and [GitHub Releases](https://github.com/akelaonline/csv-to-json/releases).

---

## Akela

This project is part of the public engineering work maintained under **Akela** by Alejandro Daniel José.

The focus is practical infrastructure for **AI, automation, WordPress, SEO, data workflows and production tooling**.

### Professional ecosystem

- **[MKT Marketing Digital](https://mktmarketingdigital.com)** — digital marketing, implementation and growth.
- **[The Thing](https://thethingapp.com)** — AI-powered customer service and sales product.
- **[Marketing Digital Experience](https://marketingdigitalexperience.com)** — AI consulting, training and knowledge transfer.
- **[Nubelytics](https://nubelytics.com)** — analytics + AI for ecommerce.
- **[Zantal](https://zantal.ai)** — agentic commerce intelligence.

These are separate products and businesses; Akela is the engineering identity used for this open-source project.

---

## Author, support and contact

Built by **Alejandro Daniel José · Akela**.

[![GitHub](https://img.shields.io/badge/GitHub-akelaonline-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/akelaonline)
[![Instagram](https://img.shields.io/badge/Instagram-%40akelaonline-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/akelaonline/)
[![MKT](https://img.shields.io/badge/MKT-Marketing_Digital-4285F4?style=for-the-badge)](https://mktmarketingdigital.com)
[![MDE](https://img.shields.io/badge/MDE-AI_Consulting-111111?style=for-the-badge)](https://marketingdigitalexperience.com)
[![Email](https://img.shields.io/badge/Email-alejandro%40mktmarketingdigital.com-0A66C2?style=for-the-badge&logo=gmail&logoColor=white)](mailto:alejandro@mktmarketingdigital.com)

- Bugs and feature requests: [GitHub Issues](https://github.com/akelaonline/csv-to-json/issues)
- Security reports: [SECURITY.md](SECURITY.md)
- Professional implementation: [MKT Marketing Digital](https://mktmarketingdigital.com)
- AI consulting and training: [Marketing Digital Experience](https://marketingdigitalexperience.com)

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
