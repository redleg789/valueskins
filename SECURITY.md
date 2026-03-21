# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| `main`  | ✅ Yes     |
| older   | ❌ No      |

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

Email: **security@valueskins.io**

Include:
- Description of the vulnerability and its impact
- Steps to reproduce
- Affected components (backend service, frontend, infrastructure)
- Any proof-of-concept code

You will receive an acknowledgement within **48 hours** and a resolution timeline within **7 days**.

## Security Architecture

### Authentication & Sessions
- JWT access tokens (HS256, min 32-char secret enforced at startup)
- Refresh tokens stored as SHA-256 hashes; family-based reuse detection revokes all sessions on compromise
- HTTP-only session cookies for browser clients; Bearer tokens for API/mobile

### Transport
- TLS 1.2+ enforced; HSTS with `preload` enabled
- Ingress-level SSL offload via cert-manager / Let's Encrypt

### Headers
- `Content-Security-Policy` on all responses
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` restricts camera, microphone, geolocation

### Input Validation
- JSON payload size capped at 256 KB
- File uploads: MIME allowlist, 50 MB limit, blocked extension list
- SQL injection impossible — all queries use parameterised bindings via sqlx

### Rate Limiting
- Layer 1: IP-based (actix-governor) — 60 req/min burst
- Layer 2: Tiered per-user (free/basic/pro/enterprise)
- Auth endpoints: 3 req/burst / 10-second window

### GDPR
- Self-service data deletion endpoint (`POST /users/me/data-deletion`)
- PII access audit log (append-only, 7-year retention, immutable DB trigger)
- Data retention policies enforced by automated cleanup worker

### Secret Management
- Secrets never committed — `.env.example` contains only placeholders
- Production secrets via AWS Secrets Manager / Kubernetes External Secrets Operator
- App refuses to start if `JWT_SECRET` is weak or default

### Dependency Scanning
- `cargo audit` in CI on every push
- Snyk frontend dependency scanning
- Semgrep SAST (OWASP Top 10, Rust, TypeScript rulesets)

### Container Security
- All containers run as non-root users
- `allowPrivilegeEscalation: false` in Kubernetes SecurityContext
- `capabilities: drop: [ALL]`

## Responsible Disclosure Timeline

| Day     | Action                            |
|---------|-----------------------------------|
| 0       | Report received                   |
| 1–2     | Acknowledgement sent              |
| 1–7     | Root cause analysis               |
| 7–30    | Patch developed and tested        |
| 30–45   | Patch deployed to production      |
| 90      | Public disclosure (coordinated)   |
