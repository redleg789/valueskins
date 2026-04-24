# Process Testing & Validation: How We Know Everything Works

**Purpose**: Define how to test each process to prove it works when we need it.

---

## Overview

Every process in the Operations Manual needs proof that:
1. It can be executed by someone other than the original author
2. It produces the expected outcome
3. Failure is detectable and documented
4. Rollback/recovery works

This document defines testing strategy for each process.

---

## Process #1: Feature Development - Test Plan

### Monthly Smoke Test (Every 1st Friday)

**Duration**: 2 hours  
**Who**: Rotating engineer (not usually does this)  
**Where**: Staging environment

**Test Steps**:
```bash
# 1. Check out main branch
git checkout main && git pull

# 2. Create feature branch (simulate feature)
git checkout -b test/feature-dev-process

# 3. Make a small change (e.g., add console.log)
# File: src/pages/index.tsx
# Change: Add `console.log("Test log");` in component

# 4. Run linting
npm run lint
# Expected: Pass with 0 errors

# 5. Run type checking
npm run type:check
# Expected: Pass with 0 errors

# 6. Run tests
npm run test:unit
# Expected: Pass with 0 errors

# 7. Build
npm run build
# Expected: Success, no errors

# 8. Create PR (follow Process #1)
# Title: "[TEST] Feature development process validation"
# Description: "Testing our feature development process"

# 9. Get approval from another engineer
# (They should review per Process #2)

# 10. Merge to main
# Expected: PR merges without conflicts

# 11. Verify CI passes
# Check GitHub Actions
# Expected: All checks green ✅

# 12. Cleanup (delete test branch)
git checkout main
git branch -D test/feature-dev-process
git push origin --delete test/feature-dev-process
```

**Success Criteria**:
- [ ] Feature branch created without errors
- [ ] Linting passed
- [ ] Type checking passed
- [ ] Tests passed
- [ ] Build succeeded
- [ ] PR created successfully
- [ ] Code review process worked
- [ ] Merged to main
- [ ] CI passed on main

**If Failure**:
- [ ] Document what failed
- [ ] File GitHub issue: "[PROCESS-BUG] Feature development process failed at step X"
- [ ] Assign to tech lead for investigation

**Sign Off**: [Engineer Name] - [Date]

---

## Process #2: Code Review - Test Plan

### Weekly Review Audit (Every Tuesday)

**Duration**: 30 min  
**Who**: Tech lead  
**Where**: GitHub

**Test Steps**:
```bash
# 1. Check recent PRs (last 7 days)
# Go to: https://github.com/[repo]/pulls?q=is:pr+closed:>2026-04-18

# 2. Verify each PR has:
# [ ] Title + description
# [ ] Link to GitHub issue
# [ ] Approval from at least 1 reviewer
# [ ] All CI checks passed
# [ ] No merge conflicts

# 3. Sample 3 random merged PRs
# For each:
# [ ] Read the code diff
# [ ] Verify it matches description
# [ ] Spot check for security issues (no secrets, input validation present)
# [ ] Spot check for code quality

# 4. Test the merged features
# [ ] Check out main
# [ ] npm run dev
# [ ] Test the new feature manually
# [ ] Verify it works as described
```

**Success Criteria**:
- [ ] All recent PRs properly described
- [ ] All PRs have approval
- [ ] All PRs passed CI
- [ ] Spot-checked code looks good
- [ ] Merged features work in dev environment

**If Failure**:
- [ ] Document which PR(s) failed review
- [ ] File issue: "[PROCESS-BUG] Code review process missed issue in PR #X"
- [ ] Discuss in team meeting: how to catch sooner

**Sign Off**: [Tech Lead Name] - [Date]

---

## Process #3: Deploy to Production - Test Plan

### Weekly Deployment Verification (Every Wednesday)

**Duration**: 30 min  
**Who**: Release engineer or on-call engineer  
**Where**: Production (monitoring only, no changes)

**Test Steps**:
```bash
# 1. Check Vercel deployments dashboard
# Go to: https://vercel.com/dashboard/[project]/deployments

# 2. Verify latest deployment:
# [ ] Status = "Ready"
# [ ] No errors in deployment logs
# [ ] Deployment time < 5 minutes

# 3. Run smoke tests on production
# [ ] Visit https://valueskins.com (loads)
# [ ] Can log in with test account
# [ ] Can view main feed
# [ ] Can create new post/campaign (if allowed by test account)
# [ ] Can message another user (if applicable)

# 4. Check metrics
# Go to: Vercel Analytics dashboard
# [ ] Error rate < 0.1% (last 1 hour)
# [ ] Response time < 300ms p99 (last 1 hour)
# [ ] No spike in errors compared to last week

# 5. Verify rollback capability
# Go to: Vercel Deployments
# [ ] Can identify previous working deployment
# [ ] Can see "Promote to Production" button on prior version
# [ ] Understand how to use it if needed
```

**Success Criteria**:
- [ ] Latest deployment successful
- [ ] Production accessible
- [ ] Core features working
- [ ] Metrics normal
- [ ] Rollback procedure verified

**If Failure**:
- [ ] If production errors > 1%: Follow Process #6 (Incident Response)
- [ ] If deployment failed: Check logs, understand why
- [ ] File issue: "[PROCESS-BUG] Deploy process failed: [reason]"

**Sign Off**: [Release Engineer Name] - [Date]

---

## Process #4: Database Migration - Test Plan

### Quarterly Migration Practice (Q1/Q2/Q3/Q4)

**Duration**: 2 hours  
**Who**: Backend engineer or DBA  
**Where**: Staging database (copy of production)

**Test Steps**:
```bash
# 1. Create test migration script
# File: migrations/[timestamp]_test_add_column.sql
-- Add a test column to a non-critical table
ALTER TABLE users ADD COLUMN test_column TEXT;

# 2. Run on staging (in SQL editor)
-- Execute migration on staging database
-- Expected: Success, no errors

# 3. Verify schema change
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'test_column';
-- Expected: 1 row

# 4. Test rollback script
# File: migrations/[timestamp]_test_add_column_rollback.sql
ALTER TABLE users DROP COLUMN test_column;

-- Execute rollback on staging
-- Expected: Success, column deleted

# 5. Verify rollback
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'test_column';
-- Expected: 0 rows (column gone)

# 6. Re-run migration (to prove idempotent)
-- Run migration again
-- Expected: Success
```

**Success Criteria**:
- [ ] Migration runs on staging
- [ ] Schema change applies correctly
- [ ] Rollback script runs
- [ ] Rollback restores previous state
- [ ] Re-running migration doesn't cause errors

**If Failure**:
- [ ] Understand why migration failed
- [ ] Fix migration script
- [ ] Re-test
- [ ] File issue: "[PROCESS-BUG] Migration process issue: [details]"

**Sign Off**: [Backend Engineer Name] - [Date]

---

## Process #5: Security Audit - Test Plan

### Weekly Automated Scan (Every Monday)

**Duration**: 15 min (automated)  
**Who**: CI/CD pipeline (automated)  
**Where**: GitHub Actions

**Test Steps** (in CI):
```yaml
name: Weekly Security Audit

on:
  schedule:
    - cron: '0 10 * * 1'  # Every Monday at 10 AM UTC

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check for secrets
        run: |
          npm install -g git-secrets
          git-secrets --scan
          # Expected: No secrets found
      
      - name: Dependency audit
        run: npm audit --production
        # Expected: 0 high/critical vulnerabilities
      
      - name: SAST scan (Snyk)
        run: npx snyk test
        # Expected: 0 issues
      
      - name: Report results
        if: success()
        run: echo "✅ Security audit passed"
      
      - name: Notify on failure
        if: failure()
        run: |
          curl -X POST https://hooks.slack.com/[webhook] \
            -d '{"text":"🚨 Security audit failed. Check logs."}'
```

**Success Criteria**:
- [ ] No secrets found
- [ ] No high/critical dependencies
- [ ] SAST scan clean
- [ ] CI job passes

**If Failure**:
- [ ] Investigate finding
- [ ] Remediate (update dependency, remove secret, etc.)
- [ ] Re-run scan
- [ ] Document in incident log

**Manual Verification** (Monthly, by security engineer):
```bash
# Run same checks manually on 1st of month
git-secrets --scan
npm audit --production
npx snyk test
# Verify results match automated checks
```

**Sign Off**: [Security Engineer Name] - [Date]

---

## Process #6: Incident Response - Test Plan

### Quarterly Incident Simulation (Q1/Q2/Q3/Q4)

**Duration**: 1 hour  
**Who**: All engineers  
**Where**: Slack + staging environment

**Test Scenario**: "Payment processing is broken, 50% of transactions failing"

**Test Steps**:
```bash
# 1. Declare start of exercise
# Post in #incidents:
"🚨 [EXERCISE] Incident simulation starting
Scenario: Payment failures
Expected end time: 14:45 UTC
Responders: @all-engineers"

# 2. Page on-call engineer
# @[on-call-engineer] "P1: Payment failures, need you"

# 3. On-call engineer: Triage (5 min)
# - Check logs for payment errors
# - Check Stripe dashboard (go to: stripe.com/dashboard)
# - Post findings: "Error rate: X%, started at HH:MM UTC"

# 4. On-call engineer: Identify cause (5 min)
# - Check deployments (was there a recent change?)
# - Check metrics (is it all users or subset?)
# - Post hypothesis: "Likely cause: [X]"

# 5. On-call engineer: Fix (10 min)
# - If deployment issue: Rollback
#   git revert [bad-commit] && git push origin main
# - If config issue: Fix config
# - If third-party: Check Stripe status

# 6. On-call engineer: Verify (5 min)
# - Test payment on staging
# - Check error rate back to normal (< 0.1%)
# - Post: "✅ Issue resolved at HH:MM UTC"

# 7. Incident commander: Document (10 min)
# Post summary in #incidents:
"📋 Incident simulation complete
Duration: 25 minutes
Root cause: [X]
Responders: [Names]
Lessons learned: [Points]"

# 8. Team debrief (15 min)
# Team meeting:
# - What went well?
# - What was confusing?
# - What would we do differently?
```

**Success Criteria**:
- [ ] On-call engineer responded within 5 min
- [ ] Root cause identified within 10 min
- [ ] Fix attempted within 15 min
- [ ] Team communicated status regularly
- [ ] Post-mortem created
- [ ] Lessons documented

**If Failure**:
- [ ] Document where process broke
- [ ] Discuss in retrospective
- [ ] Update Process #6 runbook if needed
- [ ] File improvement issue

**Sign Off**: [Incident Commander Name] - [Date]

---

## Process #7: Scaling - Test Plan

### Monthly Load Test (Every 3rd Friday)

**Duration**: 2 hours  
**Who**: Backend engineer or performance specialist  
**Where**: Staging environment

**Test Steps**:
```bash
# 1. Baseline current performance
# Run: npm run performance:baseline
# Captures:
# - Response time for main endpoints
# - Database query times
# - Memory usage
# - CPU usage

# 2. Run load test (10x expected traffic)
# Run: npm run load-test -- --users 1000 --duration 10m
# Simulates 1000 concurrent users for 10 minutes
# Expected: Should complete without crashes

# 3. Monitor during test
# Dashboard metrics:
# - CPU < 80% (should not max out)
# - Memory < 80% (should not max out)
# - Error rate < 1% (should stay low)
# - Response time < 500ms p99

# 4. Verify no data corruption
# After test:
SELECT COUNT(*) FROM [table] WHERE created_at > [test-start-time];
-- Should match expected transaction count

# 5. Review bottleneck
# If error rate > 1% or latency > 500ms:
# - Identify slowest endpoint
# - Profile that endpoint
# - File issue: "[PERF] [endpoint] too slow: [X ms]"

# 6. Document results
# Save report: /docs/performance/load-test-[YYYY-MM-DD].json
# Include:
# - Peak CPU/memory
# - Response time p50/p95/p99
# - Error rate
# - Any issues found
```

**Success Criteria**:
- [ ] Load test completes without crashes
- [ ] Error rate < 1%
- [ ] Response time < 500ms p99
- [ ] No data corruption
- [ ] Report documented

**If Failure**:
- [ ] Identify bottleneck
- [ ] Follow Process #7: Scaling (optimize)
- [ ] Re-run load test
- [ ] File performance issue if still slow

**Sign Off**: [Performance Engineer Name] - [Date]

---

## Process #8: Backup/Recovery - Test Plan

### Monthly Restore Practice (Last Friday of Month)

**Duration**: 2 hours  
**Who**: DevOps/DBA  
**Where**: Staging database copy

**Test Steps**:
```bash
# 1. Check backup age
SELECT * FROM backups ORDER BY created_at DESC LIMIT 1;
-- Expected: < 24 hours old

# 2. Request DBA to create restore test environment
# File issue: "Monthly backup test: Restore [yesterday's] backup to staging"
# DBA responds: "Restore complete, you can test"

# 3. Verify restored data
# Connect to restored database:
psql -h [staging-restored-host] -U postgres -d valueskins_test

# Check key tables:
SELECT COUNT(*) FROM users;           -- Should match production count
SELECT COUNT(*) FROM deals;           -- Should match production count
SELECT COUNT(*) FROM payments;        -- Should match production count

# 4. Spot check data accuracy
SELECT * FROM creators LIMIT 5;
-- Verify columns present, data looks correct

# 5. Run application against restored DB
# Temporarily point staging app to restored database
# Test: Can you query data? Do selects work?

# 6. Verify encryption
-- Check backup is encrypted
aws s3api head-object --bucket [backup-bucket] --key [backup-file]
-- Expected: "ServerSideEncryption": "AES256"

# 7. Document result
# File: /docs/operations/backup-test-[YYYY-MM-DD].md
# Include:
# - Backup age (how old)
# - Restore duration (how long to restore)
# - Data integrity (counts match)
# - Encryption verified
# - Signed off by: [DBA Name]
```

**Success Criteria**:
- [ ] Backup exists and is < 24 hours old
- [ ] Restore completes without errors
- [ ] Data counts match production
- [ ] Data accuracy verified
- [ ] Backup is encrypted
- [ ] Documentation complete

**If Failure**:
- [ ] If restore fails: Page DBA immediately
- [ ] If data counts don't match: Investigate discrepancy
- [ ] File issue: "[CRITICAL] Backup/restore failed: [details]"
- [ ] Do not mark as successful until fixed

**Sign Off**: [DBA Name] - [Date]

---

## Process #9: Monitoring Setup - Test Plan

### Monthly Alert Test (Every 2nd Friday)

**Duration**: 30 min  
**Who**: DevOps/SRE  
**Where**: Staging + Slack

**Test Steps**:
```bash
# 1. Verify dashboard exists
# Go to: [Your monitoring dashboard URL]
# [ ] Page loads
# [ ] Metrics displayed (not blank)
# [ ] No stale data (timestamp recent)

# 2. Test error rate alert
# Trigger: Create error in staging
# Example: Deploy bad code that crashes on one endpoint
# Expected alert: "🚨 Error rate [10%] exceeded threshold [1%]"
# Verify: Alert arrives in Slack within 1-2 minutes

# 3. Test latency alert
# Trigger: Add artificial delay to endpoint
# Expected alert: "🚨 Latency [p99: 2000ms] exceeded threshold [500ms]"
# Verify: Alert arrives in Slack

# 4. Test uptime alert
# Trigger: Temporarily take down staging
# Expected alert: "🚨 Service unavailable"
# Verify: Alert arrives within 1-2 minutes

# 5. Cleanup
# Remove test code, restore normal operation

# 6. Verify alerts silent (no false positives)
# Monitor for 30 minutes post-test
# [ ] No unexpected alerts during normal operation
```

**Success Criteria**:
- [ ] Dashboard displays current metrics
- [ ] Error rate alert works
- [ ] Latency alert works
- [ ] Uptime alert works
- [ ] No false positives

**If Failure**:
- [ ] Check alert configuration
- [ ] Fix (add missing alert rule, adjust threshold, etc.)
- [ ] Re-test
- [ ] File issue: "[MONITORING] Alert [X] not working"

**Sign Off**: [SRE Name] - [Date]

---

## Process #10: User Data Deletion - Test Plan

### Monthly Deletion Test (Every 3rd Friday)

**Duration**: 1 hour  
**Who**: Backend/Data engineer  
**Where**: Staging database

**Test Steps**:
```bash
# 1. Create test user
# Script: Create user with profile, photos, deals, messages
curl -X POST http://staging.localhost/api/v1/users \
  -d '{"name":"testuser","email":"test@staging.local"}'
# Note: [user_id]

# 2. Add test data
# Create photos, messages, deals, etc.

# 3. Initiate deletion request
# Simulate user clicking "Delete my account"
curl -X POST http://staging.localhost/api/v1/users/[user_id]/delete-request

# 4. Verify "deletion_pending" state
SELECT status FROM deletion_queue WHERE user_id = '[user_id]';
-- Expected: "pending"

# 5. Run deletion cron (manually)
# Normally runs nightly, trigger manually for test:
npm run cron:delete-users

# 6. Verify deletion complete
SELECT COUNT(*) FROM users WHERE id = '[user_id]';
-- Expected: 0 (user gone)

SELECT COUNT(*) FROM photos WHERE user_id = '[user_id]';
-- Expected: 0 (photos gone)

SELECT COUNT(*) FROM messages WHERE user_id = '[user_id]' OR recipient_id = '[user_id]';
-- Expected: 0 (messages gone)

# 7. Verify anonymization (logs)
SELECT * FROM audit_logs WHERE old_values ->> 'user_id' = '[user_id]';
-- Expected: 0 rows (all audit logs anonymized)

SELECT * FROM audit_logs WHERE old_values ->> 'email' LIKE '%@%';
-- Expected: 0 rows (all emails anonymized)
```

**Success Criteria**:
- [ ] Test user created successfully
- [ ] Deletion request accepted
- [ ] Deletion executed
- [ ] All PII deleted
- [ ] Audit logs anonymized
- [ ] No data orphaned

**If Failure**:
- [ ] Check deletion script for bugs
- [ ] Verify all related tables were deleted
- [ ] File issue: "[COMPLIANCE] Data deletion process failed"
- [ ] Fix and re-test

**Sign Off**: [Backend Engineer Name] - [Date]

---

## Master Testing Calendar

Print this and put on wall / in calendar app:

```
TESTING CALENDAR 2026

January (Q1 Start)
- Jan 3  (Fri) - Quarterly process audit (all processes)
- Jan 10 (Fri) - Monthly load test (scaling)
- Jan 17 (Fri) - Monthly restoration test (backups)
- Jan 24 (Fri) - Monthly alert test (monitoring)

February
- Feb 7  (Fri) - Feature dev smoke test
- Feb 14 (Fri) - Code review audit
- Feb 21 (Fri) - Monthly load test

March
- Mar 7  (Fri) - Feature dev smoke test
- Mar 14 (Fri) - Code review audit
- Mar 21 (Fri) - Monthly restoration test
- Mar 28 (Fri) - Monthly deletion test

April (Q2 Start)
- Apr 4  (Fri) - Quarterly process audit (all processes)
- Apr 11 (Fri) - Monthly load test
- Apr 18 (Fri) - Code review audit
- Apr 25 (Fri) - Monthly alert test

[Continue for remaining quarters...]

Every Monday:
- Automated security scan (Process #5)

Every Tuesday:
- Code review audit (Process #2)

Every Wednesday:
- Deploy verification (Process #3)

Monthly (1st of month):
- Security audit (Process #5, manual)

Monthly (3rd Friday):
- Migration practice test
- User deletion test

Quarterly:
- Incident simulation
- Process audit
- Full security review
```

---

## How to Report Test Results

**File**: Create one GitHub issue per test cycle
**Title**: `[TEST] [Process #X] - [Date] - [Status]`
**Template**:

```markdown
## Process Testing Results

**Process**: [Name]
**Test Date**: [YYYY-MM-DD]
**Tester**: [Your Name]
**Duration**: [X min]

### Results
- [ ] Criterion 1: PASS / FAIL
- [ ] Criterion 2: PASS / FAIL
- [ ] Criterion 3: PASS / FAIL

### Issues Found
- [List any issues, or "None"]

### Lessons Learned
- [What did we learn, if anything?]

### Sign Off
Tested by: [Name]
Date: [YYYY-MM-DD]
Status: ✅ PASS / ❌ FAIL
```

---

## Quick Test Status Dashboard

Track in Airtable / Spreadsheet:

| Process | Last Tested | Status | Tester | Next Test | Notes |
|---------|-------------|--------|--------|-----------|-------|
| Feature Dev | 2026-04-12 | ✅ PASS | Alex | 2026-05-10 | All good |
| Code Review | 2026-04-16 | ✅ PASS | Jamie | 2026-04-23 | Found 1 missing approval |
| Deploy | 2026-04-17 | ✅ PASS | Sam | 2026-04-24 | Quick |
| Scaling | 2026-04-10 | ❌ FAIL | Alex | 2026-04-24 | Retesting after fix |
| Backup | 2026-04-12 | ✅ PASS | DBA | 2026-05-10 | Restore took 15 min |

---

**Last Updated**: 2026-04-24  
**Purpose**: Ensure every process works when we need it  
**Frequency**: Tests run on schedule, results tracked
