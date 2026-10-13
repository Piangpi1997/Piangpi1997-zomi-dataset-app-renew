# Release evidence checklist

This repository deliberately **blocks final release** until every gate has a real, HTTPS-accessible evidence URL and status `passed`. Evidence links are not automatically verified by the checker; a human reviewer must validate authenticity and applicability.

Run: `node backend/release-gate.mjs backend/release-evidence.json`

The example evidence file contains no passing claims. Do not fill it with placeholder links or fabricate device tests. CI Web/Backend checks alone are not enough for release.

Required: backend tests, frontend build, HTTPS backend, session-based user auth, dataset ownership, private storage, real text AI pipeline, audio transcription, video extraction, owner approval and audit, Android build, physical Android end-to-end install/import/review verification.
