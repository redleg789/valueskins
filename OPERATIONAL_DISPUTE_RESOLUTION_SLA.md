# Dispute Resolution & Payout Process SLA

**ValueSkins, Inc.**  
Effective Date: April 17, 2026

---

## 1. Dispute Resolution Process

### 1.1 Eligibility to File

Either party (creator or brand) may file a dispute if:
- A deal has been completed (marked "in_progress" or "completed" status)
- The dispute is filed **within 14 calendar days** of deal completion date
- The dispute involves payment, deliverable quality, or contract violation

**Not eligible for disputes:**
- Deals cancelled before completion
- Matching rejections (creator rejected brand's offer)
- Communication disputes (rude messages, etc. — handle via user conduct policy)
- Pricing disagreements (brands are responsible for budget)

### 1.2 How to File a Dispute

**Step 1: Navigate to Deal Page**
- Go to your completed deal
- Click "Dispute This Deal" button
- (In database: `disputes` table, insert new row with `status='open'`)

**Step 2: Select Dispute Type**
```
- Payment Not Received (creator claim: brand didn't pay)
- Deliverables Not Provided (brand claim: creator didn't deliver)
- Quality Issues (brand claim: deliverables don't meet specifications)
- Scope Creep (creator claim: brand demanded more than agreed)
- Other (describe in text field)
```

**Step 3: Upload Evidence**
- Messages (from ValueSkins chat or email)
- Deliverable screenshots/videos
- Payment records or lack thereof
- Contract terms (deal agreement text)
- Any other relevant documentation

**Step 4: Write Claim**
- Description (max 1000 characters)
- What you're asking for (full payment, refund, redo, etc.)
- Amount in dispute (in USD cents)

**Step 5: Submit**
- Click "Submit Dispute"
- Receive confirmation email
- Auto-created dispute_id for tracking

---

### 1.3 Initial Response (48 Hours)

**What happens:**
- ValueSkins review team receives notification
- Team reads claim + evidence
- **Within 48 hours:** Acknowledge receipt
  - Send email to both parties
  - Provide dispute_id + timeline
  - Request any missing evidence

**If evidence is missing:**
- Team emails requesting specifics
- Parties have **3 business days** to submit additional evidence
- If no response, case proceeds with existing evidence

**Database update:**
```sql
UPDATE disputes 
SET status = 'in_review', 
    acknowledged_at = NOW(),
    assigned_to = 'support_team_member_id'
WHERE id = dispute_id;
```

---

### 1.4 Full Investigation (5 Business Days)

**What the team reviews:**

1. **Chat Messages**
   - Were requirements clear?
   - Any scope changes discussed?
   - Tone/professionalism?

2. **Deliverables**
   - Were deliverables provided?
   - Do they meet spec (if available)?
   - Quality issues documented?

3. **Payment Records**
   - Did brand initiate payment?
   - Was payment received by creator?
   - Any failed transfers?
   - Currency conversion issues?

4. **Contract Compliance**
   - Deal agreement signed?
   - Deadlines met?
   - FTC disclosures included?
   - Non-compete violations?

5. **Party Reputation**
   - History of similar disputes?
   - Past completion rates?
   - Ratings/feedback?

**Timeline:**
```
Day 0: Dispute filed
Day 1-2: Evidence collection + party interviews (if needed)
Day 3-4: Analysis + internal discussion
Day 5: Decision drafted + reviewed
Day 7: Decision issued
```

**Database update:**
```sql
UPDATE disputes 
SET status = 'under_investigation',
    investigation_started_at = NOW()
WHERE id = dispute_id;
```

---

### 1.5 Decision & Outcome (Day 7)

**Decision notification email includes:**
- Summary of claim
- Evidence reviewed
- Findings
- Final decision + reasoning
- Action required (if any)

**Possible Outcomes:**

#### Outcome A: Awarded to Creator
**Situation:** Brand failed to pay, or payment was fraudulent

**Decision:**
- Creator receives full deal amount
- Platform commission is **refunded** to creator
- Brand is charged **$50 chargeback fee**
- Brand's account flagged for payment issues

**Database:**
```sql
UPDATE disputes SET status = 'resolved_creator_favor', decision_date = NOW();
UPDATE deal_rooms SET status = 'completed' WHERE id = deal_id;
INSERT INTO payouts (creator_id, amount_cents, reason) 
VALUES (creator_id, agreed_amount_cents, 'Dispute resolution - awarded to creator');
UPDATE brands SET payment_failures = payment_failures + 1 WHERE user_id = brand_user_id;
```

#### Outcome B: Awarded to Brand
**Situation:** Creator failed to deliver, or deliverables were unusable

**Decision:**
- Creator must return payment (pulled from next payout)
- If creator has insufficient balance, funds held for 90 days
- Brand keeps deposit (no refund)
- Creator's completion rate reduced

**Database:**
```sql
UPDATE disputes SET status = 'resolved_brand_favor', decision_date = NOW();
INSERT INTO chargebacks (creator_id, amount_cents, reason) 
VALUES (creator_id, agreed_amount_cents, 'Dispute resolution - refund to brand');
UPDATE creator_reputation_metrics 
SET completed_deals = completed_deals - 1 
WHERE creator_user_id = creator_id;
```

#### Outcome C: Partial Resolution
**Situation:** Both parties partially at fault (scope creep + late delivery, but content was decent)

**Decision:**
- Creator receives 50-75% of deal amount (negotiated)
- Brand receives 25-50% refund
- Platform commission reduced proportionally

**Database:**
```sql
UPDATE disputes SET status = 'resolved_partial', decision_date = NOW();
INSERT INTO payouts (creator_id, amount_cents, reason) 
VALUES (creator_id, partial_amount, 'Dispute resolution - partial award');
INSERT INTO refunds (brand_id, amount_cents, reason) 
VALUES (brand_id, refund_amount, 'Dispute resolution - partial refund');
```

#### Outcome D: Dismissed
**Situation:** Dispute is frivolous, both parties performed, or outside SLA

**Decision:**
- Payment stands as-is
- No refund
- Both parties notified

**Database:**
```sql
UPDATE disputes SET status = 'dismissed', decision_date = NOW();
```

---

### 1.6 Appeal Process (Days 8-14)

Either party may appeal within **7 days** of decision with:
- New evidence not available during initial investigation
- Procedural errors in investigation
- Insufficient reasoning in decision

**Appeal Submission:**
- Email legal@valueskins.com with "Appeal: [dispute_id]"
- Include new evidence or procedural complaint
- Request specific relief (reconsideration, new decision, etc.)

**Appeal Review:**
- **Assigned to different team member** (not original investigator)
- **3 business days** to review
- **Final decision is binding** (no further appeals)

**Database:**
```sql
UPDATE disputes 
SET status = 'appealed', 
    appeal_submitted_at = NOW(),
    assigned_to = 'different_team_member_id'
WHERE id = dispute_id;
```

---

### 1.7 Escalation (Day 15+)

If dissatisfied with appeal, either party may escalate to:

**Option 1: Email Arbitration**
- Submit written case to legal@valueskins.com
- Third-party arbitrator selected (neutral)
- Arbitrator reviews all evidence + appeal decision
- **Binding decision within 14 days**
- **Cost:** Losing party pays arbitrator fees (~$500-2K depending on case complexity)

**Option 2: Small Claims Court**
- If dispute claim < $5,000: File in small claims court
- ValueSkins will participate in hearing
- Court decision is final

**Option 3: Full Legal Action**
- Disputes > $5,000: Litigation in civil court
- Governing law: California
- See Terms of Service §14 (Governing Law)

---

## 2. Payout Process

### 2.1 Payout Eligibility

A creator is eligible for payout if they meet **ALL** criteria:

1. **Account Verified**
   - Email verified
   - Phone verified
   - Tax ID verified

2. **Minimum Earnings**
   - No minimum balance (can withdraw $1)

3. **No Active Disputes**
   - No open or appealed disputes on pending payouts
   - Resolved disputes don't block future payouts

4. **Not Suspended**
   - Account not suspended for violations
   - No pending investigation

5. **Tax Compliance**
   - Tax identification provided
   - Tax forms (W-9, W-8BEN, etc.) on file if required

### 2.2 Payout Calculation

**Weekly (Monday) Calculation:**

```
Total Earnings = SUM(agreed_amount FROM deal_rooms WHERE status='completed' AND completed_at >= last_payout_date)

Less: Platform Commission (5%)
Commission = Total Earnings × 0.05

Less: Tax Withholding (jurisdiction-specific)
  - US: 0% (creator's responsibility)
  - India: 10% (withheld by ValueSkins, remitted to government)
  - UK: 20% (withheld if income > £10K/year)
  - Canada: 15%
  - Australia: 10%
  - Other: 30% FATCA default (or treaty rate if applicable)

Less: Disputed Amounts
  - If dispute is open/appealed, that deal's amount is held in escrow
  - Once dispute resolved, amount either paid or refunded

Net Payout = Total Earnings - Commission - Tax Withholding - Disputed Amounts
```

**Example (US Creator):**
```
Week 1:
- Deal A completed: $1,000
- Deal B completed: $500
Total: $1,500

Calculation:
Commission: $1,500 × 0.05 = $75
Tax withholding (US): $0
Net payout: $1,500 - $75 = $1,425
```

**Example (India Creator):**
```
Week 1:
- Deal A completed: $1,000 (₹82,500 @ 82.5 exchange rate)
- Deal B completed: $500 (₹41,250)
Total USD: $1,500 | Total INR: ₹123,750

Calculation:
Commission: $1,500 × 0.05 = $75 (₹6,187.50)
TDS Withholding (10%): $150 (₹12,375)
Net payout: $1,275 (₹105,187.50)

Note: ValueSkins remits ₹12,375 to Indian government on creator's behalf
Creator receives ₹105,187.50 in bank account
```

### 2.3 Payout Schedule

**Weekly Payouts:**

| Day | Action |
|-----|--------|
| **Friday 5pm PT** | Cutoff for deals to be marked "completed" |
| **Saturday 8am PT** | Payout calculation runs (automated) |
| **Saturday 12pm PT** | Payout batches created + queued |
| **Monday 9am PT** | ACH/bank transfers initiated |
| **Monday-Wednesday** | Funds arrive in creator accounts (3-5 business days) |

**Manual Payout Request:**
- Creators can request manual payout anytime (outside weekly schedule)
- Processing: Within 2 business days
- Minimum: $10 USD (to avoid fees)

**Database:**
```sql
-- Scheduled weekly
SELECT creator_id, SUM(agreed_amount) as total_earnings
FROM deal_rooms
WHERE status = 'completed' 
  AND completed_at >= DATE_TRUNC('week', NOW())
  AND creator_id NOT IN (SELECT user_id FROM disputes WHERE status IN ('open', 'appealed'))
GROUP BY creator_id;

INSERT INTO payouts (creator_id, amount_cents, currency, status, scheduled_date)
VALUES (...) ON CONFLICT (creator_id, week) DO UPDATE SET amount_cents = EXCLUDED.amount_cents;
```

### 2.4 Tax Withholding & Remittance

**How Withholding Works:**

1. **Calculation:** ValueSkins calculates withholding based on country of residence
2. **Deduction:** Amount withheld from creator's payout
3. **Reporting:** ValueSkins records withholding in tax database
4. **Remittance:** ValueSkins remits withheld amount to relevant tax authority
5. **Documentation:** Creator receives withholding statement for tax filing

**Tax Authority Remittances:**

| Jurisdiction | Authority | Frequency | Deadline |
|--------------|-----------|-----------|----------|
| **US** | IRS | Annual (1099-NEC) | Jan 31 |
| **India** | Income Tax Dept | Monthly (TDS) | 7th of next month |
| **UK** | HMRC | Quarterly | End of quarter |
| **Canada** | CRA | Annual | March 31 |
| **Australia** | ATO | Annual | June 30 |

**Example (India TDS Remittance):**
```
April payouts: ₹12,375 TDS withheld from creators
Remitted to: Government of India Income Tax Dept
Due: May 7, 2026
ValueSkins files: Challan (TDS payment receipt)
Creator receives: Withholding certificate for personal tax filing
```

---

### 2.5 Failed Payouts

If a payout fails (invalid bank account, insufficient funds, fraud flag):

**Retry Sequence:**
```
Attempt 1: Immediate retry (same day)
Attempt 2: Next day retry
Attempt 3: After 3 days
...
Attempt 30: Up to 30 days of retries
```

**After 30 Days:**
- Amount held in **escrow account** pending creator action
- Creator receives email: "Update your payment method"
- Creator must update bank account / payment method
- Once updated, payout processes immediately
- Held funds do NOT accrue interest

**Database:**
```sql
INSERT INTO payout_failures (creator_id, amount_cents, reason, retry_count)
VALUES (...);

UPDATE payouts SET status = 'failed', failed_at = NOW() WHERE payout_id = ...;

-- After 30 days
UPDATE payouts SET status = 'held_in_escrow' WHERE failed_at < NOW() - INTERVAL '30 days';
```

---

### 2.6 Payout Disputes & Chargebacks

**Creator Claims "I didn't receive my payout":**

1. **Creator files payout dispute** within 30 days of transfer date
2. **ValueSkins team:**
   - Checks bank transfer status (via ACH/SWIFT confirmation)
   - Confirms whether funds were sent
   - Confirms whether funds were received
3. **Outcome:**
   - If sent successfully: Creator checks their bank (may take 5-7 days)
   - If sent but not received: Contact recipient bank for research
   - If NOT sent: Emergency re-payout (manually processed)

**Brand Claims "Creator double-charged me":**

1. **Two payouts for same deal (should not happen)**
2. **Root cause analysis:**
   - Was deal marked complete twice?
   - Was payout run twice?
   - Was there a system error?
3. **Resolution:**
   - Issue refund to brand (process as dispute resolution)
   - Recover from creator via next payout (chargeback)
   - Fix system bug to prevent recurrence

---

### 2.7 Payout Holds & Compliance Flags

ValueSkins may place a temporary hold on payouts if:

| Reason | Duration | Action |
|--------|----------|--------|
| Account under investigation | Pending investigation | Resume once cleared |
| Suspected fraud | 30 days | Manual review required |
| Dispute in process | Until resolved | Resume after resolution |
| Tax ID mismatch | Until corrected | Creator must update |
| Payment method flagged | 5 business days | Creator must verify |
| Sanctions screening | Pending review | Contact creator for info |

**Database:**
```sql
CREATE TABLE payout_holds (
  id BIGSERIAL PRIMARY KEY,
  creator_id BIGINT NOT NULL,
  reason VARCHAR(255),
  held_at TIMESTAMP DEFAULT NOW(),
  released_at TIMESTAMP,
  notes TEXT
);

INSERT INTO payout_holds (creator_id, reason) VALUES (creator_id, 'fraud_investigation');
-- When resolved:
UPDATE payout_holds SET released_at = NOW() WHERE creator_id = creator_id AND released_at IS NULL;
```

---

## 3. SLA Guarantees

### 3.1 Response Times

| Event | SLA | Consequence for Miss |
|-------|-----|---------------------|
| Dispute filing acknowledgment | 48 hours | Manual follow-up + credit |
| Investigation completion | 7 days | Decision issued immediately |
| Appeal decision | 10 days | Auto-grant appeal in creator's favor |
| Payout processing | 5 business days | Manual expedite + fees covered |
| Payout arrival | 7 calendar days | Investigation + potential refund |

### 3.2 Uptime & Availability

**Platform Availability Goal:** 99.5% monthly uptime (excluding maintenance windows)

- Scheduled maintenance: Saturday 12am-2am PT (12am = announcement; 2am = completion)
- Emergency maintenance: As needed (posted in-app with ETA)
- During disputes: Platform must remain accessible for evidence uploads + messaging

---

## 4. Appendix: Database Schema Updates

```sql
-- Disputes table (if not already created)
CREATE TABLE disputes (
  id BIGSERIAL PRIMARY KEY,
  deal_id BIGINT UNIQUE NOT NULL,
  filed_by_user_id BIGINT NOT NULL,
  dispute_type VARCHAR(50), -- 'payment_not_received', 'deliverables_not_provided', etc.
  description TEXT,
  amount_in_dispute_cents BIGINT,
  status VARCHAR(20) DEFAULT 'open', -- open, acknowledged, in_review, appealed, resolved_creator_favor, resolved_brand_favor, resolved_partial, dismissed
  evidence_urls TEXT[], -- array of attachment URLs
  
  filed_at TIMESTAMP DEFAULT NOW(),
  acknowledged_at TIMESTAMP,
  investigation_started_at TIMESTAMP,
  decision_date TIMESTAMP,
  decision_summary TEXT,
  appeal_submitted_at TIMESTAMP,
  appeal_decision TIMESTAMP,
  
  assigned_to BIGINT, -- support team member ID
  assigned_to_appeal BIGINT, -- different team member for appeal
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payouts table (if not already created)
CREATE TABLE payouts (
  id BIGSERIAL PRIMARY KEY,
  creator_id BIGINT NOT NULL,
  amount_cents BIGINT NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, sent, failed, held_in_escrow, completed
  
  payment_method VARCHAR(20), -- 'ach', 'paypal', 'wire'
  destination_account_masked VARCHAR(50), -- last 4 digits
  
  commission_cents BIGINT,
  tax_withholding_cents BIGINT,
  gross_amount_cents BIGINT,
  
  scheduled_date DATE,
  sent_date TIMESTAMP,
  arrived_date TIMESTAMP,
  
  failure_reason TEXT,
  retry_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tax withholding summary (for reporting)
CREATE TABLE tax_withholding_summary (
  id BIGSERIAL PRIMARY KEY,
  month DATE, -- first day of month
  country VARCHAR(2),
  total_withheld_cents BIGINT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, remitted, filed
  remittance_date DATE,
  authority_receipt VARCHAR(255), -- government confirmation number
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

**END OF DISPUTE RESOLUTION & PAYOUT PROCESS SLA**
