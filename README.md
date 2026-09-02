# Zomi Dataset Studio

Professional starter for collecting, validating, reviewing and exporting multilingual Zomi (Tedim) AI dataset records.

## Included
- Zomi → Myanmar → English records
- Category, dialect and verification status
- Search + filters
- CSV / Excel / JSON import
- Import review + duplicate detection
- Dataset validation counters
- CSV / JSON export
- Local browser persistence
- React + TypeScript + Vite

## Run locally
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
```

## Expected import columns
`zomi,myanmar,english,category,dialect,source`

`source` may be `verified` or `unverified`. Unknown/missing status defaults to `unverified`.

> PDF import is intentionally not enabled in this release. PDF extraction is document-layout dependent and should be added as a separate reviewed ingestion pipeline rather than silently treating arbitrary PDF text as clean training data.
