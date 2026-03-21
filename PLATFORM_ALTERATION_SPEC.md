# Platform Workflow Alterations — LinkedIn & YouTube

## Context

Instagram/TikTok model: Creator + Brand negotiate **price, script, exclusivity, deliverables**. Both parties co-author content.

LinkedIn & YouTube serve different creator economies:
- **LinkedIn**: Professional services marketplace (B2B). Creator expertise = currency. Negotiation = contract negotiation.
- **YouTube**: Longform content monetization. Creator audience = asset. Sponsorship = simple brand insertion.

---

## LinkedIn: "Professional Opportunity Marketplace"

### The Transition It Solves
LinkedIn evolves from "hiring platform" → "professional boasting platform." Valueskins helps by:
- Companies **discover expertise** (like hiring, but for brand partnerships)
- Creators **sell credibility** (thought leadership, speaking, consulting, corporate advisory)
- Both negotiate **formal service agreements** (not handshake deals)

### Deal Types (All 4 Active)

1. **B2B Services** — "I'll create corporate content for you"
   - Brand: Tech company wanting thought leadership videos
   - Creator: Software engineer with 100K+ engaged connections
   - Terms: 3-month content series, usage rights, exclusivity for tech category

2. **Professional Credentialing** — "Verify and amplify my expertise"
   - Brand: VC firm or recruitment agency
   - Creator: Data scientist or product leader
   - Terms: Featured profile badge, referral commission, speaking opportunity

3. **Speaking/Training** — "I'll speak at your event"
   - Brand: Conference organizer or corporate training firm
   - Creator: Industry expert
   - Terms: Event date, audience size, honorarium, travel covered

4. **Executive Positioning** — "Connect me with investors/recruiters"
   - Brand: VC fund or HR agency
   - Creator: Founder or executive
   - Terms: Intro facilitation, equity in venture, placement fee

### UI/UX Alterations for LinkedIn

**Deal Negotiation:**
- Remove "Script Editor" entirely (LinkedIn deals are NOT about co-authored content)
- Add "Service Agreement" template selector:
  - B2B Services Contract
  - Speaking Engagement Letter
  - Consulting Agreement
  - Equity/Placement Arrangement
- Add legal fields:
  - Scope of Work (text area)
  - Deliverables checklist (e.g., "3 LinkedIn articles", "1 speaking slot", "20 intros")
  - NDA required? (toggle)
  - IP Ownership clause (radio: Creator, Brand, Shared)
  - Payment model (flat fee, equity, retainer, commission)

**Deal Room States (Simplified):**
Replace Instagram's `brief → offer → negotiation → accepted → softhold → completed` with:

```
pending
  ↓
proposal_review (recipient reads scope of work)
  ↓
contract_draft (auto-generates agreement from selections)
  ↓
legal_review (both parties sign)
  ↓
active (work begins)
  ↓
completed
  ↓
review_exchange
```

**Profile Emphasis:**
- Creator "credentials" section (education, certifications, past speaking engagements)
- Brand "hiring history" section (who they've worked with before)
- Reputation badge: "Trusted B2B Partner" after 3+ completed deals

**Marketplace Filters (not Instagram's "engagement rate"):**
- Industry expertise (AI/ML, SaaS, Finance, etc.)
- Audience size (not just followers, but "decision makers in audience")
- Past contract types (B2B Services, Speaking, Consulting)
- NDA willing? Yes/No
- Geographic availability (for speaking engagements)

---

## YouTube: "Longform Sponsorship Marketplace"

### The Transition It Solves
YouTube fights TikTok/Reels by **keeping creators incentivized to produce long-form**. Valueskins helps by:
- Making sponsorship deals **as fast as pre-roll ads** (no negotiation friction)
- Brands **fund specific video topics** (e.g., "review this product in 15-min unboxing")
- Creators **keep all audience**, YouTube gets discovery

### Deal Type (Singular: Product Sponsorship)

- **Creator**: Any YouTuber (tech, lifestyle, food, fitness, etc.)
- **Brand**: Any product brand wanting review/sponsorship
- **Terms**: Fixed price, product shipment, content deadline, usage rights (brand can reshare), exclusivity window

---

### UI/UX Alterations for YouTube

**Script Negotiation Simplified to "Topic Brief":**
Remove the 3-mode script negotiation. Replace with:
```
Brand specifies:
  - Product to feature
  - Minimum video length (e.g., 10 minutes)
  - Placement in video (opening? mid-roll? outro?)
  - Explicit claims to avoid (compliance)
  - Usage rights (brand can use 30-sec clip in ads? yes/no)
  - Exclusivity window (e.g., 60 days no competing products)

Creator auto-accepts OR rejects (no back-and-forth).
If accept: deal is LIVE. Creator films, uploads.
```

**Deal Room States (Ultra-Simple):**
```
pending (brand waiting for creator to accept/reject)
  ↓
accepted (creator agrees to terms)
  ↓
in_progress (creator filming/editing)
  ↓
delivered (video uploaded, link provided)
  ↓
verified (brand watched video, approved)
  ↓
completed (payment released)
  ↓
review_exchange
```

**Eliminate Escrow/Milestones:**
- YouTube deals = simple: Creator gets paid on verified delivery
- No 30/40/30 payment split (Instagram model). Just: "Pay when video is approved"
- Payment trigger: Brand clicks "Verified ✓" → Immediate payout

**Creator Profile (YouTube-Specific):**
- Video production examples (embed YouTube shorts/clips)
- "Sponsorship rate" (simple: $/video, not negotiable)
- Product categories (willing to review): Tech, Fitness, Food, Finance, etc.
- Turnaround time: "Can deliver in 5-10 days"
- Past sponsorships: "Reviewed for Apple, Nike, Skillshare" (proof)

**Marketplace Filters:**
- Subscriber count ranges (10K-100K, 100K-1M, 1M+)
- Video category (Tech, Lifestyle, Food, Fitness, Education)
- Audience demographics (age, location)
- Average video length (10-15m, 15-30m, 30m+)
- Sponsorship rate ($/video in range)
- **NEW: Turnaround time** (fast: 3-5 days, standard: 5-10 days, flexible: negotiate)

**Deal Notification:**
- Brand: "Review complete → approve & pay" (1-click)
- Creator: "Payment received! ($3,500)" with payment history

---

## Implementation Priority

### Phase 1: YouTube (Fast Win)
Why first: Simplest to build, highest demand (YouTube creators = biggest audience losing to Reels).

1. Fork `instagram/page.tsx` → `youtube/page.tsx`
2. Strip out script editor, escrow milestones
3. Simplify deal states to 6 (pending → review_exchange)
4. Replace profile fields with YouTube-specific (channel art, avg views, subs)
5. Simplify marketplace to product sponsorship only

**Build time: 1-2 sessions** (reuse Instagram scaffolding, delete ~30% of complexity)

### Phase 2: LinkedIn (Strategic Win)
Why second: More complex (contracts), but targets B2B buyers (enterprise deals = higher LTV).

1. Fork `instagram/page.tsx` → `linkedin/page.tsx`
2. Replace script editor with "Service Agreement" template selector
3. Add legal/contract fields (IP, NDA, scope of work)
4. Update deal states to 7 (pending → review_exchange)
5. Replace profile with credentials, industry tags, past deals
6. Add "hiring history" for brands

**Build time: 2-3 sessions** (more complex state machine, contract templates)

---

## Why Companies Will Fight For This

| Platform | Win for Company | Win for Creator |
|---|---|---|
| **LinkedIn** | "Hire expertise + negotiate contracts in one place. No more recruiter emails." | "Get paid for credibility, not followers. B2B pays 10x Instagram rates." |
| **YouTube** | "Sponsor longform at scale. Creators aren't abandoning for Reels." | "Monetize without algorithm. Get paid BEFORE hitting monetization threshold." |

**The play:** LinkedIn = Enterprise deals ($10K-$100K per contract). YouTube = Volume deals ($500-$5K per video, fast payout). Together: billion-dollar creator economy.

---

## Files to Modify

- `frontend/src/app/demo/linkedin/page.tsx` — NEW (fork from instagram, add contract templates)
- `frontend/src/app/demo/youtube/page.tsx` — NEW (fork from instagram, strip down)
- `frontend/src/lib/useDealSync.ts` — Add deal type discriminator for platform
- `frontend/src/components/ContractTemplates.tsx` — NEW (LinkedIn service agreements)

---

## Rollout Strategy

1. **Week 1**: YouTube MVP (sponsor deals, simple workflow, payment on verify)
2. **Week 2**: LinkedIn MVP (service agreements, 4 deal types, B2B contracts)
3. **Week 3**: Cross-platform refinement (shared components, unified marketplace search across all platforms)
4. **Week 4**: Marketing push (YouTube creators: "Monetize without the algorithm", LinkedIn: "The B2B creator economy is open")
