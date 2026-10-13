# Multimodal Import API (Text / Audio / Video)

Frontend upload UI and typed API client implemented in `src/ImportPanel.tsx` and `src/api.ts`. This is **not** a working ingestion backend. API implementation and deployment are required.

## Required authenticated backend routes

`POST /api/imports` — multipart/form-data fields: `file`, `kind` (`text|audio|video`), `datasetId`. Returns HTTP 202:
```json
{"import_id":"uuid","dataset_id":"zomi_batch_01","kind":"audio","status":"queued","filename":"sample.wav"}
```

`GET /api/imports/:id` — authenticated owner-only polling:
```json
{"import_id":"uuid","status":"processing","stage":"transcribing","progress":42}
```

Expected status: `queued`, `processing`, `awaiting_review`, `failed`. All raw uploads and extracted data must remain in private storage. Existing `/api/preflight` and publication routes need integration with import jobs.

## Processing

- Text: validate TXT/CSV/JSON/JSONL/XLSX, normalize Unicode, parse into rows, dedupe, AI compare/translate.
- Audio: safe decode, speech-to-text with timestamps and source language, transcript review, translate and compare.
- Video: safe media probing, audio track extraction, transcription; optional OCR/frame text extraction; transcript review.
- All modalities: save immutable raw originals and derived artifacts, provenance, model/provider/version, error and confidence metadata. Mark every AI output as **unverified** until human review.
- AI training is a separate approved process, never triggered automatically by uploading a file.
- GitHub push is triggered by a server-side authenticated final owner approval only, using an immutable snapshot and append-only audit.

## Production security checklist

- Validate identity/session, ownership, CSRF, content type and magic bytes on server; never trust extension or user-supplied kind.
- Enforce upload limits on server (text 20MB, audio 200MB, video 500MB), quotas, rate limits, streaming, antivirus and media sandbox/timeouts.
- Restrict file types, prevent decompression bombs and path traversal; keep uploads out of public static hosting.
- Use encrypted object storage, signed internal access, deletion/retention policy, transcription consent and private AI provider policies.
- Do not place secrets or GitHub tokens in frontend environment variables. Only `VITE_API_BASE_URL` may be public.
- For Capacitor Android, set `VITE_API_BASE_URL=https://your-trusted-api.example` during cloud build. Same-origin web can leave it empty. Configure CORS/cookies and CSRF for cross-origin native context.
- This branch is a frontend/API contract only; no real ASR, video processing, upload persistence, or deployment is claimed.
