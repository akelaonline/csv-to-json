# AI Data Prep Converter v2.0.0

A ground-up hardening and productization pass for the original converter.

## Highlights

- Secure XLSX, XLS, CSV, PDF and TXT ingestion.
- JSON and JSONL output for RAG, agents and data pipelines.
- Configurable PDF/TXT chunking with overlap.
- Multi-sheet Excel processing.
- File signature validation, bounded parsing and guaranteed temporary-file cleanup.
- Express 5, Multer 2.2, Helmet, rate limiting and safer production error handling.
- Current SheetJS CE distribution instead of the obsolete npm-registry `xlsx@0.18.5` package.
- New drag-and-drop frontend.
- Reproducible `package-lock.json` and `npm ci`-based CI.
- Node 22 + Node 24 validation.
- Docker image definition with non-root runtime and healthcheck.
- CodeQL, Dependabot and CODEOWNERS.
- Full Akela open-source branding and repository documentation.

## Breaking / compatibility notes

- Minimum Node.js version is **22.3.0**.
- The project no longer describes its generic output as a proprietary “OpenAI-compatible JSON” format.
- Output remains portable JSON/JSONL intended to be transformed or ingested by the target AI/data system.

## Security

This release replaces the vulnerable legacy spreadsheet/upload dependency line and adds multiple controls around untrusted file ingestion. See `SECURITY.md` for the security model and reporting process.

## Maintainer

Built and maintained by **Alejandro Daniel José · Akela** — [@akelaonline](https://github.com/akelaonline).
