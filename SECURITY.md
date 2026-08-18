# Security Policy

## Supported version

Security fixes are applied to the latest stable release on `main`.

## Reporting a vulnerability

Please **do not** publish exploitable details, malicious fixtures or proof-of-concept payloads in a public issue.

Preferred channels:

1. GitHub private vulnerability reporting, when enabled for this repository.
2. Email **alejandro@mktmarketingdigital.com** with subject `SECURITY: csv-to-json`.

Include:

- affected version or commit;
- reproduction steps;
- expected and actual behavior;
- security impact;
- suggested mitigation, if known.

Do not attach malicious sample files publicly. Coordinate a private transfer method with the maintainer first.

## Security model

The application treats every uploaded document as untrusted input.

Current controls include:

- upload-size and multipart limits;
- extension/MIME allowlists;
- content-signature validation for PDF, XLSX and XLS;
- binary-content rejection for TXT/CSV samples;
- bounded CSV rows/row size and spreadsheet rows/sheets;
- cryptographically random temporary filenames;
- temporary-file cleanup on success and failure;
- Helmet security headers;
- request rate limiting;
- CORS disabled unless explicitly configured;
- optional API-key authentication;
- constant-time comparison for equal-length API keys;
- `Cache-Control: no-store` on API responses;
- generic production 5xx responses;
- request/header/keep-alive timeouts;
- production dependency audits in CI;
- CodeQL analysis and Dependabot monitoring.

## Authentication

`API_KEY` is optional to preserve local and trusted-network workflows. When configured, `/api/*` requires either `Authorization: Bearer <key>` or `X-API-Key: <key>`.

The `/health` endpoint remains public by design.

For public internet deployments, configure a strong API key or place the service behind trusted upstream authentication. The built-in API key is a service-level shared secret, not a user identity system.

## Residual risk

These controls reduce risk but do not make arbitrary document parsing risk-free. File-size limits do not fully eliminate decompression/parser resource-exhaustion risks, and parsers should not be treated as security sandboxes.

For exposed deployments:

- use TLS;
- apply body/rate limits at the reverse proxy or gateway too;
- run with least privilege;
- prefer ephemeral temporary storage;
- isolate arbitrary public parsing workloads from critical systems;
- keep dependencies and GitHub Actions patched.

## Maintainer

**Alejandro Daniel José · Akela**  
GitHub: [@akelaonline](https://github.com/akelaonline)
