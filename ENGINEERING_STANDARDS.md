# ValueSkins Engineering Standards (MANDATORY)

**This is binding engineering policy. Violate at code review.**

## Core Principle

**Correct > Fast. Sustainable > Clever. Maintainable > Concise.**

Short-term velocity is worthless if it poisons long-term codebase value.

---

## Part 1: Non-Negotiable Safety Rules

### 1. Correctness is Prerequisite

- **TypeScript errors block deployment** - no exceptions
- **Build must pass** before push - no "we'll fix it later"
- **Tests must pass** before merge - no manual-testing exemptions
- **Type safety is mandatory** - no `any`, no ignoring type errors
- **Silent failures are worse than loud failures** - fail fast and explicitly

**Escalation:** If you can't make it compile, stop and ask for help.

### 2. Security and Compliance are Non-Negotiable

#### Authentication & Authorization
- [ ] Every API endpoint validates JWT ownership of resource
- [ ] User can only access their own data
- [ ] Creator can only modify their own deals
- [ ] Brand can only modify their own campaigns
- [ ] Admin endpoints verify admin role explicitly

#### Data Protection
- [ ] Passwords never in logs, code, or error messages
- [ ] API keys live only in environment variables
- [ ] Sensitive data encrypted at rest (prod requirement)
- [ ] User deletion actually deletes (GDPR compliance)
- [ ] Database backups encrypted

#### Input Validation
- [ ] All user inputs validated (length, type, format)
- [ ] SQL injection prevented (parameterized queries only)
- [ ] XSS prevented (HTML escaping on all user content)
- [ ] CSRF tokens on state-changing requests
- [ ] File uploads validated (size, MIME type)

#### API Security
- [ ] Rate limiting enforced (tiered by user/IP)
- [ ] HTTPS only (no HTTP in prod)
- [ ] CORS restricted to known origins
- [ ] Sensitive endpoints log access attempts

**Escalation:** If you find a security gap, fix immediately and report.

### 3. Code Quality Standards are Requirements

#### Naming and Clarity
- [ ] Variable names are clear (not abbreviated)
- [ ] Function names describe intent
- [ ] Type names are accurate
- **Rule:** Misleading names are worse than long names

#### Function Design
- [ ] Single responsibility principle (one job per function)
- [ ] Functions <100 lines (preferably <50)
- [ ] Side effects documented explicitly
- [ ] Parameters validated at entry
- [ ] Return types are explicit (no implicit `any`)

#### Error Handling
- [ ] Every async operation has error path
- [ ] Errors are logged with context (not swallowed)
- [ ] User-facing errors are helpful (not technical jargon)
- [ ] Error recovery path exists or explicitly documented
- [ ] No `try-catch` blocks that do nothing

#### Code Reuse (NOT Copy-Paste)
- [ ] Duplicated logic is factored into utilities
- [ ] Shared patterns are in shared modules
- [ ] Do NOT copy-paste code 3 times
- [ ] Utilities go in `/lib` with clear exports
- [ ] DRY is enforced at code review

**Escalation:** If you see copy-pasted logic in PR, request refactor.

### 4. Testing Requirements

#### Unit Tests (Required)
- [ ] Critical business logic has tests
- [ ] State transitions have tests
- [ ] Edge cases are covered (empty, null, max values)
- [ ] Error paths are tested
- [ ] Tests run in CI/CD

#### Integration Tests (Required for Features)
- [ ] API endpoints have integration tests
- [ ] Database interactions tested with real schema
- [ ] Complex workflows tested end-to-end
- [ ] All state machine phases tested

#### Coverage Targets
- **Payment/escrow code:** 100% coverage required
- **Authentication:** 90%+ coverage required
- **Critical paths:** 80%+ coverage required
- **Everything else:** 60%+ coverage target
- **Absolute minimum:** No untested error paths

**Escalation:** If coverage drops below target, PR blocked until fixed.

### 5. Database and Data Integrity

#### Schema Migrations
- [ ] Every schema change has reversible migration
- [ ] Migrations tested locally before commit
- [ ] Data loss prevented (no dropping columns without backup)
- [ ] Rollback procedure documented

#### Data Consistency
- [ ] Foreign key constraints enforced
- [ ] Unique constraints where needed
- [ ] Default values sensible
- [ ] Nullable fields explicitly justified
- [ ] No magic strings (use enums)

#### Backup and Recovery
- [ ] Backup strategy documented
- [ ] Recovery time objective (RTO) defined
- [ ] Backups tested (actually recoverable)
- [ ] Encryption at rest (prod)

**Escalation:** If you're writing destructive SQL, get explicit approval first.

### 6. Documentation is Required

#### Code Comments
Required when:
- [ ] Logic is non-obvious (why, not what)
- [ ] Business rules are embedded
- [ ] Temporary workarounds exist (with deadline)
- [ ] Performance implications matter
- [ ] Concurrency issues present

Not required:
- Self-documenting code (good names = no comment needed)

#### Commit Messages
Must include:
- [ ] WHAT changed (brief, 50 char max)
- [ ] WHY it changed (business reason)
- [ ] WHERE it impacts (which features)
- [ ] RISK level (low/medium/high)

Example:
```
fix: prevent duplicate reel uploads in deliverables

Validate incoming reel link against existing deliverable_links
to prevent creator from submitting same content twice.

Where: Deal room deliverables upload flow
Risk: Low (validation only, no state changes)
```

#### API Documentation
- [ ] All endpoints have purpose, params, response documented
- [ ] Error codes are documented
- [ ] Examples provided for complex requests
- [ ] Rate limits documented

#### Breaking Changes
Required for any breaking change:
- [ ] Migration guide
- [ ] Deprecation notice (minimum 1 sprint)
- [ ] Rollback procedure
- [ ] Update path for downstream
- [ ] Communication to affected users

**Escalation:** Code review rejects PRs without adequate commit message.

### 7. Monitoring and Observability

#### Error Logging
- [ ] All errors logged with context
- [ ] Error logs don't expose internals (no stack traces to users)
- [ ] Errors include request ID for tracing
- [ ] Log level appropriate (ERROR vs WARN vs INFO)

#### Performance Monitoring
- [ ] Critical paths have latency metrics
- [ ] Database queries are monitored (slow query alerts)
- [ ] API response times tracked
- [ ] Alerts on performance degradation

#### Health Checks
- [ ] Service health endpoint exists
- [ ] Database connectivity checked
- [ ] External dependencies (Firebase, etc) checked
- [ ] Alerts when health checks fail

#### Audit Trails
- [ ] All state-changing operations logged
- [ ] User action logs include timestamp and actor
- [ ] Financial operations have immutable audit log
- [ ] Logs accessible for compliance investigation

**Escalation:** If you can't monitor it, you can't support it.

### 8. Stop and Escalate Conditions

**STOP all work and escalate immediately if:**

- [ ] TypeScript doesn't compile
- [ ] Security vulnerability found or suspected
- [ ] Data loss is possible
- [ ] Critical path broken
- [ ] Database migration blocks rollback
- [ ] Payment system behavior unclear
- [ ] User confusion likely
- [ ] Compliance requirement unclear
- [ ] You're writing code that contradicts existing patterns without understanding why
- [ ] Breaking change needed without migration path

**How to escalate:**
1. Stop writing code
2. Create minimal reproduction of problem
3. Document the issue
4. Create PR with "WIP" label explaining the gap
5. Ask for help in Slack/email with PR link
6. Do NOT merge without approval

---

## Part 2: Guardrails by Area

### Payment and Escrow (Highest Scrutiny)

**Before any payment code ships:**
- [ ] All monetary values are integers (cents, not floats)
- [ ] Rounding is explicit and documented
- [ ] Double-funding prevented (escrowFunded flag verified)
- [ ] Partial releases use atomic transactions
- [ ] Refunds are reversible and logged
- [ ] All operations have idempotency keys
- [ ] Audit trail captures every fund movement
- [ ] Test coverage: 100%
- [ ] Code reviewed by 2 people (including someone who understands payments)

**Example of what NOT to do:**
```javascript
// ❌ WRONG - using float for money
const advanceAmount = totalAmount * 0.3;
```

**Example of what to do:**
```javascript
// ✅ CORRECT - integer cents, explicit rounding
const advanceAmount = Math.round(totalAmount * 30 / 100);
// or better yet:
const advanceAmount = Math.floor(totalAmount * 30 / 100);
```

### Authentication and Authorization

**Before auth code ships:**
- [ ] JWT validated on every protected endpoint
- [ ] Token expiration enforced
- [ ] User ownership verified (not just JWT exists)
- [ ] Role checked against required role
- [ ] Password reset has time limit
- [ ] Sessions invalidated on logout
- [ ] Test cases include: no token, expired token, wrong user, wrong role

### Deal Workflow State Machine

**Immutable rules (violating these blocks PR):**
- [ ] Can only progress forward in phase
- [ ] Cannot skip phases
- [ ] formalOfferSentByCreator flag prevents further negotiation
- [ ] escrowFunded flag prevents double-funding
- [ ] deliverableStatuses track individual slot progress (not all-or-nothing)
- [ ] Both parties see same phase (sync verified)

### Form Validation

**Required for every form:**
- [ ] Required fields validated (not empty after trim)
- [ ] Length limits enforced
- [ ] Type validation (number not string)
- [ ] Format validation (email, date, URL)
- [ ] XSS prevention (HTML escaping)
- [ ] SQL injection prevention (parameterized)
- [ ] Error messages helpful (not technical)
- [ ] Disabled submit button while validating

### Database Queries

**Every query must:**
- [ ] Use parameterized queries (no string concatenation)
- [ ] Have an index strategy documented
- [ ] Be tested with realistic data size
- [ ] Have error handling
- [ ] Log slow queries (>1 second)
- [ ] Avoid N+1 patterns

---

## Part 3: Code Review Standards

**PR Author Checklist:**
- [ ] Passes local build and tests
- [ ] TypeScript strict mode (no `any` or `@ts-ignore`)
- [ ] Follows existing patterns
- [ ] No breaking changes without migration
- [ ] Commit message is clear
- [ ] Tests added for new logic
- [ ] No unnecessary dependencies
- [ ] No credentials/secrets in code

**Reviewer Checklist:**
- [ ] Build passes
- [ ] Tests pass
- [ ] Tests actually test the change (not just run)
- [ ] Naming is clear
- [ ] Error handling complete
- [ ] No security gaps
- [ ] No performance regression
- [ ] Consistent with existing code
- [ ] Documentation updated
- [ ] Breaking changes handled

**Merge Criteria:**
- [ ] 2 approvals (1 for small fixes, 2 for anything complex)
- [ ] Build passing
- [ ] Tests passing
- [ ] No unresolved concerns
- [ ] Commit message clean

---

## Part 4: Velocity Without Recklessness

### Allowed Shortcuts
- [ ] Hardcode config if env var not available (but log a warning)
- [ ] Skip optional analytics if deadline tight (but add TODO)
- [ ] Deploy without full feature flag rollout if low-risk (but have rollback plan)
- [ ] Defer non-critical error handling (but document it)

### NOT Allowed
- [ ] Skipping tests
- [ ] TypeScript errors
- [ ] Security gaps
- [ ] Data loss risk
- [ ] Breaking without migration
- [ ] Code duplication as shortcut
- [ ] Ignoring monitoring/alerts
- [ ] Leaving error paths unhandled

### How to Move Fast Safely
1. Understand the requirement completely (5 minutes)
2. Check existing patterns (5 minutes)
3. Write the code (20 minutes)
4. Test locally (5 minutes)
5. Code review (10 minutes)
6. Merge and monitor (5 minutes)

**Total: 50 minutes. Fast AND safe.**

Skipping steps doesn't save time - it shifts cost to debugging later.

---

## Part 5: Tools and Enforcement

### Automated Checks (CI/CD)
- [ ] TypeScript compilation required
- [ ] Tests required (must pass)
- [ ] Linting required (eslint/prettier)
- [ ] Security scanning (npm audit, SAST)
- [ ] Code coverage gates (minimum %age)
- [ ] Commit message format check

### Manual Checks (Code Review)
- [ ] Does it solve the right problem?
- [ ] Could this break existing features?
- [ ] Are tests actually testing?
- [ ] Is performance acceptable?
- [ ] Are edge cases handled?
- [ ] Does documentation match code?

### Monitoring (Post-Deploy)
- [ ] Error rates in production
- [ ] Performance metrics
- [ ] Security alerts
- [ ] User-reported issues
- [ ] Automated rollback if error rate spikes

---

## Part 6: When Standards Conflict with Speed

**Principle: Safety always wins.**

If fast and safe are in conflict:
1. Choose safe
2. Find faster safe way
3. If no faster safe way exists, do slow safe

**Example:**
- Fast way: No tests (NOT ALLOWED)
- Safe way: Comprehensive tests (required)
- Faster safe way: Only critical path tests (compromise)

The compromise is faster safe way, not "no tests."

---

## Enforcement

### What Happens When Standards Are Violated

**TypeScript error:**
- [ ] PR blocked automatically (CI failure)
- [ ] No merge until fixed

**Security gap:**
- [ ] PR blocked immediately
- [ ] Must be fixed before code review approval

**Broken test:**
- [ ] PR blocked automatically
- [ ] No merge until test passes

**Missing test for new logic:**
- [ ] PR feedback: "Add test for X scenario"
- [ ] Cannot merge without test

**Unhandled error path:**
- [ ] PR feedback: "Handle error case: Y"
- [ ] Cannot merge without handling

**Duplicated logic:**
- [ ] PR feedback: "Factor into utility in /lib"
- [ ] Cannot merge without refactor

**Unclear commit message:**
- [ ] PR blocked from merge
- [ ] Must rewrite message

**Breaking change without migration:**
- [ ] PR blocked
- [ ] Must add deprecation path

### Accountability

- **Author:** Responsible for quality of code
- **Reviewer:** Responsible for catching issues
- **Team lead:** Responsible for enforcement
- **Everyone:** Responsible for escalating blockers

---

## Summary: The Real Speed Equation

```
True Velocity = (Features Shipped * Code Quality) / Technical Debt

Fast code + poor quality = low velocity (hidden cost appears later)
Slower code + high quality = high velocity (compound growth)

ValueSkins needs sustainable velocity, not short-term sprint heroics.
```

Ship safely, or you'll spend months untangling what you shipped fast.

---

**This document is binding. Violations caught at code review. Questions? Ask before coding.**
