# PWA and Android review UI

This branch restores the missing Vite React entrypoint and adds an owner-approval review UI, PWA shell, Capacitor config and GitHub Actions workflows.

**Not production-ready.** The frontend requires authenticated same-origin backend routes:
- POST /api/preflight {datasetId} → {report,rows}
- POST /api/publication/request {datasetId,stage} → {id}
- POST /api/publication/decision {requestId,approve} → status
- GET /api/publication/status/:requestId → {status,github_commit_sha}

Server must authenticate session, authorize owner, protect against CSRF, load authoritative records and immutable review snapshot, run the AI adapter and owner-gated publication worker from the separate dataset repository. UI checkboxes are not authoritative evidence. Browser/PWA and APK do not contain GitHub tokens.

PWA service worker is an offline shell fallback only and deliberately excludes /api/. The manifest is included, but production installation may require icons and HTTPS. Android APK requires a reachable backend endpoint; the Capacitor packaged frontend cannot use relative /api routes without configuring a trusted remote backend. This is a **build scaffold**, not an end-to-end connected Android app.

The training folder in the backend is only a blocked manifest; model fine-tuning still requires approved datasets, compute, and separate training-job integration.
