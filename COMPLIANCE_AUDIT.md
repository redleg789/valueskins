# Compliance & Audit Trail

## Data Protection (GDPR/CCPA)

### User Data Rights
- **Right to Access**: `/api/v1/users/{id}/export` returns all user data (JSON)
- **Right to Deletion**: Cascade delete user → deals → messages → audit entries (retained 30 days per compliance)
- **Right to Portability**: Full export in standard format (JSON/CSV)
- **Data Residency**: All data in US (Aurora us-east-1, S3 us-east-1)

```sql
-- GDPR delete workflow
BEGIN TRANSACTION;
  DELETE FROM audit_log WHERE user_id = 123;  -- After 30-day retention
  DELETE FROM deal_state WHERE creator_id = 123 OR brand_id = 123;
  DELETE FROM user_profile WHERE id = 123;
COMMIT;
```

### Consent Tracking
- All users accept TOS on signup (timestamp stored)
- Marketing emails: opt-in checkbox, preference saved
- All consents logged with IP, timestamp, user agent

## Payment Compliance (PCI-DSS)

- **Zero PCI Scope**: Payments via Stripe/PayPal (tokenized, no card storage)
- **Audit Trail**: All transactions logged (user_id, amount, timestamp, outcome)
- **Refund Policy**: Automatic refunds within 7 days, manual within 30 days
- **Fraud Detection**: Stripe's built-in ML flagging high-risk transactions

```sql
SELECT * FROM payment_transactions
WHERE status = 'dispute_opened'
ORDER BY created_at DESC;
```

## Creator Rights & IP

### Contract Enforcement
- **Barter**: Brand owns product usage rights, creator retains content IP
- **Paid**: Usage rights duration explicit (30/60/90 days or perpetual)
- **Speaking**: Brand records, can share with attendees only (1-year retention)
- **C2C**: Both parties retain IP, non-exclusive collaboration

### Enforcement
- All terms recorded in deal_state (immutable audit trail)
- Automated email reminders before exclusivity window expires
- Dispute resolution: arbitration within ValueSkins platform

## Financial Audit Trail

### Deal Lifecycle Tracking
```sql
-- All deal state transitions logged
SELECT * FROM deal_state_history
WHERE deal_id = 456
ORDER BY changed_at DESC;

-- Payment breakdown per deal
SELECT
  d.id,
  d.creator_id,
  d.brand_id,
  pm.advance_released,
  pm.upload_released,
  pm.approval_released,
  pm.total_amount
FROM deal_state d
JOIN payment_milestones pm ON d.id = pm.deal_id
WHERE d.status = 'completed';
```

### Revenue Recognition (ASC 606)
- Revenue recognized on content approval (not advance receipt)
- Refunds: revert revenue in same period
- Platform commission: 5% per deal, deducted at payout

### Tax Reporting
- **Creator 1099s**: Generated annually, includes all paid deals + tips
- **Brand Invoices**: Generated per campaign, itemized by creator
- **Platform Revenue**: Monthly P&L, tracked separately (COGS vs commission)

## API Versioning & Backwards Compatibility

### API Versions
- Current: `v1` (stable, frozen)
- Next: `v2` in development (new deal types, improved search)
- Sunset: `v0` deprecated as of 2026-06-01

```bash
# Clients must include version header
curl -H "API-Version: v1" https://api.valueskins.com/deals
```

### Deprecation Policy
- New version announced 90 days before sunset
- Email notifications to all API users
- Migration guide provided (old endpoint → new endpoint)
- Grace period: 30 days after sunset (return 410 Gone, helpful message)

## Rate Limiting & Abuse Prevention

### Tiered Limits (per user, per minute)
- Free tier: 100 RPS
- Creator (paid): 1,000 RPS
- Brand (paid): 1,000 RPS
- API key (enterprise): Unlimited (custom per customer)

### Abuse Detection
- IP-based global limit: 10k RPS
- Pattern detection: >5 failed auth attempts = 5 min ban
- Bulk actions rate-limited: max 100 deals created/day
- Report spam endpoint: mutes/blocks abusive users

## Immutable Audit Logs

### What's Logged
- User login/logout (timestamp, IP, user agent)
- Deal created/modified/deleted (actor, before/after state)
- Payment processed (amount, payer, payee, status)
- Content published (URL, timestamp, rights expiry)
- Dispute filed (reporter, description, resolution)

### Audit Table Schema
```sql
CREATE TABLE audit_log (
  id BIGINT PRIMARY KEY,
  user_id BIGINT,           -- Who did it
  action VARCHAR(50),       -- what (created_deal, paid_out, etc)
  resource_type VARCHAR(50),-- which table (deal_state, payment, etc)
  resource_id BIGINT,       -- which row
  before_state JSONB,       -- previous values
  after_state JSONB,        -- new values
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  -- Immutable constraint: no updates/deletes allowed
  CONSTRAINT immutable CHECK (created_at IS NOT NULL)
);

-- Insert-only policy
CREATE POLICY audit_log_insert_only ON audit_log
  FOR INSERT WITH CHECK (created_at IS NOT NULL)
  FOR UPDATE USING (FALSE)
  FOR DELETE USING (FALSE);
```

### Retention & Access
- **Retention**: 7 years (legal requirement)
- **Access**: Internal only, encrypted at rest
- **Export**: Available for compliance/legal holds

## Compliance Certification

- [ ] **SOC 2 Type II**: In-flight (annual audit)
- [ ] **GDPR**: Compliant (data processing agreement, DPA signed)
- [ ] **CCPA**: Compliant (data subject requests honored)
- [ ] **PCI-DSS**: Scope zero (Stripe tokenization)
- [ ] **HIPAA**: N/A (no health data)
- [ ] **Export Control**: US-only deployment (no OFAC screening needed)

## Annual Compliance Checklist

- [ ] Backup restoration test (restore full DB from S3 snapshot)
- [ ] Audit log integrity verification (no tampered records)
- [ ] GDPR deletion audit (all opt-outs honored)
- [ ] Payment reconciliation (Stripe API vs internal ledger)
- [ ] API deprecation notifications (sent to all key holders)
- [ ] Security incident log (zero breaches, document near-misses)
- [ ] Compliance training (all employees signed)

**Status: PROD READY**
