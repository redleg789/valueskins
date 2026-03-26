# Meta Integration Guide — What Meta Needs to Add

This document outlines exactly what Meta needs to connect, implement, or provide
to take ValueSkins from demo to production. Everything on the ValueSkins side is
already built and waiting. This is purely Meta's checklist.

---

## 1. Authentication

**What's built:** Full auth service in Rust (`/backend/auth_service`). JWT token
management, session handling, Google OAuth scaffolding, httpOnly cookie delivery.
Frontend login UI exists.

**What Meta adds:**
- Instagram OAuth credentials (`INSTAGRAM_CLIENT_ID`, `INSTAGRAM_CLIENT_SECRET`)
- Facebook Login credentials (`FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`)
- Register ValueSkins as a Meta app at developers.facebook.com
- Provide OAuth redirect URI whitelist for production domain

**API scope required:**
```
instagram_basic
instagram_manage_insights
instagram_content_publish
pages_read_engagement
business_management
```

**One-line switch:**
```bash
# .env (production)
OAUTH_PROVIDER=meta
INSTAGRAM_CLIENT_ID=your_app_id
INSTAGRAM_CLIENT_SECRET=your_app_secret
```

---

## 2. Creator Audience Data

**What's built:** Full matching algorithm in `/frontend/src/lib/creatorMatching.ts`.
`CreatorDataProvider` interface is ready. MVP provider assumes all creators match.
Production provider is scaffolded and commented out, waiting for real API keys.

**What Meta adds:**
- Grant ValueSkins access to Instagram Graph API
- Grant access to Instagram Insights API (requires Business/Creator account)
- Provide long-lived access tokens per creator (with creator consent)

**API endpoints ValueSkins will call:**
```
GET /v19.0/{ig-user-id}/insights
  ?metric=audience_city,audience_country,audience_gender_age,audience_locale
  &period=lifetime

GET /v19.0/{ig-user-id}/media
  ?fields=like_count,comments_count,reach,impressions,engagement_rate
```

**Database tables to create (schema already defined in creatorMatching.ts):**
```sql
CREATE TABLE creator_audience_cache (
  creator_id     VARCHAR(255) PRIMARY KEY,
  data           JSONB NOT NULL,
  fetched_at     TIMESTAMP DEFAULT NOW(),
  ttl_hours      INT DEFAULT 24
);

CREATE TABLE creator_metrics_cache (
  creator_id     VARCHAR(255) PRIMARY KEY,
  data           JSONB NOT NULL,
  fetched_at     TIMESTAMP DEFAULT NOW(),
  ttl_hours      INT DEFAULT 6
);

CREATE TABLE brand_safety_audits (
  creator_id     VARCHAR(255) PRIMARY KEY,
  score          INT NOT NULL CHECK (score >= 0 AND score <= 100),
  flags          JSONB DEFAULT '[]',
  audited_at     TIMESTAMP DEFAULT NOW()
);
```

**One-line switch:**
```typescript
// In app initialization
import { setCreatorDataProvider, MetaCreatorDataProvider } from '@/lib/creatorMatching';
setCreatorDataProvider(new MetaCreatorDataProvider({ metaAppId, metaAppSecret, dbPool }));
```

---

## 3. Payment & Escrow

**What's built:** Full escrow service in Rust (`/backend/payment_service`). Audit
logging, idempotency keys, milestone release logic (30/40/30 split), dispute
handling, payout calculation. All the business logic is done. Zero payment
processor is hardcoded — it's entirely abstracted behind a `PaymentProcessor`
trait.

**What Meta adds:**
- Choose payment processor: Meta Pay, Stripe, Razorpay, or any provider
- Implement the `PaymentProcessor` trait (one Rust file, ~150 lines)
- Provide API keys for chosen processor

**The trait Meta implements:**
```rust
// backend/payment_service/src/processor.rs (already exists as interface)
pub trait PaymentProcessor: Send + Sync {
    async fn create_payment_intent(&self, amount_usd: u64, metadata: PaymentMetadata) -> Result<PaymentIntent>;
    async fn capture_payment(&self, intent_id: &str) -> Result<PaymentReceipt>;
    async fn release_to_creator(&self, creator_id: &str, amount_usd: u64) -> Result<Payout>;
    async fn refund(&self, intent_id: &str, reason: RefundReason) -> Result<Refund>;
    async fn handle_dispute(&self, dispute: Dispute) -> Result<DisputeResolution>;
}
```

**One-line switch:**
```rust
// main.rs
let processor = MetaPayProcessor::new(meta_pay_config);
// or
let processor = StripeProcessor::new(stripe_secret_key);

App::new().app_data(web::Data::new(processor))
```

---

## 4. Database

**What's built:** Full PostgreSQL schema with 48 migrations
(`/backend/migrations`). All tables defined: users, creators, opportunities,
deals, messages, payments, audit_logs, reputation_scores, notifications, etc.

**What Meta adds:**
- Provision a PostgreSQL instance (RDS, Cloud SQL, or Neon)
- Set `DATABASE_URL` environment variable
- Run migrations: `sqlx migrate run`

**That's it.** All schema is ready. No design work needed.

```bash
DATABASE_URL=postgresql://user:password@host:5432/valueskins
sqlx migrate run --database-url $DATABASE_URL
```

---

## 5. Media Storage

**What's built:** Storage service scaffolded (`/backend/storage_service`).
Presigned URL generation logic exists. Frontend upload UI exists with Instagram
reel URL validation.

**What Meta adds:**
- S3-compatible storage (AWS S3, Cloudflare R2, or Meta's own storage)
- Bucket credentials: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`
- Optional: CDN in front of bucket for fast delivery

```bash
S3_BUCKET=valueskins-media
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

---

## 6. Email Notifications

**What's built:** Notification service in Rust (`/backend/notification_service`).
Email templates defined. Trigger points implemented (deal offer, counter-offer,
accepted, payment released, etc). SendGrid client scaffolded.

**What Meta adds:**
- SendGrid account or Meta's internal email service
- `SENDGRID_API_KEY` environment variable
- Verify sender domain (SPF, DKIM)

```bash
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@valueskins.com
```

---

## 7. Real-Time Messaging

**What's built:** Firebase Realtime Database already connected and working for
chat. All messages sync in real-time between creator and brand.

**What Meta adds (optional upgrade):**
- If Meta wants to replace Firebase with their own infra: implement WebSocket
  server using the existing `useFirebaseRoom` interface in
  `/frontend/src/lib/useFirebaseRoom.ts`
- The interface is clean — swap Firebase calls for WebSocket calls, zero UI changes

**Firebase config (already working, Meta can keep or replace):**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...
```

---

## 8. Content Publishing (Future)

**What Meta enables (not needed for MVP):**
- Instagram Content Publishing API — allow ValueSkins to verify creator posts
- Webhook subscriptions for post published events
- Content performance tracking post-deal

**API endpoint:**
```
POST /v19.0/{ig-user-id}/media  → create container
POST /v19.0/{ig-user-id}/media_publish  → publish
```

Webhook handler stub already exists in `/backend/api_gateway/src/handlers/`.

---

## 9. Environment Variables — Complete List

All variables ValueSkins backend needs. Meta provides everything below `---`.

**Already set (ValueSkins side):**
```bash
APP_ENV=production
ALLOWED_ORIGINS=https://valueskins.com
JWT_SECRET=<32+ char secret>
```

**Meta provides:**
```bash
# Database
DATABASE_URL=postgresql://...

# Meta / Instagram OAuth
INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

# Payment (choose one processor)
STRIPE_SECRET_KEY=sk_live_...          # if using Stripe
META_PAY_MERCHANT_ID=                  # if using Meta Pay
RAZORPAY_KEY_ID=                       # if using Razorpay (India)

# Storage
S3_BUCKET=
S3_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Email
SENDGRID_API_KEY=

# Firebase (already working, optional to replace)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Instagram Graph API (for creator audience data)
META_APP_ID=
META_APP_SECRET=
```

---

## 10. Deployment

**What's built:** Dockerfile in `/backend/Dockerfile`. Kubernetes configs in
`/kubernetes/`. Infrastructure specs in `/infrastructure/`.

**What Meta adds:**
- Container registry (ECR, GCR, or Meta's internal registry)
- Kubernetes cluster or equivalent (EKS, GKE, internal)
- CI/CD pipeline pointing at the existing Dockerfile
- SSL certificate for production domain

**Deploy in one command:**
```bash
docker build -t valueskins-backend ./backend
docker push <registry>/valueskins-backend:latest
kubectl apply -f kubernetes/
```

---

## Summary

| Component | ValueSkins Status | Meta Action Required |
|---|---|---|
| Auth service | ✅ Built | Provide Instagram/FB OAuth credentials |
| Deal workflow | ✅ Complete, locked | Nothing |
| Creator matching | ✅ Algorithm ready | Provide Graph API access + DB |
| Payment escrow | ✅ Logic built | Choose processor, implement trait |
| Database schema | ✅ 48 migrations ready | Provision PostgreSQL, run migrations |
| Media storage | ✅ Scaffolded | Provide S3 credentials |
| Email notifications | ✅ Templates ready | Provide SendGrid key |
| Real-time chat | ✅ Working (Firebase) | Keep or replace with own infra |
| Content publishing | 🔲 Stub exists | Provide Content Publishing API access |
| Deployment | ✅ Dockerfile + K8s ready | Provide cluster + registry |

**Estimated Meta engineering effort: 1-2 weeks for a single backend engineer.**
All business logic, deal workflow, UI, and architecture is done.
Meta only connects credentials and provisions infrastructure.
