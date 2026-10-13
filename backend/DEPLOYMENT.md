# Deployment runbook — not production authorization

## Before deployment
1. Provision a Linux VM with Docker and a domain name. Put HTTPS reverse proxy (e.g. Caddy or managed load balancer) in front of localhost:8787.
2. Create backend/.env from .env.example. Generate a new 32-byte random token (`openssl rand -hex 32`), and never commit .env or expose this token to browser, APK, Vite, logs, or screenshots.
3. Set ALLOWED_ORIGIN to the exact HTTPS web origin.
4. Run `docker compose up -d --build` from backend/. Check `curl http://127.0.0.1:8787/healthz`. Back up the private_imports volume and protect it with encryption/access controls.
5. Set a reverse proxy max request body and timeouts, HTTPS/TLS, firewall and monitoring.

## Critical release blockers
This API uses a single service bearer token, not end-user authentication. **Do not point the public PWA or APK at it.** The browser UI currently sends no token and will correctly get HTTP 401. Implement per-user sessions with ownership enforcement, CSRF protection, rate limits, streaming to durable object storage, database and retention before opening public access. Implement AI workers and owner approval with immutable audit trail before claiming end-to-end completion.

The Docker Compose port binds only to loopback by design. Public HTTPS requires an independently configured reverse proxy. No hosting provider, domain or TLS certificate has been provisioned automatically by this repository.
