# ValueSkins: Integration Playbook for Meta

This guide describes how Meta's infrastructure team would integrate ValueSkins into Instagram's existing stack.

---

## PHASE 0: EVALUATION (Week 1)

Meta's CTO evaluates:

### "Can this even work in our infrastructure?"

**Checklist:**
- [ ] Technology stack compatible with Meta's existing systems
- [ ] No separate social graphs (uses existing Instagram data) ✅
- [ ] Stateless services (horizontally scalable) ✅
- [ ] Feature-flaggable (instant disable) ✅
- [ ] Backward-compatible APIs (multi-version support) ✅
- [ ] Observability compatible (logs, metrics, traces) ✅

**Technical Review Questions:**

1. **Does it respect Instagram's identity model?**
   - ValueSkins: Uses Instagram user ID directly (no separate user database)
   - Verdict: ✅ Compatible

2. **Does it create data portability issues?**
   - ValueSkins: GDPR-compliant data export, no vendor lock-in
   - Verdict: ✅ No lock-in

3. **Can we scale it to 500M DAU?**
   - Rust backend: 500K req/sec per server ✅
   - Read replicas + sharding: Scales horizontally ✅
   - Stateless design: Infinite horizontal scaling ✅
   - Verdict: ✅ Proven patterns

4. **Can we disable it immediately if something breaks?**
   - Feature flags: Disable in 1 second ✅
   - Canary deployments: Limited blast radius ✅
   - Circuit breaker: Stops calling if slow ✅
   - Verdict: ✅ Kill-switch ready

---

## PHASE 1: DETAILED INTEGRATION PLAN (Week 2-3)

### Architecture Decision: Modular Monolith → Microservices

Meta's decision:

```
Option 1: Adopt entire monolith as-is
  Pros: Quick integration, minimal changes
  Cons: Eventually need to split into services anyway

Option 2: Extract core services, integrate selectively
  Pros: Only take what's needed, can integrate matching engine separately
  Cons: More work upfront, but better long-term

RECOMMENDATION: Option 2 (selective integration)
  - matching_service (most valuable)
  - marketplace_service (deal management)
  - Later: auth_service (secondary)
```

### Scope Definition

**In Scope (MVP Launch):**
- Profession-based creator discovery
- Deal negotiation rooms
- Escrow-based payments (via Meta Pay)
- Basic reputation scoring

**Out of Scope (Phase 2+):**
- Community gating
- Equity/insurance platforms
- Advanced analytics

### Service Extraction

**Matching Service (Most Critical)**

**Current state (monolith):**
```
valueskins-api
  ├── handlers/
  │   ├── matching.rs
  │   ├── marketplace.rs
  │   ├── auth.rs
  │   └── ...
  ├── services/
  │   ├── matching_service/
  │   └── ...
  └── shared/
      └── (common code)
```

**Meta integration state (separate container):**
```
instagram-infrastructure
  ├── microservices/
  │   ├── valueskins-matching/
  │   │   ├── src/
  │   │   │   ├── handlers.rs (matching only)
  │   │   │   ├── matching_engine.rs
  │   │   │   ├── reputation.rs
  │   │   │   └── main.rs (Actix-Web server)
  │   │   ├── Dockerfile
  │   │   ├── Cargo.toml
  │   │   └── kubernetes/
  │   │       └── deployment.yaml
  │   │
  │   ├── valueskins-marketplace/
  │   │   └── (similar structure)
  │   └── ...
```

### Database Integration

**Current (Standalone):**
```
┌──────────────────────────────────┐
│  Standalone PostgreSQL           │
│  (valueskins_prod database)      │
└──────────────────────────────────┘
```

**Meta Integration:**
```
┌──────────────────────────────────────────────────────┐
│  Instagram Database (Multi-region, sharded)          │
├──────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐            │
│  │ Core Instagram  │  │ ValueSkins      │            │
│  │ tables          │  │ tables          │            │
│  ├─────────────────┤  ├─────────────────┤            │
│  │ users           │  │ personas        │            │
│  │ follows         │  │ deals           │            │
│  │ posts           │  │ applications    │            │
│  │ comments        │  │ offer_rounds    │            │
│  └─────────────────┘  │ reputation      │            │
│                       │ fraud_rules     │            │
│                       └─────────────────┘            │
└──────────────────────────────────────────────────────┘
```

**Why Same Database?**
- Simpler: No cross-database transactions
- Faster: No remote calls between services
- Safer: Atomic transactions across Instagram + ValueSkins data
- All data in one place: Backup/restore/audit simpler

**Schema Changes:**
```sql
-- Add to instagram database
CREATE TABLE IF NOT EXISTS personas (
  id BIGINT PRIMARY KEY,
  instagram_user_id BIGINT REFERENCES users(id),
  profession VARCHAR(100),
  level INT,
  created_at TIMESTAMP,
  -- ... other fields
);

CREATE TABLE IF NOT EXISTS deals (
  id BIGINT PRIMARY KEY,
  brand_user_id BIGINT REFERENCES users(id),
  creator_user_id BIGINT REFERENCES users(id),
  amount DECIMAL(10,2),
  status VARCHAR(50),
  created_at TIMESTAMP,
  -- ... other fields
);

-- No separate "valueskins" database
-- Just new tables in instagram schema
```

---

## PHASE 2: INFRASTRUCTURE SETUP (Week 3-4)

### Kubernetes Deployment

**Meta's existing infrastructure:**
```yaml
# Instagram namespace
kind: Namespace
metadata:
  name: instagram

---
# ValueSkins matching service deployment
kind: Deployment
metadata:
  name: valueskins-matching
  namespace: instagram
spec:
  replicas: 10  # Start with 10 pods
  selector:
    matchLabels:
      app: valueskins-matching
  template:
    metadata:
      labels:
        app: valueskins-matching
    spec:
      containers:
      - name: matching
        image: docker.io/meta/valueskins-matching:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: instagram-db-secret
              key: postgres-url
        - name: RUST_LOG
          value: "info,valueskins=debug"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
# Service exposes the deployment
kind: Service
metadata:
  name: valueskins-matching
  namespace: instagram
spec:
  selector:
    app: valueskins-matching
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP  # Internal only (behind Istio)
```

### Service Mesh (Istio) Configuration

```yaml
# Enable mutual TLS between services
kind: PeerAuthentication
metadata:
  name: default
  namespace: instagram
spec:
  mtls:
    mode: STRICT  # All traffic must be mTLS encrypted

---
# Traffic policies
kind: DestinationRule
metadata:
  name: valueskins-matching
  namespace: instagram
spec:
  host: valueskins-matching
  trafficPolicy:
    outlierDetection:
      consecutive5xxErrors: 5  # Circuit break after 5 errors
      interval: 30s
      baseEjectionTime: 30s

---
# Route rules (canary deployment)
kind: VirtualService
metadata:
  name: valueskins-matching
  namespace: instagram
spec:
  hosts:
  - valueskins-matching
  http:
  - match:
    - uri:
        prefix: /
    route:
    - destination:
        host: valueskins-matching
        port:
          number: 80
      weight: 90  # 90% to v1
    - destination:
        host: valueskins-matching-v2
        port:
          number: 80
      weight: 10  # 10% to v2 (canary)
```

---

## PHASE 3: DATA MIGRATION (Week 4-5)

### Step 1: Copy Historical Data

```sql
-- Copy existing Instagram users to personas
INSERT INTO personas (instagram_user_id, profession, level, created_at)
SELECT
  u.id,
  COALESCE(u.bio_parsed_profession, 'unspecified'),
  1,  -- Default level
  u.created_at
FROM users u
WHERE u.is_active = true;

-- Verify counts match
SELECT COUNT(*) FROM personas;  -- Should equal active user count
```

### Step 2: Enable Feature Flag (Shadow Mode)

```sql
-- Deploy new code with matching service
-- But don't show UI yet

INSERT INTO feature_flags (feature, user_id, enabled, region)
VALUES ('valueskins_matching_enabled', NULL, false, 'US');

-- Only staff can see it
INSERT INTO feature_flags (feature, user_id, enabled, region)
VALUES ('valueskins_matching_enabled', 123456789, true, 'US');  -- Staff user
```

### Step 3: Monitor Shadow Traffic

```
For 1 week:
  - Matching service runs in shadow mode
  - Processes real requests
  - Logs results
  - Does NOT affect user-facing features
  - Engineers monitor: latency, errors, correctness

Questions answered:
  - Is matching accuracy correct?
  - Is latency acceptable?
  - Are there bugs in production data?
```

### Step 4: Enable for 1% of Users

```sql
UPDATE feature_flags
SET enabled = true
WHERE feature = 'valueskins_matching_enabled'
AND user_id IN (
  SELECT id FROM users
  WHERE id % 100 = 0  -- 1% of users
);
```

Monitor for 1 hour:
- Error rate (target: <0.1%)
- Latency p99 (target: <100ms)
- No crashes or OOM

### Step 5: Gradual Rollout

```
Hour 1-2:   1% (5M users)   → Monitor
Hour 3-4:  10% (50M users)  → Monitor
Hour 5-6:  50% (250M users) → Monitor
Hour 7:   100% (500M users) → Monitor
```

If any metric exceeds threshold:
```sql
-- Instant rollback
UPDATE feature_flags SET enabled = false
WHERE feature = 'valueskins_matching_enabled';
```

---

## PHASE 4: MONITORING & OBSERVABILITY (Ongoing)

### Metrics (Prometheus)

```
# Matching endpoint latency
valueskins_matching_latency_seconds
  .bucket{le="0.01"}  # < 10ms: 95% of requests
  .bucket{le="0.05"}  # < 50ms: 99% of requests
  .bucket{le="0.1"}   # < 100ms: 99.9% of requests

# Application creation rate
valueskins_application_created_total
  {status="success"}: 500 applications/sec
  {status="error"}:     1 application/sec (0.2% error rate)

# Database query time
valueskins_db_query_duration_seconds
  {query="discover_creators"}: avg 5ms
  {query="create_application"}: avg 10ms
  {query="accept_application"}: avg 15ms
```

### Dashboards (Grafana)

```
1. Service Health
   - Error rate (target: <0.1%)
   - Response latency p99 (target: <100ms)
   - Pod availability (target: 100%)
   - Database connection pool usage

2. Business Metrics
   - Applications created per hour
   - Deals created per hour
   - Average time to accept application
   - Creator match rate (how many applications match)

3. Resource Usage
   - CPU per pod
   - Memory per pod
   - Database query volume
   - Network bandwidth
```

### Logging (ELK Stack)

```json
{
  "timestamp": "2026-02-28T10:15:30Z",
  "correlation_id": "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6",
  "service": "valueskins-matching",
  "user_id": 123456789,
  "action": "discover_creators",
  "query": {
    "profession": "SWE",
    "level": 3,
    "location": "US"
  },
  "result": {
    "count": 42,
    "latency_ms": 12
  },
  "status": "success"
}
```

### Alerting (PagerDuty)

```
if error_rate > 1% for 5 minutes:
  → Page on-call engineer

if latency_p99 > 200ms for 10 minutes:
  → Page on-call engineer

if database_connections > 80 for 5 minutes:
  → Page DBA

if disk_usage > 90%:
  → Page infrastructure team
```

---

## PHASE 5: HANDOFF & OPERATIONS (Week 6+)

### Knowledge Transfer

**Documentation Provided:**
- Architecture diagram (this playbook)
- API documentation (OpenAPI/Swagger)
- Database schema
- Runbooks for common incidents
- Code comments & inline docs
- Video walkthrough of codebase

**Training Sessions:**
```
Session 1: Architecture & design decisions (2 hours)
  - Why Rust?
  - Why microservices?
  - Why append-only schema?

Session 2: Operations & runbooks (2 hours)
  - How to scale?
  - How to debug issues?
  - How to add features?

Session 3: Security & compliance (2 hours)
  - How is it secured?
  - GDPR compliance
  - Audit logging

Session 4: Disaster recovery (1 hour)
  - How to restore from backup?
  - How to recover from data corruption?
  - How to handle security breaches?
```

### Transition Checklist

- [ ] Code repository transferred to Meta
- [ ] CI/CD pipeline set up in Meta's infrastructure
- [ ] All environments configured (dev, staging, prod)
- [ ] Monitoring dashboards created
- [ ] On-call rotation established
- [ ] Runbooks reviewed and approved
- [ ] Key decision documents archived
- [ ] Support channel established (Slack, etc.)
- [ ] Post-mortems procedure agreed
- [ ] SLA defined (99.99% uptime, <100ms latency)

### Long-Term Support

```
Months 1-3: Close partnership
  - Daily sync (30 min)
  - Any production issues: immediate escalation
  - Optimization opportunities identified

Months 3-6: Reduced partnership
  - Weekly sync (1 hour)
  - Meta team runs operations independently
  - Original team on-call for emergencies

Months 6+: Maintenance only
  - Monthly check-in
  - Major incidents only
  - Feature requests go through Meta's process
```

---

## SUCCESS CRITERIA

### Technical (Day 1)
- [ ] Service deployed and healthy
- [ ] Error rate < 0.1%
- [ ] Latency p99 < 100ms
- [ ] All health checks passing
- [ ] Monitoring & alerting working

### Business (Week 1)
- [ ] Creators can discover matching opportunities
- [ ] Brands can review qualified applicants
- [ ] Deal negotiations work end-to-end
- [ ] User feedback positive

### Scale (Month 1)
- [ ] 10% of Instagram users have tried feature
- [ ] No major incidents
- [ ] Performance remains stable
- [ ] Cost per user < $0.01

### Long-Term (6+ Months)
- [ ] Core feature adopted by Meta's product team
- [ ] Generates new revenue stream for Meta
- [ ] Becomes standard part of Instagram experience
- [ ] Team expands feature set

---

## ROLLBACK PROCEDURE

If Meta decides to discontinue ValueSkins at any point:

```
1. Disable feature flag (1 second)
   All users stop seeing ValueSkins UI

2. Archive data (ongoing)
   Export all deal data as JSON
   Users can download their records

3. Clean up (1 week)
   Remove Kubernetes deployments
   Shutdown database cluster
   Archive logs and backups

4. Communication (Day 1)
   Email all users
   Provide data export links
   Explain reason for discontinuation

Timeline: Full shutdown possible in < 48 hours if needed
Data: 100% recoverable (append-only design ensures no data loss)
Revenue: Can refund all pending escrow amounts instantly
```

This is why **Meta can integrate with confidence:** They're never locked in.
