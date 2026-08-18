# Changelog

## 2.0.2 - 2026-08-18

### Fixed
- Fixed valid PDF parsing when text extraction and metadata extraction were started concurrently on the same `pdf-parse` parser instance.
- PDF text and metadata extraction now run sequentially, avoiding worker/transfer races around the PDF data buffer.
- The parser now passes the Node.js `Buffer` directly to `PDFParse`, matching the documented Node usage.

### Quality
- Added an end-to-end valid-PDF smoke test with a generated minimal PDF fixture.
- The PDF test verifies text extraction, page count, source metadata and chunk metadata on Node 22 and Node 24.

## 2.0.1 - 2026-08-18

### Security
- Added optional service-level API authentication with `Authorization: Bearer` or `X-API-Key` when `API_KEY` is configured.
- API responses now send `Cache-Control: no-store` and `Pragma: no-cache`.
- API-key comparison uses constant-time comparison for equal-length secrets.
- Production startup warns when no API key is configured.
- Malformed numeric upload options are now rejected strictly instead of being partially accepted by `parseInt`.

### Quality
- Expanded integration tests for API authentication, cache policy and strict option validation.
- Updated GitHub Actions to `actions/checkout@v7`, `actions/setup-node@v7` and `github/codeql-action@v4`.
- Corrected contribution requirements to Node.js 22.3+ / Node 24 recommended.
- Expanded package metadata and discovery keywords; marked the application private to prevent accidental npm publication.
- Generalized release automation so releases follow the version in `package.json` and synchronize matching release notes.

### Documentation
- Rebuilt the README around the final Akela public-project standard.
- Replaced the aspirational roadmap with explicit current scope and known limitations.
- Separated open-source issue/security channels from professional implementation and consulting services.

## 2.0.0 - 2026-08-18

### Security
- Replaced the vulnerable npm-registry `xlsx@0.18.5` build with SheetJS CE `0.20.3` from the authoritative SheetJS CDN.
- Upgraded Multer to 2.2.0, including the 2026 security fixes in the 2.x line.
- Added bounded upload limits, extension/MIME checks and file-content signature validation.
- Added guaranteed temporary-file cleanup using `finally`.
- Added Helmet security headers and API rate limiting.
- Disabled permissive CORS by default; explicit origins can be configured with `CORS_ORIGIN`.
- Added parser row/sheet limits and server timeouts.
- Production 5xx responses no longer expose internal exception messages.
- Added CodeQL scanning and Dependabot monitoring.

### Added
- JSONL output.
- Configurable text/PDF chunk size and overlap.
- Multi-sheet XLSX and XLS processing.
- Health endpoint at `/health`.
- Drag-and-drop interface, copy/download actions and API status.
- Node built-in unit/integration tests and GitHub Actions CI.
- Reproducible `package-lock.json` generated on GitHub Actions.
- Dockerfile with non-root runtime and healthcheck.
- CODEOWNERS, security, contributing, license and environment documentation.

### Changed
- Repositioned the project as an AI/RAG data preparation converter rather than claiming a proprietary OpenAI JSON format.
- Minimum Node.js version is now 22.3.0.
- CI installs through `npm ci` on Node 22 and Node 24 and verifies the Docker build.
- README and repository presentation now follow the Akela open-source branding standard.
