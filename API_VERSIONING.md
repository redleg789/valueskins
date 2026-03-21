# API Versioning & Migration Guide

## Current API: v1 (Stable)

### Base URL
```
https://api.valueskins.com/v1
```

### Authentication
```bash
# JWT Token (expires 24 hours)
curl -H "Authorization: Bearer eyJhbGc..." https://api.valueskins.com/v1/deals

# API Key (for server-to-server)
curl -H "X-API-Key: sk_live_..." https://api.valueskins.com/v1/deals
```

### Core Endpoints

#### Deals
```
GET    /deals                     # List creator's deals
GET    /deals/{id}                # Get deal details
POST   /deals                     # Create new deal
PATCH  /deals/{id}                # Update deal state
DELETE /deals/{id}                # Cancel deal
GET    /deals/{id}/messages       # Get deal chat
POST   /deals/{id}/messages       # Send message
POST   /deals/{id}/deliverables   # Upload content
```

#### Opportunities (Brands)
```
GET    /opportunities             # List opportunities (creator discovery)
GET    /opportunities/{id}        # Get opportunity brief
POST   /opportunities             # Create campaign (brand only)
PATCH  /opportunities/{id}        # Update campaign
DELETE /opportunities/{id}        # Cancel campaign
```

#### Payments
```
GET    /payments                  # List creator payments
GET    /payments/{id}             # Get payment details
POST   /payments/{id}/refund      # Refund payment (brand)
```

#### Profile
```
GET    /profile                   # Get logged-in user profile
PATCH  /profile                   # Update profile (avatar, bio, etc)
GET    /profile/reputation        # Get reputation score
GET    /profile/earnings          # Creator earnings summary
```

## v2 (Coming 2026-Q3)

### New Features
- **Multi-platform deals**: LinkedIn services, YouTube sponsors (separate deal types)
- **Advanced search**: Filter by expertise, location, rate, availability
- **Batch operations**: Create 100 deals in one request
- **Webhooks**: Real-time event notifications (deal accepted, payment released, etc)
- **Reports API**: Monthly performance dashboards
- **GraphQL endpoint**: Alongside REST for complex queries

### Breaking Changes
- `POST /deals` requires explicit `dealType` (paid | barter | c2c_paid | c2c_collab)
- `GET /opportunities` moved to `GET /campaigns` (v1 endpoint deprecated)
- Payment response includes `platformFee` (breakdown of commission)
- Timestamps: ISO 8601 required (no Unix timestamps)

### Migration Timeline
- **2026-06-01**: v2 available alongside v1
- **2026-09-01**: v1 endpoints return 410 Gone with migration URL
- **2026-12-01**: v1 infrastructure decommissioned

## v2 Example: New Deal Type Support

### v1 (Current - No Deal Type Discrimination)
```bash
POST /deals
{
  "opportunityId": 123,
  "creatorId": 456,
  "offerAmount": 5000,
  "advancePercent": 30,
  "uploadPercent": 40,
  "approvalPercent": 30
}
```

### v2 (Coming - Deal Type Explicit)
```bash
POST /v2/deals
{
  "opportunityId": 123,
  "creatorId": 456,
  "dealType": "paid",  # NEW: paid | barter | c2c_paid | c2c_collab
  "paymentTerms": {    # CHANGED: structure
    "total": 5000,
    "currency": "USD",
    "milestones": [
      { "phase": "advance", "percent": 30 },
      { "phase": "upload", "percent": 40 },
      { "phase": "approval", "percent": 30 }
    ]
  }
}
```

## Cost Controls

### Usage Quotas (Per Subscription Tier)

| Tier | API Calls/Month | Deals/Month | Webhooks | Price |
|------|----------|----------|----------|-------|
| Starter | 10k | 10 | None | Free |
| Creator | 100k | 50 | Yes | $10/mo |
| Brand | 500k | 500 | Yes | $50/mo |
| Enterprise | Unlimited | Unlimited | Yes | Custom |

### Rate Limiting Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1648000000
X-RateLimit-Tier: basic
```

### Over-Limit Behavior
```bash
HTTP 429 Too Many Requests
{
  "error": "Rate limit exceeded",
  "tier": "basic",
  "limit": 1000,
  "retry_after_seconds": 60
}
```

## Billing & Cost Attribution

### API Call Costs (Freemium Model)
- First 10k calls/month: Free
- Next 90k calls: $0.001 per call ($90)
- Next 400k calls: $0.0005 per call ($200)
- Overage: $0.0001 per call

### Webhook Delivery (v2)
- Included in tier (Creator: 100/month, Brand: 1000/month)
- Overage: $0.01 per delivery
- Failed delivery retry: 5 attempts over 24 hours (free)

### Data Retrieval (Exports, Reports)
- Monthly: 3 free exports per tier
- Overage: $5 per export (compressed JSON)
- Report generation: 1 free/month, then $10 per report

## Error Codes & Handling

### Client Errors (4xx)
```
400 Bad Request       # Malformed JSON, missing required fields
401 Unauthorized      # Invalid/expired token
403 Forbidden         # User doesn't have permission
404 Not Found         # Resource doesn't exist
409 Conflict          # Deal state can't transition (e.g., can't accept completed deal)
429 Too Many Requests # Rate limited
```

### Server Errors (5xx)
```
500 Internal Server Error    # Unexpected error (bug)
503 Service Unavailable      # Maintenance mode, retry after X seconds
```

### Error Response Format
```json
{
  "error": "Descriptive message",
  "code": "RATE_LIMITED",
  "details": {
    "retryAfter": 60,
    "remaining": 0,
    "limit": 1000
  }
}
```

## Monitoring API Health

### Status Page
```
https://status.valueskins.com
```

### Health Endpoint (Always Free, No Auth Required)
```bash
GET /health
{
  "status": "operational",
  "version": "v1",
  "timestamp": "2026-03-22T14:30:00Z",
  "dbLatency": "45ms",
  "cacheHitRate": 0.92
}
```

### Deprecation Headers
```
Deprecation: true
Sunset: Sun, 01 Sep 2026 00:00:00 GMT
Link: </v2/docs>; rel="successor-version"
```

**Status: PROD READY**
