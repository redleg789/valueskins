# Production Deployment Checklist

## Environment Variables (GitHub Secrets)

### Frontend Deployment (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://dyvfkrdidiprdzdhnqpj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=https://api.valueskins.com
```

### Backend Deployment (EKS)
```
JWT_SECRET=<min 32 chars, random>
VERIFICATION_HMAC_SECRET=<min 32 chars>
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASS=SG....
ALLOWED_ORIGINS=https://valueskins.com,https://api.valueskins.com
S3_BACKUP_BUCKET=valueskins-db-backups
AWS_REGION=us-east-1
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

## Pre-Deployment Validation

### Backend
- [ ] `cargo build --release` succeeds with zero errors
- [ ] All migrations applied (`sqlx migrate run`)
- [ ] Health checks responding: `/health/live`, `/health/ready`
- [ ] Secrets enforced (JWT_SECRET min 32 chars, no placeholder values)
- [ ] Database pool tuned: DATABASE_POOL_SIZE=(workers × cores / 2)
- [ ] CORS origins whitelist configured

### Frontend
- [ ] `npm run build` succeeds
- [ ] No console errors in audit
- [ ] CSP headers validated (unsafe-inline for hydration only)
- [ ] API URL points to production endpoint
- [ ] Supabase keys from production project

## Deployment Process

### Canary (1% traffic)
1. Push to main → GitHub Actions triggered
2. CI pipeline runs (tests, build, security scan)
3. On success: Canary job deploys to 1% of traffic
4. Monitor canary metrics (error rate, latency p99, RPS)
5. Golden signals check (error budget, SLO compliance)

### Full Rollout (100% traffic)
1. Canary stable for ≥15 min without alerts
2. Frontend: Vercel automatic rollout
3. Backend: kubectl apply canary→stable deployment
4. Verify all 50 replicas healthy (HPA min 3, max 50)
5. Database backups running (S3 retention: 30 days)

## Scaling Assumptions

### Frontend (Vercel CDN)
- Auto-scaling, edge caching
- 1M concurrent users @ 0.1 QPS each

### Backend (EKS)
- 3-50 replicas (HPA: CPU 65%, RPS 1000/pod)
- 256Mi base memory, scales to 512Mi per pod
- Rate limiting: per-user tiers (free 100, basic 1k, pro 10k RPS)
- In-memory cache for <10 pods; Redis migration path documented

### Database (Aurora PostgreSQL)
- Multi-AZ, automated failover
- Connection pooling (max_connections tuned for 50 api pods)
- Backup automation: daily + weekly + monthly to S3
- Metrics: error rate <1%, P99 latency <500ms

### Monitoring (Prometheus + Alerting)
- Critical alerts: HighErrorRate, HighLatencyP99, DatabasePoolExhausted
- Warning alerts: HighRateLimitRejections, HighCacheMissRate, CircuitBreakerOpen
- SLO: 99.9% availability (error budget monitoring)

## Security Checklist

- [ ] Secrets in env vars (no .env files committed)
- [ ] HTTPS enforced (TLS 1.2+)
- [ ] CORS whitelist exact origins (no *)
- [ ] SQL: parameterized queries (sqlx macros)
- [ ] XSS: no dangerouslySetInnerHTML, CSP enforced
- [ ] CSRF: HMAC signature verification on state mutations
- [ ] Rate limiting: tiered by user subscription + IP global limit
- [ ] Session tokens: 24hr expiry, rotate on auth
- [ ] Backup encryption: S3 SSE-KMS
- [ ] Audit logging: all brand/creator transactions

## Incident Response

### 5xx Error Rate > 1% for 5 min
1. Check API logs in CloudWatch
2. Verify database health: max_connections % utilization
3. Check Redis cache status
4. Rollback canary deployment if necessary
5. Page on-call engineer

### High Latency (P99 > 500ms)
1. Check database query performance (slow logs)
2. Verify cache hit rate (should be >50%)
3. Check API pod CPU/memory utilization
4. Scale horizontally if needed

### Database Connection Pool Exhausted
1. Check for long-running transactions
2. Increase pool size (DATABASE_POOL_SIZE env)
3. Reduce number of API replicas temporarily
4. Run `SELECT * FROM pg_stat_activity` to find culprits

## Rollback Procedure

```bash
# Frontend (Vercel)
# Auto-rollback available in Vercel dashboard

# Backend (EKS)
kubectl rollout undo deployment/api-gateway -n valueskins
kubectl rollout undo deployment/api-gateway-canary -n valueskins
```

## Success Metrics

- [ ] Error rate <1% sustained
- [ ] P99 latency <500ms
- [ ] 99.9% availability (monthly)
- [ ] <2 second page load time (p95)
- [ ] <100ms API response time (p95)
- [ ] Zero security incidents
