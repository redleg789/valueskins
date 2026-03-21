# Claude Code Best Practices (From Real MVP Development)

> Real-world wisdom from shipping multiple client MVPs in parallel

## 🟢 DO

### 1. Write Your Plan Down in Persistent Files
- **DO:** Create detailed specs in `CLAUDE.md` or project docs BEFORE starting work
- **DO:** Be specific about features, flows, constraints, and edge cases
- **DO:** Keep the plan visible to Claude at start of each session
- **WHY:** Keeps AI focused, prevents second-guessing, catches conflicts early
- **EXAMPLE:** Don't say "add payments", say "stripe escrow with 3-stage releases: 30% advance, 40% on upload, 30% on approval. Must be auditable for disputes."

### 2. Break Work Into Phases
- **DO:** Define 1-2 week phases with clear entry/exit criteria
- **DO:** Complete each phase fully before starting next (no interleaving)
- **DO:** List what's done, what's blocked, what's next at end of phase
- **WHY:** Each phase fits in context window, prevents rework
- **EXAMPLE:**
  - Phase 1: Core deal room + script negotiation
  - Phase 2: Payment milestones + dispute resolution
  - Phase 3: Multi-platform replication + admin panel

### 3. One Phase Per Chat
- **DO:** Start a fresh chat for each phase (don't use same chat for multiple phases)
- **DO:** Copy relevant docs into new chat (memory, specs, progress)
- **DO:** Only feed Claude what that phase needs
- **WHY:** Respects context window, prevents token bloat, keeps focus sharp
- **EXAMPLE:** Don't ask AI to simultaneously build frontend AND backend; do frontend Phase 1, then start new chat for backend Phase 2

### 4. Keep Everything in Persistent Files
- **DO:** Store specs in `.md` files in the repo
- **DO:** Store decisions/learning in memory files (outside the repo, in `.claude/memory/`)
- **DO:** Store progress/blockers in `NOT_PROD_READY.md` or similar tracking file
- **DO:** Store code snippets and architectural patterns in dedicated docs
- **WHY:** State persists across chats, new sessions start informed
- **EXAMPLE:** `CLAUDE.md` (specs), `memory/DECISIONS.md` (why you chose React over Vue), `memory/NOT_PROD_READY.md` (what's left)

### 5. Track Progress Explicitly
- **DO:** Document what's done, what's left, blockers, and why you made certain calls
- **DO:** Update progress file at end of each major feature or session
- **DO:** Use clear status labels (completed, in_progress, pending, blocked)
- **WHY:** Prevents duplicate work, helps next session understand where to start
- **EXAMPLE:**
  ```
  ✓ Script negotiation workflow (3 modes implemented)
  ✓ Tip system (zero commission direct payout)
  - Dispute resolution (UI complete, needs backend integration)
  - Multi-platform replication (Instagram done, pending TikTok/YouTube/LinkedIn)
  ```

### 6. Verify Output
- **DO:** Write expected behavior documentation alongside features
- **DO:** Use Playwright or similar E2E testing for critical flows
- **DO:** Test at least one full end-to-end flow (creator applies → deal negotiates → payment → completion)
- **DO:** Build checks should pass before committing
- **WHY:** Catches regressions, prevents shipping broken features
- **EXAMPLE:** Don't just add a button; write a test: "Creator can open script editor, make changes, save, see version history"

### 7. Use Worktrees for Parallelization
- **DO:** Create separate git worktrees for each phase or platform variant
- **DO:** Run multiple chats in parallel (Phase 2 in one chat, platform replication in another)
- **DO:** Merge worktrees back to main when work is complete
- **WHY:** Massive speed multiplier; let AI work on independent parts simultaneously
- **EXAMPLE:** Worktree A = implement dispute resolution, Worktree B = replicate to TikTok/YouTube, merge both when done

### 8. Commit Frequently with Clear Messages
- **DO:** Commit after each complete feature or significant milestone
- **DO:** Use descriptive commit messages with context (issue, solution, impact)
- **DO:** Include "Co-Authored-By" to track AI contribution
- **WHY:** Clear history helps debug issues, shows progress to stakeholders
- **EXAMPLE:** `feat: add 3-stage payment milestones with audit trail - brands can release advance/upload/approval payments independently, fully auditable for disputes`

### 9. Document Decisions, Not Just Code
- **DO:** When choosing between approaches, write down why in memory/decisions file
- **DO:** Include the constraint that drove the decision (performance, compliance, UX)
- **DO:** Note what would trigger switching to a different approach
- **WHY:** Future you and Claude understand the context, avoid second-guessing
- **EXAMPLE:** "Chose Firebase over Supabase because: (1) real-time sync needed for script collab, (2) Supabase polling too slow, (3) Firebase BroadcastChannel sufficient for demo. Would switch if 1B+ DAU required."

### 10. Respect Component Boundaries
- **DO:** Keep frontend state management (useState, hooks) separate from backend state
- **DO:** Define clear API contracts between frontend and backend
- **DO:** Don't let platform-specific code bleed into shared libraries
- **WHY:** Makes replication to other platforms (TikTok, YouTube, LinkedIn) trivial
- **EXAMPLE:** `useDealSync.ts` is the single source of truth for deal state; platform-specific demo pages just consume it

## 🔴 DON'T

### 1. Don't Second-Guess Decisions Without Documentation
- **DON'T:** Refactor working code "because it might be better" mid-phase
- **DON'T:** Switch frameworks/libraries without documenting the constraint that changed
- **DON'T:** Let Claude explore 5 different approaches and pick the prettiest one
- **INSTEAD:** Lock in your architecture in CLAUDE.md upfront; only change if constraint changes
- **IMPACT:** Second-guessing costs 20-40% extra time in rework

### 2. Don't Mix Phases
- **DON'T:** Start implementation before spec is written
- **DON'T:** Design UI while backend is still being architected
- **DON'T:** Refactor old code while building new features
- **INSTEAD:** Finish spec phase completely, then move to impl phase
- **IMPACT:** Mixing phases causes rework; clear phases let AI execute cleanly

### 3. Don't Forget the Humans
- **DON'T:** Build features without checking if they match user needs
- **DON'T:** Make architectural decisions in isolation; validate with stakeholders
- **DON'T:** Deploy to production without at least one real user testing it
- **INSTEAD:** Get feedback from actual users (creator, brand, admin personas) before finalizing
- **IMPACT:** Beautiful code that solves the wrong problem is still wrong

### 4. Don't Let Code Bloat
- **DON'T:** Leave debug code, commented-out functions, or unused state variables
- **DON'T:** Create "helper" functions that are only used once
- **DON'T:** Add features "just in case" you'll need them later
- **INSTEAD:** Delete dead code immediately; implement only what spec calls for
- **IMPACT:** Large codebases slow down parsing, increase bugs, make replication harder

### 5. Don't Rely on Implicit Knowledge
- **DON'T:** Assume AI remembers context from 3 chats ago
- **DON'T:** Store important decisions in Slack or email instead of docs
- **DON'T:** Build features without linking them to the spec
- **INSTEAD:** Put everything in persistent files that new chats read first
- **IMPACT:** Without explicit docs, each chat rediscovers the same gotchas

### 6. Don't Ship Untested
- **DON'T:** Commit code without running `npm run build` or equivalent
- **DON'T:** Use TypeScript with `@ts-ignore` comments to silence errors
- **DON'T:** Trust that a feature works because "the code looks right"
- **INSTEAD:** Actually run the code, click the UI, watch the API logs
- **IMPACT:** One 5-minute test catch at dev time vs one hour of production debugging

### 7. Don't Silo Knowledge
- **DON'T:** Keep architectural decisions in your head
- **DON'T:** Assume the next person (or AI) will figure out why you chose Postgres over MongoDB
- **DON'T:** Let complexity hide in comments instead of being front-and-center
- **INSTEAD:** Document tradeoffs, constraints, and decision tree in readable files
- **IMPACT:** Makes onboarding new devs (or new AI chats) instant instead of 1 week

### 8. Don't Overengineer for Future Scale
- **DON'T:** Build multi-tenant infrastructure for a single customer
- **DON'T:** Optimize queries before you have data volume
- **DON'T:** Design for 1B DAU when targeting 10K users
- **INSTEAD:** Build for current scale + 10x headroom, document migration path for next 10x
- **IMPACT:** Overengineering burns 30-50% of dev time on unused features

### 9. Don't Skip Integration Points
- **DON'T:** Build payment UI without defining payment provider interface
- **DON'T:** Build notification system without thinking about how different providers (FCM, APNs, email) will plug in
- **DON'T:** Assume "we'll figure it out at scale"
- **INSTEAD:** Define abstract interfaces even if you only implement one provider now
- **IMPACT:** No rework when requirements change or scaling happens

### 10. Don't Lose Focus on Product Goal
- **DON'T:** Get caught up in technical perfection at the expense of shipping
- **DON'T:** Build all edge cases if core happy path isn't done
- **DON'T:** Let AI explore 10 different UI approaches when simple works
- **INSTEAD:** Focus on: Does it solve the user's problem? Is it stable? Can we measure it?
- **IMPACT:** Shipped imperfect beats perfect stuck in engineering limbo

---

## Quick Checklist Before Each Phase

- [ ] Spec is written in `CLAUDE.md` or project docs
- [ ] Phase entry/exit criteria are clear
- [ ] Blockers from previous phase are logged
- [ ] Memory files (decisions, progress) are up to date
- [ ] One phase per chat (new chat if starting new phase)
- [ ] Architecture diagram or component map exists
- [ ] Acceptance criteria (how to verify done) written down
- [ ] Worktree strategy planned (if parallelizing)

---

## Compound Effect

When all 10 practices are in place:
- ✅ First chat lands features cleanly
- ✅ No rework, no second-guessing
- ✅ Each new chat picks up context instantly
- ✅ Parallelization via worktrees gives 3-4x speedup
- ✅ New team members onboard in hours, not weeks
- ✅ Code is maintainable and ready for scale

**Bottom line:** Specs + phases + persistent files + verification = boring, fast shipping.
