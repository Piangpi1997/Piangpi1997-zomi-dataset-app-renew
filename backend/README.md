# Private Import API — first backend milestone

This is an independently deployable Node 22 upload API, **not** the finished AI backend. It stores original uploads privately and exposes authenticated upload and status routes. It does not transcribe, translate, process, publish to GitHub or train a model.

## Setup

Set `API_ACCESS_TOKEN` to a unique secret of 32+ characters, `ALLOWED_ORIGIN` to your web origin and `PRIVATE_DATA_DIR` to a persistent private disk directory. Run `npm install && npm start` in backend/. Docker deployment is supported; mount a persistent private volume at /data.

**Important:** This bearer-token prototype is intended only for trusted backend-to-backend clients. **Never put API_ACCESS_TOKEN in a browser, PWA, APK or VITE_* variable.** The existing browser upload frontend does not supply this token, so it will receive 401 until a real login/session, scoped owner authorization, CSRF-safe proxy and database are implemented. No user data should be uploaded to a public deployment of this prototype.

The server currently buffers uploaded files in RAM and validates extension only. Before production: stream to object storage, inspect magic bytes, enforce ingress limits, antivirus/media sandbox, durable metadata DB, per-user ownership, rate limits, audit logging, retention and backup, queues for transcription/translation and review. Do not expose a live public endpoint until these gates are implemented.

## API
- GET /healthz — health status
- POST /api/imports — multipart file, kind, datasetId, requires bearer token
- GET /api/imports/:id — metadata, requires bearer token

Status `awaiting_processing` is intentional: there is no transcription worker yet.
