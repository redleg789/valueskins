# Last Version Diff

Comparison:
- Previous version: `6d84296`
- Current version: `TBD (next commit)`

## What changed
- Hardened OAuth login validation:
  - Rejects ambiguous auth payloads (`code` + `access_token` together).
  - Enforces non-empty/max-length checks for OAuth code and token input.
  - Enforces strict redirect URI allowlist via `OAUTH_REDIRECT_ALLOWLIST`.
- Fixed authenticated social posting path:
  - Uses JWT claims from auth middleware reliably instead of missing extension type.
- Enforced idempotency on high-value mutation endpoints:
  - `POST /marketplace/opportunities`
  - `POST /marketplace/applications`
  - `POST /brands/applications/accept`
  - `POST /brands/deals/complete`
  - Requires `Idempotency-Key` and replays cached response on retry.
- Hardened Next.js backend proxy route:
  - Strict `BACKEND_URL` validation.
  - Correlation ID propagation (`X-Correlation-ID`).
  - Idempotency key forwarding.
  - Safe retry for transient failures on idempotent methods.
  - Safer error responses (no internal details leaked).
  - `Cache-Control: no-store` on proxied responses.
- Removed deprecated Next middleware file to avoid legacy convention warnings.

## Files changed in current version
- `backend/api_gateway/src/handlers/auth.rs`
- `backend/api_gateway/src/handlers/social.rs`
- `backend/marketplace_service/src/handlers.rs`
- `frontend/src/app/api/backend/[...path]/route.ts`
- `frontend/src/middleware.ts` (deleted)
