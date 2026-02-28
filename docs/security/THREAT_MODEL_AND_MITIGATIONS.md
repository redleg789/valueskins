# ValueSkins: Security Threat Model & Mitigations

A threat model identifies "what could go wrong" and "how we stop it." This document maps every attack surface and how it's defended.

---

## ATTACK SURFACES

### 1. AUTHENTICATION & SESSION HIJACKING

#### Threat: Attacker Steals JWT Token

**Attack Vector:**
```
Victim logs in
  ↓
Backend issues JWT: "eyJhbGc.eyJpZCI6MTIzfQ.signature"
  ↓
Frontend stores in localStorage
  ↓
Attacker steals JWT (XSS exploit or network sniff)
  ↓
Attacker calls API with stolen JWT:
  POST /deal/456/counter-offer HTTP/1.1
  Authorization: Bearer eyJhbGc.eyJpZCI6MTIzfQ.signature
  ↓
Backend: "Signature is valid, you are user 123"
  ↓
Attacker submits offer as victim
```

**Mitigations Layered:**

1. **JWT Short Expiration (1 hour)**
   ```
   If stolen JWT discovered:
     - Victim's next API call fails (token expired)
     - Backend: "Unauthorized"
     - Frontend: redirect to login
     - Attacker can only use JWT for max 1 hour
   ```

2. **Refresh Token Rotation**
   ```
   Initial login:
     Access Token: 1 hour (short-lived, in-memory)
     Refresh Token: 30 days (longer, secure storage)

   When Access Token expires:
     Frontend: POST /auth/refresh { refresh_token }
     Backend: Issues NEW access token + NEW refresh token
     Attacker's refresh token was single-use → becomes invalid

   Threat: Attacker with old refresh token
     → Tries to use it
     → Backend rejects (already used)
     → Backend logs suspicious activity
     → Admin notified
   ```

3. **Denylist on Logout**
   ```
   User clicks "Logout"
     ↓
   Frontend clears JWT + refresh token
   Frontend: POST /auth/logout { token_jti }
     ↓
   Backend: INSERT INTO revoked_tokens VALUES (jti, NOW());
   All future requests with this jti: rejected
   ```

4. **Device Fingerprinting**
   ```
   Login creates fingerprint:
     - IP address
     - User agent (browser, OS)
     - Device ID (stored in localStorage)

   On each request:
     Verify fingerprint matches original
     If different device: require re-authentication
     Prevents: token used from attacker's machine

   Scenario:
     Victim in New York
     Attacker in Russia uses stolen token
     IP doesn't match → 403 "Unrecognized device"
   ```

5. **Automatic Logout on Multi-Device**
   ```
   User logs in on Device A (phone)
   User logs in on Device B (laptop)
     ↓
   INSERT INTO active_sessions (user_id, device_id, created_at)
     ↓
   Keep max 3 sessions per user
     ↓
   If 4th device logs in:
     Kill oldest session (Device A loses access)
     Victim notices: "Why was I logged out on my phone?"
     User knows there's a problem
     User changes password
   ```

#### Threat: Attacker Forges JWT (Wrong Secret)

**Attack Vector:**
```
Attacker creates fake JWT:
  {
    "alg": "HS256",
    "id": 999999,  // Victim's ID
    "permissions": ["admin"]
  }

Signs it with... what key?
  → Doesn't know the secret
  → Signature will be wrong
```

**Mitigation: Cryptographic Verification**
```rust
// Backend on every request
pub fn verify_jwt(token: &str, secret: &[u8]) -> Result<Claims> {
  let decoded = jsonwebtoken::decode::<Claims>(
    token,
    &DecodingKey::from_secret(secret),
    &Validation::new(Algorithm::HS256),
  )?;
  // ^^^ This fails if:
  //     - Secret is different
  //     - Token was modified (signature won't match)
  //     - Token expired

  Ok(decoded.claims)
}

// If verification fails:
// HttpResponse::Unauthorized("Invalid token")
```

---

### 2. AUTHORIZATION & PRIVILEGE ESCALATION

#### Threat: Brand Creates Application as Creator

**Attack Vector:**
```
Brand (ID 456) wants to view creator applications
Normally: GET /creators/789/applications
  → Requires: CreatorID = 789, OR Admin

Brand forges request:
  GET /creators/789/applications
  Authorization: Bearer eyJpZCI6NDU2fQ  (Brand's token)

Backend checks:
  IF user_id (456) == creator_id (789): ALLOW
  ELSE IF user_role == "admin": ALLOW
  ELSE: 403 Forbidden

Brand is not admin, not creator 789 → Rejected
```

**Mitigation: Server-Side Authorization on Every Endpoint**

```rust
pub async fn get_creator_applications(
  req: HttpRequest,
  creator_id: Path<i64>,
) -> impl Responder {
  // Step 1: Extract user from JWT
  let user_id = extract_user_id(&req)?;
  let user_role = extract_role(&req)?;

  // Step 2: Verify ownership or admin
  if user_id != creator_id.into_inner() && user_role != "admin" {
    return HttpResponse::Forbidden()
      .json(json!({"error": "Unauthorized"}));
  }

  // Step 3: Load data (only if authorized)
  let applications = load_applications(creator_id).await?;

  HttpResponse::Ok().json(applications)
}
```

**Key Principle: Trust Checks Before Data Access**
```
❌ Wrong:
  applications = load_applications(creator_id);
  if user_id != creator_id { return error; }
  return applications;
  // (Loaded data even though not authorized)

✅ Right:
  if user_id != creator_id { return error; }
  applications = load_applications(creator_id);
  return applications;
  // (Only load if authorized)
```

#### Threat: Non-Admin Tries to Moderate User

**Attack Vector:**
```
Attacker (regular user) tries:
  POST /admin/ban-user { user_id: 789 }

Expected: Only admins can ban users
```

**Mitigation: Role-Based Access Control**

```rust
pub async fn ban_user(req: HttpRequest, body: BanRequest) -> impl Responder {
  // Step 1: Check if user is admin
  let user_role = extract_role(&req)?;

  if user_role != "admin" {
    return HttpResponse::Forbidden()
      .json(json!({"error": "Admin required"}));
  }

  // Step 2: Proceed with ban
  mark_user_banned(body.user_id).await?;

  HttpResponse::Ok().json(json!({"success": true}))
}
```

---

### 3. INJECTION ATTACKS (SQL, COMMAND, XSS)

#### Threat: SQL Injection

**Attack Vector:**
```
Attacker provides malicious input:
  creator_name = "'; DROP TABLE users; --"

Naive code:
  query = "SELECT * FROM creators WHERE name = '" + creator_name + "'";
  // Result: SELECT * FROM creators WHERE name = ''; DROP TABLE users; --'

Execution:
  1. Create empty WHERE clause (match nothing)
  2. DROP TABLE users (deletes all users!)
  3. -- comments out rest of query
```

**Mitigation: Parameterized Queries (Used Everywhere)**

```rust
// ✅ Correct: SQLx parameterized queries
let creators = sqlx::query_as::<_, Creator>(
  "SELECT * FROM creators WHERE name = $1"
)
  .bind(&creator_name)  // ← Value passed separately
  .fetch_all(&pool)
  .await?;

// SQL and data are separate at the protocol level
// Even if creator_name = "'; DROP TABLE users; --"
// The database sees:
//   SQL: SELECT * FROM creators WHERE name = ?
//   Parameter: ''; DROP TABLE users; --
// The parameter is NEVER interpreted as SQL code
```

#### Threat: Cross-Site Scripting (XSS)

**Attack Vector:**
```
Attacker creates deal with title:
  <img src=x onerror="steal_cookies()">

Admin views deal in dashboard
  ↓
HTML rendered: <img src=x onerror="steal_cookies()">
  ↓
Browser executes JavaScript: steal_cookies()
  ↓
Admin's JWT token sent to attacker's server
```

**Mitigation: Content Security Policy (CSP) Header**

```
HTTP Response Header:
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-random123';
  img-src 'self' data: https:;
  style-src 'self' 'unsafe-inline';

What this means:
  - Scripts can ONLY load from same origin + with explicit nonce
  - Inline <img onerror=...> WILL NOT EXECUTE
  - Even if HTML contains malicious code: blocked by browser
```

**Additional Mitigation: HTML Escaping**

```typescript
// Frontend (React)
const dealTitle = "<img src=x onerror='alert()'>";

// React automatically escapes:
<h1>{dealTitle}</h1>

// Rendered HTML:
<h1>&lt;img src=x onerror=&#39;alert()&#39;&gt;</h1>

// Browser displays: <img src=x onerror='alert()'>
// Browser does NOT execute the script
```

---

### 4. FRAUD & MANIPULATION

#### Threat: Creator Creates Fake Deals With Themselves

**Attack Vector:**
```
Single person (user_id=123):
  1. Create brand account (brand_id=456)
  2. Create campaign: "SWE needed, $5000"
  3. Switch to creator account
  4. Apply to campaign
  5. Accept application (as brand)
  6. Complete deal
  7. Get paid $5000
  8. Reputation increased
  9. Repeat 100x

Result:
  - User has artificially inflated reputation
  - User has stolen $500K
```

**Mitigation: Multiple Overlapping Fraud Gates**

```rust
pub async fn submit_application(
  req: HttpRequest,
  body: ApplicationRequest,
) -> impl Responder {
  let creator_id = extract_user_id(&req)?;
  let campaign = load_campaign(body.campaign_id).await?;

  // GATE 1: Persona limit
  let persona_count = count_personas(creator_id).await?;
  if persona_count > 3 {
    return HttpResponse::Forbidden()
      .json(json!({"error": "Max 3 personas per user"}));
  }

  // GATE 2: Phone hash deduplication
  let phone_hash = hash_phone(creator.phone);
  let other_accounts = find_users_by_phone(phone_hash).await?;
  if other_accounts.len() > 1 {
    return HttpResponse::Forbidden()
      .json(json!({"error": "Phone already used for another account"}));
  }

  // GATE 3: Collusion limit
  let deals_with_brand = count_deals_between(creator_id, campaign.brand_id).await?;
  if deals_with_brand >= 5 {
    return HttpResponse::Forbidden()
      .json(json!({"error": "Max 5 deals with same brand"}));
  }

  // GATE 4: Velocity detection
  let applications_today = count_applications_since(
    creator_id,
    Duration::from_secs(86400)
  ).await?;
  if applications_today > 20 {
    return HttpResponse::Forbidden()
      .json(json!({"error": "Too many applications today"}));
  }

  // GATE 5: IP address check
  let ip = extract_client_ip(&req);
  if is_ip_flagged(ip).await? {
    return HttpResponse::Forbidden()
      .json(json!({"error": "Suspicious IP address"}));
  }

  // All gates passed
  create_application(...).await?;
  HttpResponse::Ok().json(...)
}
```

**Why Multiple Gates?**

```
Single gate: Attacker bypasses it
  "OK, I'll use a different phone number"

Multiple gates:
  Gate 1: Phone dedup
    Attacker: "Use different phone"
    Gate 2: Persona limit
    Attacker: "OK, only 3 personas"
    Gate 3: Collusion limit
    Attacker: "OK, 5 deals max with each brand"
    Gate 4: Velocity detection
    Attacker: "OK, spread applications over 5 days"
    Gate 5: IP detection
    Attacker: "Now I need VPN rotating through 100s of IPs"

    To pass all 5 gates:
    - 3 phones
    - 5 days
    - 100s of IPs
    - Multiple Gmail addresses
    = Massively increases attacker cost
    = Not worth it for $5K

Attacker gives up.
```

#### Threat: Lowball Offers

**Attack Vector:**
```
Brand creates campaign: "Social media video, $1000"
Creator applies
Brand counter-offers: "$10" (lowball)
Creator can't tell if legitimate or harassment
```

**Mitigation: Lowball Detection**

```rust
pub async fn submit_counter_offer(
  req: HttpRequest,
  body: CounterOfferRequest,
) -> impl Responder {
  let offer = load_offer(body.offer_id).await?;

  // Check if offer is lowball (< 50% of original)
  let original_budget = load_campaign(offer.campaign_id).await?.budget;

  if body.amount < original_budget / 2 {
    // Not rejected, but flagged
    let flagged = create_counter_offer_flagged(
      offer_id,
      body.amount,
      "lowball_warning"
    ).await?;

    return HttpResponse::Ok().json(json!({
      "id": flagged.id,
      "warning": "This offer is significantly below the campaign budget. Brands have been warned that lowballs may result in account suspension."
    }));
  }

  // Normal offer
  create_counter_offer(...).await?;
  HttpResponse::Ok().json(...)
}
```

**Consequence: Admin Review**
```
If a brand makes 5+ lowball offers:
  - Flag account for review
  - Send warning: "Multiple lowball offers detected"
  - Risk: Account suspension if pattern continues

Deters: Harassment, bad-faith negotiation
```

---

### 5. DATA EXPOSURE & PRIVACY

#### Threat: Attacker Reads Other Users' Deal Negotiations

**Attack Vector:**
```
Deal negotiations are sensitive:
  - Budget (competitor intelligence)
  - Timeline (business schedule)
  - Brand secrets (product launches)

Attacker tries:
  GET /deals/456/room
  Authorization: Bearer [attacker's JWT]

Expected: 403 Forbidden (not a party to deal)
```

**Mitigation: Field-Level Access Control**

```rust
pub async fn get_deal_room(
  req: HttpRequest,
  deal_id: Path<i64>,
) -> impl Responder {
  let user_id = extract_user_id(&req)?;
  let deal = load_deal(deal_id).await?;

  // Verify user is a party to the deal
  if user_id != deal.creator_id && user_id != deal.brand_id {
    return HttpResponse::Forbidden()
      .json(json!({"error": "Not a party to this deal"}));
  }

  HttpResponse::Ok().json(deal)
}
```

**Additional: Encryption at Rest**

```
Sensitive deal negotiation text:
  - Encrypted in database (using AES-256)
  - Decrypted on read
  - Only if authorized

Even if attacker steals database backup:
  - Sees: encrypted_text = "aBcDeFgH..."
  - Cannot decrypt (doesn't have key)
```

#### Threat: PII (Personally Identifiable Information) Exposure

**Attack Vector:**
```
Phone numbers stored in plaintext:
  attackers_list = scraped_phone_numbers.txt

Attacker breaches database:
  database_backup.sql leaked
  Attacker: GREP phone_number
  Finds 500M phone numbers
  Sells to identity thieves
```

**Mitigation: Hash Phone Numbers**

```rust
// On login
let phone = user.phone;
let phone_hash = sha256(phone + SALT);

// Store in database
INSERT INTO users (id, phone_hash) VALUES (123, phone_hash);

// Later: Verify if same phone used (fraud detection)
let new_phone_hash = sha256(new_phone + SALT);
let existing = find_by_phone_hash(new_phone_hash).await?;
if existing.len() > 1 {
  "This phone is already registered";
}

// What attacker gets if database breached:
phone_hash = "a1b2c3d4e5f6..."
// Cannot reverse this to get original phone number
// SHA256 is one-way: phone → hash ✓, hash → phone ✗
```

---

### 6. DENIAL OF SERVICE (DoS)

#### Threat: Attacker Floods API With Requests

**Attack Vector:**
```
Attacker sends 1M requests/second to /api/search
  → Database gets slow
  → Legitimate users get 503 errors
  → Service unavailable
```

**Mitigation: Multi-Layer Rate Limiting**

```
LAYER 1: Global IP-based limit
  Max 10,000 requests/second from any single IP
  Exceeded: 429 "Too Many Requests"

LAYER 2: Per-user limit
  Free user: 100 req/sec
  Pro user: 1,000 req/sec
  Exceeded: 429 + "Upgrade to Pro"

LAYER 3: Per-endpoint limit
  /search: 10 req/sec (expensive database query)
  /campaign: 100 req/sec (cheap read-only)

LAYER 4: Circuit breaker (if service slow)
  If database latency > 1 second:
    Stop accepting new requests
    Return: 503 "Service temporarily unavailable"
    Prevents: Cascading failures
```

**Implementation (Rust/Actix-Web):**

```rust
use actix_governor::{Governor, KeyExtractor};

let governor = Governor::new(&RateLimitConfig::default()
  .per_second(2)
  .burst_size(10));

web::scope("/api")
  .wrap(governor)
  .route("/search", web::get().to(search_handler))
```

---

### 7. CRYPTOGRAPHY & SECRETS

#### Threat: API Keys Hardcoded in Source Code

**Attack Vector:**
```
Attacker clones GitHub repo:
  git clone valueskins-repo

Searches for hardcoded secrets:
  grep -r "STRIPE_KEY=" .
  grep -r "DATABASE_PASSWORD=" .

Finds:
  STRIPE_KEY="sk_live_abcd1234"
  DATABASE_URL="postgres://user:password@host/db"

Attacker:
  1. Uses stolen Stripe key to process fake payments
  2. Directly accesses database with stolen password
  3. Steals all user data
```

**Mitigation: Environment Variables**

```bash
# .env.example (checked into git)
STRIPE_KEY=<your-stripe-key>
DATABASE_PASSWORD=<your-password>

# .env (NOT checked into git)
STRIPE_KEY=sk_live_abcd1234
DATABASE_PASSWORD=actual_password

# .gitignore
.env
*.local
secrets/
```

**At Deploy Time:**
```
Kubernetes secrets (not in code):
  kubectl create secret generic stripe-keys \
    --from-literal=stripe_key=sk_live_abcd1234

Application reads:
  let stripe_key = env::var("STRIPE_KEY")?;
```

#### Threat: Passwords Stored in Plaintext

**Attack Vector:**
```
Database breached:
  SELECT id, username, password FROM users;

Attacker sees:
  123, alice, "mypassword123"
  456, bob, "secure_password"

Attacker tries password on other services:
  LinkedIn login: alice + "mypassword123" ✓ Works!
  Gmail: bob + "secure_password" ✓ Works!
```

**Mitigation: Password Hashing (bcrypt)**

```rust
// On signup
let password = "mypassword123";
let hashed = bcrypt::hash(password, 12)?;
// Result: "$2b$12$R9h/c.6W9bJzXqEGrEzCm..."

// Store hashed password
INSERT INTO users (id, password_hash) VALUES (123, hashed);

// On login
let input = "mypassword123";
let stored_hash = load_password_hash(user_id).await?;

if bcrypt::verify(input, &stored_hash)? {
  // Password matches
  issue_jwt()
} else {
  // Wrong password
  403 Forbidden
}

// If database breached:
// Attacker sees: "$2b$12$R9h/c.6W9bJzXqEGrEzCm..."
// Cannot reverse bcrypt (designed to be slow + irreversible)
// Would take 100+ years to brute force
```

---

### 8. REPLAY ATTACKS

#### Threat: Attacker Replays Old Request

**Attack Vector:**
```
Legitimate request (captured by attacker):
  POST /deal/123/accept HTTP/1.1
  Authorization: Bearer valid_jwt
  {"accept": true}

Attacker saves this request, plays it back 100x:
  POST /deal/123/accept HTTP/1.1
  Authorization: Bearer valid_jwt  (still valid for 1 hour)
  {"accept": true}

Result:
  Deal gets "accepted" 100 times (duplicate applications)
```

**Mitigation: Idempotency Keys**

```rust
// Client generates unique key
let idempotency_key = uuid::Uuid::new_v4();

POST /deal/123/accept HTTP/1.1
Authorization: Bearer valid_jwt
Idempotency-Key: a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6
{"accept": true}

// Server stores: idempotency_key → response
// First request: Creates acceptance, stores response
// Second identical request: Returns cached response (no duplicate)

// Table:
idempotency_keys:
  key: "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6"
  user_id: 123
  endpoint: "/deal/123/accept"
  response: {"success": true}
  created_at: NOW()
```

**Cleanup:**
```
Idempotency keys older than 24 hours: delete
Users can't replay requests after 24 hours anyway (JWT expires in 1 hour)
```

---

## SECURITY MONITORING & INCIDENT RESPONSE

### Real-Time Alerts

```
1. Error rate > 5% (indicates attack or bug)
2. Database slow queries (DoS attack)
3. High rate of 403 errors (privilege escalation attempt)
4. Login failures spike (brute force attack)
5. Unusual IP addresses (geographic anomaly)
6. Database connection exhaustion (resource exhaustion attack)
```

### Incident Response Plan

**If Password Database Breached:**
```
1. Force password reset for all users
2. Rotate API keys (Stripe, Instagram OAuth)
3. Enable two-factor authentication (2FA)
4. Notify all users (email + in-app)
5. Offer identity theft protection subscription
6. Post-mortem: What went wrong, how to prevent
```

**If API Credentials Leaked:**
```
1. Immediately rotate credentials (Stripe, AWS)
2. Review API usage for unauthorized transactions
3. Revert fraudulent transactions
4. Update .env and restart services
5. Enable IP whitelisting (if possible)
6. Add monitoring for credential usage
```

---

## SECURITY CHECKLIST FOR LAUNCH

- [ ] All endpoints require authentication (no public endpoints)
- [ ] All endpoints verify authorization (user owns resource)
- [ ] All database queries use parameterized statements
- [ ] No hardcoded secrets in code
- [ ] HTTPS enforced (no HTTP)
- [ ] Security headers set (CSP, HSTS, etc.)
- [ ] Rate limiting on all mutation endpoints
- [ ] Fraud gates implemented (multi-layer)
- [ ] Password hashing (bcrypt)
- [ ] Phone numbers hashed
- [ ] Sensitive data encrypted at rest
- [ ] Backup tested (can restore in <5 minutes)
- [ ] Error messages don't expose internals
- [ ] No SQL injection vectors (SQLx parameterized)
- [ ] No XSS vectors (HTML escaping + CSP)
- [ ] CORS correctly configured (not "*")
- [ ] JWT short-lived (1 hour)
- [ ] Refresh token rotation working
- [ ] Logout denylist implemented
- [ ] Monitoring & alerting for suspicious activity
- [ ] Incident response playbook written
- [ ] Security audit scheduled (annual)
- [ ] GDPR compliance verified
- [ ] Two-factor authentication available
- [ ] Account recovery mechanism (secure)
