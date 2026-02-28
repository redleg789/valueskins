# ValueSkins: Scaling from 0 to 500M DAU

This guide describes exactly how to evolve ValueSkins infrastructure as user base grows, when bottlenecks appear, and what to optimize at each stage.

---

## STAGE 1: LAUNCH (0 → 10K DAU)

### Infrastructure
```
┌─────────────────────────────────┐
│  Frontend (Vercel)              │
│  ~$0/month (free tier)          │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│  API Gateway (Rust, 1 server)   │
│  1 × t3.xlarge ($150/month)     │
│  Handles 500K req/sec capacity  │
│  (actual: ~10K req/sec usage)   │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│  PostgreSQL (1 primary)         │
│  1 × db.t3.xlarge ($400/month)  │
│  Single availability zone       │
│  Automated backups to S3        │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│  Redis (cache + sessions)       │
│  1 × cache.t3.small ($50/month) │
└─────────────────────────────────┘

MONTHLY COST: ~$600
CAPACITY: 10K-50K DAU comfortably
RISK: Single point of failure (database)
```

### Performance Profile
```
Response time (p99): <50ms
Database queries: <10ms (small dataset)
Zero cache hits needed (data small enough)
```

### What You Monitor
```
1. Error rate (target: <0.1%)
2. Database connection count (target: <20 of 100 available)
3. API response time p99 (target: <100ms)
4. PostgreSQL slow queries (target: none >100ms)
5. Disk usage (target: <50% of allocated)
```

### When to Worry
```
ERROR RATE > 1%
  → Check logs for pattern
  → Common: database connection timeout
  → Fix: add connection pool capacity

P99 LATENCY > 200ms
  → Run: EXPLAIN ANALYZE on slow queries
  → Add missing indexes
  → Common: unindexed WHERE clauses

DISK USAGE > 80%
  → Increase EBS volume size
  → Check for log bloat (clean up old logs)
```

---

## STAGE 2: EARLY GROWTH (10K → 100K DAU)

### What Changed
- **DAU increased 10x**
- Database queries now visible in metrics (weren't noticeable before)
- Single server still has capacity, but creeping toward limits
- Customers expect uptime (not just availability)

### Infrastructure Changes

**ADD: Read Replica**
```
┌─────────────────────────────────┐
│  API Gateway (1 server)         │
│  Still handles 10K req/sec      │
└─────────────────────────────────┘
       ↙ (reads)      ↖ (writes)
┌──────────────────┐  ┌──────────────────┐
│  PostgreSQL      │  │  PostgreSQL      │
│  Primary (RW)    │  │  Replica (R)     │
│  +Multi-AZ       │  │  +Streaming repl │
└──────────────────┘  └──────────────────┘
   (backups)
   (transactions)
```

```
ADDED COST: +$400/month (replica)
NEW TOTAL: ~$1,000/month
CAPACITY: 100K-500K DAU comfortably
RISK REDUCTION: Database failure has RTO of 30 seconds
```

**UPDATE: Enable Point-in-Time Recovery (PITR)**
```
PostgreSQL Write-Ahead Log (WAL) shipped to S3 every 60 seconds
Can restore to any second in past 7 days
Cost: ~$50/month (S3 WAL storage)
```

**UPDATE: Configure Automated Backups**
```
Daily snapshots (keep 30 days)
Stored in different region
Can restore full database in 5 minutes
Cost: ~$20/month (S3 backup storage)
```

### Database Changes

**Add Indexes on Hot Columns**
```sql
-- Creators searching for campaigns
CREATE INDEX ON opportunities(profession_id, level_required, created_at DESC);

-- Brands reviewing applications
CREATE INDEX ON applications(opportunity_id, status, created_at DESC);

-- Matching engine queries
CREATE INDEX ON persona_professions(user_id, profession_id);
```

**Set Up Connection Pooling**
```
Before: Each request creates new connection (slow)
After: Pool of 20 connections reused
Result: <1ms per request (vs 10ms creating new connection)
```

### What You Monitor Now
```
Database replication lag (target: <1 second)
Read vs write split (target: 80/20)
Slow query log (target: zero queries >100ms)
Cache hit rate (target: >50% for creator profiles)
Transaction abort rate (target: <0.1%)
```

### Common Problems & Fixes

**Problem: Replication lag is 5+ seconds**
```
Symptom: Users create campaign, creator doesn't see it for 5 seconds
Root cause: Heavy transactions (deal payout) blocking WAL replication
Fix:
  1. Reduce transaction duration (break into smaller txns)
  2. Use read_committed isolation (not serializable) where possible
  3. Add more CPU to replica
```

**Problem: Connection pool exhausted**
```
Symptom: 503 errors "cannot acquire connection"
Root cause: Long-running transactions holding connections
Fix:
  1. Add statement timeout (5 seconds)
  2. Kill long queries
  3. Increase pool size (but investigate why needed)
```

**Problem: One table bloating (50GB, mostly dead rows)**
```
Symptom: Slow sequential scans, disk full
Root cause: High UPDATE/DELETE volume without VACUUM
Fix:
  1. Run VACUUM ANALYZE
  2. Enable autovacuum (should be default)
  3. Partition large tables by user_id
```

---

## STAGE 3: SCALING (100K → 1M DAU)

### Critical Threshold Crossed
- **Single server no longer handles write volume**
- Database primary becoming bottleneck
- Need to think about sharding/partitioning
- Operational complexity jumps significantly

### Infrastructure Changes

**ADD: Second API Server**
```
┌────────────────────────────────────────┐
│  Load Balancer (ALB)                   │
│  Distributes 50K req/sec               │
└────────────────────────────────────────┘
         ↙           ↖
┌─────────────────┐  ┌─────────────────┐
│ API Server 1    │  │ API Server 2    │
│ t3.xlarge       │  │ t3.xlarge       │
└─────────────────┘  └─────────────────┘
         ↘           ↙
┌────────────────────────────────────────┐
│  PostgreSQL Primary (RW)               │
│  r5.2xlarge (more CPU/memory)          │
│  Can now handle 50K write req/sec      │
└────────────────────────────────────────┘
         ↓  ↓  ↓
┌──────────────────────────────────────┐
│  3x Read Replicas (same region + 1   │
│  replica in different region)        │
└──────────────────────────────────────┘
```

**ADD: Kubernetes for Orchestration**
```
Instead of manually managing servers:
  - Use EKS (Elastic Kubernetes Service)
  - API services auto-scale based on CPU/memory
  - Rolling deployments (0 downtime)
  - Health checks auto-restart failed pods
```

**ADD: Service Mesh (Istio)**
```
Between services:
  - Automatic mTLS (encrypted service-to-service)
  - Retry logic built-in
  - Circuit breaker (stop calling failing services)
  - Traffic splitting for canary deployments
  - Request tracing (see request flow across services)
```

**ADD: Multi-Region**
```
Primary: us-east-1
  - Serving 100M users
  - Primary database

Secondary: us-west-2
  - Read-only replica
  - Serves <5% of traffic (for latency)
  - Can be promoted to primary if us-east-1 fails
```

### Database Schema: Start Sharding Planning

**Current (single database):**
```sql
SELECT applications.* FROM applications
WHERE campaign_id = 123;
-- Works fine: 100M rows, query < 10ms
```

**Prepare for sharding (add shard key to queries):**
```sql
SELECT applications.* FROM applications
WHERE campaign_id = 123
AND user_id = $1;  -- Add user_id filter
-- When sharded: user_id determines which database
```

**Cost Summary**
```
Old: 1 server + 1 replica + cache = $1,500/month
New: 2 servers + 4 replicas + K8s + cache + monitoring = $8,000/month

But: Now handles 100x traffic
Cost per user: $1,500 / 10K DAU = $0.15/DAU → $8,000 / 1M DAU = $0.008/DAU
(80% cheaper per user at scale)
```

### New Monitoring Requirements

```
Pod CPU/memory usage (target: <70%)
Kubernetes node health (target: all healthy)
Service mesh error rate (target: <0.5%)
Database query latency percentiles (p50/p95/p99)
Replication lag per replica (target: <500ms)
Cache hit rate by service (target: >60%)
```

---

## STAGE 4: MASSIVE SCALE (1M → 100M DAU)

### Architecture Fundamentally Changes

**Database Sharding is Now Required**

Before: Single database
```
users table: 100M rows
applications table: 5B rows
deals table: 1B rows
← All in one database
```

After: Sharded database
```
SHARD 0 (user_id % 8 = 0):
  users: 12.5M rows
  applications: 625M rows
  deals: 125M rows

SHARD 1 (user_id % 8 = 1):
  users: 12.5M rows
  applications: 625M rows
  deals: 125M rows

... (8 shards total)
```

**Implementation:**
```rust
// In matching_service
fn get_shard(user_id: i64) -> usize {
  (user_id % 8) as usize  // Routes to shard 0-7
}

let shard_num = get_shard(creator_id);
let database_url = format!(
  "postgres://user:pass@shard-{}.valueskins.internal/db",
  shard_num
);
let pool = create_pool(&database_url).await;

// Now: query only hits 1 database (1/8th the data)
let results = pool.query("SELECT * FROM applications WHERE creator_id = $1", [creator_id]).await;
```

**Cross-Shard Queries (Dangerous)**

Problem: Find all creators with profession "SWE"
```sql
-- Naive approach: query all shards, merge results
SELECT * FROM creators WHERE profession = "SWE";
-- Must hit all 8 shards in parallel
-- Latency = slowest shard response
-- At 100M users: 8 databases queried = 8x slower
```

Solution: Pre-compute or use different pattern
```sql
-- Option 1: Denormalized index table
-- Kept in a single "lookup" database
CREATE TABLE profession_index (
  profession TEXT,
  creator_id BIGINT,
  PRIMARY KEY (profession, creator_id)
);
-- Single database lookup: all SWEs instantly

-- Option 2: Elasticsearch
-- Index all creators by profession
-- Single ES cluster: find SWEs in <10ms
```

### Infrastructure at 100M DAU

```
Load Balancer (Global)
    ↓
Regional Load Balancers (4 regions)
    ↓
Kubernetes Clusters (1 per region, 100 pods each)
    ↓
Service Mesh (Istio)
    ↓
Microservices (24 independent services)
    ↓
Database Layer:
  - 8 shards × 4 replicas = 32 databases
  - Elasticsearch cluster (profession index)
  - Redis cluster (cache)
  - Kafka cluster (event streaming)

Monitoring Layer:
  - Prometheus (metrics)
  - Grafana (dashboards)
  - Datadog/Splunk (log aggregation)
  - PagerDuty (incident response)
```

**Cost: ~$500K/month infrastructure**

---

## STAGE 5: INSTAGRAM SCALE (100M → 500M DAU)

### What Changes at 500M?

**Everything becomes about "leverage."**

At 10K DAU: one engineer can debug an issue
At 100M DAU: need on-call rotation, automation, monitoring
At 500M DAU: need automatic remediation (fix issues without human)

### Patterns That Become Critical

**1. Circuit Breaker Maturity**
```rust
// If fraud_service is slow, stop calling it
let result = circuit_breaker
  .call(|| fraud_service.check_application(app))
  .await;

// After 5 failures:
//   STOP calling fraud_service
//   Return cached result (default to "accept")
// Users don't experience latency spike from one slow service
```

**2. Chaos Engineering**
```
Every week:
  1. Randomly kill a pod
  2. Randomly fail database queries (5% error rate)
  3. Randomly delay responses (add 500ms latency)
  4. Randomly partition network (AZ offline)

System must auto-heal and continue serving
If not: incident during testing (not production)
```

**3. Data Consistency Guarantees**
```
At 500K req/sec across 8 shards:
  - Replication lag possible
  - Creator sees stale reputation score
  - Brand sees old application list

Solution: Accept eventual consistency with bounded staleness
  - Creator page: "Reputation updated every 30 seconds"
  - Application list: "Refreshing..."
  - User expects slight delay (acceptable)
```

**4. Quota & Rate Limiting Per User**
```
Before: Global rate limit (100 req/sec to all endpoints)
After: Per-user limits
  - Free tier: 100 req/sec
  - Pro tier: 1000 req/sec
  - Enterprise: unlimited

Implementation: Token bucket per user
  - 100 tokens per second (free user)
  - Each request = 1 token
  - At 120 req/sec: requests start queuing
  - Fair queuing: user doesn't take down system
```

### Financial Model at Scale

```
MONTHLY COSTS (500M DAU):

Infrastructure:
  Kubernetes + compute:         $200K
  Database (sharded):            $150K
  Cache/Search:                   $50K
  Data transfer:                  $80K
  Monitoring/Observability:       $40K
  ──────────────────────────────────
  TOTAL:                         $520K/month

REVENUE (at Meta scale):
  15% commission on all deals
  Average deal: $500
  50% of DAU make 1 deal/month: 250M deals/month
  Commission: $250M × 0.15 = $37.5M/month

  Minus infrastructure: $37.5M - $0.52M = $37M profit/month
```

At this scale, **every 1% efficiency gain = $375K/month saved.**

---

## CRITICAL OPERATIONS

### When Database Gets Slow (p99 > 500ms)

**Step 1: Identify The Problem (30 seconds)**
```sql
-- Show slowest queries
SELECT query, calls, mean_time, max_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;

-- Common culprits:
-- 1. Missing index on WHERE clause
-- 2. N+1 query problem (query inside loop)
-- 3. Cartesian product (forgot JOIN condition)
-- 4. Full table scan (WHERE on unindexed column)
```

**Step 2: Fix the Query (5 minutes)**
```sql
-- Before: 500ms
SELECT * FROM users u
WHERE u.profession = 'SWE'
ORDER BY u.created_at;
-- Missing index on profession

-- After: 5ms
CREATE INDEX ON users(profession, created_at);
SELECT * FROM users u
WHERE u.profession = 'SWE'
ORDER BY u.created_at;
```

**Step 3: Monitor That It Stays Fixed (ongoing)**
```
Add alert: if profession_index query > 50ms, page on-call
Add dashboard: profession query latency over time
Weekly review: are query times stable?
```

### When Disk Fills Up (>90%)

**Immediate (5 minutes)**
```
1. Identify largest tables
   SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
   FROM pg_tables
   ORDER BY pg_total_relation_size DESC;

2. Most likely: audit_log or analytics tables

3. Archive old data
   DELETE FROM audit_log WHERE created_at < (NOW() - INTERVAL '1 year');

4. Run VACUUM
   VACUUM ANALYZE;

5. Add capacity
   Increase EBS volume size (Kubernetes automatically expands)
```

**Prevent (ongoing)**
```
1. Set up automated retention policies
   DELETE FROM audit_log WHERE created_at < (NOW() - INTERVAL '1 year');

2. Partition large tables by date
   CREATE TABLE audit_log_2024_01 PARTITION OF audit_log
   FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

3. Monitor disk usage (alert at 70%)
```

### When Application Crashes (Deploy Rollback)

**Scenario: New code has memory leak**

```
10:00 AM - Deploy new version
10:05 AM - Monitor alerts: memory usage climbing
10:06 AM - Error rate spiking to 5%
10:07 AM - Auto-rollback triggered: memory drops, errors clear
10:07:30 AM - Previous version serving 100% traffic again

Users impacted: ~5M out of 500M (1%)
Downtime: 7 minutes (automatic)
Revenue impact: ~$100K (for 7 minutes of reduced throughput)
```

**How it works:**

```rust
// Kubernetes health check
fn health_check() -> Status {
  if memory_usage > threshold {
    Status::Unhealthy
  } else {
    Status::Healthy
  }
}

// Load balancer
// Stops sending traffic to unhealthy pods
// Auto-scales (kills unhealthy pod, creates new one from previous version)
```

---

## SCHEMA EVOLUTION AT SCALE

### Adding a New Column (100M users)

**Step 1: Add Nullable Column (Deploy 1)**
```sql
ALTER TABLE deals ADD COLUMN deal_type VARCHAR(50);
-- New code: reads NULL (ignore if missing)
-- Old code: unaffected (doesn't know column exists)
```

**Step 2: Backfill (Deploy 1, runs async)**
```sql
UPDATE deals SET deal_type = 'standard'
WHERE deal_type IS NULL
LIMIT 10000;  -- Batch process to avoid locking

-- Runs in background, 1000s of small updates
-- Old/new code both running: no conflicts
```

**Step 3: New Code Reads Column (Deploy 2)**
```rust
pub struct Deal {
  id: i64,
  deal_type: DealType,  // Now required
}

// Code handles missing values
let deal_type = deal.deal_type.unwrap_or(DealType::Standard);
```

**Step 4: Enforce Non-Null (Deploy 3, only after all rows backfilled)**
```sql
ALTER TABLE deals ALTER COLUMN deal_type SET NOT NULL;
```

### Why This Matters

**Wrong approach (single ALTER):**
```sql
ALTER TABLE deals ADD COLUMN deal_type VARCHAR(50) NOT NULL;
-- At 100M rows: takes 30 minutes
-- Database is locked during migration
-- All write operations fail
-- 30 minutes of downtime
-- Revenue impact: $75K+ (for just one schema change)
```

**Right approach (expand-contract):**
```
Deploy 1: 5 minutes (add nullable column + backfill async)
Deploy 2: 5 minutes (read column in new code)
Deploy 3: 5 minutes (enforce NOT NULL)
Total downtime: 0 minutes
Total business impact: $0
```

---

## ADDING NEW FEATURES AT SCALE

### Feature: "Profile Verification Badge"

**Planning Phase**
- How many new queries?
- What data is needed?
- Is it read-heavy or write-heavy?
- Can it be eventually consistent?

**Phase 1: Database (backward compatible)**
```sql
ALTER TABLE users ADD COLUMN verification_badge BOOLEAN DEFAULT FALSE;
CREATE INDEX ON users(verification_badge, created_at);
```

**Phase 2: New Service**
```rust
// verification_service
// Separate from matching_service
// Can be deployed independently
// Can be scaled independently if needed
```

**Phase 3: API Endpoint**
```rust
GET /v1/creators?badge=verified
```

**Phase 4: Feature Flag (progressive rollout)**
```sql
INSERT INTO feature_flags (feature, user_id, enabled)
VALUES ('profile_badges', NULL, false);  -- Disabled globally

-- After monitoring health:
UPDATE feature_flags SET enabled = true;  -- Enable for 1% of users
-- Monitor for 1 hour
UPDATE feature_flags SET enabled = true;  -- Enable for 10% of users
-- Monitor for 1 hour
UPDATE feature_flags SET enabled = true;  -- Enable for 100% of users
```

**Phase 5: Remove Feature Flag (after stable)**
```
After 1 month of 100% traffic:
  - Remove from feature_flags table
  - Hard-code: always enabled
  - Code is simpler
```

**Phase 6: Optimize (if needed)**
```
If badge queries slow:
  - Add materialized view (pre-computed)
  - Add Redis cache (5 min TTL)
  - Add Elasticsearch index
```

**Timeline: 2-3 weeks (with thorough testing)**

---

## INCIDENT RESPONSE

### Define Severity

**SEV1: Outage (error rate >5%)**
```
- Page on-call immediately
- All hands on deck
- Aim: restore in <5 minutes
- Post-mortem within 24 hours
```

**SEV2: Degradation (error rate 1-5%)**
```
- Page on-call
- Major investigation
- Aim: restore in <15 minutes
- Post-mortem within 48 hours
```

**SEV3: Bug (error rate <1%)**
```
- File ticket
- Investigate during next business day
- No page needed
```

### Sample Incident: Deal Payments Not Processing

**Timeline**

10:00 - Error monitoring alerts: payment_failure spike to 10%

10:02 - On-call engineer pages team

10:03 - Initial investigation:
```
SELECT COUNT(*) FROM escrow_transactions
WHERE status = 'pending' AND created_at > NOW() - INTERVAL '5 minutes';
-- Result: 50,000 stuck payments
-- Status: pending (never completed)
```

10:05 - Root cause identified:
```
-- Stripe API is returning 503 (temporarily down)
-- Payment service times out after 30 seconds
-- Outbox worker retries every 60 seconds
-- But Stripe is still down
-- Transactions pile up
```

10:06 - Mitigation (immediate):
```sql
-- Disable payment creation (feature flag)
UPDATE feature_flags SET enabled = false
WHERE feature = 'deal_payment_enabled';

-- Users can't create new deals
-- But existing 50K stuck transactions aren't getting worse
-- Stripe recovers in 15 minutes
```

10:21 - Stripe recovers

10:22 - Re-enable feature flag
```sql
UPDATE feature_flags SET enabled = true;
```

10:23 - Manually trigger outbox worker:
```rust
// Retry all pending transactions
SELECT * FROM escrow_transactions WHERE status = 'pending'
ORDER BY created_at ASC;

for txn in pending_transactions {
  match stripe.transfer(txn.amount) {
    Ok(transfer_id) => {
      UPDATE escrow_transactions SET status = 'completed'
      WHERE id = txn.id;
    }
    Err(_) => {
      // Already will be retried by worker
    }
  }
}
```

10:30 - All 50K payments processed

**Post-Mortem (next day)**
```
What happened: Stripe outage
Why we caught it: Error monitoring (real-time alerts)
Why it took 30 mins: Manual retry (not automatic)

Actions:
1. Implement automatic retry with exponential backoff
2. Add circuit breaker (stop retrying after N failures)
3. Add Stripe health check (monitor their status page)
4. Set up PagerDuty escalation (page team faster)
5. Increase payment service monitoring (watch timeout behavior)
```

---

## CHECKLIST: Ready for Next Stage?

### Before Going from 10K → 100K DAU
- [ ] Error monitoring in place (Sentry/Datadog)
- [ ] Database backups automated
- [ ] Slow query log enabled
- [ ] Load testing done (can handle 10x)
- [ ] Feature flags implemented
- [ ] On-call rotation defined
- [ ] Runbooks written (what to do if X breaks)
- [ ] Canary deployment working

### Before Going from 100K → 1M DAU
- [ ] Read replicas deployed
- [ ] Multi-AZ setup working
- [ ] Kubernetes cluster operational
- [ ] Service mesh (Istio) deployed
- [ ] Horizontal scaling tested (add 2nd server, all tests pass)
- [ ] Database indexes optimized
- [ ] Connection pooling tuned
- [ ] Load test at 500K req/sec passed

### Before Going from 1M → 100M DAU
- [ ] Sharding strategy designed (ready to implement)
- [ ] Cross-shard query patterns identified
- [ ] Elasticsearch/denormalization plan
- [ ] Circuit breaker in use
- [ ] Chaos engineering tests running weekly
- [ ] Multi-region failover tested
- [ ] 99.99% uptime SLA achievable
- [ ] Cost per user < $0.01

### Before Going from 100M → 500M DAU
- [ ] Database sharding live
- [ ] Quota system per user
- [ ] Eventual consistency handled in code
- [ ] Automatic remediation (no human needed)
- [ ] Disaster recovery plan tested
- [ ] Cost < $500K/month
- [ ] P99 latency < 200ms globally
- [ ] Error budget tracked and respected
