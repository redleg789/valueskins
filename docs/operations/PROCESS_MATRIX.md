# Process Matrix: Who Does What & When

**Purpose**: Quick reference for process ownership, triggers, and timing.

---

## Master Process Table

| Process | Owner | Backup | Duration | Frequency | Trigger | Success Metric |
|---------|-------|--------|----------|-----------|---------|-----------------|
| **Feature Development** | Frontend/Backend Lead | Any engineer | Variable | Per sprint | User story in backlog | Code merged + deployed |
| **Code Review** | All engineers | N/A (rotation) | 30-120 min | Ongoing | PR created | Approved + merged |
| **Deploy to Production** | Release Engineer | Lead Engineer | 15-30 min | Variable | Main branch ready | Users see new features |
| **Database Migration** | Backend/DBA | DevOps | 15-120 min | As-needed | Schema change required | Data integrity verified |
| **Security Audit** | Security Engineer | Backend Lead | 3-4 hours | Monthly (1st) | Calendar reminder | Issues filed + remediated |
| **Incident Response** | On-call Engineer | Team lead | 5-120 min | As-needed | Alert triggered | Root cause identified + fixed |
| **Scaling** | DevOps/Backend | SRE | 1-4 hours | As-needed | Error rate > 1% or latency spike | Metrics back to normal |
| **Backup/Recovery** | DevOps | DBA | 10 min (auto) / 2+ hours (recover) | Daily auto + monthly test | Auto backup OR disaster | Restore verified |
| **Monitoring Setup** | DevOps/SRE | None (one-time) | 2-4 hours | Once per year | New system launched | Alerts working + tested |
| **User Data Deletion** | Backend/Data Eng | Compliance officer | 5-30 min | On-request | User requests deletion | Verified deleted |
| **Payment Processing** | Backend/Payments | Finance | 5-15 min | Per transaction | User initiates payment | Stripe receipt sent |
| **Onboarding New Engineer** | Tech Lead | Mentor | Full week | Per hire | Engineer joins team | Can ship to production |
| **Knowledge Transfer (Exit)** | Departing Eng + Tech Lead | None | 5 days | Per departure | 2-week notice given | New owner trained + on-call ready |
| **Quarterly Audit** | Engineering Manager | Lead Engineer | 4 hours | Quarterly (Jan/Apr/Jul/Oct) | Calendar reminder | Process doc updated + team trained |

---

## By Process Priority (What's Most Critical)

### TIER 1 (Must Never Fail)
1. **Payment Processing** - Revenue critical
2. **Incident Response** - Service recovery critical
3. **Backup/Recovery** - Data preservation critical
4. **Deploy to Production** - Deployment process critical

**Action**: Every engineer must know these processes. Test monthly.

### TIER 2 (Very Important)
5. **Security Audit** - Compliance critical
6. **Database Migration** - Data schema critical
7. **Monitoring Setup** - Detection critical

**Action**: Lead engineer owns; backup trained quarterly.

### TIER 3 (Important)
8. **Feature Development** - Velocity critical
9. **Code Review** - Quality critical
10. **Scaling** - Performance critical

**Action**: Daily operations; continuous feedback loops.

### TIER 4 (Support)
11. **Onboarding** - Ramp-up time critical
12. **Knowledge Transfer** - Continuity critical
13. **Quarterly Audit** - Improvement critical

**Action**: Planned, not reactive; schedule ahead.

---

## By Team Role

### Frontend Engineer
- **Owns**: Feature Development (frontend), Code Review
- **Participates**: Testing, incident response (if UI broken)
- **Tests**: Monthly security audit (frontend security)
- **Escalates to**: Backend engineer (if API issue) | Tech lead (if stuck)

### Backend Engineer
- **Owns**: Feature Development (backend), Database Migration, User Data Deletion
- **Participates**: Code review, incident response, scaling
- **Tests**: Weekly code reviews, monthly security audit
- **Escalates to**: DBA (if complex migration), CTO (if major decision)

### DevOps/SRE
- **Owns**: Deploy to Production, Scaling, Backup/Recovery, Monitoring Setup
- **Participates**: Incident response (infrastructure), Database Migration
- **Tests**: Weekly deployment cycle, monthly backup test
- **Escalates to**: CTO (if infrastructure down), AWS support (if provider issue)

### Tech Lead
- **Owns**: Onboarding, Code Review oversight, Knowledge Transfer, Quarterly Audit
- **Participates**: All processes (advisor), incident response (escalation point)
- **Tests**: All processes (quarterly), trains replacements
- **Escalates to**: CTO (if strategic decision)

### Finance/Operations
- **Owns**: Payment Processing reconciliation, User Data Deletion (compliance)
- **Participates**: Monthly data audit
- **Tests**: Monthly reconciliation
- **Escalates to**: Legal (if GDPR issue), Tax advisor (if compliance issue)

### CTO/Leadership
- **Owns**: Emergency decisions, incident escalation
- **Participates**: Quarterly audit, strategy decisions
- **Tests**: Incident simulation (annual)
- **Escalates to**: Board (if major issue)

---

## Decision Tree: "I Need to Do X"

```
I need to release code to production
├─ Is code on main branch? YES
├─ Did CI pass? YES
├─ → Run Process #3: Deploy to Production

I found a bug in production
├─ Is it critical? (users can't use app)
│  ├─ YES → Run Process #6: Incident Response
│  └─ NO → Create GitHub issue, add to backlog
├─ Did you fix it? YES
└─ → Follow Process #3 for rollout

I need to add a new feature
├─ Do you have a design? YES
├─ Do you have requirements? YES
└─ → Follow Process #1: Feature Development

The app is slow / errors spiking
├─ Run Process #6: Incident Response
├─ Did you identify bottleneck? YES
└─ → Follow Process #7: Scaling (if needed)

A user wants their data deleted
├─ Is deletion request verified? YES
└─ → Follow Process #10: User Data Deletion

I need to change the database schema
├─ Is this a migration? YES
└─ → Follow Process #4: Database Migration

An engineer is leaving
├─ Do you have 2 weeks notice? YES
└─ → Follow Process #13: Knowledge Transfer

A new engineer joined
├─ Is environment set up? NO
└─ → Follow Process #12: Onboarding

It's time to audit our processes
├─ Is it Q1/Q2/Q3/Q4? YES
└─ → Follow Process #14: Quarterly Audit
```

---

## Escalation Paths

### By Severity

**P1 (Critical)**: Service down, can't log in, payments failing
- Escalate: Page on-call engineer immediately
- ETA to fix: 15 min
- Escalate further: If not fixed in 15 min, page CTO

**P2 (High)**: Major feature broken, slow performance
- Escalate: Notify on-call engineer via Slack
- ETA to fix: 1 hour
- Escalate further: If not fixed in 1 hour, page lead engineer

**P3 (Medium)**: Minor issue, workaround exists
- Escalate: Slack #ops
- ETA to fix: Next business day
- Escalate further: Not needed (schedule for sprint)

**P4 (Low)**: Cosmetic, no user impact
- Escalate: GitHub issue
- ETA to fix: Next sprint planning
- Escalate further: No

### By Domain

**Authentication / Security Issue**
- First: Page security engineer / backend lead
- If not resolved in 5 min: Page CTO
- External: Contact legal (if GDPR breach)

**Payment / Revenue Issue**
- First: Page backend engineer + finance officer
- If not resolved in 10 min: Page CTO
- External: Contact Stripe support

**Infrastructure / Deployment Issue**
- First: Page DevOps engineer
- If not resolved in 10 min: Page infrastructure lead
- External: Contact AWS support

**Database / Data Issue**
- First: Page backend engineer + DBA
- If not resolved in 15 min: Page CTO
- External: Contact database provider

**Unknown / Can't Diagnose**
- First: Page on-call engineer
- If stuck: Page tech lead
- If really stuck: Page CTO

---

## Monthly Checklist

Use this to verify all processes are running smoothly:

```
Week 1:
☐ Security Audit (Process #5) executed
☐ Incidents from last month reviewed (lessons learned documented)
☐ On-call engineer rotated
☐ Backup engineer trained for next rotation

Week 2-3:
☐ Deploy to production (Process #3) executed (at least once)
☐ Code reviews happening regularly (Process #2)
☐ Features shipped to main

Week 4:
☐ Backup/recovery test executed (Process #8)
☐ Monthly reconciliation completed (Process #11 - payments)
☐ Payment processing audit (no failed charges, reconciled)
☐ Monitoring alerts all working (Process #9)

Ongoing:
☐ No process marked "tribal knowledge"
☐ All processes documented (none "ask [person]")
☐ New engineer onboarding on track (Process #12)
☐ Departing engineers handed off (Process #13)
```

---

## Quarterly Runbook (Every 3 Months)

```
Start of Quarter:
1. Audit all processes (Process #14)
2. Update this matrix
3. Train team on any changes
4. Assign new on-call rotation for quarter

Mid-Quarter:
1. Verify all critical processes tested at least once
2. Gather feedback: "What's broken or confusing?"
3. File improvements as GitHub issues

End of Quarter:
1. Review incident history: patterns?
2. Review deployment history: any rollbacks?
3. Plan improvements for next quarter
4. Update this document
```

---

## Owner Contact Info Template

Replace [Name] with actual details:

| Role | Name | Phone | Email | Backup |
|------|------|-------|-------|--------|
| Tech Lead | [Name] | [Phone] | [Email] | [Backup Name] |
| Frontend Lead | [Name] | [Phone] | [Email] | [Backup Name] |
| Backend Lead | [Name] | [Phone] | [Email] | [Backup Name] |
| DevOps Lead | [Name] | [Phone] | [Email] | [Backup Name] |
| Security Lead | [Name] | [Phone] | [Email] | [Backup Name] |
| Finance/Ops | [Name] | [Phone] | [Email] | [Backup Name] |
| CTO | [Name] | [Phone] | [Email] | [Backup Name] |

**Update this table**: Quarterly or when roles change.

---

## Testing Schedule

**Weekly**:
- Deploy to production (happens naturally as features merge)
- Code reviews (daily, but assess weekly)

**Monthly**:
- Security audit (Process #5) - 1st of month
- Backup restore test (Process #8) - last Friday
- Payment reconciliation (Process #11) - end of month

**Quarterly** (Jan/Apr/Jul/Oct):
- Process audit (Process #14) - 1 day, start of quarter
- Incident simulation (Process #6) - test response procedures
- Disaster recovery drill (Process #8) - full restore simulation

**Annually**:
- Full security penetration test
- Team training refresh (each engineer re-read all processes)

---

**Last Updated**: 2026-04-24  
**Next Review**: 2026-07-24 (Q3 Audit)
