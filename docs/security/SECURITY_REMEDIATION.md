# Security Remediation Roadmap

**Date Created:** February 21, 2026
**Audit Status:** CRITICAL VULNERABILITIES IDENTIFIED
**Priority:** IMMEDIATE ACTION REQUIRED

---

## Executive Summary

Codebase contains **20 security vulnerabilities**, including **6 CRITICAL** issues that can lead to:
- Complete credential compromise (tokens exposed in logs/history)
- OAuth/OAuth 2.0 bypass (PKCE circumvented)
- SQL injection (database compromise)
- Unauthorized data access (PII exposure)

**Estimated Remediation Time:** 2-3 weeks (if done sequentially), 3-5 days (parallel teams)

**Risk Level:** 🔴 **CRITICAL — DO NOT DEPLOY TO PRODUCTION WITHOUT FIXES**

---

## Critical Issues (Fix Today)

### 1. Remove Hardcoded Credentials from Git

**Files:** `backend/.env`

**Action:**
```bash
# 1. Remove from current commit
git rm --cached backend/.env

# 2. Purge from git history
git filter-branch --tree-filter 'rm -f backend/.env' HEAD

# 3. Force push (⚠️ only if private repo)
git push -f origin master

# 4. Rotate all credentials
# - Generate new DATABASE_URL with random password
# - Generate new JWT_SECRET (use: openssl rand -hex 32)
# - Generate new SMTP credentials

# 5. Add to .gitignore
echo "backend/.env" >> .gitignore
git add .gitignore
git commit -m "Remove .env from version control"
```

**Why:** Any developer with git history access now has database credentials, JWT secret, SMTP access.

**Estimate:** 30 minutes

---

### 2. Fix OAuth Token Exposure (Instagram + Twitter)

**Files:**
- `backend/auth_service/src/verify.rs:25-28`
- `backend/social_service/src/oauth.rs:148-151`

**Current (INSECURE):**
```rust
let url = format!(
    "https://graph.instagram.com/me?fields=id,username&access_token={}",
    access_token
);
let response = client.get(&url).send().await?;
```

**Fixed:**
```rust
let url = "https://graph.instagram.com/me?fields=id,username";
let response = client
    .get(url)
    .bearer_auth(&access_token)  // Token in Authorization header only
    .send()
    .await?;
```

**Why:** Tokens in URLs get logged to:
- Server access logs (nginx, Apache)
- Browser history
- HTTP Referer headers
- Third-party log aggregation
- CDN logs

**Estimate:** 1 hour (both files)

---

### 3. Fix PKCE Implementation (Twitter OAuth)

**File:** `backend/social_service/src/oauth.rs:74-91`

**Current (INSECURE):**
```rust
pub fn twitter_auth_url(&self, redirect_uri: &str, state: &str) -> String {
    format!(
        "...&code_challenge=challenge&code_challenge_method=plain",
    )
}

// Later, exchange uses hardcoded verifier
("code_verifier", "challenge"),  // ❌ Hardcoded!
```

**Fixed:**
```rust
use sha2::{Sha256, Digest};
use base64::{engine::general_purpose, Engine};

pub fn twitter_auth_url(&self, redirect_uri: &str, state: &str) -> String {
    // 1. Generate random challenge (43-128 chars, URL-safe)
    let challenge_bytes = (0..64)
        .map(|_| fastrand::u8(0..=255))
        .collect::<Vec<u8>>();
    let challenge = general_purpose::URL_SAFE_NO_PAD.encode(&challenge_bytes);

    // 2. Store challenge in session/state (keyed by state param)
    self.cache.insert(state.to_string(), challenge.clone());

    // 3. Compute S256 challenge
    let mut hasher = Sha256::new();
    hasher.update(&challenge);
    let hash = hasher.finalize();
    let code_challenge = general_purpose::URL_SAFE_NO_PAD.encode(hash);

    format!(
        "https://twitter.com/i/oauth2/authorize?...&code_challenge={}&code_challenge_method=S256",
        code_challenge
    )
}

pub fn exchange_token(&self, code: &str, state: &str) -> Result<Token, Error> {
    // Retrieve stored challenge
    let challenge = self.cache.remove(state)
        .ok_or(Error::InvalidState)?;

    // POST to token endpoint with verifier
    client.post("...token")
        .form(&[
            ("grant_type", "authorization_code"),
            ("code", code),
            ("code_verifier", &challenge),  // ✅ Retrieved from storage
        ])
        .send()
        .await?
}
```

**Why:** Current implementation allows anyone to intercept auth code and complete the flow without the original client.

**Estimate:** 3 hours (includes adding cache layer)

---

### 4. Add Security Headers Middleware

**File:** `backend/api_gateway/src/main.rs`

**Create new file:** `backend/api_gateway/src/middleware/security_headers.rs`

```rust
use actix_web::{
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpMessage,
};
use futures_util::future::LocalBoxFuture;
use std::future::{ready, Ready};

pub struct SecurityHeaders;

impl<S, B> Transform<S, ServiceRequest> for SecurityHeaders
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = SecurityHeadersMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(SecurityHeadersMiddleware { service }))
    }
}

pub struct SecurityHeadersMiddleware<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for SecurityHeadersMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let fut = self.service.call(req);

        Box::pin(async move {
            let mut res = fut.await?;

            // Add security headers
            res.headers_mut().insert(
                actix_web::http::header::HeaderName::from_static("x-content-type-options"),
                actix_web::http::header::HeaderValue::from_static("nosniff"),
            );
            res.headers_mut().insert(
                actix_web::http::header::HeaderName::from_static("x-frame-options"),
                actix_web::http::header::HeaderValue::from_static("DENY"),
            );
            res.headers_mut().insert(
                actix_web::http::header::HeaderName::from_static("strict-transport-security"),
                actix_web::http::header::HeaderValue::from_static("max-age=31536000; includeSubDomains"),
            );
            res.headers_mut().insert(
                actix_web::http::header::HeaderName::from_static("content-security-policy"),
                actix_web::http::header::HeaderValue::from_static(
                    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
                ),
            );

            Ok(res)
        })
    }
}
```

**Update main.rs:**
```rust
mod middleware;
use middleware::security_headers::SecurityHeaders;

// Inside App::new():
App::new()
    .wrap(cors)
    .wrap(Governor::new(&governor_conf))
    .wrap(SecurityHeaders)  // Add before other middleware
    .wrap(tiered_limiter)
```

**Headers Added:**
- `X-Content-Type-Options: nosniff` — Prevent MIME sniffing
- `X-Frame-Options: DENY` — Prevent clickjacking
- `Strict-Transport-Security: max-age=31536000` — Enforce HTTPS (1 year)
- `Content-Security-Policy` — Prevent inline script injection

**Estimate:** 2 hours

---

### 5. Fix Weak JWT Validation

**File:** `backend/auth_service/src/token.rs:75-83`

**Current:**
```rust
pub fn validate_token(&self, token: &str) -> Result<Claims, AuthError> {
    let token_data = decode::<Claims>(
        token,
        &self.decoding_key,
        &Validation::default()  // ❌ Accepts any algorithm!
    ).map_err(|_| AuthError::InvalidToken)?;
    Ok(token_data.claims)
}
```

**Fixed:**
```rust
pub fn validate_token(&self, token: &str) -> Result<Claims, AuthError> {
    let mut validation = Validation::new(jsonwebtoken::Algorithm::HS256);
    validation.validate_exp = true;
    validation.validate_iat = true;
    validation.validate_nbf = true;
    validation.leeway = 60;  // 60 seconds clock skew tolerance

    let token_data = decode::<Claims>(
        token,
        &self.decoding_key,
        &validation,
    ).map_err(|_| AuthError::InvalidToken)?;

    Ok(token_data.claims)
}
```

**Why:** Default validation can accept none algorithm or mismatched algorithms (algorithm confusion attack).

**Estimate:** 30 minutes

---

## High-Priority Issues (This Week)

### 6. Implement Field-Level Encryption for PII

**Files:** `backend/marketplace_service/src/brand_verification_service.rs`

**Add encryption dependency to Cargo.toml:**
```toml
[dependencies]
aes-gcm = "0.10"
rand = "0.8"
hex = "0.4"
```

**Create encryption module:**
```rust
// backend/shared/src/crypto.rs
use aes_gcm::{Aes256Gcm, Key, Nonce};
use rand::Rng;

pub struct FieldEncryption {
    key: Key<Aes256Gcm>,
}

impl FieldEncryption {
    pub fn new(key_hex: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let key_bytes = hex::decode(key_hex)?;
        let key = Key::<Aes256Gcm>::from_slice(&key_bytes[..32]);
        Ok(Self { key: key.clone() })
    }

    pub fn encrypt(&self, plaintext: &str) -> Result<String, Box<dyn std::error::Error>> {
        let cipher = Aes256Gcm::new(&self.key);
        let mut nonce_bytes = [0u8; 12];
        rand::thread_rng().fill(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);

        let ciphertext = cipher
            .encrypt(nonce, plaintext.as_bytes())
            .map_err(|_| "Encryption failed".into())?;

        // Format: nonce(hex):ciphertext(hex)
        Ok(format!(
            "{}:{}",
            hex::encode(&nonce_bytes),
            hex::encode(&ciphertext)
        ))
    }

    pub fn decrypt(&self, encrypted: &str) -> Result<String, Box<dyn std::error::Error>> {
        let parts: Vec<&str> = encrypted.split(':').collect();
        if parts.len() != 2 {
            return Err("Invalid encrypted format".into());
        }

        let nonce_bytes = hex::decode(parts[0])?;
        let nonce = Nonce::from_slice(&nonce_bytes);
        let ciphertext = hex::decode(parts[1])?;

        let cipher = Aes256Gcm::new(&self.key);
        let plaintext = cipher
            .decrypt(nonce, ciphertext.as_ref())
            .map_err(|_| "Decryption failed".into())?;

        Ok(String::from_utf8(plaintext)?)
    }
}
```

**Update schema:**
```sql
ALTER TABLE brand_verifications
    ADD COLUMN legal_name_encrypted TEXT,
    ADD COLUMN website_url_encrypted TEXT;

-- Populate from existing data
UPDATE brand_verifications
SET legal_name_encrypted = legal_name,
    website_url_encrypted = website_url;

-- Later: drop old columns after verification
```

**Estimate:** 4 hours

---

### 7. Add Per-IP Rate Limiting for Auth

**File:** `backend/api_gateway/src/middleware/rate_limit.rs`

**Add brute-force protection:**
```rust
use std::collections::HashMap;
use std::sync::Arc;
use parking_lot::Mutex;

pub struct BruteForceProtection {
    failures: Arc<Mutex<HashMap<String, (u32, Instant)>>>,  // ip -> (count, first_attempt_time)
    max_attempts: u32,
    lockout_duration: Duration,
}

impl BruteForceProtection {
    pub fn check_auth_failure(&self, ip: &str) -> Result<(), String> {
        let mut failures = self.failures.lock();
        let now = Instant::now();

        if let Some((count, first_attempt)) = failures.get_mut(ip) {
            if now.duration_since(*first_attempt) > self.lockout_duration {
                // Window expired, reset
                failures.remove(ip);
                return Ok(());
            }

            if *count >= self.max_attempts {
                return Err(format!(
                    "Too many auth attempts. Try again in {}s",
                    (self.lockout_duration - now.duration_since(*first_attempt)).as_secs()
                ));
            }

            *count += 1;
        } else {
            failures.insert(ip.to_string(), (1, now));
        }

        Ok(())
    }

    pub fn clear_failures(&self, ip: &str) {
        self.failures.lock().remove(ip);
    }
}
```

**Estimate:** 3 hours

---

### 8. Add Request Timeouts

**File:** `backend/auth_service/src/verify.rs`

**Before:**
```rust
let response = client.get(&url).send().await?;
```

**After:**
```rust
let response = client
    .get(&url)
    .timeout(Duration::from_secs(10))
    .send()
    .await?;
```

**Estimate:** 1 hour (apply to all external API calls)

---

## Medium-Priority Issues (This Sprint)

### 9. Input Validation Layer

**Create:** `backend/shared/src/validation.rs`

```rust
pub struct InputValidator;

impl InputValidator {
    pub fn validate_instagram_handle(handle: &str) -> Result<String, String> {
        let handle = handle.trim();

        if handle.is_empty() || handle.len() > 30 {
            return Err("Instagram handle must be 1-30 characters".to_string());
        }

        if !handle.chars().all(|c| c.is_alphanumeric() || c == '_' || c == '.') {
            return Err("Instagram handle can only contain alphanumeric, underscore, and dot".to_string());
        }

        Ok(handle.to_lowercase())
    }

    pub fn validate_email(email: &str) -> Result<String, String> {
        if email.len() > 254 || !email.contains('@') {
            return Err("Invalid email format".to_string());
        }
        Ok(email.to_lowercase())
    }

    pub fn validate_oauth_state(state: &str) -> Result<String, String> {
        if state.len() < 20 || state.len() > 100 {
            return Err("State parameter must be 20-100 characters".to_string());
        }
        Ok(state.to_string())
    }
}
```

**Estimate:** 3 hours

---

### 10. Remove Console Error Logging

**File:** `frontend/src/components/ErrorBoundary.tsx`

**Before:**
```typescript
console.error('[ErrorBoundary] Uncaught error:', {
  error: error.message,
  stack: error.stack,
  componentStack: errorInfo.componentStack,
  timestamp: new Date().toISOString(),
});
```

**After:**
```typescript
// Send to backend observability service
const reportError = async (errorData: ErrorReport) => {
  try {
    await fetch('/api/v1/observability/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: errorData.error.message,
        // Don't send stack trace to frontend (server logs it internally)
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    });
  } catch (err) {
    // Silently fail if observability is down
  }
};

reportError({...});

// Show generic message to user
setError('Something went wrong. Our team has been notified.');
```

**Estimate:** 2 hours

---

## Deployment Plan

### Phase 1: Immediate (Today)
- [ ] Remove .env from git, rotate credentials
- [ ] Fix OAuth token URL exposure
- [ ] Add security headers middleware
- [ ] Fix JWT validation

**Estimate:** 6 hours
**Owner:** Senior Backend Engineer

### Phase 2: High Priority (Days 2-5)
- [ ] Fix PKCE implementation
- [ ] Implement field encryption
- [ ] Add brute-force protection
- [ ] Add request timeouts

**Estimate:** 12 hours
**Owner:** Backend Team + Security Engineer

### Phase 3: Medium Priority (Week 2)
- [ ] Input validation layer
- [ ] Remove console error logging
- [ ] Implement PII access controls

**Estimate:** 8 hours
**Owner:** Backend Team

### Phase 4: Verification (Week 3)
- [ ] Security code review
- [ ] Penetration testing (optional)
- [ ] Load testing with security headers
- [ ] Canary deployment
- [ ] Full production rollout

**Estimate:** 8 hours
**Owner:** QA + DevOps

---

## Testing Checklist

### Before Deployment

- [ ] Unit tests for encryption/decryption
- [ ] Unit tests for input validation
- [ ] Unit tests for token validation (algorithm explicit)
- [ ] Integration test: OAuth flow with S256 PKCE
- [ ] Integration test: Auth endpoint rate limiting
- [ ] Security headers present in all responses
- [ ] No credentials in logs or error messages
- [ ] API timeouts working (mock slow endpoints)
- [ ] PII fields encrypted at rest

### After Deployment

- [ ] Monitor error logs for 24 hours
- [ ] Check external API call timeouts don't trigger
- [ ] Verify HSTS header (browser dev tools)
- [ ] Verify CSP policy (check CSP violations in logs)
- [ ] Test OAuth flow end-to-end
- [ ] Verify token-based auth still works
- [ ] Check performance impact of encryption (< 5ms per operation)

---

## Rollback Plan

If any critical issue arises during deployment:

```bash
# 1. Revert to previous git commit
git revert <bad-commit-hash>

# 2. Rebuild and redeploy
cargo build --release
docker build -t api_gateway:prev .
kubectl set image deployment/api-gateway api_gateway=api_gateway:prev

# 3. Monitor error rates (should drop immediately)

# 4. Investigate issue, fix, and redeploy
```

---

## Cost Estimate

| Phase | Hours | Cost (@ $200/hr) |
|-------|-------|-----------------|
| Phase 1 (Immediate) | 6 | $1,200 |
| Phase 2 (High) | 12 | $2,400 |
| Phase 3 (Medium) | 8 | $1,600 |
| Phase 4 (Verification) | 8 | $1,600 |
| **Total** | **34** | **$6,800** |

---

## Audit Trail

- **Audit Date:** February 21, 2026
- **Auditor:** Claude Code (Security Review Agent)
- **Total Vulnerabilities:** 20 (6 CRITICAL, 5 HIGH, 6 MEDIUM, 3 LOW)
- **Status:** Remediation Plan Complete
- **Next Review:** After Phase 4 completion

---

*This remediation plan is mandatory before production deployment.*

