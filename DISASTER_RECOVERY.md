# Disaster Recovery & Failover

## Database Replication (Aurora MySQL/PostgreSQL)

### Multi-AZ Setup
- Primary + Standby replica (automatic failover <1 min)
- Read replicas in 3+ regions for global distribution
- Continuous binary log replication (0 RPO target)

```bash
# Promote read replica to primary (in outage)
aws rds promote-read-replica --db-instance-identifier valueskins-replica-us-west-2
```

### Backup Strategy
- **Automated**: Hourly snapshots to S3 (retention: 30 days)
- **Manual**: Before major deployments, test restore weekly
- **Backup test**: Auto-restore to isolated RDS every Sunday, run smoke tests
- **Encryption**: S3 SSE-KMS, RDS encryption at rest

```bash
# Point-in-time restore (up to 35 days back)
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier valueskins-restored \
  --db-snapshot-identifier valueskins-snapshot-2026-03-22
```

## Application Failover

### API Gateway (EKS)
- 3+ replicas across 3 AZs (pod anti-affinity enforced)
- HPA scales to 50 on CPU spike
- Circuit breaker: auto-drain if downstream fails
- Graceful shutdown: 30s drain before termination

```bash
# Emergency scale-up (manual)
kubectl scale deployment api-gateway --replicas=30 -n valueskins
```

### Frontend (Vercel)
- Automatic edge caching + failover to CDN
- Rollback to previous deployment: 1-click in Vercel dashboard
- Git revert + auto-deploy: `git revert HEAD && git push`

## Redis Cache Failover

- Cluster mode: 3 masters + 3 slaves (auto-failover)
- If master fails: slave promoted, no manual intervention
- No cache = degraded but functional (fail-open pattern)

```bash
# Check cluster health
redis-cli -c CLUSTER INFO
```

## Data Loss Prevention

### Transactional Integrity
- All deal mutations wrapped in DB transactions
- Outbox pattern: publish events from transaction (at-least-once)
- Notification worker polls outbox, delivers async

### Audit Trail
- Every user action logged: creator_id, brand_id, action, timestamp
- 7-year retention (compliance)
- Searchable by deal_id, creator_id, brand_id

```sql
SELECT * FROM audit_log WHERE deal_id = 123 ORDER BY created_at DESC;
```

## Incident Playbooks

### Database Unavailable (no read/write)
1. Check AWS RDS console: failover status, events
2. If primary down: wait for automatic failover OR promote read replica
3. Drain API pods if failover >2 min (prevent cascading errors)
4. Verify data consistency post-failover
5. Page DBA on-call

**Expected recovery: <2 minutes (automated)**

### Redis Cache Down
1. API continues (fail-open, cache misses slow queries)
2. Auto-restart Redis pods in K8s
3. Repopulate cache via background jobs
4. If recovery >10 min: scale API replicas (more memory pressure)

**Expected recovery: <5 minutes**

### API Memory Leak (pods OOMkilled)
1. Check pod metrics: memory trend over 1 hour
2. Identify leaky service (profiling dashboard)
3. Kill + restart pod (quick workaround)
4. Rollback to previous deployment
5. Post-mortem: fix leak, re-test

**Workaround recovery: <1 minute, Full fix: next deploy**

### Data Corruption in Deal State
1. Stop all deal mutations (maintenance mode: return HTTP 503)
2. Restore from backup (point-in-time)
3. Replay clean transactions from outbox
4. Verify data consistency
5. Resume traffic

**Expected recovery: <30 minutes**

## Testing & Drills

### Monthly Chaos Engineering
- Kill random pods, verify auto-recovery
- Disconnect database, verify circuit breaker
- Fill Redis to capacity, verify cache eviction
- Spike traffic 10x, verify HPA scales + SLO holds

### Quarterly Disaster Recovery Drill
- Simulate primary region outage
- Promote read replica in secondary region
- Verify all services functional in new region
- Document recovery time, action items

## Monitoring for Failover Readiness

**Critical Alerts:**
- Replication lag >30s
- Backup failure (backup script stale)
- Primary/replica divergence detected
- Circuit breaker open >1 min
- Pod memory/CPU at 90%+ sustained

**Check Every Week:**
```bash
# Replication lag
SHOW SLAVE STATUS\G | grep Seconds_Behind_Master

# Backup recency
aws s3 ls s3://valueskins-db-backups/daily/ --recursive | tail -1

# Pod resource pressure
kubectl top nodes --all-namespaces
kubectl top pods -n valueskins
```

## Failover Checklist

- [ ] Read replicas in 3+ regions
- [ ] Automated backup to S3 (tested weekly)
- [ ] Database encryption at rest + in transit
- [ ] API replicas spread across AZs
- [ ] Circuit breaker on downstream calls
- [ ] Graceful shutdown configured
- [ ] Audit trail immutable (7-year retention)
- [ ] Outbox pattern for event publishing
- [ ] Chaos engineering tests monthly
- [ ] DR drill quarterly
- [ ] On-call runbook documented
- [ ] Alerting for all critical paths

**Status: PROD READY**
