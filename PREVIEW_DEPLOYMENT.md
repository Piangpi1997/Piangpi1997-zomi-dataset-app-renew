# Free static preview deployment and verification

Render service: https://dashboard.render.com/static/srv-db6pfggm7kps73ar5nlg
Public URL: https://zomi-dataset-studio-preview.onrender.com

## Scope
This is a **public UI preview**, not the production dataset application. It has no connected API or user authentication, and must not receive private datasets. The build intentionally disables upload, AI preflight and publication controls without `VITE_API_BASE_URL`.

## Release verification
1. Check GitHub Actions on `feature/free-static-preview`: run `npm test` and `npm run build`.
2. Check Render's latest deploy commit SHA matches the latest commit on `feature/free-static-preview`. **A live status alone is not proof that latest changes deployed.**
3. Open the public URL on an actual Android browser, check the preview warning and confirm all backend-dependent controls are disabled.
4. Never set `VITE_API_BASE_URL` to the token-based prototype API; it does not support browser sessions. Do not put `API_ACCESS_TOKEN` into any Vite variable.
5. If Render does not auto-deploy new commits, inspect the GitHub repository connection and service auto-deploy settings in the Render dashboard; do not assume a deployment occurred.

## Current blockers
Production-grade per-user auth, durable private storage, AI workers, owner approval backend, GitHub publishing audit, Android APK build and physical device E2E are all incomplete.
