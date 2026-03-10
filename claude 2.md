Use approaches that use the least amount of tokens without compromising the quality, the fulless of code like frontend, backend, etc. speed may be compromised but not the quality or the fullness.

---

## Hard Lessons — Never Repeat These Mistakes

### 1. Self-audit BEFORE declaring done
Never say "done" without running a full scale audit against the target user count. If the target is "billions of users", stress-test every query, every lock, every handler BEFORE presenting the work. The user should never have to ask "is it really prod ready?" — you should have already verified.

### 2. Always push after making changes the user expects to see live
If you remove a password gate, fix a bug, or change anything the user will check on a live deployment — commit AND push in the same step. Never leave changes uncommitted when the user expects them deployed.

### 3. Always push to the correct branch
Check which branch Vercel/CI deploys from (usually `main`). Push to BOTH `master` and `main` (or whatever the deploy branch is). Run `git branch -a` first if unsure.

### 4. Type-check AND build-check before pushing frontend changes
`tsc --noEmit` passing ≠ build passing. Next.js has additional build-time checks that only surface during `next build`:
- `useSearchParams()` must be wrapped in `<Suspense>` boundary (SSR prerender crashes without it)
- Dynamic route folders must use `[param]` not `\[param\]` (escaped brackets create broken paths)
- Static page generation can fail even when types pass
- API response types must match component state (`ApiResponse<T>` vs `T | null`)
**Before every push:** run `npx tsc --noEmit` first, then if possible `cd frontend && npm run build`. If build can't run locally, at minimum grep for: `useSearchParams` without Suspense, `useRouter` in server components, missing `'use client'` directives. Never push and hope — verify locally first.

### 5. Check for duplicate/escaped files after git operations
After creating files with brackets (Next.js dynamic routes like `[id]`), verify no escaped duplicates exist (`\[id\]`). Run `ls` on the directory before committing.

### 6. Audit your own code like an attacker
After writing any service, immediately ask:
- What breaks at 1 billion rows?
- What races exist between read and write?
- What authorization checks are missing?
- What happens when advisory lock IDs overflow i32?
- Are all list queries paginated with real totals (not `.len()`)?
- Do all timeouts cancel the DB query, not just the Rust future?
Don't wait for the user to catch these. Find and fix them in the same pass.

### 7. MVP flow > backend perfection
Backend scale fixes mean nothing if the user can't:
- Log in (Instagram OAuth must work end-to-end)
- See filtered results (marketplace must filter by ValuSkin)
- Chat (deal room messages must persist)
- Share links (brand URLs must route correctly)
Always verify the end-to-end user flow works before optimizing internals.

### 8. Never ship partial work as complete
If you find 30 issues, fix all 30. Don't fix 14 and present it as done. The 100/100 rule applies to audits too.

---

**claude.md — Production-grade implementation rules**

You are not writing demos, mockups, placeholders, or tutorial code.
You are acting as a senior engineer shipping code that could immediately enter a real company repository.

---
**ValueSkins — Large-Platform Adoption Rules (concise)**

---

## Goal

Design ValueSkins as a **platform capability**, not an app feature.
A social network must be able to enable, scope, audit, and roll back safely at any time.

---

## Core Principles

* Deterministic: same inputs → same outputs everywhere
* Server authoritative only (client never decides state)
* Platform owns identity, moderation, trust, permissions
* No shadow graphs (no duplicate followers/reputation)
* Versioned behavior forever (old results remain valid)
* Explainable decisions required for every state

---

## Integration Compatibility

* Adapter layer consumes platform data (identity, activity, trust signals)
* Never require schema rewrite of host platform
* Works alongside legacy systems
* Feature flaggable per user / region / surface
* Instant rollback safe
* Backward compatible outputs

---

## Data & State

* Append-only records (no destructive updates)
* Store: inputs, transformation steps, version, output
* Recompute possible at any time
* No time-dependent or random logic
* Idempotent operations only
* Concurrent safe updates

---

## API Contract

* Read and write APIs separated
* Versioned endpoints
* Deterministic responses
* Pagination mandatory
* No unbounded queries
* No breaking changes without new version

---

## Reliability & Scale

* Stateless handlers
* Horizontal scaling safe
* Retry safe (idempotency keys)
* Handles out-of-order events
* Handles duplicate events
* Backpressure supported
* Partial failure tolerant

---

## Security (Platform Context)

* Trust platform auth; never replace it
* Verify ownership on every mutation
* Never trust client identifiers
* Rate limit all mutation paths
* Protect against mass manipulation (bot amplification, fake engagement)
* All decisions reproducible for abuse review

---

## Moderation & Trust

* Skin state must react to platform enforcement actions
* Supports retroactive moderation (recalc after bans/strikes)
* No permanent irreversible states
* Platform moderators override system decisions
* Provide investigation logs

---

## Deployment Expectations

* Canary rollout compatible
* Parallel version execution allowed
* Shadow mode support (compute without showing)
* Kill-switch safe
* Migration safe without downtime

---

## Observability

* Structured logs
* Correlation IDs
* Decision trace per user
* Metrics for drift detection
* Alert on abnormal state shifts

---

## What Is Forbidden

* UI-only features
* Hidden heuristics
* Random scoring
* Separate social graph
* Non-reversible writes
* Unexplainable outcomes
* Single-server assumptions
* Breaking platform invariants

---

## Acceptance Standard

If a large social network cannot:

* audit it
* disable it
* scale it
* or legally defend it

→ redesign.

### Core Objective

Every feature must be implemented so that an external social-media platform could integrate it into their existing production stack without rewrites, hacks, or conflicts.

The output must behave like a merge-ready pull request — not an example.

---

### Non-negotiable engineering standards

#### 1) Full stack completion

Whenever a feature is requested, implement **everything required for it to function in reality**, including:

* Database schema / migrations
* Backend logic and services
* API routes
* Validation and error handling
* Authentication and authorization checks
* Rate limiting (if applicable)
* Background jobs / queues (if needed)
* Caching strategy (if useful)
* Logging
* Configuration management
* Environment variable usage
* Integration points
* Tests (unit + integration level)
* Clear comments explaining why code exists

Never leave TODOs, stubs, or “assume this exists”.

---

#### 2) Integration-safe architecture

The system must be designed so another company can adopt it without breaking their codebase.

Therefore:

* No hardcoded globals
* No tight coupling
* No magic constants
* No singletons unless justified
* Use interfaces / adapters / dependency injection
* Version APIs
* Backward compatibility matters
* Avoid opinionated framework lock-ins unless necessary
* Write modular, replaceable components

Think: “a large company will plug this into a 5-year-old codebase”

---

#### 3) Functional reality over visuals

Never treat a feature as UI.

A feature exists only if:

* The data model supports it
* The server enforces it
* Edge cases are handled
* Malicious use is handled
* Concurrent usage works
* Failure states are defined

UI alone = not implemented.

---

#### 4) Reliability requirements

All code must assume real users and real traffic.

Include:

* Race condition prevention
* Idempotent operations where required
* Input validation
* Security checks
* Pagination
* Timeouts
* Retries for external calls
* Graceful failure paths
* Deterministic behavior

---

#### 5) Security baseline

Always assume attackers exist.

Add protections where relevant:

* Injection prevention
* Auth verification
* Permission checks
* Rate limiting
* Data exposure prevention
* Safe defaults
* No trust of client input

**CRITICAL — Security Anti-Patterns (Never Do These):**

- ❌ Hardcoded API keys or secrets in source code or `.env` files tracked in git
  - Use environment variables with `.env.example` instead
  - Rotate secrets if ever exposed
  - Never commit `.env` to version control

- ❌ Passing authentication tokens in URLs (Instagram Graph API, OAuth tokens, etc.)
  - Always use Authorization headers: `Authorization: Bearer <token>`
  - URL tokens get logged (access logs, browser history, referrer headers)
  - Violates OAuth 2.0 security standards

- ❌ PKCE challenges hard-coded or using plaintext method
  - Generate cryptographically random challenges
  - Use S256 (SHA256) method, never plain
  - Each auth flow must have unique challenge

- ❌ Weak JWT validation (using `Validation::default()` without algorithm specification)
  - Always explicitly specify algorithm: `Validation::new(Algorithm::HS256)`
  - Validate exp, iat, nbf claims
  - Prevent algorithm confusion attacks

- ❌ SQL injection via string formatting/concatenation
  - Always use parameterized queries: `sqlx::query("... $1 ...")
  .bind(value)`
  - Never: `format!("... {}", value)`
  - Even if restricted to hardcoded values, teach wrong patterns

- ❌ Missing security headers (CORS configuration alone is insufficient)
  - Add middleware for: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
  - Don't rely on browser defaults

- ❌ Storing sensitive data in plaintext in database
  - Encrypt fields at-rest for: API keys, tokens, SSNs, payment info
  - Use field-level encryption, not just TLS in transit
  - Hash passwords and API keys before storage

- ❌ Error messages that expose internal details in production
  - Don't panic with config requirements in startup errors
  - Catch errors and log separately; return generic client messages
  - Stack traces visible in console.error() or HTTP responses

- ❌ No timeouts on external API calls
  - Every HTTP client call must have timeout: `.timeout(Duration::from_secs(10))`
  - Prevents hanging connections and connection pool exhaustion

- ❌ Public auth endpoints without per-IP rate limiting
  - Add brute-force protection with exponential backoff
  - Implement CAPTCHA on repeated failures
  - Consider account lockout after N failed attempts

- ❌ Social platform IDs (Instagram ID, Twitter ID) used as cryptographic identifiers
  - Platform IDs are predictable sequences, not cryptographically secure
  - Generate your own user UUIDs
  - Verify platform ownership proof separately

- ❌ Frontend generating API keys or auth tokens
  - Keys/tokens must be generated server-side only
  - Frontend receives key only ONCE at creation time
  - Key is hashed before storage; frontend never sees it again

- ❌ Exposing PII without field-level access control
  - Implement audit logging for who accessed what PII
  - Return only necessary fields based on role/permission
  - Encrypt responses for sensitive data

- ❌ Trusting client-provided state without validation
  - Validate state parameter length, format, origin
  - Never echo state back without verification
  - Prevents state injection and CSRF attacks

---

#### 6) No "AI-style code"

Avoid patterns typical of generated sample code:

Do NOT:

* Fake persistence
* Store state in memory when persistence is required
* Implement logic only on frontend
* Skip validation
* Ignore concurrency
* Return success without guarantees
* Assume single user usage

Every behavior must be enforceable server-side.

---

#### 7) Vibe Coding Anti-Patterns — Production Killers

These are the exact failure patterns that destroy SaaS products post-launch. Every pattern below was validated by real churn events. Do not skip them.

- ❌ **Ship AI-generated code straight to production without review**
  - Prototype ≠ production-ready. AI optimizes for happy-path completion
  - Every production change needs a human reading it before deploy

- ❌ **Trust test mode (Stripe/payment) as proof of production stability**
  - Webhook failures, race conditions, and edge cases only appear in production
  - Always test with real payment events before launch

- ❌ **Skip webhook signature validation**
  - Verify the `Stripe-Signature` / `X-Valueskins-Signature` header on every inbound webhook
  - Half-implemented = silent revenue leaks and spoofable events
  - Handle duplicates (idempotency) and out-of-order delivery

- ❌ **Write database queries without pagination and LIMIT**
  - `.fetch_all()` with no LIMIT is a time bomb — works at 10 rows, kills DB at 10,000
  - Every list query must have `LIMIT $n OFFSET $m` or cursor-based pagination
  - Every unbounded query must cap at a safe maximum (e.g. LIMIT 100)

- ❌ **Deploy without database indexes on hot columns**
  - Always index: foreign keys, status columns, created_at, user_id
  - Queries that work at 10 users collapse at 100 without indexes
  - Add indexes in migrations before first data exists

- ❌ **Leave frontend pages returning mock/hardcoded data**
  - Pages with `const data = MOCK_DATA` are not implemented — they are stubs
  - Every page must have real API calls, real loading states, real error states
  - MOCK_* constants are prototyping scaffolding, not features

- ❌ **Ship without error boundaries on every route**
  - One crashing component must never blank the entire page
  - Wrap each route segment in `<ErrorBoundary>` with a fallback UI
  - Never expose stack traces in production browser console

- ❌ **Ignore edge cases outside the happy path**
  - AI writes for ideal flows. Production surfaces every other flow
  - Before accepting any AI output ask: "What happens when this fails?"
  - Explicitly handle: network timeout, auth expiry, empty state, partial data

- ❌ **Deploy without structured logging and error tracking**
  - `console.log` is not monitoring. It disappears after tab close
  - Backend: structured JSON logs with correlation IDs per request
  - Frontend: errors sent to observability endpoint, not just `console.error`
  - If you can't see failures in a dashboard, you will learn about them from churn

- ❌ **Push major changes without staged rollout**
  - Use canary releases (1% → 10% → 100%) for anything touching payments, auth, or data
  - Monitor error rate and p99 latency during canary window
  - Auto-rollback threshold: >1% error rate or >500ms p99

- ❌ **Scale traffic before stabilizing infrastructure**
  - Growth amplifies every weakness: unindexed queries, missing pagination, unhandled errors
  - Stabilize before marketing. Churn compounds faster than growth

- ❌ **Confuse good UI with stable product**
  - Pretty dashboards hide broken backend logic
  - A 4% landing page conversion rate means nothing if week-4 churn is 27%
  - Reliability is part of the product, not an afterthought

- ❌ **Launch without minimum monitoring**
  - Required before any production launch:
    - Error tracking (frontend + backend exceptions)
    - Server/API logs
    - Payment event monitoring (webhook delivery logs)
    - DB query performance alerts (slow query log)
    - Uptime check on `/health/ready`

- ❌ **Accept AI output without forcing it to explain assumptions**
  - Before accepting generated code, ask: "What edge cases did you skip?"
  - Ask: "What happens when the database is slow?" / "What if the user is unauthenticated?"
  - AI will tell you if you ask. It won't volunteer what it omitted

- ❌ **Treat debugging as an afterthought**
  - Vibe coding builds fast. Vibe debugging destroys momentum and revenue
  - Build observability in from day one, not after the first incident

---

### Output format expectations

Your output should resemble a real engineering contribution:

1. Brief architecture explanation
2. Data model
3. Backend implementation
4. API contract
5. Failure cases
6. Integration notes (how another platform plugs it in)

Do not shorten implementations to save space.
Completeness is more important than brevity.

---

### Final rule

If a feature would break in production, you implemented it incorrectly.



Always follow the SOLID principles while coding.
**S — Single Responsibility:** Each class or module should have only one job.
**O — Open/Closed:** Code should allow adding new behavior without changing existing code.
**L — Liskov Substitution:** Child classes must work correctly wherever the parent is expected.
**I — Interface Segregation:** Use small, specific interfaces instead of one large one.
**D — Dependency Inversion:** Depend on abstractions, not concrete implementations.

## DRY (Don't Repeat Yourself)
Avoid duplicating code. Extract common logic into reusable functions, utilities, or shared components.

## KISS (Keep It Simple, Stupid)
Write simple, readable code. Avoid over-engineering. The simplest solution is often the best one.

## YAGNI (You Aren't Gonna Need It)
Don't add features or code you don't need yet. Only implement what's required now.

## Composition Over Inheritance
Prefer composition to extend functionality rather than deep inheritance hierarchies.

## Immutability
Use immutable data structures and final variables where possible to prevent unexpected state changes.

## Error Handling & Validation
- Validate inputs at system boundaries (user input, external APIs)
- Use meaningful error messages
- Don't ignore exceptions silently
- Handle edge cases explicitly

## Code Organization & Structure
- Keep files focused and small
- Group related functionality together
- Use clear naming conventions (PascalCase for classes, camelCase for functions/variables)
- Organize imports logically

## Testing Principles
- Write testable code with dependencies injected
- Test edge cases and error scenarios
- Aim for clear, maintainable tests
- Use descriptive test names

## Performance & Security
- Avoid premature optimization
- Follow security best practices (no hardcoded secrets, input sanitization)
- Use appropriate data structures and algorithms
- Review contract security patterns for smart contracts

---

# Anti-Vibe-Coder Master Checklist (principles + ship-ready rules)

Run this before calling any code "done".

## Structure & Design

* Each class/module has one responsibility.
* Functions do one thing and stay small.
* No god objects or god files.
* Composition preferred over inheritance.
* Business logic separated from UI, DB, and network.
* Core logic not tied to a framework.
* State modeled with enums/state machines, not multiple booleans.
* Dependencies point inward to abstractions.

## Clarity & Readability

* Names describe intent, not shortcuts.
* No single-letter variables outside tiny loops.
* No magic numbers or hidden constants.
* One abstraction level per function.
* Deep nesting removed with early returns.
* Comments explain why, not what.
* No clever tricks that reduce readability.
* Consistent style and formatting.

## Correctness & Safety

* All external inputs validated.
* Edge cases handled explicitly.
* Errors never silently ignored.
* Fail fast on invalid state.
* Side effects are obvious in function names.
* Null/none cases handled deliberately.
* Timeouts and retries defined for external calls.
* Idempotent operations where retries can happen.

## Interfaces & Contracts

* Depend on interfaces, not concrete classes.
* Interfaces are small and role-focused.
* No method forces unused parameters.
* Function contracts documented by types.
* Illegal states made impossible by design.
* Backward compatibility considered for public APIs.

## Testing Discipline

* Critical paths covered by tests.
* Tests check behavior, not internals.
* Tests deterministic, no randomness.
* Each test has one purpose.
* Bug fixes come with a regression test.
* Integration tests for cross-module flows.
* No untested complex logic.

## Change & Version Control

* Small commits with one purpose.
* No mixed refactor + feature commits.
* Dead code deleted, not commented out.
* Refactor when complexity rises, not later.
* Public interfaces versioned when changed.
* Diff readable without mental gymnastics.

## Complexity Control

* No copy-paste blocks — extract functions.
* Repeated logic centralized.
* Cyclomatic complexity kept low.
* Large functions split.
* Config moved out of code.
* Feature flags used instead of branching chaos.

## Performance & Reliability

* Measure before optimizing.
* Resource usage bounded.
* Expensive operations cached or batched.
* No blocking calls in hot paths.
* Graceful degradation for dependency failure.
* Logging at failure points, not everywhere.

## Professional Red Flags (instant rewrite triggers)

* "It works, don't touch it."
* 200+ line functions.
* Boolean flag explosions.
* Hidden global state.
* Silent catch blocks.
* Tight coupling across layers.
* Behavior controlled by scattered conditionals.
* You cannot explain the flow in plain language in 60 seconds.

Use this as a gate. If multiple items fail, redesign — don't patch.

If microservices start failing : 1️⃣ Identify and isolate the mismatch
Start by comparing configurations across environments to find missing, inconsistent, or incorrectly scoped values. Confirm whether the issue affects startup, runtime behavior, or external integrations, and apply a temporary override to stabilize the service.

2️⃣ Completely separate configuration from code
Ensure the microservice is environment-agnostic by removing hardcoded values. The same build artifact should be deployed everywhere, with only configuration determining environment-specific behavior.

3️⃣ Standardize configuration structure across environments
Define a single configuration schema with mandatory keys, types, and defaults. All environments must follow this structure so failures happen early if something is missing or misconfigured.

4️⃣ Centralize configuration management
Use a single, authoritative source for configuration to avoid duplication and drift. This makes updates traceable, auditable, and easier to roll back when issues occur.

5️⃣ Validate configuration at startup (fail fast)
Perform strict validation when the service starts. If required values are missing or invalid, the service should fail immediately with clear, actionable error messages rather than running in a broken state.

6️⃣ Treat configuration as code
Version configurations, review changes through pull requests, and test them in CI pipelines. This ensures configuration changes receive the same scrutiny as application code.

7️⃣ Maintain strong environment parity
Use the same deployment process and tooling across all environments. Promote configurations consistently from development to production to prevent surprises and reduce environment-specific issues.

Managing high traffic API : 
1️⃣. Reduce Object Creation Rate
High object creation increases garbage collection frequency and CPU usage.
Focus on minimizing unnecessary object creation, especially in frequently executed request paths such as parsing, logging, and response building.
Key Idea:
Create objects only when necessary and avoid short-lived temporary objects.

2️⃣. Reuse Objects When Possible
Instead of creating new objects repeatedly, reuse existing ones safely.
Where it helps most:
Expensive objects with heavy initialization
Large buffers
Parsers or serializers
Avoid reusing very small lightweight objects because modern JVM garbage collectors handle them efficiently.

3️⃣ Use Thread-Level Object Reuse
Each thread can maintain its own reusable objects, which reduces allocation and avoids synchronization overhead.
Common reusable items:
Temporary buffers
String builders
Formatters
Be careful in thread pools to prevent memory leaks by clearing large objects when not needed.

4️⃣. Prefer Primitive Types Over Wrapper Objects
Primitive types consume less memory and avoid extra heap allocation.
Why this matters:
Wrapper objects add object header overhead
Increase garbage collection workload
Reduce cache efficiency
Using primitives improves both memory and CPU performance.

5️⃣. Use Immutable Objects
Immutable objects help optimize memory because they can be shared safely across threads and components.
Benefits:
Reduced defensive copying
Safer concurrency
JVM optimization opportunities
Lower duplication risk
They also improve system reliability in distributed architectures.

6️⃣ Avoid Temporary Objects in Critical Execution Paths
Temporary objects created inside loops or high-frequency methods can significantly increase memory pressure.
Common problem areas:
String operations
Repeated data format conversions
Creating new collections per request
Creating intermediate data transfer objects
Even small objects can cause major impact at scale.

payments : 
1️⃣ Singleton Pattern Usage
Ensures only one configuration instance exists throughout the application. This avoids duplication and keeps system behavior predictable.

2️⃣ Restrict Direct Object Creation
By blocking external instantiation, all modules are forced to use the same centralized configuration source, preventing misuse.

3️⃣ Maintain Consistent Payment Settings
Guarantees uniform use of API keys, encryption rules, timeout values, and gateway URLs across all transactions.

4️⃣ Improve Security & Reliability
Avoids conflicts caused by multiple configuration objects, reducing transaction failures and security loopholes.

5️⃣ Optimize Memory & Resource Usage
Reuses a single configuration instance instead of creating multiple objects, improving system performance.

6️⃣ Support Thread Safety
Prevents multiple threads from creating separate configuration instances in high-load payment environments.

When kafka consumer logic needs DB access : 
1️⃣ Commit Kafka Offset Only After DB Success
Process the Kafka message and update the database first.
Commit the Kafka offset only after the database transaction completes successfully.
If the DB operation fails, the offset is not committed, and the message is reprocessed.
This ensures at-least-once delivery and prevents data loss.

2️⃣ Make Database Operations Idempotent
Kafka can re-deliver messages, so duplicate processing is possible.
Design DB operations to be idempotent using unique business keys or deduplication logic.
This guarantees data consistency even if the same message is processed multiple times.

3️⃣ Understand Kafka Exactly-Once Limitations
Kafka provides exactly-once semantics only for Kafka-to-Kafka flows.
External systems like databases are not part of Kafka transactions.
With databases, exactly-once is achieved logically using manual offset control and idempotent writes.

4️⃣ Use Outbox / Inbox Pattern for Enterprise Systems
For large-scale and microservice systems, use the Outbox / Inbox pattern.
It avoids distributed transactions while maintaining strong consistency.
This approach is widely used in production-grade and financial systems.

producer crashes mid set and you want to ensure no data loss : 1️⃣Use acknowledgments set to all
Configure the producer with acks=all.
This ensures a message is considered successful only after all in-sync replicas have written it.
If the producer crashes before receiving the acknowledgment, the broker still retains the data.

2️⃣ Enable idempotent producer
Enable idempotence so retries do not create duplicates.
Each message is assigned a sequence number.
If the producer crashes and retries, the broker detects duplicates and discards them safely.

3️⃣ Configure retries properly
Set a high retry count.
If a crash occurs after sending but before acknowledgment, the producer retries once it restarts.
With idempotence enabled, retries remain safe and ordered.

4️⃣ Use transactions for exactly-once delivery
Wrap sends inside a transaction.
If the producer crashes mid-send, the transaction is automatically aborted.
Consumers will never read partial or inconsistent data.

5️⃣ Ensure replication factor ≥ 3
Messages are replicated across brokers.
If the leader broker fails during send, a follower with the data is promoted.
This prevents data loss even during crashes.

6️⃣ Configure min.insync.replicas
Set min.insync.replicas to at least 2.
The broker only acknowledges writes when the minimum number of replicas are in sync.
This protects against leader failure right after a write.

7️⃣ Handle producer restarts correctly
On restart, the producer resumes with the same producer ID.
Kafka uses sequence numbers to continue safely without losing or duplicating messages.

You are a senior backend architect.


Step 1:
Design a normalized database schema including:- Core entities- Relationships- Foreign keys- Indexing suggestions

Step 2:
Simulate as many  daily active users as you think may use valueskins if meta adopts this. (billions of users)
Identify:- Structural weaknesses- Bottlenecks- Redundant relationships- Risk of write amplification

Step 3:
Suggest schema improvements for scale.

Be brutally honest.
Do not optimize for simplicity.
Optimize for long-term stability.

You are a backend security engineer.

Given this architecture: (the techbase we've used)

List potential vulnerabilities including:- Authentication bypass risks- Improper role enforcement- Rate abuse- Injection attacks- Data exposure risks- Client-side trust issues

Then suggest mitigation strategies for each.

You are a systems architect evaluatinglong-term scalability.
 At millions/ billions of users 

- What migration challenges might arise?
- What parts of the system become hard to replace?
- What data portability issues may occur?
- What vendor limitations might hurt scale?

Suggest how to design today to reducelock-in risk.

You are a cloud cost analyst.

Estimate cost behavior at:- 100 DAU- 1,000 DAU- 10,000 DAU

Identify:- Which metric drives cost (reads, writes, bandwidth, storage, function calls)- What can spike unexpectedly- Which architectural decisions increase cost sensitivity

Suggest optimizations for cost stability.

You are a distributed systems engineer. And imagine valueskins has been adopted by meta

Simulate sudden traffic spikes.

Answer:- What fails first?- What slows down first?- What data becomes inconsistent?- What monitoring should exist?

Then recommend architectural safeguards.

Evaluate this system design.

Does it optimize for:- Feature completion
or- Long-term stability?

List:- Hidden technical debt- Unscalable shortcuts- Poor separation of concerns

Be critical.
Assume this app will scale 100x.

If AI says:

“Looks good.”

Ask:

“What would break at scale?”

Always interrogate the system.

---

## The 100/100 Rule — Non-Negotiable

**Never deliver work at 65/100 and call out the remaining 35 as "recommendations" or "future work."**

If you can identify a problem, you fix it. Period. There is no "identify now, fix later" unless the user explicitly says so.

### What this means in practice:

- ❌ **Never write a report that says "NOT YET" next to something you can implement right now.**
  If you know the bottleneck exists and you know the fix, ship the fix — not a bullet point.

- ❌ **Never split work into "edge case fixes" and "architectural fixes" as separate phases unless told to.**
  Both are part of the same job. Shipping one without the other is shipping broken code.

- ❌ **Never present a score below 100 and then list what would make it 100.**
  That list IS your job. Do the work, then present the score.

- ❌ **Never use "at scale this would need X" as an excuse to not build X.**
  If you're stress-testing for Meta scale, build for Meta scale. Don't describe the gap — close it.

- ❌ **Never defer architectural infrastructure (event bus, circuit breaker, caching, rate limiting, read replicas) as "medium-term" or "long-term" when you can write it now.**
  These are not optimizations. They are requirements. Ship them with the feature.

### The standard:

Every deliverable must be **complete on first pass**. If you find 16 edge cases, fix all 16 AND fix the architecture that caused them. If you find 6 bottlenecks, resolve all 6 in code — not in a markdown recommendations list.

**If it's not 100/100, you're not done.**