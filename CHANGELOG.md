# Changelog

## 2.0.0 - 2026-08-18

### Security
- Replaced the vulnerable npm-registry `xlsx@0.18.5` build with current SheetJS CE `0.20.3` from the authoritative SheetJS CDN.
- Upgraded Multer to 2.2.0, including the 2026 security fixes in the 2.x line.
- Added bounded upload limits, extension/MIME checks and file-content signature validation.
- Added guaranteed temporary-file cleanup using `finally`.
- Added Helmet security headers and API rate limiting.
- Disabled permissive CORS by default; explicit origins can be configured with `CORS_ORIGIN`.
- Added parser row/sheet limits and server timeouts.
- Production 5xx responses no longer expose internal exception messages.

### Added
- JSONL output.
- Configurable text/PDF chunk size and overlap.
- Multi-sheet XLSX and XLS processing.
- Health endpoint at `/health`.
- Drag-and-drop interface, copy/download actions and API status.
- Node built-in unit/integration tests and GitHub Actions CI.
- Security, contributing, license and environment documentation.

### Changed
- Repositioned the project as an AI/RAG data preparation converter rather than claiming a proprietary OpenAI JSON format.
- Minimum Node.js version is now 22.3.0.
- Dependency versions are pinned because `package-lock.json` from v1 no longer represents the dependency graph and was removed during the migration.
