# Backend Production Validation Checklist

How to verify ValueSkins backend is truly production-ready (not just claims).

---

## APPROACH 1: LOAD TESTING (Prove It Handles Scale)

### Setup
```bash
# Deploy backend to public endpoint
curl https://api.valueskins.demo/health/ready
# Response: 200 OK (service is ready)
```

### Test 1: Baseline Performance
```bash
# Simple request at low concurrency
k6 run - <<EOF
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 1,          // 1 user
  duration: '30s',
};

export default function () {
  let res = http.get('https://api.valueskins.demo/v1/campaigns');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}
EOF
```

**Expected Result:**
```
✓ Response time: < 50ms p95
✓ Error rate: 0%
✓ Throughput: > 100 req/sec
```

### Test 2: Ramp Up (Gradually increase load)
```bash
k6 run - <<EOF
import http from 'k6/http';

export let options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp to 100 users
    { duration: '5m', target: 1000 },  // Ramp to 1000 users
    { duration: '2m', target: 0 },     // Cool down
  ],
};

export default function () {
  http.get('https://api.valueskins.demo/v1/campaigns');
}
EOF
```

**Expected Result:**
```
At 100 users:   p95 latency < 50ms
At 500 users:   p95 latency < 100ms
At 1000 users:  p95 latency < 200ms
Zero errors throughout
```

### Test 3: Spike Test (Sudden traffic spike)
```bash
k6 run - <<EOF
export let options = {
  stages: [
    { duration: '10s', target: 100 },    // Normal
    { duration: '1m', target: 5000 },    // 50x spike!
    { duration: '10s', target: 100 },    // Return to normal
  ],
};

export default function () {
  http.get('https://api.valueskins.demo/v1/creators');
}
EOF
```

**Expected Result:**
```
✓ Handles 5000 concurrent users
✓ No 503 errors
✓ Latency degrades gracefully (not crashes)
✓ Auto-recovery when traffic drops
```

### Test 4: Data Under Load
```bash
k6 run - <<EOF
import { group, check } from 'k6';
import http from 'k6/http';

export let options = {
  vus: 100,
  duration: '5m',
};

export default function () {
  group('Create application', function () {
    let res = http.post('https://api.valueskins.demo/v1/applications', {
      campaign_id: Math.floor(Math.random() * 1000),
      pitch: 'I am interested',
    });
    check(res, {
      'created': (r) => r.status === 201,
      'has id': (r) => r.json('id') > 0,
    });
  });

  group('List applications', function () {
    let res = http.get('https://api.valueskins.demo/v1/applications');
    check(res, {
      'retrieved': (r) => r.status === 200,
      'has data': (r) => r.json('length') > 0,
    });
  });
}
EOF
```

**Verify:**
```
✓ All created applications are retrievable
✓ No lost writes under concurrent load
✓ Data consistency maintained
```

---

## APPROACH 2: SECURITY AUDIT (Prove It's Secure)

### Test 1: SQL Injection
```bash
# Try to inject SQL
curl -X GET "https://api.valueskins.demo/v1/creators?profession=SWE'; DROP TABLE users; --"

# Expected: Either sanitized or rejected
# Result: Returns creators, no table dropped
```

**Verification:**
```sql
-- Check table still exists
SELECT COUNT(*) FROM users;
-- Result: > 0 (table intact)
```

### Test 2: Unauthorized Access
```bash
# Try to access without JWT
curl -X GET "https://api.valueskins.demo/v1/applications"
# Response: 401 Unauthorized

# Try to access other user's data
curl -X GET "https://api.valueskins.demo/v1/users/456/applications" \
  -H "Authorization: Bearer [valid_jwt_for_user_123]"
# Response: 403 Forbidden (user 123 is not user 456)
```

### Test 3: Privilege Escalation
```bash
# Regular user tries admin endpoint
curl -X POST "https://api.valueskins.demo/v1/admin/ban-user" \
  -H "Authorization: Bearer [regular_user_jwt]" \
  -d '{"user_id": 999}'
# Response: 403 Forbidden

# Verify user 999 is NOT banned
curl -X GET "https://api.valueskins.demo/v1/users/999"
# Response: 200 OK (user still exists)
```

### Test 4: Rate Limiting
```bash
# Send 1000 requests as fast as possible from one IP
for i in {1..1000}; do
  curl -s "https://api.valueskins.demo/v1/campaigns" &
done
wait

# After N requests, should get 429 Too Many Requests
# Then: Auto-recovery (requests succeed again after cooldown)
```

### Test 5: HTTPS Enforcement
```bash
# Try HTTP (not HTTPS)
curl -i "http://api.valueskins.demo/v1/campaigns"
# Response: 301 Redirect or 400 Bad Request (not 200)

# Only HTTPS works
curl -i "https://api.valueskins.demo/v1/campaigns"
# Response: 200 OK
```

---

## APPROACH 3: CODE REVIEW (Verify Implementation)

### Clone and Inspect
```bash
git clone https://github.com/valueskins/backend.git
cd backend
```

### Checklist: Authentication
```bash
# Search for hardcoded secrets
grep -r "sk_live\|STRIPE_KEY\|DATABASE_PASSWORD" . --include="*.rs"
# Result: ZERO matches (all use environment variables)

# Search for weak JWT validation
grep -r "decode.*Validation::default" . --include="*.rs"
# Result: ZERO matches (all use explicit algorithm HS256)

# Check JWT expiration is set
grep -r "exp_seconds\|expiration" backend/auth_service/src/token.rs
# Result: exp = now + 3600 seconds (1 hour)
```

### Checklist: Database
```bash
# Check all queries use parameterized statements
grep -r "format!\|concat" . --include="*.rs" | grep -i select
# Result: ZERO SQL string concatenation

# Verify SQLx compile-time checking
grep -r "sqlx::query_as\|sqlx::query" . --include="*.rs"
# Expected: All use type-safe sqlx macros
```

### Checklist: Error Handling
```bash
# Search for unhandled panics
grep -r "unwrap()" . --include="*.rs" | grep -v "test" | grep -v ".ok()?"
# Result: All unwraps are in safe contexts or tests

# Check for missing error returns
grep -r "\.await" . --include="*.rs" | grep -v "?" | wc -l
# Result: Low count (most errors propagated with ?)
```

### Checklist: Security Headers
```bash
# Search for security header middleware
grep -r "Strict-Transport-Security\|X-Frame-Options\|Content-Security-Policy" . --include="*.rs"
# Result: All headers set in middleware/security_headers.rs
```

### Read Key Files
```bash
# Examine authentication implementation
cat backend/auth_service/src/token.rs
# Verify: JWT generation, expiration, validation

# Examine fraud prevention
cat backend/marketplace_service/src/fraud_service.rs
# Verify: Multiple gates (persona limit, phone hash, collusion, velocity)

# Examine database design
cat backend/migrations/*.sql
# Verify: Append-only design, indexes on hot columns, constraints
```

---

## APPROACH 4: INTEGRATION TESTS (Verify Real Behavior)

### Deploy Test Environment
```bash
# Spin up complete stack
docker-compose up -d

# Wait for health checks
sleep 30

# Verify all services healthy
curl http://localhost:8080/health/ready
curl http://localhost:8080/health/live
```

### Test: Complete Deal Workflow
```bash
#!/bin/bash

API="http://localhost:8080"

# Step 1: Create brand user
BRAND=$(curl -s -X POST "$API/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"instagram_id": "brand_123"}' | jq -r '.jwt')

# Step 2: Create campaign
CAMPAIGN=$(curl -s -X POST "$API/v1/campaigns" \
  -H "Authorization: Bearer $BRAND" \
  -d '{"title": "SWE needed", "budget": 50000}' | jq -r '.id')

echo "Created campaign: $CAMPAIGN"

# Step 3: Create creator user
CREATOR=$(curl -s -X POST "$API/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"instagram_id": "creator_456"}' | jq -r '.jwt')

# Step 4: Apply to campaign
APPLICATION=$(curl -s -X POST "$API/v1/applications" \
  -H "Authorization: Bearer $CREATOR" \
  -d "{\"campaign_id\": $CAMPAIGN}" | jq -r '.id')

echo "Created application: $APPLICATION"

# Step 5: Brand accepts
curl -s -X POST "$API/v1/applications/$APPLICATION/accept" \
  -H "Authorization: Bearer $BRAND"

# Step 6: Verify application is accepted
STATUS=$(curl -s -X GET "$API/v1/applications/$APPLICATION" \
  -H "Authorization: Bearer $CREATOR" | jq -r '.status')

if [ "$STATUS" = "accepted" ]; then
  echo "✓ Application acceptance works"
else
  echo "✗ Application acceptance failed: got $STATUS"
fi
```

### Test: Fraud Gates
```bash
# Test 1: Can't create more than 3 personas
for i in {1..5}; do
  curl -s -X POST "$API/v1/personas" \
    -H "Authorization: Bearer $JWT" \
    -d "{\"profession\": \"profession_$i\"}" \
  | jq '.status'
  # Expected: 201, 201, 201, 403, 403
done

# Test 2: Phone hash deduplication
RESPONSE=$(curl -s -X POST "$API/v1/auth/register" \
  -d '{"phone": "+1234567890"}')
# First signup: 200 OK

RESPONSE=$(curl -s -X POST "$API/v1/auth/register" \
  -d '{"phone": "+1234567890"}')
# Second signup: 409 Conflict (same phone)
```

### Test: Data Consistency
```bash
# Create deal and immediately read it
DEAL=$(curl -s -X POST "$API/v1/deals" \
  -H "Authorization: Bearer $BRAND" \
  -d '{"campaign_id": 123, "creator_id": 456}' | jq -r '.id')

# Read from 5 different API servers (behind load balancer)
for i in {1..5}; do
  curl -s -X GET "$API/v1/deals/$DEAL" \
    -H "Authorization: Bearer $BRAND" | jq '.status'
  # All should return same status (consistency)
done
```

---

## APPROACH 5: STRESS TEST (Push to Breaking Point)

### Memory Leaks
```bash
# Monitor memory over 24 hours
docker stats valueskins-api --no-stream > memory_baseline.txt

# Run continuous traffic
k6 run script.js --duration 24h --vus 100

# Compare memory after 24h
docker stats valueskins-api --no-stream > memory_after.txt

# Verify: No significant increase (no memory leak)
grep "MEM %" memory_after.txt | head -1
grep "MEM %" memory_after.txt | tail -1
# Both should be similar
```

### Connection Pool Exhaustion
```bash
# Send requests with intentional delays
k6 run - <<EOF
import http from 'k6/http';

export let options = { vus: 1000, duration: '5m' };

export default function () {
  // Each request holds DB connection for 10 seconds
  http.get('https://api.valueskins.demo/slow-query?delay=10000');
}
EOF

# Monitor: Database connections
# Expected: Connections max out at 20 (pool size), then requests queue
# NOT: Connections exhaust, service crashes
```

### Database Under Load
```bash
# Insert 1M rows while serving traffic
k6 run - <<EOF
import http from 'k6/http';

export let options = { vus: 100, duration: '1h' };

export default function () {
  http.post('https://api.valueskins.demo/v1/applications', {
    campaign_id: Math.floor(Math.random() * 10000),
    pitch: 'test'
  });
}
EOF

# Verify database health
SELECT COUNT(*) FROM applications;  -- Should be ~1M
SELECT COUNT(*) FROM applications WHERE created_at > NOW() - INTERVAL '1h';  -- ~100 per second
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 5;  -- No slow queries
```

---

## APPROACH 6: CHAOS ENGINEERING (Kill Things, Watch It Recover)

### Kill a Pod
```bash
# Delete a random API pod
kubectl delete pod -n instagram -l app=valueskins-matching

# Verify: Traffic seamlessly routes to other pods
# No 503 errors, no latency spike

# Watch recovery
kubectl get pods -n instagram -l app=valueskins-matching --watch
# New pod should be Ready in 10-30 seconds
```

### Simulate Network Partition
```bash
# Disconnect database for 30 seconds
# (using tc traffic control or pod network policy)

# During partition:
# - Requests fail with connection timeout (not hangs)
# - Circuit breaker stops trying after 5 failures
# - p99 latency doesn't exceed 1 second

# After partition heals:
# - Requests immediately succeed
# - No manual intervention needed
# - No data loss
```

### Disk Full Scenario
```bash
# Fill up database disk to 90%
fallocate -l 100G /var/lib/postgresql/data/fillfile

# Verify: Service detects this and alerts (not crashes)
# Monitoring should show disk_usage > 90%

# Cleanup
rm /var/lib/postgresql/data/fillfile

# Recovery: Automatic, no intervention needed
```

---

## APPROACH 7: API CONTRACT TESTING (Responses Match Spec)

### Generate Test Suite from OpenAPI
```bash
# Fetch API spec
curl https://api.valueskins.demo/openapi.json > spec.json

# Generate test cases
schemathesis from-schema spec.json --hypothesis-max-examples=1000

# Expected: All endpoints return responses matching spec
# Status codes, field types, required fields all correct
```

### Validate Every Response
```bash
# Example: GET /v1/campaigns should return
{
  "id": 123,              // number, required
  "title": "SWE needed",  // string, required
  "budget": 50000,        // number, required
  "status": "active",     // enum, required
  "created_at": "2026-02-28T10:00:00Z",  // ISO8601, required
  "applications": [...]   // array, required
}

# Test: Make request, verify structure
RESPONSE=$(curl -s https://api.valueskins.demo/v1/campaigns/123)
echo $RESPONSE | jq 'keys'
# Expected: ["id", "title", "budget", "status", "created_at", "applications"]

# Test: Verify types
echo $RESPONSE | jq '.id | type'   # Expected: "number"
echo $RESPONSE | jq '.title | type' # Expected: "string"
```

---

## APPROACH 8: DATABASE CONSISTENCY (Append-Only Integrity)

### Test Data Loss Scenarios
```bash
# Scenario 1: Service crashes mid-transaction
# Kill service while it's writing
pkill -9 api_gateway

# Verify: Transaction rolled back (no partial data)
SELECT * FROM applications WHERE id = $incomplete_id;
-- Expected: No row (transaction didn't commit)

# Restart service
docker-compose up api_gateway

# Verify: Previous data still there
SELECT COUNT(*) FROM applications;
-- Same count as before crash
```

### Test Idempotency
```bash
# Submit same application twice (same idempotency key)
IDEMPOTENCY_KEY="a1b2c3d4-e5f6-47g8"

curl -X POST https://api.valueskins.demo/v1/applications \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d '{...}' \
  > response1.json

curl -X POST https://api.valueskins.demo/v1/applications \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d '{...}' \
  > response2.json

# Verify: Same response both times
diff response1.json response2.json
# Expected: Identical (same application ID, same timestamp)

# Verify: Only one application created
SELECT COUNT(*) FROM applications WHERE idempotency_key = '$IDEMPOTENCY_KEY';
-- Expected: 1 (not 2)
```

---

## APPROACH 9: MONITORING VERIFICATION

### Verify Metrics Exist
```bash
# Scrape Prometheus endpoint
curl http://localhost:9090/metrics | grep valueskins

# Expected output:
valueskins_http_requests_total{method="GET",status="200"} 1234
valueskins_http_latency_seconds_bucket{le="0.01"} 900
valueskins_database_query_duration_seconds_sum 5000
```

### Verify Logging Works
```bash
# Make a request
curl https://api.valueskins.demo/v1/campaigns/123

# Check logs contain correlation ID
kubectl logs -n instagram deployment/valueskins-matching | grep correlation_id

# Expected:
# {"timestamp":"2026-02-28T10:15:30Z","correlation_id":"abc-123","action":"fetch_campaign","status":"success"}
```

### Verify Alerts Fire
```bash
# Trigger an alert (high error rate)
k6 run script_with_errors.js  # 50% of requests return 500

# Wait 1 minute
sleep 60

# Check PagerDuty received alert
# OR: Check AlertManager
curl http://localhost:9093/api/v1/alerts

# Expected: Alert showing "error_rate > 5%"
```

---

## APPROACH 10: MANUAL WALKTHROUGH

### As Brand User, Verify Complete Flow

1. **Login**
   - Visit: https://valueskins.demo
   - Click "Login with Instagram"
   - Authenticate
   - Verify JWT stored in localStorage (in browser DevTools)

2. **Create Campaign**
   - Click "Create Campaign"
   - Fill: Title, Budget, Profession, Deliverables
   - Submit
   - Verify: POST /v1/campaigns returns 201 (browser Network tab)
   - Verify: Campaign appears in list

3. **Review Applications**
   - Click "Applications"
   - Verify: Fetch /v1/applications returns real data
   - Check: Each application shows creator name, profession, rating

4. **Accept Creator**
   - Click "Accept" on an application
   - Verify: POST /v1/applications/123/accept returns 200
   - Verify: UI updates to "Accepted" (socket message or poll)

5. **Enter Deal Room**
   - Click "Negotiate"
   - Verify: GET /v1/deals/456 returns current state
   - Submit counter-offer
   - Verify: POST /v1/deals/456/counter-offer returns 201
   - Creator should see offer in their deal room (real-time sync)

6. **Fund Escrow**
   - Click "Fund" to deposit into escrow
   - Verify: Redirects to Meta Pay (Stripe sandbox)
   - Simulate payment
   - Verify: Payment stored in database
   - Verify: Deal status changes to "funded"

---

## FINAL VERIFICATION: Meta's Engineering Team Checklist

```
PERFORMANCE:
  ✓ Handles 1000 concurrent users with p95 < 100ms
  ✓ Can sustain 500+ requests/sec per server
  ✓ No memory leaks after 24h load test
  ✓ Connection pool doesn't exhaust

SECURITY:
  ✓ No SQL injection vectors (parameterized queries)
  ✓ No XSS vectors (CSP + escaping)
  ✓ No hardcoded secrets (all env variables)
  ✓ Rate limiting works on all mutation endpoints
  ✓ Authorization verified on every request
  ✓ Passwords hashed (bcrypt)
  ✓ PII not exposed in plaintext

DATA INTEGRITY:
  ✓ No lost writes under concurrent load
  ✓ Idempotency prevents duplicates
  ✓ Transactions atomic (all or nothing)
  ✓ Backups can be restored in < 5 minutes
  ✓ Append-only design verified (no data loss scenarios)

OBSERVABILITY:
  ✓ All requests logged with correlation ID
  ✓ Metrics collected (latency, throughput, errors)
  ✓ Alerts fire for error rate > 1%
  ✓ Can identify which service is slow

RELIABILITY:
  ✓ Service recovers from pod crash < 30 seconds
  ✓ Circuit breaker stops cascading failures
  ✓ Graceful degradation under overload (queuing, not crashing)
  ✓ No single point of failure (multi-pod, multi-replica DB)

CODE QUALITY:
  ✓ No hardcoded values (all configurable)
  ✓ Error handling comprehensive (no silent failures)
  ✓ Code follows Rust best practices
  ✓ Dependencies up-to-date (no security vulnerabilities)
  ✓ Tests pass (unit + integration)

INTEGRATION:
  ✓ Uses Instagram's user ID (no shadow accounts)
  ✓ Feature-flaggable (can disable instantly)
  ✓ API versioned (backward compatible)
  ✓ No separate social graph (uses existing follows)
  ✓ Can be deployed as separate Kubernetes service
```

If all 30 items check ✓, the backend is production-ready.
