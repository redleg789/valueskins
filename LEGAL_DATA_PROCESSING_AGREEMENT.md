# Data Processing Agreement (DPA)

**ValueSkins, Inc.**  
Effective Date: April 17, 2026

---

## 1. Overview

This Data Processing Agreement ("DPA") governs how ValueSkins, Inc. ("Processor") processes personal data on behalf of creators and brands ("Data Subjects" or "Controllers").

This DPA complies with:
- **GDPR** (EU General Data Protection Regulation)
- **CCPA** (California Consumer Privacy Act)
- **LGPD** (Lei Geral de Proteção de Dados - Brazil)
- **PIPL** (Personal Information Protection Law - China)
- **Other applicable privacy laws**

---

## 2. Definitions

- **Personal Data:** Any information that relates to an identified or identifiable individual (name, email, SSN, payment info, social media data, etc.)
- **Processing:** Any operation on personal data (collection, storage, use, deletion, etc.)
- **Data Subject:** The individual to whom personal data relates
- **Controller:** The entity determining how personal data is processed (the creator or brand using ValueSkins)
- **Processor:** ValueSkins, Inc. (processes data on behalf of Controllers)
- **Data Breach:** Unauthorized access, disclosure, or loss of personal data

---

## 3. Scope of Data Processing

### 3.1 Data Collected

ValueSkins collects and processes the following personal data:

**From Creators:**
- Name, email address, phone number
- Social media profile data (handle, followers, engagement, bio)
- Tax identification information (SSN, ITIN, EIN, PAN, NI Number, etc.)
- Payment information (bank account, routing number, PayPal ID)
- Deal transaction history
- Chat messages
- Reputation/rating information

**From Brands:**
- Business name, email, phone
- Business tax ID (EIN, VAT Number, etc.)
- Payment information (credit card, bank account)
- Campaign information and deliverable requirements
- Chat messages
- Deal transaction history

**Automatically Collected:**
- IP addresses, browser type, device information
- Login timestamps
- Platform activity logs
- Dispute records

### 3.2 Purpose of Processing

ValueSkins processes personal data for:
1. **Platform Operation:** Account creation, user authentication, deal management
2. **Matching:** Recommending creators to brands and vice versa
3. **Payment Processing:** Tax withholding, payout, dispute resolution
4. **Fraud Detection:** Risk scoring, account verification
5. **Legal Compliance:** Tax form generation, regulatory reporting
6. **Analytics:** Anonymized aggregation (no PII), benchmarking, market insights
7. **Communication:** Email notifications, in-app messages
8. **Dispute Resolution:** Investigating claims, enforcing agreements

### 3.3 Data Retention

| Data Type | Retention Period | Reason |
|-----------|------------------|--------|
| Account information | Duration + 7 years | Tax compliance (IRS, HMRC, etc.) |
| Chat messages | 12 months | Legal disputes, evidence |
| Tax forms (1099, W-8BEN, etc.) | Indefinitely | IRS record-keeping requirement |
| Payment records | 7 years | Tax audit trail |
| Reputation scores | 2 years | Creator onboarding history |
| Anonymized analytics | Indefinitely | Market insights (no PII) |
| Deal contracts | 7 years | Legal liability |

After retention period expires:
- Personal identifiers are removed
- Data is anonymized or deleted
- Tax-critical data is archived (not accessible to product team)

---

## 4. Data Subject Rights

All data subjects have the right to:

### 4.1 Right to Access (GDPR Article 15)
- You can request all personal data we hold about you
- We will provide it within **30 days** in a portable format (JSON, CSV)
- **Process:** Email legal@valueskins.com with "Access Request" in subject

### 4.2 Right to Rectification (GDPR Article 16)
- You can request corrections to inaccurate data
- We will update within **14 days**
- **Process:** Submit corrections via account settings or email

### 4.3 Right to Erasure ("Right to Be Forgotten") (GDPR Article 17)
- You can request deletion of your personal data
- **Exceptions:** We retain tax-critical data (1099, W-8BEN, payment records) for 7 years per law
- We will delete non-tax data within **30 days**
- **Process:** Email legal@valueskins.com with "Deletion Request" in subject

### 4.4 Right to Restrict Processing (GDPR Article 18)
- You can restrict how we use your data
- We will stop processing (except for storage) within **7 days**
- **Example:** You can restrict us from using data for marketing while keeping it for tax purposes

### 4.5 Right to Data Portability (GDPR Article 20)
- You can receive your data in a structured, portable format
- We will provide within **30 days**
- Formats supported: JSON, CSV, PDF

### 4.6 Right to Object (GDPR Article 21)
- You can object to processing of your data
- We will stop processing within **14 days** (except where legally required)
- **Example:** Object to marketing emails, but not to tax form generation

### 4.7 Rights Related to Automated Decision Making (GDPR Article 22)
- Our reputation scoring and fraud detection use automated algorithms
- You have the right to:
  - Know how we calculated your score
  - Request human review of automated decisions
  - Challenge scores you believe are inaccurate
- **Process:** Email legal@valueskins.com with "Algorithm Review Request"

---

## 5. Data Security

### 5.1 Security Measures

ValueSkins implements:
- **Encryption:** All data in transit (HTTPS/TLS) and at rest (AES-256)
- **Access Controls:** Role-based access; only authorized employees access personal data
- **Firewalls:** Network segmentation; no direct internet access to databases
- **Monitoring:** 24/7 intrusion detection and logging
- **Backups:** Daily encrypted backups; 30-day retention for recovery

### 5.2 Data Breach Notification

If we discover a data breach, we will:
- Notify affected data subjects **within 72 hours** (GDPR requirement)
- Notify relevant authorities (DPA, ICO, CCPA AG) if breach is serious
- Provide:
  - Description of the breach
  - Data compromised
  - Likely consequences
  - Measures being taken
  - Recommended actions for data subjects

### 5.3 Incident Response Plan

1. **Detection:** Continuous monitoring + employee reporting
2. **Containment:** Isolate affected systems within 1 hour
3. **Investigation:** Determine scope, root cause, impact
4. **Notification:** Inform affected parties (72 hours max)
5. **Remediation:** Patch vulnerability, enhance security
6. **Post-mortem:** Document lessons learned

---

## 6. Subprocessors (Third Parties)

ValueSkins does **not** use third-party processors for personal data except:

| Processor | Purpose | Location | Security |
|-----------|---------|----------|----------|
| AWS (RDS PostgreSQL) | Database hosting | us-east-1, eu-west-1 | SOC 2 Type II certified |
| Twilio (SMS notifications) | Opt-in SMS notifications | US | SOC 2 Type II certified |
| SendGrid (Email) | Transactional emails | US | SOC 2 Type II certified |

**Important:** We do not use Google Analytics, Facebook Pixel, or other third-party tracking. No advertising networks have access to personal data.

For each subprocessor, we have:
- A Data Processing Addendum (DPA)
- Security certifications (SOC 2, ISO 27001)
- Data handling commitments

**Data Subject Consent:** By using ValueSkins, you consent to processing by the above subprocessors.

---

## 7. International Data Transfers

### 7.1 US to EU Transfers

If you are in the EU, your data may be transferred to the US (where ValueSkins servers are located).

**Legal Basis:** Standard Contractual Clauses (SCCs) as approved by EDPB.

We ensure:
- Adequate safeguards (encryption, access controls)
- Compliance with GDPR even outside EU
- Right to local storage (on request)

### 7.2 Data Localization (China, Russia)

For data subjects in countries requiring data localization (China PIPL, Russia DPA):
- Data is stored locally (not transferred)
- Processing complies with local law
- On request, we facilitate local data residency

---

## 8. California Privacy Rights (CCPA)

If you are a California resident, you have the right to:

### 8.1 Right to Know (CCPA §1798.100)
- What personal information we collect
- The purposes for collection
- Categories of third parties we share with

### 8.2 Right to Delete (CCPA §1798.105)
- Request deletion of your personal information
- Exceptions: Tax records (7 years), legal obligations

### 8.3 Right to Opt-Out (CCPA §1798.120)
- Opt out of "sales" of personal information
- **Note:** ValueSkins does NOT sell personal information

### 8.4 Right to Non-Discrimination (CCPA §1798.125)
- We will not discriminate against you for exercising CCPA rights
- No penalties, higher prices, or denied services

**Process:** Submit requests via legal@valueskins.com

---

## 9. Brazil Privacy Rights (LGPD)

If you are a Brazilian data subject:

### 9.1 Rights Under LGPD
- Right to access, correct, delete personal data
- Right to data portability
- Right to object to processing
- Right to withdraw consent

### 9.2 Sensitive Data
- Health, racial, religious data: Explicit consent required
- Criminal data: Processing prohibited (except by law)

---

## 10. China Privacy Rights (PIPL)

If you are in China:

### 10.1 Data Localization
- Your personal data is stored in mainland China
- Cross-border transfers require explicit consent

### 10.2 Consent
- Explicit, informed consent required for processing
- You can withdraw consent anytime

### 10.3 Restrictions
- No sharing with third parties without consent
- Government access: We comply with lawful requests

---

## 11. Cookies & Tracking

### 11.1 Cookies We Use

| Cookie | Purpose | Expiry |
|--------|---------|--------|
| `session_id` | User authentication | 30 days |
| `timezone` | User timezone preference | 1 year |
| `theme` | Dark/light mode preference | 1 year |

### 11.2 Cookies We Don't Use

We do **not** use:
- Google Analytics
- Facebook Pixel
- Advertising networks
- Retargeting cookies
- Behavioral tracking

### 11.3 Managing Cookies

You can:
- Disable cookies in browser settings
- Clear cookies anytime
- Opt out of optional cookies in account settings

---

## 12. Privacy by Design

ValueSkins implements privacy by design:
1. **Minimization:** Collect only necessary data
2. **Pseudonymization:** Use hashes for non-critical identifiers
3. **Encryption:** All data encrypted in transit & at rest
4. **Access Controls:** Only authorized employees can access personal data
5. **Audits:** Annual third-party privacy audits

---

## 13. Contact & Inquiries

**For Data Subject Rights Requests:**
- Email: legal@valueskins.com
- Subject: [Access/Deletion/Rectification/Portability Request]
- Include: Name, email, specific data/dates
- Response time: Within 30 days

**For Privacy Concerns:**
- Email: privacy@valueskins.com
- Include: Description of concern, evidence if possible
- Response time: Within 14 days

**For GDPR Questions:**
- Contact your local Data Protection Authority (DPA)
- Europe: https://edpb.ec.europa.eu
- UK: https://ico.org.uk

**For CCPA Questions:**
- California Attorney General: https://oag.ca.gov/privacy

---

## 14. Changes to DPA

We may update this DPA at any time. Material changes will be communicated via email.

Continued use of ValueSkins constitutes acceptance of updated DPA.

---

## 15. Appendix: Data Processing Details

### A. Processing Activities

| Activity | Legal Basis | Duration | Recipients |
|----------|------------|----------|------------|
| Account creation | Contractual necessity | Account lifetime + 7 years | ValueSkins staff, payment processor |
| Reputation scoring | Legitimate interest | 2 years | Brands (anonymized stats only) |
| Fraud detection | Contractual necessity, legal obligation | 12 months | ValueSkins staff |
| Tax form generation | Legal obligation | 7 years | Creator, tax authorities |
| Email communication | Contractual necessity | Consent-based | SendGrid (subprocessor) |
| Chat storage | Contractual necessity | 12 months | ValueSkins staff (dispute resolution) |

### B. Data Subject Categories

1. **Creators** (primary users)
   - Social media data
   - Tax data
   - Payment data
   - Behavioral data (deals, ratings)

2. **Brands** (secondary users)
   - Business data
   - Payment data
   - Campaign data
   - Behavioral data (campaign history)

3. **Indirect data subjects**
   - Creator social media followers (data aggregated, not individually tracked)
   - Brand customers (no interaction with ValueSkins)

---

**END OF DATA PROCESSING AGREEMENT**
