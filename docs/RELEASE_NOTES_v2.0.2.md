# AI Data Prep Converter v2.0.2

A focused PDF reliability fix discovered during the final parser coverage audit.

## Fixed

- Fixed valid PDF parsing when text extraction and metadata extraction were started concurrently on the same `pdf-parse` parser instance.
- PDF text and metadata extraction now run sequentially on one parser instance, avoiding transfer/worker races around the PDF data buffer.
- The parser now passes the Node.js `Buffer` directly to `PDFParse`, matching the library's documented Node usage.

## Added

- Added an end-to-end valid-PDF smoke test that generates a minimal PDF fixture at runtime and verifies:
  - text extraction;
  - page count metadata;
  - source type metadata;
  - chunk metadata.

The existing fake-PDF signature rejection test remains in place, so both valid and invalid PDF paths are now covered.

## Validation

The fix is validated on:

- Node.js 22;
- Node.js 24;
- full unit/integration suite;
- production dependency audit;
- Docker build and runtime healthcheck;
- CodeQL.

## Upgrade

```bash
git pull
npm ci
npm test
```

Docker:

```bash
docker build -t ai-data-prep-converter:2.0.2 .
```

## Maintainer

Built and maintained by **Alejandro Daniel José · Akela** — [@akelaonline](https://github.com/akelaonline).

MIT licensed.
