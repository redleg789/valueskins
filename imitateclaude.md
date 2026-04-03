# Imitate Claude - Founder Context + Product Vision (NOT Engineering Law)

## CRITICAL: This is Context, Not Rules

**This document is founder mindset and product knowledge, NOT binding engineering policy.**

**For engineering standards,** see `ENGINEERING_STANDARDS.md` (binding, enforced at code review).

**This document explains:**
1. How Claude thinks (context for decision-making)
2. Product vision and workflows (what we're building)
3. Founder mentality (why we do things this way)

**Use this to understand:**
- What decisions matter to Saketh
- Why we prioritize certain things
- Product context when building features

**Do NOT use this to:**
- Skip engineering standards
- Justify code quality shortcuts
- Avoid testing/documentation
- Ignore security/compliance

If something here conflicts with `ENGINEERING_STANDARDS.md`, **ENGINEERING_STANDARDS.md wins.**

---

## Part 1: How Claude Thinks (Context for AI Assistants)

**NOTE: This is context for understanding Claude's decision-making, not rules you must follow.**

**For actual rules, see ENGINEERING_STANDARDS.md**

### Core Operating Principles

#### 1. **Correctness Always Precedes Speed**
- Broken code never ships, regardless of urgency
- TypeScript errors block deployment
- Type safety is non-negotiable
- Silent failures are worse than loud failures
- "It compiles" is minimum bar, not celebration

#### 2. **Refactoring and Abstraction Are Required, Not Debt**
- Copy-paste code is a liability
- Utilities should be centralized (not duplicated 3 times)
- Naming clarity prevents future bugs
- DRY principle saves debugging time
- Shared patterns reduce cognitive load for team

#### 3. **Code Review and Testing Before Shipping**
- No "ask forgiveness later" for production code
- Breaking changes require explicit approval
- Critical paths need test coverage
- Edge cases must be handled explicitly
- Error states are as important as happy paths

#### 4. **Documentation Prevents Disasters**
- Unclear code requires comments
- State machines need diagrams
- Breaking changes get migration guides
- Contributors shouldn't need to read your mind
- Assumptions should be documented, not implicit

#### 5. **Security and Compliance are Non-Negotiable**
- PCI-DSS if handling payment data
- GDPR/CCPA for user data
- Authentication is always verified
- Secrets never in code
- Audit trails for financial operations
- Rate limiting on public endpoints
- XSS/SQL injection prevention automatic

#### 6. **Reversibility is Built In**
- Feature flags for risky changes
- Database migrations are reversible
- Breaking changes have deprecation period
- Rollback procedures documented
- No accidental data deletion

#### 7. **Monitoring and Observability from Day One**
- Error logging for all paths
- Performance metrics for critical operations
- Health checks on dependencies
- Alerting on failures
- Audit logs for sensitive operations

#### 8. **Token Efficiency Without Cutting Corners**
- Use tools to avoid redundant work (Glob > Grep > Read)
- Batch independent operations
- Don't repeat analysis
- BUT: Never skip safety checks to save tokens
- Never guess at behavior - verify with code

### Error Recovery Protocol

When something breaks:
1. **Diagnose first** (don't retry same operation)
2. **Root cause analysis** (why did this fail?)
3. **Fix the cause** (not the symptom)
4. **Add safeguard** (prevent recurrence)
5. **Document the lesson** (update this guide)

### Code Quality Standards

**Naming conventions:**
- Variable names should be clear, not cryptic
- Function names should describe intent
- Misleading names are worse than long names
- Use domain language (not abbreviations)

**Function design:**
- Single responsibility principle
- Testable units (<50 lines preferred)
- Side effects documented
- Parameters validated at entry
- Return types explicit

**Error handling:**
- Every async operation needs error path
- User-facing errors are helpful (not technical jargon)
- Silent failures are forbidden
- Error logging includes context
- Recovery paths documented

**Testing requirements (for prod-grade code):**
- Critical paths: unit tests required
- State transitions: integration tests required
- API endpoints: endpoint tests required
- Payment code: 100% coverage required
- Authentication: fuzzing + normal tests

### Documentation Standards

**Code comments required when:**
- Logic is non-obvious
- Business rules are embedded
- Temporary workarounds exist
- Performance implications matter
- Concurrency issues present

**Commit messages required to include:**
- WHAT changed
- WHY it changed
- WHERE it impacts (which features/services)
- RISK level (low/medium/high)

**Breaking changes require:**
- Migration guide
- Deprecation period (minimum 1 sprint)
- Update path for downstream
- Rollback procedure documented

### Compliance Checklist (Must Pass Before Prod)

- [ ] Authentication verified on all mutations
- [ ] User data encrypted at rest
- [ ] Secrets not in code/logs
- [ ] Rate limiting implemented
- [ ] Audit logs for financial ops
- [ ] GDPR deletion support works
- [ ] XSS prevention active
- [ ] SQL injection prevented (parameterized)
- [ ] CSRF tokens present
- [ ] No hardcoded credentials
- [ ] Dependencies audited (npm audit)
- [ ] Error logs don't expose internals

---

## Part 2: Product Context and Workflows

**This part is accurate product knowledge. Use it when building features.**

**But follow ENGINEERING_STANDARDS.md for HOW you build it.**

### Core Concept (Business Layer)

**ValueSkins** = Portable professional identity for creators, verified by achievement.

Creator says "I'm a Software Engineer" → proves it (credentials, past deals, community rating) → earns reputation in that skin → any brand hiring "Software Engineers" finds them instantly.

**Problem solved:** Brands waste hours vetting creators. ValueSkins makes vetting automatic.

### The 24 ValueSkins (Professions)

1. **Fashion** - Influencer, Stylist, Designer, Model, Shopper, Photographer, Streetwear, Sustainable
2. **Beauty** - Makeup Artist, Skincare, Hair, Nails, Reviewer, Fragrance, Esthetician, Educator
3. **Travel** - Blogger, Adventure, Luxury, Budget, Solo, Photographer, Digital Nomad, Reviewer
4. **Food & Beverage** - Chef, Photographer, Recipe Creator, Reviewer, Pastry, Nutritionist, Stylist, Student
5. **Fitness** - Personal Trainer, Yoga, Coach, CrossFit, Pilates, Bodybuilder, Runner, Sports Nutritionist
6. **Lifestyle** - Blogger, Minimalist, Wellness, Self-Care, Productivity, Journal, Morning Routine, Slow Living
7. **Photography** - Portrait, Street, Landscape, Product, Wedding, Drone, Editor, Film Creator
8. **Interior Design** - Designer, Home Decor, DIY, Minimalist, Plant Parent, Organization, Furniture, Renovation
9. **Technology** - Software Engineer, Full Stack, Data Scientist, Product Manager, DevOps, UX/UI, Entrepreneur, AI/ML
10. **Entertainment** - Actor, Comedian, Musician, Producer, Director, Screenwriter, Animator, Voice Actor, Podcast, DJ, Streamer, Stunt
11. **Sports** - Professional Athlete, Fitness Coach, Sports Coach, Yoga, Nutritionist, Analyst, Trainer, Physical Therapist
12. **Business** - CEO, Entrepreneur, Consultant, Sales Manager, HR Manager, Operations, Marketing, Analyst

Plus 12 more: Real Estate, Sustainability, Wellness, Education, Gaming, Music Production, Writing, Coaching, Consulting, Design, Marketing, Media

### ValueSkin Structure (Data Model)

```typescript
interface ValueSkin {
  profession: string;           // "Software Engineer"
  level: 1-5;                   // 1=beginner, 5=expert
  verified: boolean;            // Human or algorithmic verification
  audience_match: {
    primary_age_range?: string;
    primary_location?: string;
    primary_language?: string;
  };
  reputation_score: 0-100;      // Calculated from completed deals
  badges: Array<{
    label: string;              // "5+ deals completed"
    earned_at: ISO8601;
    proof_link?: string;         // GitHub, portfolio, etc
  }>;
  skinned_profile: {
    headline: string;            // "Software Engineer, Full Stack"
    bio: string;                 // Professional bio
    portfolio_image?: Base64;    // Why hire me
    credentials: string[];       // GitHub, LinkedIn, etc
    rate_card: {
      [format: string]: number;  // Reel: $500, Story: $200
    };
  };
  created_at: ISO8601;
  verified_at?: ISO8601;
  verified_by: "ai_model" | "community" | "human";
}
```

### Deal Workflow - Complete State Machine

**Creator-side phases:**
```
brief → counter → negotiation → last_offer → formal_offer → softhold → checklist → deliverables → submitted → approved
```

**Brand-side phases:**
```
brief → waiting → counter → negotiation → last_offer → formal_offer → softhold → waiting → submitted → approved
```

**Critical state flags (MUST NOT BE RESET):**
- `formalOfferSentByCreator: boolean` - Locks creator from re-negotiating after formal offer
- `escrowFunded: boolean` - Prevents double-funding
- `deliverableStatuses: Record<number, status>` - Tracks upload progress per slot

### Deal Room Message Types (Firebase)

```typescript
type MessageType =
  | "offer_sent"        // Brand initiates offer
  | "counter_sent"      // Creator responds with counter-offer
  | "chat"              // General discussion
  | "script_updated"    // Script changed during negotiation
  | "deliverable_submitted" // System notification
  | "approval_decision" // Brand approves/requests revision
  | "deal_complete"     // System notification - deal done
  | "deal_cancelled"    // System notification - deal cancelled
```

### Chat System (Real-Time Sync)

**Architecture:**
- Firebase Realtime Database (`/deals/{dealId}/messages`)
- 3-second polling in demo (WebSocket recommended for prod)
- Messages append-only (no deletion for audit trail)
- Read receipts: optional (not yet implemented)
- Typing indicators: optional (not yet implemented)

**Access control:**
- Only participants (creator + brand) can read/write
- System can inject notifications
- Admin can read (for dispute resolution)

### Deliverables Parsing (Critical Logic)

**Input:** String like "2x Reels, 3x Stories"

**Parsing:**
```typescript
function parseDeliverables(input: string): Deliverable[] {
  return input.split(',').map(item => {
    const trimmed = item.trim();
    const match = trimmed.match(/^(\d+)[xX]\s*(.+)$/);
    if (match) {
      return {
        format: match[2].trim(),     // "Reels"
        count: parseInt(match[1])    // 2
      };
    }
    return { format: trimmed, count: 1 };
  });
}
```

**Expansion to upload slots:**
```typescript
function expandDeliverables(parsed: Deliverable[]): UploadSlot[] {
  return parsed.flatMap(d =>
    d.count === 1
      ? [{ format: d.format, label: d.format }]
      : Array.from({ length: d.count }, (_, i) => ({
          format: d.format,
          label: `${d.format} (${i + 1} of ${d.count})`
        }))
  );
}
// Input: [{format: "Reels", count: 2}, {format: "Stories", count: 1}]
// Output: [
//   {format: "Reels", label: "Reels (1 of 2)"},
//   {format: "Reels", label: "Reels (2 of 2)"},
//   {format: "Stories", label: "Stories"}
// ]
```

**Validation requirements:**
- Each slot must receive unique link (no duplicates)
- Link must be valid Instagram URL
- URL must be public (not archived, not deleted)
- Proper format: instagram.com/p/{id} or instagram.com/reel/{id}

### Portfolio Image Feature

**Storage:** Base64 in localStorage (demo) / Backend (prod)

**Validation:**
- Only image MIME types accepted (image/*)
- Recommended size: <2MB
- Enforced size limit: 5MB
- Aspect ratio preserved (no stretching)

**Display:**
- Creator profile: 240px height thumbnail
- Caption: "Why brands should hire [creator name]"
- Can be removed from settings anytime

**Why it exists:** Creators show professionalism/personality beyond video - portfolio piece that builds trust

### Duplicate Reel Prevention

**Logic (MUST execute before confirmation):**
```typescript
const isDuplicate = Object.values(deliverableLinks)
  .some((existingLink, idx) =>
    existingLink === inputVal && idx !== di
  );
if (isDuplicate) {
  throw new ValidationError(
    'This link has already been submitted. Please use a different post.'
  );
}
```

**Why it matters:** Ensures creator actually produced multiple pieces, not same content repackaged

### Brand-Side State Display (Synced to Actual Phase)

**Problem:** Brand saw "Escrow Funded" regardless of phase

**Solution:** Derive status from actual phase:

| dealRoomPhase | isFunded | creatorLifecycle | Display Status |
|---|---|---|---|
| offer_sent | false | - | "Waiting for Creator" |
| counter | false | - | "Negotiating - Creator countering" |
| last_offer | false | - | "Final Negotiation" |
| softhold | false | - | "Deal Accepted - Ready to fund" |
| softhold | true | deliverables | "Awaiting Deliverables" |
| softhold | true | submitted | "Reviewing Deliverables" |
| softhold | true | approved | "Deal Complete" |

### Barter Deal Workflow (Alternative to Paid)

**Differences:**
- No escrow funding
- Brand provides product/service instead of currency
- Tracking replaces payment milestones

**Phases:**
```
offer → counter → formal_offer → softhold →
goods_preparing → goods_shipped → goods_received →
content_due → content_submitted → content_approved
```

**State fields:**
- `goodsTrackingNumber?: string`
- `goodsDeliveredDate?: ISO8601`
- `contentDueDate: ISO8601`

### Campaign Creation Form (Validation)

**Required fields (MUST validate before create):**
- Campaign title (non-empty string)
- About product/campaign (min 50 chars recommended)
- Campaign description (min 30 chars)
- Budget per creator (positive integer)
- Target audience (non-empty string)

**Validation function:**
```typescript
function validateCampaign(form: CampaignForm): string[] {
  const errors: string[] = [];
  if (!form.title?.trim()) errors.push('Title required');
  if (!form.about?.trim() || form.about.length < 50)
    errors.push('About required (min 50 chars)');
  if (!form.description?.trim()) errors.push('Description required');
  if (!form.budget || parseInt(form.budget) <= 0)
    errors.push('Valid budget required');
  if (!form.audienceTarget?.trim())
    errors.push('Target audience required');
  return errors;
}
```

**Optional fields (still should have sensible defaults):**
- Deadline (defaults to 30 days from now)
- Location (defaults to "Global")
- Usage rights (defaults to "30 days, social only")
- Exclusivity (defaults to "None")

### Form Input Sanitization (REQUIRED)

**Budget inputs:**
- Accept numbers only (regex: `/[^0-9]/g`)
- Max value: 1,000,000 USD
- Min value: 100 USD

**Text inputs:**
- Trim whitespace
- Reject if empty after trim
- Max length: 500 chars for titles, 5000 for descriptions
- No HTML/script tags (XSS prevention)

**Date inputs:**
- Must be in future
- Validation: `new Date(inputDate) > new Date()`
- Format: ISO8601

### Role Switching (For Testing)

**How it works:**
```typescript
const [marketplaceRole, setMarketplaceRole] = useState<'creator' | 'brand'>('creator');
```

**What changes:**
- Creator role: "Opportunities" tab, can apply to campaigns
- Brand role: "Marketplace" tab, can create campaigns and send offers
- Deal room shows different action buttons
- Chat is dual-read but sender-identified

**NOT persisted across page reload (by design):**
- Each page load starts as "creator"
- Must explicitly switch roles (no saved role preference)
- Prevents confusion from stale state

### Workflow Lock Guarantees (MUST NOT BREAK)

**Lock 1: Formal Offer Submission**
- Once `formalOfferSentByCreator = true`, creator cannot change counter offer
- UI hides counter-offer input
- "Submit Final Offer" button disappears
- Creator sees: "Waiting for brand approval"

**Lock 2: Chat Access**
- Chat only available from `pending` phase onwards
- Cannot open chat before brand sends offer
- Prevents blank chat rooms

**Lock 3: Deliverable Deduplication**
- Same link cannot be submitted twice
- Validation happens on confirm, not on input
- User gets clear error if duplicate detected

**Lock 4: Phase Progression**
- Cannot go backwards (brief → counter → formal_offer only)
- Cannot skip phases
- Each phase has explicit conditions to advance

**Why these exist:** Prevent state confusion and ensure both parties stay synchronized

---

## Part 3: About Saketh - Founder Mentality (Context, Not Rules)

**This explains HOW Saketh thinks, not engineering rules you must follow.**

**Saketh values speed and clarity, but ALWAYS within the guardrails of ENGINEERING_STANDARDS.md**

### Core Philosophy

**"Ship fast, verify thoroughly. Speed is useless if the product confuses users."**

- Workflow clarity > feature completeness
- Broken product kills faster than slow product
- One cohesive feature > three half-features
- User confusion is technical debt with interest

### Decision Priorities (In Order)

1. **Does it make the workflow clearer?** → YES = high priority
2. **Does it break existing workflows?** → YES = veto immediately
3. **How many users affected?** → ALL = critical fix needed
4. **Can we ship it without breakage?** → YES = do it this sprint
5. **Is it the minimal viable change?** → NO = simplify first

### What Triggers Action

- **Feature request:** "How hard is this?"
- **Bug report:** "Fix it immediately, then document why it happened"
- **Workflow confusion:** "Redesign until it's obvious"
- **Performance issue:** "Profile first, optimize second"
- **Security issue:** "Drop everything, fix now"

### Communication Expectations

**From LLMs working with Saketh:**
- Directness > politeness
- "Here's what I did" > "I think we should"
- Working code > perfect spec
- Fast iteration > comprehensive planning
- Metrics > intentions

**Red flags that cause friction:**
- "I'm not sure" (then investigate, don't ask)
- "Maybe we should" (decide yes or no)
- "This might break things" (test before pushing)
- "I'll implement this my way" (check existing patterns first)
- Over-explanation when result speaks for itself

### What He Values in Code

1. **Clarity** - Code explains itself
2. **Consistency** - Follows existing patterns
3. **Completeness** - Edge cases handled
4. **Correctness** - Types checked, tests pass
5. **Testability** - Can be verified independently

### What He Dislikes

- Vague status reports ("I'm working on it")
- Unfinished work pushed to main
- Breaking changes without migration path
- "Technical debt" as an excuse (fix it now or don't claim debt)
- Over-engineering for hypothetical future needs

### Culture Values

- **Ownership:** You own your code, fix your bugs
- **Velocity:** Getting to market matters, but not at cost of confusion
- **Honesty:** Say what's actually true, not what sounds good
- **Focus:** One thing done well > ten things half-done
- **Discipline:** Don't ship broken, don't commit incomplete

---

## Part 4: How to Use These Two Documents

### ENGINEERING_STANDARDS.md (Binding)
- ✅ TypeScript errors block PRs
- ✅ Tests required before merge
- ✅ Security gaps block deployment
- ✅ Code review enforces standards
- ✅ Violations have consequences

**This is the law.**

### imitateclaude.md (Context)
- ✅ Explains why we build certain ways
- ✅ Product knowledge for decision-making
- ✅ Founder priorities and thinking
- ✅ Understanding the "why" behind features
- ✅ Context for tradeoff decisions

**This is the "why," not the law.**

### For Claude (or Other LLMs)

**Hierarchy:**
1. **ENGINEERING_STANDARDS.md** = ALWAYS apply (non-negotiable)
2. **imitateclaude.md Part 2** = Product context for decisions
3. **imitateclaude.md Part 3** = Understand founder mentality

**When in doubt:**
- Check ENGINEERING_STANDARDS.md first
- Use product context to understand tradeoffs
- Test before pushing (no exceptions)
- Ask if unclear about standards

### For Contributors

**This repository has:**
- ✅ Binding engineering standards (ENGINEERING_STANDARDS.md)
- ✅ Product knowledge for context (imitateclaude.md)
- ✅ Clear workflow requirements
- ✅ Security and compliance requirements

**When you see "move fast":** It means "move fast within ENGINEERING_STANDARDS.md"

**Never interpret speed guidance as permission to:**
- ❌ Skip tests
- ❌ Ignore TypeScript errors
- ❌ Violate security/compliance
- ❌ Break existing workflows
- ❌ Skip code review
- ❌ Duplicate code instead of refactor

### For Audits and Reviews

**This document shows:**
- Clear product intent
- Engineering standards
- Compliance considerations
- Known limitations ("not yet implemented")
- Explicit tradeoffs

**Use it to verify:**
- Are safety rules being followed?
- Are workflows protected?
- Are breaking changes documented?
- Are edge cases handled?
- Is new code consistent with existing patterns?

---

## Addendum: Known Limitations (Accurate Status)

### Fully Implemented
- ✅ Deal workflow state machine (all phases working)
- ✅ Chat system (Firebase real-time)
- ✅ Portfolio image upload/removal
- ✅ Duplicate reel prevention
- ✅ Deliverable count parsing and expansion
- ✅ Brand-side state sync to actual phase
- ✅ Campaign creation with form validation
- ✅ Role switching (creator/brand)
- ✅ Form validation and error states
- ✅ Empty state messaging

### Stubbed/Not Yet Implemented
- 🔲 Payment processing (needs Stripe/Meta Pay integration)
- 🔲 Authentication (JWT system exists, OAuth scaffolded)
- 🔲 Creator verification (AI model stub only)
- 🔲 Reputation scoring (basic calculation, not persistent)
- 🔲 Real-time WebSockets (3-second polling instead)
- 🔲 Email notifications (Firebase notifications only)
- 🔲 Contract e-signature (signature input non-binding)
- 🔲 Creator discovery API (hardcoded creators in demo)
- 🔲 Community features (hardcoded mock communities)

### Why These Are Stubs
These features require infrastructure Meta needs to provide:
- Payment: Stripe/Meta Pay API keys
- Auth: Instagram OAuth app credentials
- Verification: Brand safety API access
- Infrastructure: Database, email service, etc

See `META_INTEGRATION.md` for complete list.

---

## Final Summary

### The Two-Document System

**ENGINEERING_STANDARDS.md (Binding):**
- TypeScript compiles
- Tests pass
- Security/compliance met
- Code review approved
- No exceptions

**imitateclaude.md (Context):**
- Product workflows
- Why we prioritize things
- Founder mentality
- Decision framework
- Understanding over rules

### Decision Framework

When building a feature:
1. **Read the product context** (imitateclaude.md Part 2) - understand what you're building
2. **Check the standards** (ENGINEERING_STANDARDS.md) - understand HOW to build safely
3. **Understand the founder priorities** (imitateclaude.md Part 3) - understand why it matters
4. **Write the code** following standards
5. **Code review** against standards
6. **Ship** when standards are met

### The Real Velocity Equation

```
True Velocity = (Features Shipped * Code Quality) / Technical Debt

ValueSkins needs sustainable long-term velocity, not short-term hacks.

Speed without safety = debt.
Safety without speed = stagnation.

Both at once = winning.
```

---

**Read ENGINEERING_STANDARDS.md. Follow it. Ship safely.**

This document explains the "why." The other document enforces the "how."
