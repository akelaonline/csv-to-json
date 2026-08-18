# AI Data Prep Converter v2.0.1

A focused hardening and publication-quality patch on top of the v2 rebuild.

## What changed

### Security and privacy

- Added optional API authentication through `Authorization: Bearer <key>` or `X-API-Key` when `API_KEY` is configured.
- API responses now send `Cache-Control: no-store` and `Pragma: no-cache` so converted document contents are not intentionally cached by browsers or intermediaries.
- API-key comparison uses constant-time comparison for equal-length secrets.
- Production startup now warns when no `API_KEY` is configured, while preserving zero-config local use.
- Numeric upload options are parsed strictly; malformed values such as `1200oops` are rejected instead of being partially accepted.

### Quality and maintenance

- Updated GitHub Actions workflows to the current major lines used by Dependabot: `actions/checkout@v7`, `actions/setup-node@v7` and `github/codeql-action@v4`.
- Expanded API integration tests for authentication, cache policy and strict option validation.
- Corrected contribution requirements to Node.js 22.3+ / Node 24 recommended.
- Expanded package metadata and discovery keywords while marking the application `private` to prevent accidental npm publication.
- Generalized the release workflow so future releases are driven by the version in `package.json` and their matching release-notes file.

### Documentation and branding

- Rebuilt the README around the public Akela project standard: clear positioning, scope, security posture, quality gates, installation, API usage, limitations, maintainer identity and professional ecosystem.
- Removed an aspirational README roadmap in favor of explicit current scope and known limitations.
- Clarified support boundaries: GitHub Issues for bugs/features, `SECURITY.md` for vulnerabilities, and separate professional implementation/consulting channels.

## Supported inputs

- XLSX
- XLS
- CSV
- PDF
- TXT

## Outputs

- JSON
- JSONL / NDJSON

The output schema remains vendor-neutral and is intended for RAG, AI agents, vector databases, knowledge-base ingestion, ETL/automation workflows and LLM data pipelines.

## Compatibility

- Node.js **22.3+**
- Node 24 recommended
- Docker supported
- One uploaded file per request

## Upgrade

```bash
git pull
npm ci
npm test
```

For Docker deployments:

```bash
docker build -t ai-data-prep-converter:2.0.1 .
docker run --rm -p 3001:3001 -e API_KEY='replace-with-a-strong-secret' ai-data-prep-converter:2.0.1
```

Generate a strong API key, for example:

```bash
openssl rand -hex 32
```

## Security note

`API_KEY` is optional to preserve local and trusted-network workflows. **Public deployments should configure it or place the service behind trusted upstream authentication.** The `/health` endpoint remains public by design.

Document parsing always carries residual risk. Keep dependencies patched, enforce upload/body limits at the reverse proxy too, and isolate arbitrary public parsing workloads when appropriate.

## Maintainer

Built and maintained by **Alejandro Daniel José · Akela** — [@akelaonline](https://github.com/akelaonline).

MIT licensed.
