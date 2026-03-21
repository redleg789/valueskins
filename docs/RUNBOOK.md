# Valueskins Operations Runbook

## On-Call Escalation

| Severity | Description                          | Response SLA | Escalation       |
|----------|--------------------------------------|--------------|------------------|
| P0       | Complete outage / data loss          | 15 min       | Founder + On-call |
| P1       | Partial outage / auth broken         | 30 min       | On-call          |
| P2       | Degraded performance / high errors   | 2 hours      | On-call          |
| P3       | Minor issue / non-critical feature   | Next business day | Triage queue |

---

## Health Checks

```bash
# Liveness
curl https://api.valueskins.io/health/live

# Readiness (checks DB connection)
curl https://api.valueskins.io/health/ready

# Prometheus metrics
curl https://api.valueskins.io/metrics
```

---

## Alert Runbooks

### Alert: `error_rate_high` (>1% 5xx over 5 min)

1. Check recent deploys: `kubectl rollout history deployment/api -n valueskins`
2. Check logs: `kubectl logs -l app=api -n valueskins --since=10m | grep -E '"level":"error"'`
3. Check DB health: `kubectl exec -it postgres-primary-0 -n valueskins -- pg_isready`
4. If new deploy: `kubectl rollout undo deployment/api -n valueskins`
5. If DB: see **Database Runbook** below

### Alert: `p99_latency_high` (>500ms P99 over 5 min)

1. Check slow query log in Postgres: `SELECT * FROM pg_stat_activity WHERE state='active' ORDER BY duration DESC LIMIT 20;`
2. Check connection pool saturation: metrics label `db_pool_waiting`
3. Check circuit breaker state: `SELECT * FROM circuit_breaker_state WHERE state != 'closed';`
4. If connection pool: increase `DATABASE_POOL_SIZE` env var and rollout
5. If specific query: add index or investigate N+1

### Alert: `pod_restarts_high` (>3 restarts in 15 min)

1. `kubectl describe pod <pod> -n valueskins`
2. `kubectl logs <pod> --previous -n valueskins`
3. Common cause: OOM → increase memory limit or find leak

### Alert: `circuit_breaker_open`

1. `SELECT * FROM circuit_breaker_state WHERE state = 'open';`
2. Check the named service's error rate from logs
3. Fix underlying issue; circuit auto-closes after 30s recovery timeout
4. Force-close: `UPDATE circuit_breaker_state SET state='closed', failure_count=0 WHERE service_name='<name>';`

---

## Database Runbook

### Check replication lag

```sql
-- On primary:
SELECT client_addr, state, sent_lsn, write_lsn, flush_lsn, replay_lsn,
       (sent_lsn - replay_lsn) AS replication_lag_bytes
FROM pg_stat_replication;
```

### Long-running queries (kill if >60s)

```sql
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '60 seconds';

SELECT pg_terminate_backend(<pid>);
```

### Connection pool exhaustion

```sql
SELECT count(*), state FROM pg_stat_activity GROUP BY state;
-- If count near max_connections, scale app or reduce pool size
```

### Emergency read-only mode

```bash
# Route all traffic to read replica temporarily
kubectl set env deployment/api REPLICA_DATABASE_URL="" -n valueskins
# Then point DATABASE_URL at replica (read-only emergency)
```

---

## Deploy & Rollback

```bash
# Rollback API
kubectl rollout undo deployment/api -n valueskins
kubectl rollout status deployment/api -n valueskins

# Rollback frontend
kubectl rollout undo deployment/frontend -n valueskins

# Force re-deploy a specific SHA
kubectl set image deployment/api api=ghcr.io/valueskins/api:<SHA> -n valueskins
```

---

## Maintenance Mode

```sql
-- Enable maintenance (immediately returns 503 to users, health/admin exempt)
UPDATE platform_config SET maintenance_mode_enabled = TRUE,
  maintenance_mode_message = 'We are performing scheduled maintenance. Back in 30 minutes.',
  updated_at = NOW() WHERE id = 1;

-- Disable
UPDATE platform_config SET maintenance_mode_enabled = FALSE, updated_at = NOW() WHERE id = 1;
```

---

## Feature Flags

```sql
-- Kill-switch a feature immediately
UPDATE feature_flags SET enabled = FALSE, updated_at = NOW() WHERE name = 'marketplace';

-- Canary rollout (10% of users)
UPDATE feature_flags SET rollout_percentage = 10, updated_at = NOW() WHERE name = 'reputation_v2';

-- Full rollout
UPDATE feature_flags SET rollout_percentage = NULL, updated_at = NOW() WHERE name = 'reputation_v2';
```

---

## GDPR Data Deletion

```sql
-- Check pending deletion requests
SELECT * FROM data_deletion_requests WHERE status = 'pending' ORDER BY requested_at;

-- Admin processing via API
POST /admin/gdpr/requests/{id}/process
```

---

## Secrets Rotation

1. Generate new secret: `openssl rand -base64 48`
2. Update in AWS Secrets Manager / Kubernetes secret
3. Rolling restart: `kubectl rollout restart deployment/api -n valueskins`
4. For JWT rotation: old tokens remain valid until expiry (15 min); no forced logout

---

## Chaos Engineering

```bash
# Kill a random pod (resilience test)
kubectl delete pod -l app=api -n valueskins --grace-period=0 --force

# Simulate DB unavailability
kubectl scale statefulset postgres-primary --replicas=0 -n valueskins
# Expect: circuit breaker opens, API returns 503, no data loss
# Restore: kubectl scale statefulset postgres-primary --replicas=1 -n valueskins
```

---

## Kubernetes Namespace Reference

| Namespace      | Contains                              |
|----------------|---------------------------------------|
| `valueskins`   | API, frontend, workers                |
| `valueskins-db`| PostgreSQL primary + replicas, PgBouncer |
| `monitoring`   | Prometheus, Grafana, AlertManager     |
| `ingress-nginx`| NGINX ingress controller              |
| `cert-manager` | cert-manager for TLS auto-provisioning |
