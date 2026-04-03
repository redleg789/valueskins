# imitateclaude.md - Founder Context (Not Engineering Policy)

**⚠️ READ ENGINEERING_STANDARDS.md FIRST. THIS IS CONTEXT ONLY.**

This document explains HOW Saketh thinks, WHAT ValueSkins is, and WHY we make certain decisions. It's useful for understanding the business and prioritizing features. **It is NOT engineering law.**

For engineering law, see ENGINEERING_STANDARDS.md.

---

## Part 1: How Claude Thinks (AI Decision Context)

### Pattern Recognition First
- Look at existing code patterns before suggesting new ones
- Copy style/naming/structure from codebase
- One consistent way = simpler than multiple ways
- Speed comes from patterns, not shortcuts

### Minimal Changes
- Change only what's needed for the request
- Leave surrounding code untouched
- Don't refactor things you didn't break
- Don't optimize before understanding the requirement

### Know When to Stop
- Task complete = stop immediately
- Don't add logging, error handling, or "nice-to-haves" you didn't ask for
- Don't optimize code you didn't write
- Don't refactor unless explicitly asked

### Context Management
- Memory persists across sessions for non-obvious insights
- Obvious architectural facts are read from code, not memorized
- Session observations auto-capture decisions
- Update memory when code changes invalidate prior decisions

### Tool Hierarchy (For LLMs)
1. Glob > find/ls (file patterns)
2. Grep > grep (content search)
3. Read > cat/head (file content, but use Get Skeleton for overview)
4. Edit > sed (modify files)
5. Write > echo (create files)
6. Agent > manual searching (only for complex multi-round exploration)

### Error Recovery
- TypeScript errors are the source of truth
- Check type definition before guessing
- When hook fails, diagnose before retrying
- Build output is the contract

### Build-Check-Push Loop
- After code changes: `npm run build` immediately
- If build fails: diagnose root cause, don't patch around it
- Never push broken code
- Always verify TypeScript compiles

---

## Part 2: ValueSkins Product Vision

### The Problem We Solve

**Today:** Brands hiring creators waste hours vetting:
- "Is this person actually a software engineer?"
- "Do they have the right audience?"
- "How reliable are they?"
- Manual checks, LinkedIn research, asking for portfolios

**ValueSkins:** Creators prove they're a "Software Engineer" once, carry that credential everywhere. Brands find verified creators in seconds.

### The 24 Professions (ValueSkins)

1. Fashion (Influencer, Stylist, Designer, Model, etc)
2. Beauty (Makeup, Skincare, Hair, Nails, etc)
3. Travel (Blogger, Adventure, Luxury, Budget, etc)
4. Food & Beverage (Chef, Photography, Recipe, etc)
5. Fitness (Trainer, Yoga, Coach, etc)
6. Lifestyle (Blogger, Minimalist, Wellness, etc)
7. Photography (Portrait, Street, Landscape, etc)
8. Interior Design (Designer, Decor, DIY, etc)
9. **Technology** (Software Engineer, Full Stack, Data Scientist, etc) ← Most relevant to current demo
10. Entertainment (Actor, Comedian, Musician, etc)
11. Sports (Athlete, Coach, Analyst, etc)
12. Business (CEO, Entrepreneur, Consultant, etc)

Plus 12 more niche: Real Estate, Sustainability, Wellness, Education, Gaming, Music Production, Writing, Coaching, Design, Marketing, Media, Consulting

### The Deal Workflow (State Machine)

**Phases (creator side):**
```
brief → counter → negotiation → formal_offer → softhold → checklist → deliverables → submitted → approved
```

**Phases (brand side):**
```
brief → [waiting] → counter → negotiation → formal_offer → softhold → [waiting] → submitted → approved
```

**Critical rules (enforced in code):**
- Can only move forward, never backward
- `formalOfferSentByCreator` flag prevents creator from re-negotiating
- `escrowFunded` flag prevents double-funding
- Both parties see same phase (synced state)

### Deliverables Parsing (Exact Logic)

**Input:** "2x Reels, 3x Stories, 1x Post"

**Parsed to:** `[{format: "Reels", count: 2}, {format: "Stories", count: 3}, {format: "Post", count: 1}]`

**Expanded to upload slots:**
```
1. Reels (1 of 2)
2. Reels (2 of 2)
3. Stories (1 of 3)
4. Stories (2 of 3)
5. Stories (3 of 3)
6. Post (1 of 1)
```

Creator must submit unique link for each slot.

### Deal Room Chat

**Real-time message sync via Firebase**
- Opens from "pending" phase onwards
- Both parties can see full history
- Messages append-only (never deleted, for audit trail)
- Types: offer_sent, counter_sent, chat, deliverable_submitted, approval_decision

### Portfolio Image Feature

**Why it exists:** Creators show professionalism/personality beyond video. Upload once, visible on profile forever. Can remove anytime from settings.

**Implementation detail:** Base64 stored in state (demo) / backend storage (prod). Single image per creator.

### Duplicate Reel Prevention

**Why it matters:** Ensures creator actually produced multiple pieces, not same content repackaged 3 times.

**Mechanism:** Before confirming upload, check if link already in `deliverableLinks`. Reject if duplicate with clear message.

### Role Switching

**How it works:** Marketplace role is a UI state toggle (creator ↔ brand). Not persisted across page load (by design for demo). Each tab switch shows different UI, but same deal room logic.

**Why it's useful:** Single interface for testing both creator and brand perspectives.

---

## Part 3: Saketh's Decision Framework (Context for Prioritization)

### What He Optimizes For (In Order)

1. **Workflow clarity** - Deal flow must be obvious, never confusing
2. **User value** - Does this solve a real problem?
3. **Speed to market** - How fast can we ship it?
4. **Technical quality** - Clean code, sustainable architecture
5. **Completeness** - Edge cases handled, not half-features

### Red Flags That Trigger Action

- "Creator can't understand what step they're on" → Fix immediately
- "Brand confusion about deal status" → Fix immediately
- "Feature could break existing workflow" → Don't ship
- "This makes the codebase harder to maintain" → Reconsider
- "We can ship this partially" → Scope it down or don't ship

### What He Values in Code

1. **Clarity** - Code explains itself (naming, structure, patterns)
2. **Consistency** - Follows existing codebase style
3. **Completeness** - Edge cases handled, not half-finished
4. **Correctness** - Types checked, tests pass, builds compile
5. **Testability** - Can be verified independently

### What He Dislikes

- Vague status updates ("I'm working on it")
- Unfinished work pushed to main
- Features that don't ship (endless refinement)
- Over-engineering for hypothetical future
- Breaking changes without migration

### Philosophy in Practice

**"Ship fast, verify thoroughly. Speed without clarity kills the product. Clarity without speed kills the market window."**

Workflow > features > speed (in that order)

---

## Part 4: Known Limitations (What's Built, What's Stubbed)

### Fully Implemented ✅
- Deal workflow state machine (all phases working)
- Chat system (Firebase real-time)
- Portfolio image upload/removal
- Duplicate reel prevention
- Deliverable count parsing and expansion
- Form validation
- Role switching (creator/brand demo)
- Brand-side state sync

### Stubbed/Not Yet Implemented 🔲
- Payment processing (needs Stripe/Meta Pay integration)
- Authentication (JWT system exists, OAuth scaffolded)
- Creator verification (AI model stub only)
- Email notifications (Firebase notifications only)
- Contract e-signature (signature input non-binding)
- Creator discovery API (hardcoded creators in demo)

### Why These Are Stubs

These features require infrastructure Meta needs to provide:
- Payment: Stripe/Meta Pay API keys
- Auth: Instagram OAuth app
- Verification: Brand safety API access
- Infrastructure: Database, email service

See `META_INTEGRATION.md` for complete list.

---

## Part 5: Using This Document

### For Understanding ValueSkins
- ✅ Read Part 2 (product vision)
- ✅ Read Part 3 (why we prioritize things)
- ✅ Use this to understand business requirements

### For Understanding Saketh
- ✅ Read Part 3 (decision framework)
- ✅ Use this to understand what he cares about
- ❌ Don't use this as permission to skip engineering standards

### For Writing Code
- ❌ This is NOT engineering law
- ✅ Read ENGINEERING_STANDARDS.md instead
- ✅ Use this document for context when making decisions
- ✅ Use this to understand what problems we're solving

### For Code Review

**Use imitateclaude.md to answer:**
- Does this solve the right problem?
- Is this aligned with product vision?
- Does this fit our priorities?

**Use ENGINEERING_STANDARDS.md to answer:**
- Does it compile?
- Do tests pass?
- Is it secure?
- Is error handling complete?
- Is naming clear?

---

## Summary

**imitateclaude.md** = Why we build things (context, motivation, vision)
**ENGINEERING_STANDARDS.md** = How we build things (rules, enforced at code review)

This document helps you understand the business and priorities.

ENGINEERING_STANDARDS.md is what actually ships code.

Read both. Follow ENGINEERING_STANDARDS.md. Use imitateclaude.md for context.
