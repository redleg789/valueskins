# ValueSkins Tax & Compliance Architecture

## Overview

Tax handling is critical for acquisition readiness. This document outlines how ValueSkins manages:
- 1099-NEC generation (US creators)
- State withholding requirements
- International tax treaties
- Compliance reporting
- Creator payouts with tax deductions

## 1. Tax Service Architecture

### Current Implementation Status
- Backend service: `backend/tax_service/src/lib.rs` — **EXISTS**
- Database schema: Supports tax profiles, withholding rates, payout records
- Payment service: Idempotency key prevents double-taxation

### Components

#### 1.1 Creator Tax Profile
```sql
CREATE TABLE creator_tax_profiles (
    id BIGSERIAL PRIMARY KEY,
    creator_user_id BIGINT NOT NULL UNIQUE,
    tax_country VARCHAR(2) NOT NULL, -- "US", "IN", "GB", etc
    tax_state VARCHAR(2), -- "CA", "NY", "TX" for US
    ssn_or_tin BYTEA NOT NULL, -- Encrypted SSN (last 4 visible only)
    tax_id_type VARCHAR(50), -- "SSN", "ITIN", "EIN", "PAN", "VAT"
    w9_accepted_at TIMESTAMP,
    kyc_status VARCHAR(50), -- "pending", "verified", "rejected"
    kyc_verified_at TIMESTAMP,
    annual_earnings_ytd BIGINT DEFAULT 0, -- cents
    annual_tax_withheld_ytd BIGINT DEFAULT 0, -- cents
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.2 Withholding Rules (Configurable)
```sql
CREATE TABLE tax_withholding_rules (
    id BIGSERIAL PRIMARY KEY,
    country VARCHAR(2) NOT NULL,
    state VARCHAR(2), -- NULL for country-level
    withholding_rate DECIMAL(5,2) NOT NULL, -- 10.0 = 10%
    applies_after_threshold_cents BIGINT DEFAULT 0,
    tax_form_required VARCHAR(50), -- "1099-NEC", "1099-MISC", "W2", etc
    effective_from TIMESTAMP,
    effective_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.3 Tax Event Log (Immutable Audit Trail)
```sql
CREATE TABLE tax_events (
    id BIGSERIAL PRIMARY KEY,
    creator_user_id BIGINT NOT NULL,
    deal_id BIGINT,
    event_type VARCHAR(50) NOT NULL, -- "deal_completed", "payout", "form_1099_generated"
    amount_cents BIGINT,
    tax_withheld_cents BIGINT,
    tax_jurisdiction VARCHAR(2),
    metadata JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

## 2. Tax Calculation Logic

### 2.1 Withholding Formula

For each deal payout:
```
gross_amount = deal agreed amount
platform_fee = gross_amount * 0.05

taxable_income = gross_amount - platform_fee
tax_withheld = taxable_income * withholding_rate(country, state)

net_payout = gross_amount - platform_fee - tax_withheld

WHERE withholding_rate =
  - US: 10% for independent contractors (safe harbor)
  - India: 10% standard, 20% if high-value deal
  - EU: VAT-dependent (reverse charge model)
  - Other: Configurable per jurisdiction
```

### 2.2 Annual Reconciliation

End of fiscal year:
```
1. Aggregate all creator's deals (gross + tax withheld)
2. Calculate actual tax liability (jurisdiction-specific)
3. Generate 1099-NEC (US) or equivalent (international)
4. Compare withholding vs. actual liability
5. Trigger refund if overwithheld, request balance due if underwithheld
```

### 2.3 Creator Self-Employment Tax

For US creators (1040 Schedule C):
```
self_employment_income = net_payout - business_expenses

self_employment_tax = self_employment_income * 0.9235 * 0.153 (approx 14%)

owed_to_irs = self_employment_tax - estimated_tax_paid

ValueSkins' role:
  - Generate 1099-NEC with correct box amounts
  - Note: Creator pays self-employment tax, not ValueSkins
```

## 3. Form Generation (1099-NEC)

### 3.1 1099-NEC Fields (US)

```
Box 1a: Rents from real estate — [N/A for creator deals]
Box 1b: Royalties — [Possible for music/IP deals]
Box 2: Other income — [Most creator payments go here]
Box 3: Other income description — "Creator sponsorship deals"
Box 4: Federal income tax withheld — [Our 10% withholding]
Box 5: Fishing boat proceeds — [N/A]
Box 6: Medical/health care payments — [N/A]
Box 7: Nonemployee compensation — [N/A, reserved for future]
Box 8: Crop insurance proceeds — [N/A]
Box 9: Excess golden parachute payments — [N/A]
Box 10: Gross proceeds, sales of securities — [N/A]

Required metadata:
  - Filer name: "ValueSkins, Inc."
  - Filer ITIN/EIN: [To be obtained during incorporation]
  - Payee SSN: [Creator's masked SSN]
  - Payee name/address
  - Year filed (e.g., 2026 for 2025 earnings)
```

### 3.2 Generation Process

```rust
async fn generate_1099_nec(
    creator_user_id: i64,
    tax_year: i32,
) -> Result<TaxForm1099NEC> {
    1. Fetch creator_tax_profiles[creator_user_id]
    2. Query tax_events WHERE creator_user_id = ? AND YEAR(timestamp) = tax_year
    3. Sum: gross_income, tax_withheld, by_deal_type
    4. Generate XML (IRS e-file format) OR PDF
    5. Store in tax_forms table with audit timestamp
    6. Make available to creator in dashboard
}
```

## 4. International Handling

### 4.1 Tax Treaties (US + India Example)

| Jurisdiction | Rate | Form | Notes |
|---|---|---|---|
| USA | 10% standard | 1099-NEC | FATCA reporting required |
| India | 10-20% | TDS Cert (26AS) | Treaty reduces to 15% for services |
| UK | 20% | Self-assessment | VAT reverse charge applicable |
| EU | VAT-dependent | VAT invoice | No withholding if MOSS registered |
| Canada | 15-30% | T4A-NR | Treaty reduces to 15% |

### 4.2 Treaty Application

If creator = Indian resident + USA revenue:
```
Gross: $10,000
Treaty rate (US-India services): 15% (vs 30% standard)
Tax withheld: $1,500
Net payout: $8,500

Forms:
  - 1099-NEC to IRS (US reporting)
  - Withholding Certificate to creator (tax filing in India)
```

### 4.3 FATCA Compliance (Foreign Account Tax Compliance Act)

For non-US creators:
```
1. Require W-8BEN (Certificate of Foreign Status)
2. Store ITIN/Foreign Tax ID
3. Report to IRS: Form 8966 (annual FATCA report)
4. Withhold 30% if W-8BEN not provided (default)
5. Apply treaty to reduce if applicable
```

## 5. Payment Payout with Tax Deduction

### 5.1 Payout Ledger Entry

```sql
INSERT INTO payout_ledger (
    creator_user_id,
    deal_id,
    gross_amount_cents = 100000 (e.g., $1000),
    platform_fee_cents = 5000,
    taxable_income_cents = 95000,
    tax_withheld_cents = 9500,  -- 10% of taxable
    net_amount_cents = 85500,
    currency = "USD",
    processor = "stripe",
    processor_status = "pending",
    initiated_at = NOW()
);
```

### 5.2 Bank Payout Flow

```
1. Brand funds escrow: $1,000 USD
2. ValueSkins receives: $1,000
3. Platform fee: $50 (5%)
4. Taxable: $950
5. Tax withheld: $95 (10%)
6. Creator receives: $855
7. ValueSkins retains: $50 (fee) + $95 (tax holdback)
8. Quarterly: $95 remitted to IRS, 1099 filed EOY
```

## 6. Compliance Checklist

### 6.1 At Launch (MVP)

- [ ] Tax service can calculate withholding (any country)
- [ ] Tax forms stored in database (not printed yet)
- [ ] Creator tax profiles captured at OAuth
- [ ] W9/W-8BEN collection in UI (for US/Int'l)
- [ ] Payout ledger records all tax data
- [ ] Audit trail immutable (tax_events table)

### 6.2 Before Scaling (< 1M ARR)

- [ ] Generate 1099-NEC PDFs (US creators)
- [ ] Generate W-8BEN confirmation letters (international)
- [ ] Quarterly tax withholding remittance process
- [ ] Creator dashboard shows tax summary
- [ ] Tax advisor review of withholding rates

### 6.3 Before Acquisition (> 1M ARR)

- [ ] SOC 2 Type II audit (controls over tax data)
- [ ] FATCA compliance (foreign creator reporting)
- [ ] State unemployment insurance registration (if applicable)
- [ ] Country-specific tax registration (India TAN, UK PAYE, etc)
- [ ] EY/PwC tax audit of previous year filings
- [ ] Legal opinion on tax treatment (contractor vs employee)

## 7. Integration with Payment Service

### 7.1 Payment Processor Role

ValueSkins' payment processor (Stripe/Razorpay/Meta) handles:
- Receiving brand payment into escrow
- Splitting escrow into: fee + tax + payout
- Sending to creator (net amount only, tax withheld separately)

### 7.2 Tax Service Role

ValueSkins' tax service handles:
- Calculating withholding rate
- Recording tax event (immutable)
- Generating forms (1099-NEC, W-8BEN, etc)
- Scheduling IRS remittance

### 7.3 Separation of Concerns

```
Payment Processor: "Move $855 to creator's bank account"
Tax Service: "Creator earned $1000, withheld $95, remit $95 to IRS, file 1099"
```

Neither knows the other's details. Tax service doesn't call payment API. Payment processor doesn't calculate tax.

## 8. Documentation for Meta Acquisition

### 8.1 Meta's Tax Questions (Likely)

Q: "How do you handle creators in countries Meta doesn't operate?"
A: Configurable withholding rules by country. Treaty support for treaty countries. FATCA compliance for foreign accounts.

Q: "What if a creator is a business entity, not individual?"
A: Tax profiles support EIN (US), PAN (India), VAT (EU). Forms auto-adjust.

Q: "How much tax liability does ValueSkins have?"
A: Zero. We're withholding agent only. We remit withheld tax to governments. Creator responsible for self-employment tax.

Q: "Are there any compliance risks?"
A: Minimal. We're conservative (10% safe harbor, FATCA-compliant, immutable audit trail). Risk = tax authorities want higher withholding (we adjust rates).

### 8.2 Docs to Provide Meta

1. Tax Service Architecture (this file)
2. Withholding Rules by Jurisdiction (spreadsheet)
3. Sample 1099-NEC, W-8BEN forms
4. FATCA Compliance Checklist
5. Tax Advisor Letter (confirming approach)
6. Audit trail sample (tax_events table)

## 9. Future Meta Integration

When Meta acquires ValueSkins:

### 9.1 Meta's Payment System

Meta may want to replace Stripe/Razorpay with their own payment system:

```
Current:
  ValueSkins -> Stripe -> Creator's Bank

Future (Meta acquisition):
  ValueSkins -> Meta Pay -> Creator's Bank
  
Tax logic remains identical. Payment processor swaps out.
```

### 9.2 Meta's Creator Fund

Meta may integrate with their Creator Fund:

```
Creator Fund Creator (already Meta-verified) applies to ValueSkins deal
  -> Skip W9/W-8BEN (already provided to Meta)
  -> Use Meta's tax ID for 1099 reporting
  -> Payout via Meta Creator Fund (not direct bank)
```

### 9.3 International Expansion

Meta may want to add creators from [country]:

```
1. Add withholding rule for [country] in tax_service
2. Update FATCA/treaty logic in tax service
3. Update form generation (local TDS cert, invoice, etc)
4. All ValueSkins code unchanged — pluggable
```

## 10. Implementation Roadmap

| Phase | Timeline | Deliverables |
|-------|----------|--------------|
| Phase 1 (Current) | Now | Tax profile schema, withholding calculation, audit trail |
| Phase 2 | Before $100K ARR | 1099-NEC generation, W-8BEN collection, quarterly remittance process |
| Phase 3 | Before $1M ARR | Multi-country withholding rules, FATCA compliance, tax advisor review |
| Phase 4 | Acquisition | SOC 2 Type II, EY audit, legal tax opinion, Meta integration docs |

## 11. References

- IRS 1099-NEC Form: https://www.irs.gov/pub/irs-pdf/f1099nec.pdf
- W-8BEN (Foreign Investor): https://www.irs.gov/pub/irs-pdf/fw8ben.pdf
- FATCA Overview: https://www.irs.gov/businesses/corporations/foreign-account-tax-compliance-act-fatca
- US-India Tax Treaty: https://www.irs.gov/pub/irs-trty/india.pdf
- EU VAT Digital Services: https://taxation-customs.ec.europa.eu/digital-services-package_en

---

**Document Status**: Ready for Tax Advisor Review
**Last Updated**: April 2026
**Next Review**: Quarterly (when first international creator added)
