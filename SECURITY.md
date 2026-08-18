# Security Policy

## Supported version

Security fixes are applied to the latest stable release on `main`.

## Reporting a vulnerability

Please **do not** publish exploitable details, malicious fixtures or proof-of-concept payloads in a public issue.

Preferred channels:

1. GitHub private vulnerability reporting, when enabled for this repository.
2. Email **alejandro@mktmarketingdigital.com** with subject `SECURITY: csv-to-json`.

Include:

- affected version or commit
- reproduction steps
- expected and actual behavior
- security impact
- suggested mitigation, if known

Do not attach malicious sample files publicly. Coordinate a private transfer method with the maintainer first.

## Security model

The application treats every upload as untrusted. It enforces size limits, extension/MIME checks, content-signature validation, request rate limits, temporary-file cleanup and bounded parsing limits.

Additional repository controls include production dependency audits in CI, CodeQL analysis and Dependabot monitoring.

These controls reduce risk but do not make arbitrary document parsing risk-free. Keep dependencies patched, run the service with least privilege and isolate public-facing parsing workloads where appropriate.

## Maintainer

**Alejandro Daniel José · Akela**  
GitHub: [@akelaonline](https://github.com/akelaonline)
