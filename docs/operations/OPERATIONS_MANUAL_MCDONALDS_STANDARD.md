# Operations Manual: McDonald's Standard (No Single Point of Failure)

**Status**: Master Process Documentation  
**Last Updated**: 2026-04-24  
**Purpose**: Every process reproducible by anyone, anytime. Zero dependency on individuals.

---

## TABLE OF CONTENTS

1. [Philosophy & Standards](#philosophy--standards)
2. [Core Processes](#core-processes)
3. [Development Workflows](#development-workflows)
4. [Security & Compliance](#security--compliance)
5. [Deployment & Operations](#deployment--operations)
6. [Monitoring & Incident Response](#monitoring--incident-response)
7. [Data Management](#data-management)
8. [Financial Processes](#financial-processes)
9. [Knowledge Base & Training](#knowledge-base--training)

---

## PHILOSOPHY & STANDARDS

### The McDonald's Model

At McDonald's, a 16-year-old can make a Big Mac identical to every other Big Mac because:
1. **Every step is documented** (visual diagrams + text)
2. **Every tool is the same** (standardized equipment)
3. **Every decision is pre-made** (decision trees, not judgment calls)
4. **Quality is measured** (checklists, not intuition)
5. **Handoffs are explicit** (clear baton passes, not assumptions)

### Our Standards

**Every process must have**:
- [ ] Step-by-step runbook (copy-pasteable commands)
- [ ] Decision tree (if X, then do Y)
- [ ] Success criteria (how do I know it worked?)
- [ ] Logging/documentation (what to record)
- [ ] Fallback procedures (if it breaks, here's plan B)
- [ ] Owner assignment (this person is trained)
- [ ] Estimated duration (how long does this take?)
- [ ] Approval gates (who reviews before go-live?)

**Forbidden**:
- [ ] "Ask [person] how to do this"
- [ ] "It's in my head"
- [ ] "Use your judgment"
- [ ] Undocumented dependencies
- [ ] Tribal knowledge
- [ ] "I'll tell you next time"

---

## CORE PROCESSES

### Process Template (Copy This)

```markdown
## [Process Name]

**Owner**: [Name + Email + Phone]  
**Duration**: [X mins/hours]  
**Frequency**: [Daily/Weekly/As-needed]  
**Last Tested**: [Date]

### Prerequisites
- [ ] Prerequisites list

### Step-by-Step
1. **Pre-flight check**
   ```bash
   # Command to verify readiness
   ```
   Expected output: [What success looks like]

2. **Main process**
   ```bash
   # Commands
   ```
   Expected output: [What success looks like]

3. **Verification**
   ```bash
   # Verification command
   ```

### Success Criteria
- [ ] Checklist item 1
- [ ] Checklist item 2

### Logs & Records
- [ ] Location of logs: [path]
- [ ] What to record: [fields to log]
- [ ] Retention: [how long to keep]

### Fallback (If Something Breaks)
- **Problem**: X happened
- **Solution**: Run [command] to rollback
- **Escalation**: Page [person] if still broken after 5 min

### Testing Schedule
- **Weekly**: [test on Thursday at 10am UTC]
- **Monthly**: Full end-to-end test
- **Annual**: Disaster recovery test

### Approval Gates
- [ ] Code reviewed by [role]
- [ ] Security approved by [role]
- [ ] Performance tested
- [ ] Runbook updated
```

---

## DEVELOPMENT WORKFLOWS

### Process 1: Feature Development (Nexus)

**Owner**: Lead Frontend Engineer (+ 1 backup)  
**Duration**: Variable (see story estimation)  
**Frequency**: Ongoing (per sprint)

#### Prerequisites
- [ ] Figma design approved by design team
- [ ] Requirements documented in GitHub issue
- [ ] Acceptance criteria defined
- [ ] Security threat model reviewed (if security-sensitive)

#### Step-by-Step

**Phase 1: Setup (5 min)**
```bash
# 1. Check out main branch and update
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/[feature-name]  # Example: feature/deal-lifecycle-states

# 3. Verify environment
npm run env:check  # Verifies all required env vars present
npm run lint:check  # Verifies linting baseline
```

**Phase 2: Development (varies)**
```bash
# 1. Start dev server
npm run dev

# 2. Create changes (editor-based, not documented here)

# 3. After each logical chunk (30 min work):
git add [files]
git commit -m "[type]: [description]"
# Types: feat (feature), fix (bug), refactor, docs, test, security

# 4. Every 2 hours or before leaving: push to remote
git push origin feature/[feature-name]

# 5. Run tests locally before pushing
npm run test:unit
npm run test:e2e  # If added E2E tests
```

**Phase 3: Pre-Submission (15 min)**
```bash
# 1. Security scan for secrets
npm run security:scan

# 2. Dependency audit
npm audit --production

# 3. Type checking
npm run type:check

# 4. Linting
npm run lint

# 5. Build verification
npm run build  # Must pass without errors

# 6. Update UPDATED_FEATURES.md (MANDATORY - see rule below)
# Add your feature to "IN PROGRESS" section with status
```

**Phase 4: Submit PR (5 min)**
```bash
# 1. Push final code
git push origin feature/[feature-name]

# 2. Create PR on GitHub
# Title: [Feature]: [Short description]
# Body:
#   ## What
#   [What you built]
#   ## Why
#   [Why it matters]
#   ## How to test
#   [Step-by-step test instructions]
#   ## Checklist
#   - [ ] Tests pass
#   - [ ] No secrets in code
#   - [ ] Security reviewed
#   - [ ] UPDATED_FEATURES.md updated

# 3. Link to issue (use closing keyword if complete)
# Example: "Closes #123"
```

#### Success Criteria
- [ ] All tests pass locally (`npm run test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Types check (`npm run type:check`)
- [ ] No new security warnings
- [ ] Build completes without errors
- [ ] PR has description + test instructions
- [ ] UPDATED_FEATURES.md updated
- [ ] Code review approved by 1+ peers
- [ ] Security review completed (if needed)

#### Logs & Records
- **Location**: GitHub PR + commit history
- **What to record**: Feature name, dates, who tested, status
- **Retention**: Permanent (in git)

**MANDATORY RULE**: Every feature completed or in-progress MUST be added to `/UPDATED_FEATURES.md` with:
- Feature name
- Status (In Progress / Completed / Blocked)
- Date started
- Expected completion date
- Key changes made

#### Fallback Procedures
**If build fails locally**:
```bash
# 1. Check for uncommitted changes
git status

# 2. Reset to last known good state
git reset --hard origin/main

# 3. Start over
git checkout -b feature/[name]
```

**If merge conflict occurs**:
```bash
# 1. Pull latest main
git fetch origin
git rebase origin/main

# 2. Resolve conflicts in editor (search for >>>)

# 3. After resolving all, continue rebase
git add [resolved-files]
git rebase --continue

# 4. Force push to feature branch (only your branch!)
git push origin feature/[name] --force-with-lease
```

**If accidentally pushed to main**:
```bash
# 1. IMMEDIATELY: Notify in #incidents Slack channel
# 2. Revert the commit
git revert [commit-hash] && git push origin main

# 3. Document what happened in incident log
# 4. Do NOT force-push main (breaks for others)
```

#### Approval Gates
1. **Author self-review**: Ensure code quality before submitting
2. **Peer code review**: At least 1 other engineer approves
3. **Security review**: If touching auth, payments, or user data
4. **Design review**: If UI changes visible to users
5. **Merge**: Approved PR can be merged to main by author or reviewer

#### Testing Schedule
- **After each commit**: Run `npm run test:unit` (< 2 min)
- **Before PR submission**: Run full test suite + build
- **Nightly CI**: Automated tests run on every push
- **Weekly**: Full integration test suite on main

---

### Process 2: Code Review (Reviewer Perspective)

**Owner**: All engineers (rotating, no single owner)  
**Duration**: 30 min - 2 hours per PR  
**Frequency**: Ongoing

#### Prerequisites
- [ ] PR has description + context
- [ ] PR links to GitHub issue
- [ ] Tests pass in CI

#### Step-by-Step

**Phase 1: Initial Scan (5 min)**
```bash
# 1. Read PR description + title
# 2. Check if scope is reasonable for single PR (not too large)
# 3. Check if changes match the description

# Large PR? (>400 lines of code changes)
# → Ask author to split or provide detailed walkthrough
```

**Phase 2: Code Review (20-45 min)**

**Security Focus**:
- [ ] No hardcoded secrets (api keys, tokens, passwords)
- [ ] Input validation present (check CLAUDE.md Part 1)
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (output encoding)
- [ ] CSRF tokens present (if state-changing endpoint)
- [ ] No PII in logs
- [ ] Rate limiting applied (if applicable)
- [ ] Error messages generic (no stack traces to client)

**Quality Focus**:
- [ ] Code is readable + well-named
- [ ] No duplicated logic
- [ ] Tests cover new functionality
- [ ] Comments explain "why", not "what"
- [ ] Performance acceptable (no O(n²) loops)
- [ ] No console.log() left in production code

**Compatibility Focus**:
- [ ] Doesn't break existing tests
- [ ] Doesn't break other features
- [ ] Database migrations (if any) tested
- [ ] API changes backward compatible (or versioned)

**Phase 3: Comment & Approve (5-10 min)**

Add comments inline:
```
Line 42:
"hardcoded API key detected. Move to environment variable."
(Suggestion: Use `process.env.STRIPE_KEY`)
```

After review:
- **If blocking issues**: Leave "Request Changes" (author must fix)
- **If minor issues**: Leave comments (author can discuss)
- **If looks good**: Approve

#### Success Criteria
- [ ] All security items checked
- [ ] All quality items checked
- [ ] Feedback is specific + actionable
- [ ] Feedback respects author's time (no nitpicks)

#### Logs & Records
- **Location**: GitHub PR comments
- **What to record**: Issues found, how they were resolved
- **Retention**: Permanent (in PR)

#### Fallback (If Unsure)
```
"I'm not sure about this design. @[senior-engineer], what do you think?"
→ Tag expert, don't approve blindly
```

---

### Process 3: Deploy to Production (Nexus)

**Owner**: Release Engineer (+ 1 backup trained weekly)  
**Duration**: 15-30 min  
**Frequency**: Variable (usually Wed/Fri afternoon UTC)

#### Prerequisites
- [ ] All PRs merged to `main`
- [ ] All tests passing on `main` (check CI)
- [ ] No critical security issues open
- [ ] Runbook has been reviewed + updated
- [ ] Backup release engineer available (on-call)
- [ ] At least 2 people in Slack ready to monitor

#### Step-by-Step

**Phase 1: Pre-Deployment (10 min)**

```bash
# 1. Check CI status
# Go to: https://github.com/[repo]/actions
# Verify: latest commit on `main` has ✅ passing

# 2. Check for open security issues
# Search: https://github.com/[repo]/issues label:security
# If any: STOP - resolve first or create post-deploy hotfix plan

# 3. Verify deployment checklist
# [ ] Tests passing
# [ ] Security scan completed
# [ ] No hardcoded secrets in final build
# [ ] UPDATED_FEATURES.md current
# [ ] Database migrations tested (if any)
# [ ] Rollback plan documented
```

**Phase 2: Staging Verification (5-10 min)**

```bash
# 1. Check staging environment (if you have one)
# Go to: https://staging.valueskins.com (or your staging URL)
# Verify: Latest features visible + working

# 2. Run smoke tests on staging
# Checklist:
# - [ ] Can log in
# - [ ] Can view main feed
# - [ ] Can create post/campaign
# - [ ] Can message
# - [ ] Can pay (test with Stripe test card)
# - [ ] Can see analytics/dashboard
```

**Phase 3: Production Deployment (5-10 min)**

**If using Vercel** (recommended):
```bash
# 1. Vercel auto-deploys on `main` push
# Check: https://vercel.com/dashboard/[project]/deployments
# Verify: Latest deployment shows "Ready"

# 2. Confirm production URL is updated
# Visit: https://valueskins.com (or production URL)
# Check: Latest features visible
```

**If using manual deployment**:
```bash
# 1. SSH into production server
ssh deploy@[production-server]

# 2. Pull latest code
cd /app
git fetch origin
git checkout main
git pull

# 3. Install dependencies + build
npm ci  # Clean install (no package-lock.json changes)
npm run build

# 4. Start service
systemctl restart valueskins  # Or your service manager

# 5. Verify health check
curl https://valueskins.com/api/health
# Expected: { "status": "ok" }
```

**Phase 4: Post-Deployment Verification (5 min)**

```bash
# 1. Smoke test production
# [ ] Can log in
# [ ] Can view main page
# [ ] Can view main feed
# [ ] Can send message
# [ ] Check admin dashboard: no errors in logs

# 2. Check metrics
# Go to: Vercel dashboard or your monitoring tool
# [ ] Error rate normal (< 0.1%)
# [ ] Response time normal (< 500ms p99)
# [ ] No unusual CPU/memory spikes

# 3. Announce deployment
# Post in #releases Slack:
# "✅ Deployment complete [2026-04-24 14:30 UTC]
#  Features: [list]
#  Rollback plan: [if needed]"
```

#### Success Criteria
- [ ] CI passing on main before deployment
- [ ] Staging tests pass
- [ ] Production URL accessible
- [ ] No error spikes in logs
- [ ] Users can use main features
- [ ] Performance metrics normal
- [ ] Team notified in Slack

#### Logs & Records
- **Location**: GitHub deployments + Vercel dashboard
- **What to record**: Deployment time, version, features deployed
- **Retention**: Permanent

**Example deployment log** (save to shared spreadsheet or Airtable):
```
Date        | Version | Features          | Status    | Deployed By | Notes
2026-04-24  | v1.2.3  | Deal states, msgs | ✅ Success| Alex        | 5 min rollout
2026-04-22  | v1.2.2  | Bug fixes         | ✅ Success| Jamie       | Zero downtime
```

#### Fallback: Immediate Rollback

If production is broken (can't log in, payment failing, major feature down):

```bash
# 1. IMMEDIATELY: Notify #incidents Slack
# Message: "🚨 ROLLBACK IN PROGRESS - [issue]"

# 2. Roll back to previous working version
# Option A (Vercel): Go to Deployments, click "Promote to Production" on previous version
# Option B (Manual):
git revert [bad-commit-hash]
git push origin main
# Wait ~2 min for auto-deploy

# 3. Verify rollback worked
curl https://valueskins.com/api/health

# 4. Create incident report
# Document in #incidents: what broke, why, how we fixed it
```

#### Approval Gates
- [ ] Lead engineer reviews deployment log
- [ ] Backup engineer on-call confirms ready
- [ ] No open critical security issues

---

### Process 4: Database Migration

**Owner**: Backend/DevOps Engineer (+ DBA if applicable)  
**Duration**: 15 min to 2 hours (depends on data size)  
**Frequency**: As-needed

#### Prerequisites
- [ ] Migration script tested on copy of production data
- [ ] Rollback script written + tested
- [ ] Downtime window scheduled (if needed) or zero-downtime approach validated
- [ ] Backups taken
- [ ] Team notified (at least 1 hour before)

#### Step-by-Step

**Phase 1: Prepare (30 min)**

```bash
# 1. Create migration script (Supabase or raw SQL)
# File: migrations/[timestamp]_[description].sql
# Example:
# -- Add new column with default
# ALTER TABLE creators ADD COLUMN bio TEXT DEFAULT '';
# -- If large table: add index
# CREATE INDEX idx_creators_bio ON creators(bio);

# 2. Test on staging/copy of production
# (Ask DBA to create copy if large dataset)
# DO NOT run on production until tested

# 3. Create rollback script
# File: migrations/[timestamp]_[description]_rollback.sql
# Example:
# ALTER TABLE creators DROP COLUMN bio;

# 4. Write runbook in shared doc
# Location: #deployments Slack, pinned message
# Format:
# - Migration name
# - Expected downtime (0 or X minutes)
# - Steps to run
# - Rollback steps
# - Who to page if broken
```

**Phase 2: Notify Team (10 min)**

```bash
# 1. Slack announcement (in #deployments, 1 hour before)
message: "@channel Migration window: 2026-04-24 14:00-14:15 UTC
What: Adding bio column to creators
Impact: 0 min downtime (zero-downtime approach)
Who: @[your-name]"

# 2. Disable auto-deploys (if applicable)
# Tell release engineer: "hold off on deployments until I'm done (10 min)"
```

**Phase 3: Execute Migration (5-30 min, depends on data size)**

```bash
# Option A: Supabase SQL Editor (if using Supabase)
# 1. Go to: https://supabase.com/dashboard
# 2. Click "SQL Editor"
# 3. Paste migration script
# 4. Hit "Run"
# 5. Wait for complete (watch progress bar)

# Option B: Command-line (if raw database)
psql -U postgres -d valueskins -h [database-host] -f migrations/[timestamp]_[description].sql

# Monitor progress
SELECT * FROM information_schema.columns WHERE table_name = 'creators';
# Should show new column if successful
```

**Phase 4: Verify (5 min)**

```bash
# 1. Check data integrity
SELECT COUNT(*) FROM creators;
# Should match expected row count

# 2. Check new column populated correctly
SELECT COUNT(*) FROM creators WHERE bio IS NOT NULL;
# Should match expectations

# 3. Run smoke tests on production
curl https://valueskins.com/api/v1/creators  # Should work
# Verify response includes new field (if applicable)

# 4. Monitor logs for errors
# Go to: Vercel dashboard or log aggregator
# Search: [last 10 min] for "error" keyword
# Should see 0 new errors related to migration
```

**Phase 5: Document + Complete (5 min)**

```bash
# 1. Update migration log (shared spreadsheet)
# Date | Migration | Status | Duration | Executed By | Notes

# 2. Post in #deployments
"✅ Migration complete: [name]
Status: Success
Duration: 5 min
Impact: 0 downtime"

# 3. Resume auto-deploys (if disabled)
# Tell release engineer: "Go ahead, ready for deploys"
```

#### Success Criteria
- [ ] Data integrity verified (correct row counts)
- [ ] New schema matches expectations
- [ ] No errors in application logs
- [ ] Production API returns expected data
- [ ] Rollback script ready (untouched, in version control)

#### Fallback: Rollback

If migration goes wrong:

```bash
# 1. IMMEDIATELY: Run rollback script
psql -U postgres -d valueskins -h [database-host] -f migrations/[timestamp]_[description]_rollback.sql

# 2. Verify rollback worked
SELECT * FROM information_schema.columns WHERE table_name = 'creators';
# Old column should be back

# 3. Notify team
# Post in #incidents:
"🚨 Migration rolled back: [name]
Reason: [what went wrong]
Previous state restored"

# 4. Investigation
# Document issue in GitHub issue: why it failed, how to prevent
```

---

## SECURITY & COMPLIANCE

### Process 5: Security Audit (Monthly)

**Owner**: Security Engineer (+ 1 backup)  
**Duration**: 3-4 hours  
**Frequency**: 1st of every month

#### Step-by-Step

**Phase 1: Code Scanning (30 min)**

```bash
# 1. Scan for secrets
git-secrets scan  # Should find 0 secrets

# 2. Scan dependencies
npm audit --production  # Should show 0 high/critical

# 3. SAST (Static Application Security Testing)
npm run security:scan  # Uses Snyk or similar

# 4. Check for hardcoded credentials
grep -r "password" --include="*.js" --include="*.ts" src/
grep -r "api_key" --include="*.js" --include="*.ts" src/
# Should return 0 results (only in comments explaining they're banned)
```

**Phase 2: Compliance Check (45 min)**

```bash
# 1. GDPR compliance
# [ ] Privacy policy updated
# [ ] Cookie consent present
# [ ] User deletion automated
# [ ] Data exports working
# Verify:
curl https://valueskins.com/api/v1/privacy
# Should return current privacy policy version

# 2. CCPA compliance (if CA users)
# [ ] Do not sell checkbox visible
# [ ] Data deletion available in settings
# Visit: https://valueskins.com/settings/privacy
# Verify: "Delete my account" button present

# 3. Session security
# [ ] Session timeout: 30 min max
# [ ] HttpOnly cookie on session ID
# Check in browser DevTools:
# Application → Cookies
# Verify: "session_id" has HttpOnly + Secure flags
```

**Phase 3: Infrastructure Check (45 min)**

```bash
# 1. HTTPS verification
curl -I https://valueskins.com
# Should see: "HTTP/2" or "HTTP/3"
# Check headers:
grep "Strict-Transport-Security" # Should be present
grep "Content-Security-Policy"   # Should be present

# 2. Database encryption
# Connect to production database
psql -h [db-host] -U postgres -d valueskins
# Check:
SELECT datname, oid FROM pg_database WHERE datname = 'valueskins';
# Verify in AWS RDS console: Encryption = "Yes"

# 3. Backup verification
# Go to: AWS RDS Dashboard → Backups
# Verify:
# [ ] Daily backups present (last backup < 24 hours old)
# [ ] Encrypted: Yes
# [ ] Retained: 30 days minimum
```

**Phase 4: Documentation (30 min)**

```bash
# 1. Update security checklist
# File: docs/security/SECURITY_AUDIT_[YYYY-MM].md
# Include:
# - Scan results
# - Issues found + severity
# - Remediation plan
# - Sign-off: [Your Name] + [Date]

# 2. File GitHub issues for any findings
# Example:
# Title: [SECURITY] Update dependencies for CVE-2026-1234
# Label: security
# Assignee: [engineer]
```

#### Success Criteria
- [ ] No critical/high severity issues found
- [ ] All compliance checks pass
- [ ] Audit log updated
- [ ] Team aware of any findings

#### Fallback
**If high-severity issue found**:
```bash
# 1. File as critical issue
# Title: [CRITICAL-SECURITY] [issue]
# 2. Assign to on-call engineer
# 3. Set deadline: 24 hours
# 4. Page team if it affects production
```

---

### Process 6: Incident Response

**Owner**: On-call Engineer (rotates weekly)  
**Duration**: 5 min to 2+ hours (depends on severity)  
**Frequency**: As-needed

#### Prerequisites
- [ ] Incident commander identified
- [ ] Slack #incidents channel exists
- [ ] Runbooks available (this doc + threat model)
- [ ] Escalation path known

#### Severity Levels

**CRITICAL** (P1): Service completely down, users blocked from core feature
- Example: Can't log in, payment processing down
- Response time: 5 min
- Page: CTO + All engineers + On-call
- Escalation: If not fixed in 15 min, page CEO

**HIGH** (P2): Major feature degraded, some users affected
- Example: Messaging slow, search broken
- Response time: 15 min
- Page: On-call engineer
- Escalation: If not fixed in 1 hour, page lead engineer

**MEDIUM** (P3): Minor feature broken, workaround exists
- Example: Avatar upload fails (users can use default)
- Response time: 1 hour
- Page: Not paged (but check Slack)
- Escalation: Handle in next sprint if not urgent

**LOW** (P4): Cosmetic issues, no user impact
- Example: Typo in UI text
- Response time: Next business day
- Page: No
- Escalation: Create GitHub issue for refinement

#### Step-by-Step (P1/P2 Incident)

**Phase 1: Immediate Response (1 min)**

```bash
# 1. Acknowledge alert
# If paged: respond with 👀 emoji in Slack

# 2. Create incident thread
# Post in #incidents:
"🚨 P1 INCIDENT: [Issue name]
Time: [Current UTC time]
Status: INVESTIGATING
Affected: [what's broken]
Impact: [how many users]"

# 3. Gather incident commander
# Page: @[on-call-engineer]
# Message: "P1 incident, need help. See #incidents"
```

**Phase 2: Triage (2-3 min)**

```bash
# 1. Check status page
# Is it a known outage? (often 3rd party)
# Example: AWS down, Stripe down, Vercel down
# → Check: https://status.vercel.com, https://status.stripe.com

# 2. Check logs
# Go to: Vercel dashboard or log aggregator
# Search: [last 5 min] for errors
# Questions:
# - When did it start? (narrow down)
# - What changed? (deployment? traffic spike? 3rd party?)
# - Which users affected? (all? subset?)

# 3. Check metrics
# CPU/Memory/Disk: Normal or spiked?
# Database queries: Normal or slow?
# Error rate: What percentage of requests fail?
# Response time: How slow?
```

**Phase 3: Remediation (depends, 5-30 min)**

**If deployment broke it**:
```bash
# 1. Rollback immediately
# See: Process 3 - Deploy to Production (Fallback section)
git revert [bad-commit-hash]
git push origin main
# Wait 2-3 min for auto-deploy

# 2. Verify rollback
curl https://valueskins.com/api/health
# Should return 200 OK
```

**If database issue**:
```bash
# 1. Check connections
psql -h [db-host] -U postgres -d valueskins
SELECT count(*) FROM pg_stat_activity;
# If > 100 connections, pool exhausted
# → Restart connection pool
systemctl restart valueskins

# 2. Check disk space
df -h
# If < 10% free: emergency cleanup or scale up
```

**If it's a DDoS/traffic spike**:
```bash
# 1. Enable rate limiting
# Go to: Cloudflare dashboard (if using)
# Enable: "I'm Under Attack" mode

# 2. Check origin IP
# If suspicious: block via WAF
# Expected: traffic from users (varied IPs)
# Suspicious: single IP hitting 1000s of requests

# 3. Scale up if legitimate traffic
# AWS: Increase auto-scaling max instances
# Vercel: Already auto-scales
```

**If you don't know**:
```bash
# 1. STOP
# Don't make random changes (makes it worse)

# 2. Page incident commander
# "I've checked [things], still investigating.
#  Help needed: [specific question]"

# 3. Escalate
# Page: @[lead-engineer] or @[CTO]
```

**Phase 4: Communication (ongoing)**

```bash
# Every 5-10 minutes: Update #incidents
"🔴 Status: INVESTIGATING
Last update: [5 min ago]
Current action: [what we're doing]
ETA: [estimated time to fix or 'unknown']"

# When fixed:
"✅ Status: RESOLVED
Root cause: [what broke]
Fix: [what we did]
Duration: [15 min outage]
Next steps: Prevent by [action]"
```

**Phase 5: Post-Mortem (within 24 hours)**

```bash
# 1. Create post-mortem doc
# File: docs/incidents/[YYYYMMDD]_[incident-name].md

# Content:
# ## Summary
# [1-sentence description]
#
# ## Timeline
# 14:30 UTC - Alert triggered (high error rate)
# 14:32 UTC - Incident commander paged
# 14:35 UTC - Root cause identified (deployment bug)
# 14:37 UTC - Rollback started
# 14:39 UTC - Service recovered
#
# ## Root Cause
# [What broke? Why wasn't it caught?]
#
# ## Impact
# [Users affected, duration, business impact]
#
# ## Prevention
# [How to prevent next time]
# - Add test for X
# - Add monitoring for Y
# - Deploy more carefully: [specific change]

# 2. File GitHub issues for prevention
# Title: [POST-MORTEM] [incident] - Add [preventative measure]
# Assign to: [engineer responsible]

# 3. Share learnings
# Post in #incidents (or all-hands):
# "📋 Post-mortem available: [link]
#  Key learning: [1-2 bullet points]"
```

#### Success Criteria
- [ ] Issue identified within 5-10 min
- [ ] Fix attempted or escalated within 15 min
- [ ] Service restored or ETA communicated
- [ ] Team kept updated (Slack messages)
- [ ] Post-mortem created within 24 hours
- [ ] Preventative action filed

---

## DEPLOYMENT & OPERATIONS

### Process 7: Scaling (When Traffic Increases)

**Owner**: DevOps/Backend Engineer (+ Ops lead)  
**Duration**: 1-4 hours (depends on what scales)  
**Frequency**: As traffic growth requires

#### Indicators You Need to Scale

```
If ANY of these happen:
- Error rate > 1% (p99 latency > 500ms)
- Database connections maxed (close to limit)
- CPU > 70% sustained (> 5 min)
- Memory > 80% sustained
- Queue depth > 1000 (if using job queue)
- User reports "app is slow"
```

#### Step-by-Step

**Phase 1: Diagnose (15 min)**

```bash
# 1. Check current metrics
# Dashboard: Vercel/AWS monitoring
# What's the bottleneck?
# - Frontend? (static assets, JS size)
# - API? (slow endpoints, database queries)
# - Database? (slow queries, connection pool)
# - External services? (Stripe, payment processing slow)

# 2. Check logs for patterns
# Search for slowest endpoints
# Example: "GET /api/v1/feed" taking 2000ms (should be < 200ms)
```

**Phase 2: Optimize (30 min - 2 hours)**

**If frontend slow**:
```bash
# 1. Reduce bundle size
npm run analyze  # Show bundle breakdown
# Remove unused dependencies
# Code-split large routes

# 2. Implement caching
# In Vercel config: add static cache headers (1 year)
# In frontend: implement service worker for offline support
```

**If API slow**:
```bash
# 1. Identify slowest endpoint
# Check logs: which GET/POST takes longest?

# 2. Profile that endpoint
# Add timing logs (middleware tracks duration)
# Example:
const start = Date.now();
const result = await db.query(...);
const duration = Date.now() - start;
logger.info(`Query took ${duration}ms`);  // Should be < 50ms for DB queries

# 3. Optimize the query
# Add index:
CREATE INDEX idx_creators_status ON creators(status);

# Add caching:
const cached = await redis.get(`creator:${id}`);
if (cached) return JSON.parse(cached);
const result = await db.query(...);
await redis.set(`creator:${id}`, JSON.stringify(result), 'EX', 3600);
```

**If database slow**:
```bash
# 1. Check for slow queries
SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;

# 2. Add index for slow queries
# Example: If "SELECT * FROM creators WHERE status = 'active'" is slow:
CREATE INDEX idx_creators_status ON creators(status);

# 3. Scale database
# If reads slow: Add read replica
# If writes slow: Vertical scaling (more CPU/RAM)
# If storage growing: Add retention policy (delete old logs, etc.)
```

**Phase 3: Horizontal Scaling (if still slow)**

```bash
# If already optimized + still slow: Add more servers

# Vercel: Auto-scales (no action needed)

# AWS/custom:
# 1. Create new server instance
# 2. Load balancer directs traffic to both
# 3. Monitor new server for errors
```

**Phase 4: Verify (10 min)**

```bash
# 1. Check metrics improved
# Error rate < 0.1% (was > 1%)
# p99 latency < 200ms (was > 500ms)
# CPU < 50% (was > 70%)

# 2. Run smoke tests
# [ ] Can log in
# [ ] Can view feed
# [ ] Can message
# [ ] All responses < 300ms

# 3. Monitor for 30 min
# Watch error rate + latency
# If any spike: Scale more
```

---

### Process 8: Backup & Recovery

**Owner**: DevOps/DBA (+ 1 backup trained)  
**Duration**: 10 min to 2 hours (depends on DB size + action)  
**Frequency**: Daily (automatic) + Monthly (manual test)

#### Step-by-Step

**Phase 1: Automated Daily Backups**

```
No action needed - Supabase/RDS auto-backup
But verify monthly (Phase 2)
```

**Phase 2: Monthly Backup Verification (Test Restore)**

```bash
# 1. Request DBA to create clone of production DB
# File GitHub issue:
# "Monthly backup test: Create staging copy for restore test"

# 2. Restore from backup to staging copy
# DBA runs: restore-from-backup-date [yesterday]
# Restore should complete in < 30 min (depends on DB size)

# 3. Test restored data
psql -h [staging-db-host] -U postgres -d valueskins_staging
SELECT COUNT(*) FROM creators;  # Should match production count
SELECT COUNT(*) FROM deals;     # Should match production count

# 4. Verify schema matches
\d creators  # Should list all columns as expected
```

**Phase 3: Emergency Recovery (If Disaster Happens)**

```bash
# SCENARIO: Accidental DELETE statement deletes all user data
# Severity: CRITICAL P1

# 1. STOP all traffic
# Tell ops: "Block all traffic - data corruption detected"
# Page: CTO, DBA, On-call engineer

# 2. Disable auto-deploys
# Tell release engineer: "Hold all deployments"

# 3. Create point-in-time recovery
# DBA runs: recover-to-timestamp [time-before-accident]
# Example: Accident happened at 14:35 UTC
#          Recover to 14:30 UTC (before accident)

# 4. Verify restored data
SELECT COUNT(*) FROM creators;
SELECT COUNT(*) FROM users WHERE deleted_at IS NULL;
# Should show data before accident

# 5. Gradually resume traffic
# 1. Allow read-only queries (queries only)
# 2. Test critical paths work
# 3. Full traffic back

# 6. Post-mortem
# File issue: Why did that DELETE happen?
# Code review: Was there a check before DELETE?
# Database access: Did engineer have necessary permissions?
```

---

## MONITORING & INCIDENT RESPONSE

### Process 9: Set Up Monitoring & Alerts

**Owner**: DevOps/SRE Engineer  
**Duration**: 2-4 hours (one-time setup)  
**Frequency**: Setup once, review quarterly

#### Step-by-Step

**Phase 1: Set Up Metrics Collection**

```bash
# 1. Application metrics (in code)
# Track per endpoint:
# - Request count (success/failure)
# - Latency (p50, p95, p99)
# - Error rate (%)
# Example code:
import { StatsD } from "node-statsd";
const metrics = new StatsD();

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.timing(`request.duration.${req.path}`, duration);
    metrics.increment(`request.count.${req.method}.${res.statusCode}`);
  });
  next();
});

# 2. System metrics
# CPU, memory, disk space (via Vercel/AWS dashboard)
```

**Phase 2: Set Up Dashboards**

```bash
# 1. Create dashboard in Vercel/AWS CloudWatch
# Panels:
# - Error rate (last 24 hours)
# - Latency (p50, p99)
# - Traffic (requests/sec)
# - CPU/Memory usage
# - Database query latency

# 2. Make dashboard visible to team
# Pin in Slack #ops
```

**Phase 3: Set Up Alerts**

```bash
# 1. Error rate alert
# If error_rate > 1% for > 5 min:
#   → Page on-call engineer
#   → Message: "🚨 P2: Error rate [3%] (threshold 1%)"

# 2. Latency alert
# If p99_latency > 500ms for > 5 min:
#   → Message in #ops: "[WARNING] P99 latency high [800ms]"

# 3. Uptime alert
# If service down > 1 min:
#   → Page on-call engineer
#   → Message: "🚨 P1: Service down"

# 4. Database alert
# If connections > 80 of max:
#   → Message in #ops: "[WARNING] Database connections [85/100]"

# 5. Quota alerts
# If storage > 80% of plan limit:
#   → Message in #ops: "[WARNING] Storage usage [82%], plan upgrade needed"
```

---

## DATA MANAGEMENT

### Process 10: User Data Deletion (GDPR Compliance)

**Owner**: Backend/Data Engineer (+ compliance officer)  
**Duration**: 5-30 min (depends on user data volume)  
**Frequency**: On-request (user asks to delete account)

#### Prerequisites
- [ ] User confirmed deletion request via email
- [ ] Verification email sent: "Click link to confirm deletion"
- [ ] 7-day grace period (optional, for accidental deletions)

#### Step-by-Step

**Phase 1: Receive Deletion Request (1 min)**

```bash
# User clicks "Delete my account" in settings
# System sends email:
# "Click [link] to confirm deletion. This cannot be undone."

# User clicks email link
# Account enters "deletion_pending" state
# Scheduled for deletion in 7 days (or immediately if no grace period)
```

**Phase 2: Execute Deletion (30 min, automated nightly)**

```bash
# Nightly cron job (3 AM UTC)
# Select users where deletion_scheduled_at < NOW()

for user in deletion_queue:
  # 1. Delete PII
  DELETE FROM users WHERE id = user.id
  DELETE FROM user_emails WHERE user_id = user.id
  DELETE FROM user_profiles WHERE user_id = user.id
  DELETE FROM photos WHERE user_id = user.id
  DELETE FROM messages WHERE user_id = user.id OR recipient_id = user.id
  DELETE FROM deals WHERE user_id = user.id
  
  # 2. Anonymize audit logs (remove email, IP, etc.)
  UPDATE audit_logs 
  SET user_id = NULL, 
      old_values = jsonb_set(old_values, '{email}', '"[REDACTED]"')
  WHERE user_id = user.id
  
  # 3. Mark deleted
  INSERT INTO deletion_logs (user_id, deleted_at) 
  VALUES (user.id, NOW())
  
  # 4. Verify deletion
  assert(SELECT COUNT(*) FROM users WHERE id = user.id) == 0
```

**Phase 3: Verification (5 min)**

```bash
# 1. Spot check random deletions
SELECT * FROM deletion_logs WHERE deleted_at > NOW() - INTERVAL '1 day';
# Should see yesterday's deletions

# 2. Verify PII gone
SELECT * FROM users WHERE id = [deleted-user-id];
# Should return 0 rows

# 3. Verify logs anonymized
SELECT old_values FROM audit_logs WHERE old_values ->> 'email' IS NOT NULL;
# Should return 0 rows (all emails anonymized)
```

**Phase 4: Documentation (2 min)**

```bash
# Log deletion
INSERT INTO data_deletion_log (user_count, executed_at, status)
VALUES (15, NOW(), 'success')

# Alert data protection officer
# Email: "✅ 15 users deleted on [date]. Verified successful."
```

---

## FINANCIAL PROCESSES

### Process 11: Payment Processing (Stripe Integration)

**Owner**: Backend/Payments Engineer (+ Finance officer)  
**Duration**: 5-15 min per transaction  
**Frequency**: Ongoing (per user payment)

#### Prerequisites
- [ ] Stripe account connected
- [ ] Webhook endpoint secured
- [ ] Payment test card in database

#### Step-by-Step

**Phase 1: User Initiates Payment (in UI, automated)**

```bash
# 1. User clicks "Pay" button
# Frontend sends:
POST /api/v1/payments/create
{
  "amount": 5000,        // $50.00 (in cents)
  "currency": "USD",
  "idempotency_key": "uuid",  // Prevent duplicate charges
  "payment_method_id": "pm_1234567"
}

# 2. Backend receives request
# Validates:
# - Amount is positive integer
# - Currency is allowed (USD, INR, EUR)
# - User is authenticated
# - User has permission (not banned)
```

**Phase 2: Process Payment (automated, via Stripe)**

```bash
# Backend calls Stripe:
stripe.paymentIntents.create({
  amount: 5000,
  currency: 'usd',
  payment_method: 'pm_1234567',
  confirm: true,
  return_url: 'https://valueskins.com/payments/success'
})

# Stripe processes payment
# Response:
{
  "id": "pi_1234567",
  "status": "succeeded",
  "amount_received": 5000
}
```

**Phase 3: Record in Database (automated)**

```bash
# Backend logs transaction:
INSERT INTO payments (
  user_id,
  amount,
  currency,
  payment_method_id,
  stripe_payment_id,
  status,
  created_at
) VALUES (
  user.id,
  5000,
  'usd',
  'pm_1234567',
  'pi_1234567',
  'succeeded',
  NOW()
)
```

**Phase 4: Send Confirmation (automated)**

```bash
# Email to user:
"Payment Confirmation
Date: 2026-04-24 14:30 UTC
Amount: $50.00
Status: ✅ Succeeded
Receipt: [link to download PDF]"

# SMS (if phone on file):
"Payment confirmed: $50.00. Receipt: [link]"
```

**Phase 5: Monthly Reconciliation (30 min, manual)**

```bash
# Finance officer runs:
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount,
  COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as succeeded,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
FROM payments
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

# Compare against Stripe dashboard
# Stripe shows: $2,450.00 for April
# Database shows: $2,450.00 for April
# ✅ Matches - reconciliation complete

# File report:
# Date: 2026-04-30
# Month: April 2026
# Total transactions: 49
# Total revenue: $2,450.00
# Status: ✅ Reconciled
```

---

## KNOWLEDGE BASE & TRAINING

### Process 12: Onboarding New Engineer

**Owner**: Tech Lead (+ Mentee)  
**Duration**: 1 week full-time  
**Frequency**: As hiring happens

#### Step-by-Step

**Day 1: Environment Setup (3 hours)**

```bash
# 1. Get access to all systems
# Verify access to:
# - GitHub (create account, add to org)
# - Vercel (add to project)
# - Stripe dashboard (read-only)
# - Sentry (error tracking)
# - Slack (all channels)
# - AWS/Cloud console (if needed)

# 2. Set up local development
# Follow: /docs/technical/DEVELOPER_QUICK_REFERENCE.md
# Run:
git clone [repo]
cd valueskins/nexus
npm install
npm run dev
# Should see: "✅ Dev server running on http://localhost:3000"

# 3. Verify everything works
# [ ] Can run tests
# [ ] Can start dev server
# [ ] Can access database
# [ ] Can log in with test user

# 4. First PR (trivial change)
# Change: Update welcome message in /about
# Push to feature branch, create PR, merge
# Goal: Understand full flow with no stakes
```

**Day 2-3: Architecture Overview (4 hours)**

```bash
# 1. Read architecture docs
# Files: /docs/architecture/DESIGN_DECISIONS.md
#        /ARCHITECTURE_GUIDE.txt
#        /CODEBASE_EXPLAINED_FOR_INVESTORS.md

# 2. Map codebase mentally
# Frontend: /frontend/src (React, Next.js)
# API: /nexus/pages/api (API endpoints)
# Database: /nexus/lib (database schemas)
# Backend: /backend (Rust microservices, optional)

# 3. Understand data flow
# User logs in → where does auth happen?
# User uploads photo → where stored? how?
# User pays → Stripe integration where?

# 4. Pair with mentor
# Mentor walkthrough: "Here's how feature X works, end-to-end"
```

**Day 4-5: Security & Standards (3 hours)**

```bash
# 1. Read security standards
# File: CLAUDE.md (33 parts, skim key sections)
# Key sections:
#   - Part 1: Input Validation (apply to every endpoint)
#   - Part 3: RBAC (check auth on every route)
#   - Part 8: Secrets (never hardcode, use env vars)

# 2. Code review examples
# Mentor shows: "Here's what good code looks like"
#              "Here's what bad code looks like"
#              "Here's what we catch in reviews"

# 3. Run through a full PR
# Implement small feature, get code review
# Learn what to watch for

# 4. First production change
# Implement: Small bug fix or typo
# Get approval, merge to main, deploy
# Experience the full cycle
```

**Day 6-7: Project-Specific Knowledge (3 hours)**

```bash
# 1. Business domain
# What is ValueSkins?
# Who are creators? Brands?
# What's the deal workflow?
# How do payments work?

# 2. ValueSkins vs Nexus
# ValueSkins: The actual product (creator marketplace)
# Nexus: The chat/messaging feature (built into ValueSkins)

# 3. Current roadmap
# What's next? What's blocked?
# Where can you contribute?

# 4. Assign first real task
# Task: Small feature or bug fix
# Estimated effort: 4-8 hours
# Mentor available for questions
```

**Week 2+: Ramp Up to Productivity**

```bash
# Week 2-3: Contribute small features
# Task size: 1-2 days
# Support: Mentor reviews every PR

# Week 4+: Contribute medium features
# Task size: 3-5 days
# Support: Lead engineer reviews PRs
# Autonomy: Increasing

# Month 2+: Full productivity
# Task size: 1-2 week features
# Support: Peer review (no hand-holding)
```

---

### Process 13: Knowledge Transfer (When Someone Leaves)

**Owner**: Departing Engineer + Tech Lead  
**Duration**: 5 days  
**Frequency**: As needed (exit process)

#### Step-by-Step

**Phase 1: Capture Knowledge (2 days)**

```bash
# 1. Document what you own
# Create file: /docs/handoff/[name]_departure.md
# Include:
# - What systems do you own? (auth, payments, etc.)
# - What's in your head? (architecture decisions, edge cases)
# - What's your on-call runbook?
# - What scripts do you run? (backups, migrations, etc.)

# 2. Document edge cases
# "This API sometimes fails if X, workaround is Y"
# "Watch out for Z when deploying"
# "Database query can slow down during peak hours"

# 3. Update runbooks
# Make sure Process #1-13 are all you
# Replace any "contact [name]" with "contact [new-owner]"
```

**Phase 2: Train Replacement (2 days)**

```bash
# 1. Pair program
# Departing engineer drives, new owner watches
# "Here's how I do this process"

# 2. Reverse pair program
# New owner drives, departing engineer watches
# "Can you walk through this process?"

# 3. Run process solo
# New owner executes process without help
# Departing engineer watches

# 4. Shadow on-call
# Departing engineer on-call, new owner shadows
# "When X happens, here's how we fix it"
```

**Phase 3: Transition (1 day)**

```bash
# 1. Change ownership
# Update Process #1-13: new owner assignment
# Update runbooks: who to page now?
# Update Slack: #ops topic with new owner

# 2. New owner on-call
# New owner takes first on-call shift alone

# 3. Verify knowledge transfer
# Run test incident simulation
# "Simulate payment system down, what do you do?"
```

**Phase 4: Exit**

```bash
# Departing engineer:
# [ ] All code committed
# [ ] All processes documented
# [ ] Replacement trained + confident
# [ ] Offboard from all systems
# [ ] Hand off laptop

# Documentation:
# [ ] Handoff file saved
# [ ] Replacement documented
# [ ] All runbooks updated
# [ ] No remaining tribal knowledge
```

---

### Process 14: Quarterly Process Audit

**Owner**: Engineering Manager (or rotating engineer)  
**Duration**: 4 hours  
**Frequency**: Every quarter (Jan, Apr, Jul, Oct)

#### Step-by-Step

```bash
# 1. Review each process (#1-13)
# For each:
# - Is it still accurate? (test it)
# - Is it still needed?
# - Have we found easier ways?
# - Are there new processes missing?

# 2. Test each process
# Actually run Process #3 (Deploy) - check if it works
# Actually run Process #8 (Backup) - verify restore works
# Actually run Process #5 (Security Audit) - run security scan

# 3. Gather feedback
# Ask engineers: "What processes are confusing?"
#               "What took longer than expected?"
#               "What's missing?"

# 4. Update this document
# File PR: "Q2 2026 Process Audit - Updates"
# Include: What changed, why, impact

# 5. Train team on changes
# Team meeting: "Here's what's changed"
```

---

## APPENDIX: QUICK REFERENCE

### Checklists by Role

**Release Engineer (Deploying to Prod)**:
- [ ] Process 3: Deploy to Production
- [ ] Process 9: Monitoring setup
- [ ] Process 6: Incident Response (if needed)

**Frontend Engineer (Building Features)**:
- [ ] Process 1: Feature Development
- [ ] Process 2: Code Review (as reviewer)
- [ ] Process 14: Process Audit (quarterly)

**Backend/Security Engineer**:
- [ ] Process 4: Database Migration
- [ ] Process 5: Security Audit
- [ ] Process 6: Incident Response
- [ ] Process 10: User Data Deletion

**DevOps/Infrastructure**:
- [ ] Process 3: Deploy to Production
- [ ] Process 7: Scaling
- [ ] Process 8: Backup & Recovery
- [ ] Process 9: Monitoring

**Tech Lead**:
- [ ] All processes (oversee)
- [ ] Process 12: Onboarding
- [ ] Process 13: Knowledge Transfer
- [ ] Process 14: Quarterly Audit

### Critical Phone Numbers / Escalation

```
ON-CALL ROTATION: See #ops Slack channel (pinned message)

CTO: [Phone]
Lead Engineer: [Phone]
DevOps Lead: [Phone]

EXTERNAL ESCALATION:
Stripe Support: [Contact + ticket system]
Vercel Support: [Link to dashboard]
AWS Support: [Link to console]
Database Provider: [Support link]
```

### Slack Channels

```
#incidents     - Real-time incident updates
#deployments   - Deployment notifications
#ops           - Operational questions + monitoring
#security      - Security discussions
#data-team     - Data management questions
#all-hands     - Team-wide announcements
```

---

## SIGN-OFF

This manual represents the current state of all processes. **Every engineer must be trained on this manual before taking ownership of any system.**

**Created By**: [Your Name]  
**Last Updated**: 2026-04-24  
**Reviewed By**: [Tech Lead/CTO]  
**Next Audit**: Q3 2026 (July 2026)

---

**KEY RULE**: If something isn't in this manual, it shouldn't be done. If you find yourself saying "just ask [person]," that's a sign we need to document the process.

**Goal**: On day 1, anyone should be able to deploy code, handle an incident, or run a migration. The only difference from day 1 to day 100 is speed and confidence, not knowledge.
