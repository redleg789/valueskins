# Implementation Roadmap — CLAUDE.md 33-Part Security Framework

**Apply to**: ValueSkins Backend + Nexus Frontend/Backend  
**Timeline**: 12-16 weeks to production-ready  
**Priority**: CRITICAL PATH items first

---

## PHASE 1: FOUNDATION (Weeks 1-2) — BLOCKING EVERYTHING

### 1.1 Infrastructure Setup
**What's missing**: Real backend infrastructure

```
Nexus Backend Deployment:
☐ Deploy Rust backend (24 microservices in /backend)
  - auth_service (OAuth + bcrypt)
  - marketplace_service (opportunities + applications)
  - payment_service (Stripe integration)
  - storage_service (S3 + image processing)
  - messaging_service (WebSocket chat)
  - Others: tax, analytics, compliance, social

☐ Database:
  - PostgreSQL (not Supabase free tier — need replication + RLS)
  - Migrations (create tables with RLS policies)
  - Backups (daily, cross-region)

☐ Message Queue:
  - Redis (sessions, rate limiting, presence)
  - Kafka (event streaming for notifications, analytics)

ValueSkins Backend:
☐ Ensure backend is production-deployed (currently exists but not live)
  - API gateway (route requests)
  - Service mesh (Istio or Linkerd for mTLS)
  - Load balancer (distribute traffic)
```

**Effort**: 2-3 weeks (backend engineers)  
**Blockers**: Everything depends on this

---

## PHASE 2: AUTHENTICATION & AUTHORIZATION (Weeks 3-4)

### 2.1 Real Authentication (PART 1)
**What's missing**: Demo mode uses localStorage tokens. Need real OAuth + bcrypt.

```
Nexus:
☐ Implement OAuth 2.0 + OIDC
  - Support: Google, Instagram, YouTube, TikTok, LinkedIn
  - Verify: Anthropic OAuth terms (can we use Claude-generated OAuth code?)
  - PKCE flow for mobile (if building mobile apps)

☐ Password hashing (bcrypt 12+ rounds)
  - Create: users.password_hash column
  - Hash: passwords on registration + password reset
  - Verify: comparison uses bcrypt_verify (timing-safe)

☐ Session management (Redis-backed)
  - Session ID: 32-byte random crypto
  - Store: Redis with TTL 30 min idle, 24 hour absolute
  - Cookie: HttpOnly, Secure, SameSite=Strict
  - One active session per user (invalidate old on new login)

ValueSkins:
☐ Connect Nexus frontend → ValueSkins auth backend
  - OAuth redirect to ValueSkins (if using ValueSkins as auth provider)
  - Or: Deploy OAuth independently, sync user data
```

**Effort**: 1-2 weeks  
**Test**: OAuth flow end-to-end (Google → Nexus → app)

---

### 2.2 Authorization & IDOR Prevention (PART 3)
**What's missing**: No authorization checks. Any user could access any user's data.

```
Nexus:
☐ Create authorization middleware
  - Check: user_id == resource owner before returning data
  - Test IDOR: curl /api/v1/users/123 as user 456 → should get 403

☐ Implement RBAC (admin/creator/brand)
  - roles table: id, name (admin, creator, brand, viewer)
  - user_roles table: user_id, role_id
  - Middleware: check role before endpoint handler

☐ Enable RLS on all sensitive tables
  ```sql
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  CREATE POLICY user_isolation ON users
    FOR SELECT
    USING (auth.uid() = id OR auth.role() = 'admin');
  
  ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
  CREATE POLICY creator_posts ON posts
    FOR ALL
    USING (auth.uid() = user_id OR auth.role() = 'admin');
  
  ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
  CREATE POLICY deal_access ON deals
    FOR ALL
    USING (auth.uid() IN (creator_id, brand_id) OR auth.role() = 'admin');
  ```

☐ Test authorization:
  - Creator A tries to access Creator B's messages → 403
  - Creator A tries to accept Creator B's deal → 403
  - Brand A tries to view Brand B's analytics → 403
  - Admin can see everything
```

**Effort**: 1-2 weeks  
**Test**: Write authorization tests for every endpoint

---

## PHASE 3: INPUT VALIDATION & INJECTION PREVENTION (Weeks 5-6)

### 3.1 SQL Injection Prevention (PART 1)
**What's missing**: Need parameterized queries everywhere

```
Nexus Rust Backend:
☐ Use SQLx (strongly-typed SQL)
  - Every query uses $1, $2 placeholders
  - Compile-time validation (sqlx::query! macro)
  - Never string concatenation

☐ Test SQL injection:
  - Try: username = "' OR '1'='1"
  - Expected: Treated as literal string, not SQL
  - Use: sqlx::raw_sql only for table/column names with whitelist

Example (GOOD):
```rust
let user = sqlx::query_as::<_, User>(
  "SELECT * FROM users WHERE email = $1"
)
.bind(email)
.fetch_optional(&pool)
.await?;
```

Example (BAD - never do this):
```rust
let query = format!("SELECT * FROM users WHERE email = '{}'", email);
```

Nexus Frontend:
☐ All API calls use parameterized requests
  - Query params: /api/v1/users?id=123
  - Body params: POST with JSON
  - Never interpolate into URL
```

**Effort**: 1 week  
**Test**: OWASP SQL injection test cases

---

### 3.2 Input Validation (PART 1, 14)
**What's missing**: No schema validation on API endpoints

```
Nexus Rust Backend:
☐ Create request DTOs (Data Transfer Objects)
  ```rust
  use serde::{Deserialize, Serialize};
  use validator::{Validate, ValidationError};

  #[derive(Deserialize, Validate)]
  pub struct CreatePostRequest {
    #[validate(length(min = 1, max = 280))]
    pub content: String,
    
    #[validate(url)]
    pub image_url: Option<String>,
  }
  ```

☐ Validate on every endpoint:
  ```rust
  #[post("/posts")]
  pub async fn create_post(
    Json(payload): Json<CreatePostRequest>,
  ) -> Result<Json<Post>, BadRequest> {
    payload.validate()?; // Reject if invalid
    // ... business logic
  }
  ```

☐ Test validation:
  - Empty content → 400 Bad Request
  - Content > 280 chars → 400 Bad Request
  - Invalid URL → 400 Bad Request
  - Extra fields → 400 Bad Request (reject unknown fields)

Nexus Frontend:
☐ TypeScript validation (compile-time)
☐ Runtime validation with Zod (frontend → backend):
  ```typescript
  const PostSchema = z.object({
    content: z.string().min(1).max(280),
    imageUrl: z.string().url().optional(),
  });
  ```
```

**Effort**: 1-2 weeks  
**Test**: Write validation tests for all endpoints

---

### 3.3 XSS Prevention (PART 1, 14)
**What's missing**: User input not sanitized before rendering

```
Nexus Frontend:
☐ Install DOMPurify
  npm install dompurify

☐ Sanitize user content before rendering:
  ```typescript
  import DOMPurify from 'isomorphic-dompurify';

  function Post({ post }) {
    const safe = DOMPurify.sanitize(post.content, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
      ALLOWED_ATTR: ['href'],
    });
    return <div dangerouslySetInnerHTML={{ __html: safe }} />;
  }
  ```

☐ Test XSS:
  - User posts: <img src=x onerror=alert(1)>
  - Expected: Rendered as escaped HTML (not executed)
  - Verify: No alert() popup

☐ CSP header (already in place):
  - Content-Security-Policy: default-src 'self'; script-src 'self'
  - Prevents inline scripts from executing
```

**Effort**: 3-5 days  
**Test**: OWASP XSS payloads

---

### 3.4 CSRF Prevention (PART 1)
**What's missing**: State-changing endpoints need CSRF tokens

```
Nexus Backend:
☐ Generate CSRF token on session creation:
  ```rust
  let csrf_token = generate_random_token(); // 32 bytes
  session.csrf_token = csrf_token;
  redis.set(session_id, session, 30 * 60).await?; // 30 min
  ```

☐ Validate CSRF token on POST/PUT/DELETE:
  ```rust
  #[post("/posts")]
  pub async fn create_post(
    session: Session,
    Form(body): Form<CreatePostRequest>,
    csrf_token_header: String,
  ) -> Result<Json<Post>> {
    if csrf_token_header != session.csrf_token {
      return Err(Forbidden); // 403
    }
    // ... create post
  }
  ```

Nexus Frontend:
☐ Send CSRF token in all state-changing requests:
  ```typescript
  const csrfToken = document.querySelector('[name="csrf-token"]').value;
  
  fetch('/api/v1/posts', {
    method: 'POST',
    body: JSON.stringify(post),
    headers: {
      'X-CSRF-Token': csrfToken,
      'Content-Type': 'application/json',
    },
  });
  ```

☐ SameSite cookie (already in place):
  - Set-Cookie: session=...; SameSite=Strict
  - Prevents cross-site POST requests
```

**Effort**: 3-5 days  
**Test**: CSRF token validation

---

## PHASE 4: RATE LIMITING & ABUSE PREVENTION (Weeks 7-8)

### 4.1 Per-User Rate Limiting (PART 6)
**What's missing**: No rate limiting. Bots can spam the API.

```
Nexus Backend:
☐ Redis-based rate limiting:
  ```rust
  use redis::Commands;

  pub async fn check_rate_limit(
    redis: &redis::Connection,
    user_id: &str,
    endpoint: &str,
    max_requests: u32,
    window_seconds: u32,
  ) -> Result<(), TooManyRequests> {
    let key = format!("ratelimit:{}:{}", user_id, endpoint);
    let count: u32 = redis.incr(&key, 1)?;
    if count == 1 {
      redis.expire(&key, window_seconds)?;
    }
    if count > max_requests {
      return Err(TooManyRequests);
    }
    Ok(())
  }
  ```

☐ Limits:
  - Login: 20 attempts/hour per user
  - API: 100 requests/minute per user
  - File upload: 10 files/hour per user
  - Message: 100 messages/hour per user

☐ Response:
  - Status: 429 Too Many Requests
  - Header: Retry-After: 60
  - Body: {"error": "Rate limit exceeded. Try again in 60 seconds."}

☐ Test:
  - Send 101 requests in 1 minute → 429
  - Wait 61 seconds → next request succeeds
```

**Effort**: 1 week  
**Test**: Rate limit attack simulation

---

### 4.2 Per-IP Rate Limiting (PART 6)
**What's missing**: Brute force attacks on signup/login

```
Nexus Backend:
☐ Per-IP limits:
  - Signup: 10 accounts/hour per IP
  - Login: 50 attempts/hour per IP
  - Password reset: 5 requests/hour per IP

☐ Track by X-Forwarded-For (if behind proxy):
  ```rust
  let client_ip = request
    .headers()
    .get("X-Forwarded-For")
    .and_then(|h| h.to_str().ok())
    .unwrap_or("0.0.0.0");
  ```

☐ Account lockout:
  - 5 failed login attempts → 15 min lockout
  - Log: [2026-04-19 14:30:45] Failed login from 192.168.1.1, user admin (3/5)
  - Alert: >20 failed logins per hour → page on-call
```

**Effort**: 1 week  
**Test**: Brute force attack simulation

---

## PHASE 5: SECRETS & ENVIRONMENT MANAGEMENT (Weeks 9)

### 5.1 Secrets Management (PART 8)
**What's missing**: Hardcoded secrets or missing env vars

```
Nexus Backend:
☐ Move all secrets to environment:
  - DATABASE_URL (Postgres connection)
  - REDIS_URL (Redis connection)
  - JWT_SECRET (for signing tokens)
  - OAUTH_CLIENT_ID (Google, Instagram, etc.)
  - OAUTH_CLIENT_SECRET
  - STRIPE_SECRET_KEY
  - AWS_SECRET_ACCESS_KEY
  - SENDGRID_API_KEY

☐ Load from .env.local (local dev):
  ```rust
  use dotenv::dotenv;
  use std::env;

  fn main() {
    dotenv().ok();
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL not set");
    let jwt_secret = env::var("JWT_SECRET").expect("JWT_SECRET not set");
  }
  ```

☐ Production deployment:
  - Docker secrets (if Kubernetes)
  - AWS Secrets Manager (if AWS)
  - Vercel environment variables (if Vercel frontend)

☐ Scan for exposed keys:
  ```bash
  git-secrets --scan
  gitleaks detect --source git --verbose
  ```

ValueSkins:
☐ Ensure all backend services use env vars (not hardcoded)
☐ Rotate credentials quarterly
```

**Effort**: 3-5 days  
**Test**: git-secrets + gitleaks scan

---

## PHASE 6: LOGGING & MONITORING (Weeks 10-11)

### 6.1 Structured Logging (PART 9)
**What's missing**: No observability. Can't debug production issues.

```
Nexus Backend:
☐ Structured JSON logging:
  ```rust
  use slog::{Drain, Logger, o, info, warn, error};
  use slog_json_compact::JsonCompactDrain;

  let drain = JsonCompactDrain::new(io::stdout()).build().fuse();
  let root = Logger::root(drain, o!("version" => "1.0"));

  // Log with structure:
  info!(root, "user login"; 
    "user_id" => sha256(user_id),
    "endpoint" => "/api/v1/login",
    "status" => 200,
    "duration_ms" => 42,
  );

  // Output:
  // {"ts":"2026-04-19T14:30:45Z","level":"info","msg":"user login","user_id":"abc123...","endpoint":"/api/v1/login","status":200,"duration_ms":42}
  ```

☐ Log levels:
  - DEBUG: detailed execution flow
  - INFO: important events (login, payment, deployment)
  - WARN: something unexpected (rate limit, retries)
  - ERROR: failure (auth failure, database error)

☐ What NOT to log:
  - Plaintext passwords
  - Full email addresses (hash them)
  - Payment tokens
  - API keys
  - Personal data (SSN, phone numbers)

Nexus Frontend:
☐ Client-side error logging:
  ```typescript
  import * as Sentry from "@sentry/react";

  Sentry.init({
    dsn: "https://key@sentry.io/project",
    environment: "production",
  });

  try {
    // code
  } catch (error) {
    Sentry.captureException(error);
  }
  ```
```

**Effort**: 1-2 weeks  
**Test**: Logs are JSON, no PII exposed

---

### 6.2 Monitoring & Alerting (PART 9)
**What's missing**: No visibility into system health

```
Nexus Backend:
☐ Metrics to track:
  - Request latency (p50, p95, p99)
  - Error rate (errors / total requests)
  - Rate limit violations (per user, per IP)
  - Database connection pool (active, idle, waiting)
  - Message queue depth (if using Kafka)
  - Cache hit rate (Redis)

☐ Instrumentation:
  ```rust
  use prometheus::{Counter, Histogram};

  lazy_static::lazy_static! {
    static ref HTTP_REQUESTS: Counter = Counter::new("http_requests_total", "").unwrap();
    static ref HTTP_LATENCY: Histogram = Histogram::new("http_request_duration_seconds", "").unwrap();
  }

  // In endpoint handler:
  let start = Instant::now();
  let result = handle_request();
  HTTP_REQUESTS.inc();
  HTTP_LATENCY.observe(start.elapsed().as_secs_f64());
  ```

☐ Alerts:
  - Response time > 500ms (p95)
  - Error rate > 1%
  - Failed logins > 3 in 5 min
  - Rate limit violations > 100/min
  - Database connection pool > 80% used

Nexus Frontend:
☐ Sentry alerts:
  - JavaScript errors
  - Unhandled promise rejections
  - Custom error boundaries
```

**Effort**: 1-2 weeks  
**Test**: Trigger alerts manually, verify on-call gets paged

---

## PHASE 7: DATA PROTECTION & COMPLIANCE (Weeks 12-13)

### 7.1 Encryption (PART 4-5)
**What's missing**: No encryption at-rest

```
Nexus Database:
☐ Encrypt sensitive fields:
  - users.email
  - users.phone
  - deals.agreed_amount
  - payments.token

☐ Implementation (AES-256-GCM):
  ```rust
  use aes_gcm::{Aes256Gcm, Key, Nonce};
  use rand::Rng;

  let key = Key::<Aes256Gcm>::from_slice(KEY_BYTES);
  let cipher = Aes256Gcm::new(key);
  
  let nonce = Nonce::from_slice(NONCE_BYTES);
  let ciphertext = cipher.encrypt(nonce, plaintext.as_ref())?;
  
  // Store in DB:
  let encrypted = format!("{}:{}", hex(nonce), hex(ciphertext));
  ```

☐ Key management:
  - Store encryption key in AWS KMS (not in code)
  - Rotate quarterly
  - Different key per environment (dev, staging, prod)

☐ Test:
  - Raw database query shows ciphertext (not plaintext)
```

**Effort**: 1 week  
**Test**: Verify data is encrypted at-rest

---

### 7.2 GDPR & CCPA Compliance (PART 20, 31)
**What's missing**: No right-to-deletion automation

```
Nexus Database:
☐ Deletion queue:
  ```sql
  CREATE TABLE deletion_queue (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    requested_at TIMESTAMP DEFAULT NOW(),
    deletion_deadline TIMESTAMP DEFAULT NOW() + INTERVAL '30 days',
    status TEXT DEFAULT 'pending' -- pending, processing, completed
  );
  ```

☐ Nightly deletion cron (Part 25):
  ```rust
  // Runs daily at 2 AM UTC
  pub async fn process_deletions() {
    let to_delete = sqlx::query(
      "SELECT user_id FROM deletion_queue WHERE deletion_deadline <= NOW() AND status = 'pending'"
    )
    .fetch_all(&pool)
    .await?;

    for row in to_delete {
      let user_id = row.get("user_id");
      
      // BEGIN TRANSACTION
      sqlx::query("DELETE FROM users WHERE id = $1").bind(user_id).execute(&pool).await?;
      sqlx::query("DELETE FROM posts WHERE user_id = $1").bind(user_id).execute(&pool).await?;
      sqlx::query("DELETE FROM deals WHERE creator_id = $1 OR brand_id = $1").bind(user_id).execute(&pool).await?;
      
      // Anonymize logs
      sqlx::query(
        "UPDATE audit_logs SET user_id = NULL, old_values = jsonb_set(old_values, '{email}', '\"[REDACTED]\"') WHERE user_id = $1"
      ).bind(user_id).execute(&pool).await?;
      
      sqlx::query("UPDATE deletion_queue SET status = 'completed' WHERE user_id = $1").bind(user_id).execute(&pool).await?;
      // COMMIT TRANSACTION
    }
  }
  ```

☐ User endpoints:
  - DELETE /api/v1/users/me → adds to deletion_queue
  - GET /api/v1/users/me/data → exports all user data
  - DELETE /api/v1/users/me/consents/marketing → opt-out of marketing

☐ Privacy policy:
  - Document retention per field (logs 30 days, analytics 90 days, backups 90 days)
  - Document user rights (access, delete, portability, opt-out)
```

**Effort**: 1-2 weeks  
**Test**: Request deletion, verify user data gone in 30 days

---

## PHASE 8: INCIDENT RESPONSE & DOCUMENTATION (Weeks 14-16)

### 8.1 Incident Response Plan (PART 24)
**What's missing**: No playbook for when things break

```
☐ Create incident response runbook:
  1. Detection (alert triggered)
  2. Triage (is this a real incident?)
  3. Investigation (what's the root cause?)
  4. Mitigation (stop the bleeding)
  5. Resolution (fix the underlying issue)
  6. Communication (notify users, regulatory, insurance)
  7. Post-mortem (what did we learn?)

☐ Contact list:
  - Security Lead: [name, phone, email]
  - CEO: [name, phone, email]
  - Legal: [name, phone, email]
  - Insurance: [name, phone, email, policy#]
  - On-call engineer: [name, phone]

☐ Breach notification procedure:
  - Identify: What data was exposed?
  - Assess: How many users affected?
  - Notify: GDPR → within 72 hours
  - Offer: Credit monitoring (24 months)
  - Document: Immutable breach log

☐ Test:
  - Simulated breach (April quarterly drill)
  - Verify notification process works
  - Measure time from detection to user notification
```

**Effort**: 1 week  
**Test**: Run breach simulation drill

---

### 8.2 Final Documentation (PART 32 - Deployment Checklist)
**What's missing**: No pre-deploy verification checklist

```
☐ Before every production deploy:

Security
☐ No secrets in code (git-secrets passed)
☐ All env vars configured
☐ IDOR prevention tests passed
☐ RBAC tests passed
☐ RLS enabled on all tables
☐ Rate limiting active

Input Validation
☐ Schema validation on all endpoints
☐ SQL injection tests passed
☐ XSS tests passed
☐ CSRF tokens present

HTTPS & Headers
☐ TLS 1.3 enforced
☐ HSTS header set
☐ CSP header set
☐ All security headers verified

Logging
☐ Structured JSON logging works
☐ No PII in logs (grep for @ symbol)
☐ Alerts configured + tested

Data
☐ Encryption at-rest verified
☐ Encryption in-transit (HTTPS)
☐ Backups automated + tested
☐ GDPR automation ready

Dependencies
☐ npm audit passed (zero high/critical)
☐ No GPL/AGPL in production
```

**Effort**: 1 week (first time), then 1 day per deploy  
**Test**: Actual deployment verification

---

## Summary Timeline

| Phase | Weeks | Key Deliverable | Team |
|-------|-------|-----------------|------|
| 1. Foundation | 1-2 | Backend deployed, databases running | Devops + Backend |
| 2. Auth & AuthZ | 3-4 | Real OAuth + RBAC + RLS | Backend + Security |
| 3. Input Validation | 5-6 | SQL injection + XSS + CSRF prevention | Backend + Frontend |
| 4. Rate Limiting | 7-8 | Per-user + per-IP throttling | Backend |
| 5. Secrets | 9 | Environment variables, no hardcoded keys | Devops |
| 6. Logging & Monitoring | 10-11 | Observability + alerting | Backend + Devops |
| 7. Compliance | 12-13 | Encryption + GDPR automation | Backend + Legal |
| 8. Documentation | 14-16 | Incident response + deployment checklist | Full team |

**Total**: 12-16 weeks to production-ready  
**Team**: 3-4 engineers (backend, frontend, devops, security)  
**Blockers**: None (can start immediately)

---

## What Gets You to MVP vs. What Gets You Funded

**MVP** (current):
- UI is built and deployed
- Auth is demo-mode (localStorage)
- No database replication
- No monitoring
- No incident response

**Fundable** (after implementation):
- Real auth + session management
- Encrypted data at-rest
- Rate limiting + bot prevention
- Logging + monitoring + alerting
- GDPR/CCPA automation
- Incident response playbook
- Legal documents reviewed
- Security audit passed

This implementation roadmap is the 80% that makes engineering valuable.

---

**Start Date**: 2026-04-19  
**Target Date**: 2026-07-19 (12 weeks)  
**Status**: Ready to begin Phase 1
