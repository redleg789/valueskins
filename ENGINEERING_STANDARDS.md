# ValueSkins Engineering Standards (v2) - Production-Safe

**This is binding policy. Code review enforces. No exceptions.**

---

## Core Philosophy

**Speed within safety. Not speed OR safety - both simultaneously.**

- Correct code ships fast because it doesn't need debugging
- Tests save time (they catch bugs you'd spend hours finding)
- Good architecture enables velocity (poor architecture kills it)
- Security is a prerequisite, not a constraint

---

## Rule 1: Build Must Pass (Non-Negotiable)

### What This Means
- TypeScript must compile with zero errors
- All tests must pass
- No `any` types (use `unknown` and narrow, or proper types)
- No `@ts-ignore` comments
- No error suppressions without documented justification

### Why
- TypeScript errors in production = user-facing bugs
- Tests that don't run = false confidence
- Type safety prevents entire classes of bugs at build time
- This check takes <30 seconds; skipping it costs hours in debugging

### How
```bash
npm run build  # Must exit 0, not "warnings are fine"
npm test       # Must exit 0
```

**Blocking condition:** Build fails → PR cannot merge. No exceptions, no negotiation.

---

## Rule 2: Tests Must Exist and Pass (Non-Negotiable)

### Coverage Requirements (Tiered by Risk)

| Category | Coverage | Scope |
|----------|----------|-------|
| **Payments** | 100% | Every fund movement, every edge case, every error path |
| **Authentication** | 90%+ | Every permission check, token expiration, role verification |
| **Deal state machine** | 85%+ | All phase transitions, guards, impossible states |
| **Critical business logic** | 80%+ | Scoring, matching, negotiations |
| **Form validation** | 75%+ | Required fields, formats, edge cases |
| **API endpoints** | 70%+ | Happy path + 2 error paths per endpoint |
| **New code** | 60%+ | Minimum for anything that ships |

### Test Types Required

**Unit tests (single function/component):**
- Happy path
- Error cases (bad input, null, empty)
- Boundary values (0, 1, max)
- Type edge cases

**Integration tests (multiple parts together):**
- API endpoint → database → response
- Form input → validation → state update → UI render
- User action → deal state change → other user sees it

**End-to-end tests (full workflow):**
- Creator applies → sees deal room → negotiates → submits
- Brand creates campaign → sends to creators → approves deliverables

### How to Write Tests Quickly
```typescript
// ✅ Fast, clear test structure
describe('parseDeliverables', () => {
  it('parses "2x Reels" into {format: "Reels", count: 2}', () => {
    expect(parseDeliverables('2x Reels')).toEqual([{format: 'Reels', count: 2}]);
  });

  it('defaults to count:1 if no number specified', () => {
    expect(parseDeliverables('Stories')).toEqual([{format: 'Stories', count: 1}]);
  });

  it('handles multiple deliverables', () => {
    const result = parseDeliverables('2x Reels, 1x Post');
    expect(result).toHaveLength(2);
  });

  it('throws on invalid format', () => {
    expect(() => parseDeliverables('xyz')).toThrow();
  });
});
```

### Why This Is Fast
- Tests catch bugs before code review (instead of after deployment)
- Refactoring is safe (tests verify it still works)
- New developer can understand code by reading tests
- No manual testing for edge cases

**Blocking condition:** Tests fail or coverage below tier → PR cannot merge.

---

## Rule 3: Security (Non-Negotiable)

### Authentication and Authorization

**Every protected endpoint MUST:**
```typescript
// ✅ Correct pattern
const userId = extractUserIdFromJWT(req.headers.authorization);
if (!userId) throw new AuthError('Missing token');

const creator = await db.query('SELECT * FROM creators WHERE user_id = $1', [userId]);
if (!creator) throw new AuthError('User not found');

const deal = await db.query('SELECT * FROM deals WHERE creator_id = $1 AND id = $2',
  [creator.id, dealId]);
if (!deal) throw new AuthError('Deal not found or not yours');

// Only now proceed
return updateDeal(deal.id, updates);
```

**What NOT to do:**
```typescript
// ❌ WRONG - trusting client input
const deal = await db.query('SELECT * FROM deals WHERE id = $1', [dealId]);
// What if another user can guess this dealId? ^^^ They can access it!

// ❌ WRONG - assuming JWT is valid
if (req.headers.authorization) { // Just checking if it exists, not if it's valid!
  proceed();
}

// ❌ WRONG - forgetting to check ownership
const deal = await db.query('SELECT * FROM deals WHERE id = $1', [dealId]);
// Any user can read ANY deal now
```

### Data Protection

**Sensitive data (passwords, API keys, SSNs):**
- Never in logs
- Never in error messages
- Never in code
- Environment variables only

**User data at rest (production):**
- Encrypted if personally identifiable (name, email, etc)
- Especially payment info and identity documents

**User data in transit:**
- HTTPS only (no HTTP)
- API endpoints require HTTPS

### Input Validation

**Every user input MUST be validated:**
```typescript
// ✅ Correct
function validateCampaignBudget(input: string): number {
  const parsed = parseInt(input, 10);
  if (isNaN(parsed)) throw new ValidationError('Budget must be a number');
  if (parsed < 100) throw new ValidationError('Minimum budget: $100');
  if (parsed > 1_000_000) throw new ValidationError('Maximum budget: $1,000,000');
  return parsed;
}
```

**What to validate:**
- Length (min/max)
- Type (number vs string vs date)
- Format (email, URL, date)
- Range (positive, not too large)
- Whitelist characters (no special chars for names)

**Validation prevents:**
- SQL injection (parameterized queries + type checking)
- XSS (HTML escaping on render)
- DoS (size limits on uploads)
- Business logic errors (negative prices, invalid dates)

### API Security

**All public endpoints:**
- Rate limited (100 req/min for anonymous, 1000 req/min for authenticated)
- CORS restricted to known origins
- HTTPS only
- Request timeout (30 seconds max)

---

## Rule 4: Code Quality (Non-Negotiable)

### Naming

**Every name must be clear and unambiguous:**
```typescript
// ✅ Clear
const advancePaymentAmount = Math.round(totalAmount * 0.3);
const creatorCanSubmitDeliverable = deliverableStatus === 'pending';
const phaseTransitionIsAllowed = currentPhase < targetPhase;

// ❌ Unclear
const adv = Math.round(totalAmount * 0.3);  // What is "adv"?
const canSubmit = phase === 'pending';      // Can WHAT submit? Who?
const allowed = cp < tp;                    // What are cp and tp?
```

**Rule:** Names should answer "what is this?" at a glance. If a name is ambiguous, it's wrong.

### Function Design

**Every function should:**
- Do one thing (if you use "and" to describe it, split it)
- Be <100 lines (preferably <50)
- Have parameters that are self-documenting
- Have explicit return type

```typescript
// ✅ Clear, single purpose
function calculateAdvancePayment(totalAmount: number): number {
  const ADVANCE_PERCENTAGE = 30;
  return Math.round(totalAmount * ADVANCE_PERCENTAGE / 100);
}

// ❌ Too many concerns
function processPayment(deal, brand, creator, amount, milestone) {
  // calculates amount
  // updates database
  // logs to audit trail
  // sends notification
  // handles disputes
  // Too much! Split into 5 functions
}
```

### Error Handling

**Every error path must be handled:**
```typescript
// ✅ Handles all outcomes
async function submitDeliverable(creatorId: string, link: string): Promise<void> {
  // Input validation
  if (!link.startsWith('instagram.com')) {
    throw new ValidationError('Must be Instagram link');
  }

  // Check for duplicates
  const existing = await db.query(
    'SELECT COUNT(*) FROM deliverables WHERE creator_id = $1 AND link = $2',
    [creatorId, link]
  );
  if (existing.count > 0) {
    throw new ValidationError('This link already submitted');
  }

  // Try to insert
  try {
    await db.query(
      'INSERT INTO deliverables (creator_id, link) VALUES ($1, $2)',
      [creatorId, link]
    );
  } catch (e) {
    if (e.code === 'UNIQUE_VIOLATION') {
      throw new ValidationError('Duplicate submission');
    }
    throw new DatabaseError('Could not save deliverable', {cause: e});
  }

  // Success
  logger.info('Deliverable submitted', {creatorId, link});
}

// ❌ Ignores error cases
async function submitDeliverable(creatorId, link) {
  await db.query('INSERT INTO deliverables VALUES ($1, $2)', [creatorId, link]);
  // What if the insert fails? Silently?
  // What if link is invalid? Just trust it?
}
```

### Code Duplication

**If the same logic appears 2+ times, extract it:**
```typescript
// ❌ Duplicated logic
function validateCampaignTitle(title: string): void {
  if (!title.trim()) throw new ValidationError('Title required');
  if (title.length > 200) throw new ValidationError('Title max 200 chars');
}

function validateCampaignDescription(desc: string): void {
  if (!desc.trim()) throw new ValidationError('Description required');
  if (desc.length > 5000) throw new ValidationError('Description max 5000 chars');
}

// ✅ Extracted utility
function validateTextField(
  value: string,
  name: string,
  maxLength: number
): void {
  if (!value.trim()) throw new ValidationError(`${name} required`);
  if (value.length > maxLength) throw new ValidationError(
    `${name} max ${maxLength} chars`
  );
}

function validateCampaignTitle(title: string): void {
  validateTextField(title, 'Title', 200);
}

function validateCampaignDescription(desc: string): void {
  validateTextField(desc, 'Description', 5000);
}
```

**Why:** Copy-pasted code means fixing one means finding and fixing all copies. Utilities = one place to fix, automatic everywhere.

---

## Rule 5: Database Integrity (Non-Negotiable)

### Parameterized Queries (Always)

```typescript
// ✅ Correct - parameter binding prevents SQL injection
const creator = await db.query(
  'SELECT * FROM creators WHERE user_id = $1',
  [userId]
);

// ❌ WRONG - string concatenation allows SQL injection
const creator = await db.query(
  `SELECT * FROM creators WHERE user_id = '${userId}'`
  // Attacker passes: '; DROP TABLE creators; --
  // Query becomes: SELECT * FROM creators WHERE user_id = ''; DROP TABLE creators; --'
);
```

### Migrations are Reversible

```typescript
// ✅ Correct - can undo this change
// migration.up.sql
ALTER TABLE deals ADD COLUMN created_at TIMESTAMP DEFAULT NOW();

// migration.down.sql
ALTER TABLE deals DROP COLUMN created_at;

// ❌ WRONG - destroying data, can't undo
// migration.up.sql
DELETE FROM deals WHERE status = 'cancelled';  // No backup!
```

### Foreign Keys and Constraints

```typescript
// ✅ Correct - database enforces relationships
CREATE TABLE deals (
  id UUID PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'approved'))
);

// ❌ WRONG - trusting application to enforce
CREATE TABLE deals (
  id UUID,
  creator_id UUID,  -- What if creator gets deleted?
  brand_id UUID,    -- What if brand deleted?
  amount_cents INTEGER,  -- What if negative?
  status TEXT  -- What if typo in status?
);
```

### Backups are Tested

**Every backup must:**
- Actually exist (test restore)
- Be encrypted at rest
- Be tested monthly (restore to staging, verify)
- Have RTO (recovery time objective) < 4 hours
- Have RPO (recovery point objective) < 1 hour

---

## Rule 6: Documentation (Non-Negotiable)

### Code Comments (When Required)

Required:
```typescript
// ✅ Explains WHY, not WHAT
// Advance must be exactly 30% to match contract terms with brand.
// Using Math.floor (not round) to ensure we never overpay.
const advanceAmount = Math.floor(totalAmount * 0.3);

// Temporary: Remove when Firebase migration complete (Dec 2024)
const useLocalStorage = true;

// ✅ Edge case explanation
// User can have null subscription if they never enabled billing.
// This is intentional - don't treat as error.
const subscription = user.subscription || null;
```

NOT required:
```typescript
// ❌ Obvious comments are noise
// Increment i by 1
i = i + 1;

// ❌ Restates the code
// Create a new user
const user = new User();
```

### Commit Messages

**Every commit must:**
```
Subject: Imperative, max 50 characters
(blank line)
Body: Explain WHY not WHAT. Reference issue. Include migration notes if schema changed.

Example:
---
Prevent duplicate reel uploads in deliverables

Validate incoming reel link against existing deliverable_links[].
Duplicates now rejected with clear error message.

This fixes: Creator was able to submit same content in multiple slots.

Schema change: None
Risk: Low (validation only)
Test coverage: 100%
---
```

### API Documentation

**Every endpoint must have:**
```typescript
/**
 * Submit a deliverable reel link for a deal.
 *
 * @param dealId - UUID of the deal
 * @param slotIndex - Index of the deliverable slot (0-based)
 * @param reelLink - Instagram link (instagram.com/p/XXX or /reel/XXX)
 *
 * @returns {Promise<void>}
 *
 * @throws ValidationError if:
 *   - reelLink is not valid Instagram format
 *   - reelLink already submitted in another slot
 *   - deal does not exist or user doesn't own it
 *
 * @example
 * await submitDeliverable('deal-123', 0, 'https://instagram.com/p/ABC123');
 */
export async function submitDeliverable(
  dealId: string,
  slotIndex: number,
  reelLink: string
): Promise<void>
```

### Breaking Changes Require Migration Path

```typescript
// ❌ WRONG - breaking change, no migration
export function parseDeliverables(input: string): Deliverable[] {
  // Changed signature - all callers now break!
}

// ✅ CORRECT - deprecation + migration period
/**
 * @deprecated Use parseDeliverables() instead. Will be removed Jan 1, 2025.
 */
export function parseDelivery(input: string): Deliverable[] {
  return parseDeliverables(input);  // Delegates to new function
}

export function parseDeliverables(input: string): Deliverable[] {
  // New implementation
}
```

---

## Rule 7: Code Review (Enforced Process)

### Before Submitting PR

**Author checklist:**
- [ ] `npm run build` passes (0 errors)
- [ ] `npm test` passes (all tests pass)
- [ ] TypeScript strict mode enforced (`--strict`)
- [ ] New tests added for new code
- [ ] Existing tests still pass
- [ ] No hardcoded secrets/credentials
- [ ] No `any` types (unless with justification in comment)
- [ ] Follows existing code patterns
- [ ] Commit messages are clear
- [ ] Handles error cases

### Reviewer Checklist

**Before approving:**
- [ ] Solves the right problem (not misunderstanding requirement)
- [ ] Doesn't break existing features (tested?)
- [ ] Tests are comprehensive (edge cases, error paths)
- [ ] Security implications considered
- [ ] Performance acceptable (no N+1 queries)
- [ ] Error handling complete
- [ ] Naming is clear
- [ ] No unnecessary code
- [ ] Documentation updated

### Merge Criteria

- [ ] Build passing
- [ ] Tests passing (100% in payment code, 90%+ in auth, etc)
- [ ] 2 approvals (1 for trivial, 2 for anything complex)
- [ ] No unresolved comments
- [ ] Commit message is polished

---

## Rule 8: Stop and Escalate (Hard Stops)

**If any of these is true, stop immediately and ask for help:**

- [ ] TypeScript doesn't compile
- [ ] Test fails and you don't know why
- [ ] Security concern (even unsure)
- [ ] Payment code behaves unexpectedly
- [ ] Database schema change needed
- [ ] You're unsure about customer impact
- [ ] You see code you don't understand
- [ ] Breaking change seems necessary
- [ ] You need to delete data
- [ ] You're about to use `any` type

**How to escalate:**
1. Create PR with "WIP: [description of blocker]"
2. Link the specific code
3. Describe what you've tried
4. Post in #engineering Slack with PR link
5. Don't merge until unblocked

---

## Rule 9: The Speed Section (CRITICAL)

### You CAN Move Fast If:
- [ ] Build passes
- [ ] Tests pass
- [ ] You follow existing patterns
- [ ] No security concerns
- [ ] No breaking changes
- [ ] No hardcoded config
- [ ] All error paths handled

### You CANNOT Move Fast By:
- ❌ Skipping tests
- ❌ Ignoring TypeScript errors
- ❌ Hoping bugs don't exist
- ❌ Copying code without understanding
- ❌ Deploying without monitoring
- ❌ Breaking workflows
- ❌ Skipping code review
- ❌ Assuming "it's probably fine"

### The Real Speed Equation

```
Velocity = (Features Shipped * Code Quality) / Technical Debt

Good code ships fast because:
- Tests prevent bugs (no debugging needed)
- Clear code is quick to understand
- Existing patterns = less thinking
- Good error handling = less firefighting
- Code review catches issues early (before production)

Bad code ships fast initially but:
- Bugs found in production (long debugging)
- Unclear code slows future changes
- No tests = regressions on every change
- Poor error handling = firefighting
- Skipped review = more bugs found later

Long-term velocity = safety + speed
Short-term hacks = debt that kills velocity
```

---

## Enforcement

### What Happens When Rules Are Broken

| Violation | Action |
|-----------|--------|
| Build fails | PR blocked automatically. Fix and push again. |
| Test fails | PR blocked automatically. Fix and push again. |
| Coverage below tier | Code review blocks merge. Add tests. |
| TypeScript error | PR blocked automatically. Can't ignore. |
| Security gap | PR blocked immediately. Must fix before review. |
| Copy-pasted code | Code review feedback: "Extract to utility." Cannot merge. |
| No error handling | Code review feedback: "Handle error case." Cannot merge. |
| Unclear naming | Code review feedback: "Rename for clarity." Cannot merge. |
| Missing tests | Code review blocks. New code = new tests. |
| Commit message unclear | Can't merge. Rewrite and push again. |

### Accountability
- **Author:** Your code, your bugs, your responsibility to test
- **Reviewer:** Catches issues before production
- **CI/CD:** Enforces automated checks (no exceptions)
- **Lead:** Enforces policy at code review

---

## Summary

**This is how ValueSkins ships code:**

1. **Write code** that solves the problem
2. **Make it correct** (TypeScript, tests, error handling)
3. **Make it secure** (validate input, protect data, verify ownership)
4. **Make it clear** (good naming, documentation, patterns)
5. **Get reviewed** (someone else checks it)
6. **Merge** when all checks pass
7. **Monitor** in production (watch for errors)

**This process takes about 1 hour for small changes, 2-4 hours for big changes.**

Skipping steps doesn't save time - it just moves the cost from development to debugging, which is 10x worse.

---

**Read this. Follow it. Questions? Ask before coding, not after.**
