<div align="center">

# AI Data Prep Converter

**Turn Excel, CSV, PDF and text files into clean JSON/JSONL datasets for RAG, AI agents, vector databases and LLM pipelines.**

[![Release](https://img.shields.io/github/v/release/akelaonline/csv-to-json?sort=semver&display_name=tag)](https://github.com/akelaonline/csv-to-json/releases/latest)
[![CI](https://github.com/akelaonline/csv-to-json/actions/workflows/ci.yml/badge.svg)](https://github.com/akelaonline/csv-to-json/actions/workflows/ci.yml)
[![CodeQL](https://github.com/akelaonline/csv-to-json/actions/workflows/codeql.yml/badge.svg)](https://github.com/akelaonline/csv-to-json/actions/workflows/codeql.yml)
![Node.js](https://img.shields.io/badge/Node.js-22.3%2B-339933?logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)
[![License: MIT](https://img.shields.io/badge/license-MIT-16a34a)](LICENSE)

**Self-hosted · vendor-neutral · security-conscious · no SaaS dependency**

Built and maintained by **Alejandro Daniel José · Akela** · [@akelaonline](https://github.com/akelaonline)

</div>

---

## What it is

**AI Data Prep Converter** is a small self-hosted Node.js service that converts common document formats into a predictable record schema:

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

It is designed to sit **before** your AI or data layer:

```mermaid
flowchart LR
    A[Files] --> B[Validate]
    B --> C[Parse]
    C --> D[Chunk / Normalize]
    D --> E[Metadata]
    E --> F[JSON / JSONL]
    F --> G[RAG / Agents / Vector DB / ETL]
```

The output is intentionally **vendor-neutral**. It is not a proprietary “OpenAI-compatible JSON” format; it is portable structured data that can be transformed for OpenAI, local models, vector databases, n8n, custom agents or any downstream pipeline.

---

## Current status

**Stable release line: v2.x**

The original prototype was rebuilt with current dependencies, bounded upload handling, content-signature validation, tests, CI, CodeQL, Docker and production-oriented defaults.

For the current release and changes, see [Releases](https://github.com/akelaonline/csv-to-json/releases/latest) and [CHANGELOG.md](CHANGELOG.md).

---

## Supported formats

| Input | Extension | Behavior |
|---|---|---|
| Excel workbook | `.xlsx` | Processes every worksheet; first row becomes headers |
| Legacy Excel workbook | `.xls` | Processes every worksheet; first row becomes headers |
| CSV | `.csv` | Streaming parser; one output record per non-empty row |
| PDF | `.pdf` | Extracts text and creates configurable chunks |
| Plain text | `.txt` | Creates configurable chunks |

### Output formats

- **JSON** — an array of records.
- **JSONL / NDJSON** — one JSON object per line.

Every record contains:

- `id`
- `text`
- `metadata`

Metadata varies by source and can include filename, source type, upload date, byte size, row number, sheet name, page count and chunk information.

---

## Why use it

- **One ingestion layer for common files.** No separate script per format.
- **Portable output.** Keep your data-prep layer independent from a single AI vendor.
- **Self-hosted.** Uploaded files do not need to pass through an external SaaS service.
- **API + browser UI.** Use it manually or inside automation.
- **JSON + JSONL.** Useful for RAG, ETL, knowledge bases and ingestion workflows.
- **Security-conscious upload path.** File signatures, size limits, bounded rows/sheets, random temp names and cleanup.
- **Optional API authentication.** Add a shared API key for exposed deployments.
- **Docker-ready.** Includes non-root runtime and healthcheck.
- **Continuously validated.** Node 22/24 CI, dependency audit, CodeQL and Docker smoke test.

---

## Quick start

### Requirements

- Node.js **22.3+**
- Node 24 recommended (`.nvmrc` is included)

### Install

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

Health endpoint:

```text
http://localhost:3001/health
```

---

## Docker

Build:

```bash
docker build -t ai-data-prep-converter .
```

Run locally:

```bash
docker run --rm -p 3001:3001 ai-data-prep-converter
```

Run with API protection:

```bash
docker run --rm \
  -p 3001:3001 \
  -e API_KEY='replace-with-a-strong-secret' \
  ai-data-prep-converter
```

Generate a strong key:

```bash
openssl rand -hex 32
```

The container runs as a non-root user and exposes a Docker healthcheck against `/health`.

---

## API

### Upload and convert

```text
POST /api/files/upload
```

Send `multipart/form-data` with one field named `file`.

Example:

```bash
curl -F "file=@document.pdf" \
  "http://localhost:3001/api/files/upload?format=jsonl&chunkSize=1600&overlap=160"
```

With `API_KEY` configured:

```bash
curl \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@document.pdf" \
  "http://localhost:3001/api/files/upload?format=jsonl"
```

`X-API-Key: YOUR_API_KEY` is also accepted.

### Query parameters

| Parameter | Default | Valid values | Purpose |
|---|---:|---:|---|
| `format` | `json` | `json`, `jsonl` | Response format |
| `chunkSize` | `1200` | integer 400–8000 | Maximum characters per PDF/TXT chunk |
| `overlap` | `120` | integer 0–1500 and `< chunkSize` | Approximate overlap between adjacent chunks |

Malformed numeric values are rejected rather than partially parsed.

### Health

```text
GET /health
```

Example:

```json
{
  "status": "ok",
  "service": "ai-data-prep-converter",
  "version": "2.0.1",
  "uptimeSeconds": 42
}
```

`/health` remains public even when `API_KEY` is enabled.

---

## Authentication

Authentication is **optional by design** so local and trusted-network use stays zero-config.

Set:

```text
API_KEY=your-long-random-secret
```

Then every `/api/*` request must provide either:

```http
Authorization: Bearer your-long-random-secret
```

or:

```http
X-API-Key: your-long-random-secret
```

**Public deployments should configure `API_KEY` or place the service behind trusted upstream authentication.**

This is intentionally a simple service-level shared key, not a user/account system or OAuth provider.

---

## Security posture

Uploads are treated as **untrusted input**.

Current controls include:

- extension + MIME allowlists;
- content-signature validation for PDF, XLSX and XLS;
- binary-content rejection for TXT/CSV samples;
- cryptographically random temporary filenames;
- guaranteed temporary-file cleanup through `finally`;
- configurable upload-size limits;
- bounded CSV row size and row count;
- bounded spreadsheet row and sheet counts;
- Helmet security headers;
- API rate limiting;
- CORS disabled unless explicitly configured;
- optional constant-time API-key validation;
- `Cache-Control: no-store` on API responses;
- request/header/keep-alive timeouts;
- generic production 5xx responses;
- dependency audit in CI;
- CodeQL analysis;
- Dependabot monitoring.

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

### Production deployment checklist

For internet-facing deployments:

1. Set a strong `API_KEY` or use trusted upstream authentication.
2. Terminate TLS at a reverse proxy/load balancer.
3. Set request-body limits at the proxy too.
4. Configure `CORS_ORIGIN` only for origins that actually need browser access.
5. Set `TRUST_PROXY=true` only behind a trusted proxy.
6. Use ephemeral storage for temporary uploads where possible.
7. Run the process/container with least privilege.
8. Use a shared rate-limit store if you scale to multiple application replicas.
9. Isolate high-risk arbitrary document parsing from critical workloads.

Document parsing always carries residual risk; no parser should be treated as a sandbox.

---

## Configuration

The service reads environment variables directly. See [.env.example](.env.example).

| Variable | Default | Purpose |
|---|---:|---|
| `PORT` | `3001` | HTTP port |
| `NODE_ENV` | — | Use `production` for deployments |
| `API_KEY` | empty | Optional API authentication |
| `MAX_FILE_SIZE_BYTES` | `10485760` | Maximum uploaded file size |
| `RATE_LIMIT_MAX` | `30` | Requests per IP per 15-minute window |
| `CORS_ORIGIN` | empty | Comma-separated browser origin allowlist |
| `TRUST_PROXY` | `false` | Trust one upstream proxy hop when `true` |
| `REQUEST_TIMEOUT_MS` | `30000` | Server request timeout |
| `HEADERS_TIMEOUT_MS` | `15000` | Header timeout |
| `KEEP_ALIVE_TIMEOUT_MS` | `5000` | Keep-alive timeout |
| `MAX_CSV_ROWS` | `50000` | Maximum CSV data rows |
| `MAX_CSV_ROW_BYTES` | `1048576` | Maximum bytes per CSV row |
| `MAX_XLSX_ROWS` | `50000` | Maximum spreadsheet data rows |
| `MAX_XLSX_SHEETS` | `25` | Maximum workbook sheets |

---

## Known limits — by design

This project is intentionally focused. Current boundaries are explicit:

- **One file per request.** It is not a batch-upload queue.
- **No OCR.** Scanned/image-only PDFs need an OCR stage before or beside this service.
- **Character-based chunking.** PDF/TXT chunks are not model-token-aware.
- **Standard CSV parsing.** Custom delimiter selection is not currently exposed as an API option.
- **No vector-database writes.** The converter prepares data; your downstream pipeline decides where to store it.
- **No provider-specific fine-tuning schema.** Transform the generic output into the exact training format required by the target model/provider.
- **No user-management system.** Optional authentication is a service-level shared API key.
- **In-memory rate limiting.** Multi-replica deployments should use an upstream/shared rate-limit layer.

These are **scope boundaries**, not promises of future features. Feature proposals belong in [GitHub Issues](https://github.com/akelaonline/csv-to-json/issues).

---

## Quality gates

Every pull request is expected to pass:

| Gate | Coverage |
|---|---|
| Syntax check | Project JavaScript |
| Unit/integration tests | API, chunking, spreadsheet parsing and file validation |
| Node matrix | Node 22 and Node 24 |
| Dependency audit | Production dependencies, high severity threshold |
| CodeQL | JavaScript/TypeScript static analysis |
| Docker build | Image must build successfully |
| Docker smoke test | Container must start and answer `/health` |

Local validation:

```bash
npm ci
npm run check
npm test
npm audit --omit=dev --audit-level=high
```

---

## Architecture

```text
.
├── index.js                     # Express app, security middleware, health endpoint
├── controllers/
│   └── fileController.js        # Conversion orchestration + response shaping
├── routes/
│   └── fileRoutes.js            # Multer upload policy and limits
├── utils/
│   ├── chunkText.js
│   ├── parseCsv.js
│   ├── parseExcel.js
│   ├── parsePdf.js
│   ├── parseTxt.js
│   └── validateFile.js
├── public/                       # Browser UI
├── test/                         # Node test runner suite
├── scripts/
├── Dockerfile
└── .github/
    ├── CODEOWNERS
    ├── dependabot.yml
    ├── ISSUE_TEMPLATE/
    └── workflows/
```

---

## Dependencies

SheetJS Community Edition distributes current Node packages through its authoritative CDN rather than relying on the obsolete npm-registry `xlsx@0.18.5` line. This repository pins the spreadsheet package deliberately and commits a reproducible `package-lock.json`.

Dependency changes are monitored with Dependabot and production dependencies are audited in CI.

---

## Releases

- **Latest:** [GitHub Releases](https://github.com/akelaonline/csv-to-json/releases/latest)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)

Release notes are stored in `docs/RELEASE_NOTES_v*.md`. The release workflow reads the version from `package.json`, creates the matching tag/release when necessary, and synchronizes release notes for an existing tag.

---

## Contributing

Contributions are welcome when they keep the service focused, bounded and vendor-neutral.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

For vulnerabilities, **do not open a public issue**; use [SECURITY.md](SECURITY.md).

---

## Akela · public engineering

This repository is maintained under **Akela**, the public engineering identity of **Alejandro Daniel José**.

The work focuses on practical systems at the intersection of **AI, automation, WordPress, SEO, data and MarTech**.

### Selected public projects

- **[WP-Nerve](https://github.com/akelaonline/WP-Nerve)** — native agent/MCP gateway for WordPress.
- **[Akela SEO](https://github.com/akelaonline/akela-seo)** — technical SEO and automation for WordPress.
- **[PageRelay](https://github.com/akelaonline/PageRelay)** — AI-to-WordPress deployment layer.
- **[NO Comments](https://github.com/akelaonline/No-comments)** — focused WordPress comment control and cleanup.
- **[AI Data Prep Converter](https://github.com/akelaonline/csv-to-json)** — vendor-neutral file-to-dataset preparation for AI workflows.

These projects are independent, but share the same engineering principles: **clear APIs, self-hosting where it matters, security by design, automation and production-oriented operation.**

### Professional ecosystem

- **[MKT Marketing Digital](https://mktmarketingdigital.com)** — digital marketing agency, implementation and growth.
- **[The Thing](https://thethingapp.com)** — MKT product for AI-powered customer service and sales.
- **[Marketing Digital Experience](https://marketingdigitalexperience.com)** — applied AI consulting, training and knowledge transfer.
- **[Nubelytics](https://nubelytics.com)** — ecommerce analytics + AI.
- **[Zantal](https://zantal.ai)** — agentic commerce intelligence.

The professional brands above are separate businesses/products; **Akela** is the engineering identity used for this open-source repository.

---

## Author, issues and contact

Built and maintained by **Alejandro Daniel José · Akela**.

[![GitHub](https://img.shields.io/badge/GitHub-akelaonline-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/akelaonline)
[![Instagram](https://img.shields.io/badge/Instagram-%40akelaonline-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/akelaonline/)
[![MKT](https://img.shields.io/badge/MKT-Marketing_Digital-4285F4?style=for-the-badge)](https://mktmarketingdigital.com)
[![MDE](https://img.shields.io/badge/MDE-AI_Consulting-111111?style=for-the-badge)](https://marketingdigitalexperience.com)
[![Email](https://img.shields.io/badge/Email-alejandro%40mktmarketingdigital.com-0A66C2?style=for-the-badge&logo=gmail&logoColor=white)](mailto:alejandro@mktmarketingdigital.com)

- **Bugs / feature proposals:** [GitHub Issues](https://github.com/akelaonline/csv-to-json/issues)
- **Security:** [SECURITY.md](SECURITY.md)
- **Professional implementation:** [MKT Marketing Digital](https://mktmarketingdigital.com)
- **AI consulting / training:** [Marketing Digital Experience](https://marketingdigitalexperience.com)

No public support SLA is implied by this open-source repository.

---

## License

**MIT** — see [LICENSE](LICENSE).

Copyright © 2026 Alejandro D. José.
