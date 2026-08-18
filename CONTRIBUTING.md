# Contributing

Thanks for helping improve **AI Data Prep Converter**.

## Development requirements

- Node.js **22.3+**; Node 24 is the recommended development version and is pinned in `.nvmrc`.
- npm with the committed `package-lock.json`.
- Docker when changing deployment/container behavior.

## Workflow

1. Fork the repository and create a focused branch.
2. Install exactly the locked dependency graph with `npm ci`.
3. Make one focused change at a time.
4. Add or update tests for behavior changes.
5. Run the full local validation suite:

```bash
npm ci
npm run check
npm test
npm audit --omit=dev --audit-level=high
```

6. When Docker/deployment behavior changes, also run:

```bash
docker build -t ai-data-prep-converter:test .
docker run --rm -p 3001:3001 ai-data-prep-converter:test
```

7. Open a pull request and complete the repository PR checklist.

## Parser and upload changes

Uploads are untrusted input. New formats or parser changes must include:

- explicit size/complexity limits where applicable;
- content validation rather than extension-only trust;
- bounded resource behavior;
- cleanup on success and failure;
- tests for malformed or unexpected input;
- no logging of uploaded document contents or credentials.

Do not commit fixtures containing personal, confidential, copyrighted-without-permission or malicious data.

## Scope

Keep the core service small and vendor-neutral. Integrations that are specific to one vector database, AI provider or workflow platform should normally live behind a clean adapter or in a separate integration layer rather than coupling the base output schema to one vendor.

## Security

Do **not** open a public issue for exploitable vulnerabilities. Follow [SECURITY.md](SECURITY.md) instead.

## Maintainer

Built and maintained by **Alejandro Daniel José · Akela** — [@akelaonline](https://github.com/akelaonline).
