# Security Policy

## Supported version

Security fixes are applied to the latest release on `main`.

## Reporting a vulnerability

Please do not publish exploitable details in a public issue. Prefer GitHub's private vulnerability reporting for this repository when available. If that option is not available, contact the maintainer through the GitHub profile at `@akelaonline` and request a private channel.

Include the affected version, reproduction steps, impact, and any suggested mitigation. Reports involving malicious sample files should not attach those files publicly.

## Security model

The application treats every upload as untrusted. It enforces size limits, extension/MIME checks, content-signature validation, request rate limits, temporary-file cleanup and bounded parsing limits. These controls reduce risk but do not make arbitrary document parsing risk-free; keep dependencies patched and run the service with least privilege.
