# Zomi Dataset Studio — Base44 Dev Environment

## Overview
React + TypeScript + Vite frontend app for collecting, validating, reviewing, and exporting
multilingual Zomi (Tedim) AI dataset records. Uses local browser persistence (localStorage) —
no backend or database.

## Setup quirks
- The repo was imported with all source files flattened at the root. They were reorganized
  into the intended `src/` directory structure that `index.html` and import paths expect:
  - `src/App.tsx`, `src/main.tsx`, `src/styles.css`
  - `src/data/sampleDataset.ts`
  - `src/types/dataset.ts`
  - `src/services/validation.ts`, `src/services/importers.ts`
- `vite.config.ts` was updated with `server.host: true` and `allowedHosts: true` so the preview's
  external hostname is accepted.
- No external secrets required. The only env var is `VITE_APP_NAME` (cosmetic).

## Running
```bash
docker compose -f docker-compose.base44.yml up -d
```
App is served on host port 3000 (mapped to Vite's 5173).

## Verifying
- `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/` returns 200 with the Vite HTML shell.
- `/src/main.tsx` and `/src/App.tsx` transform without errors.
- No error lines in `docker compose logs web` after startup.

## Build
```bash
npm run build   # tsc && vite build
```
