# Docker Production Deployment Guide

## Quick Start (Local Dev with All Services)

```bash
cd /Users/sakethvelamuri/Desktop/Startups*/Short\ term/Valueskins.

# Set up environment
export NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
export NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key

# Start all services: PostgreSQL, Redis, PgBouncer, Rust backend, Next.js frontend
docker-compose -f scalability/docker-compose.yml up -d

# Monitor logs
docker-compose -f scalability/docker-compose.yml logs -f backend frontend

# Stop all services
docker-compose -f scalability/docker-compose.yml down
```

## What Gets Deployed

### 1. PostgreSQL Primary (Port 5432)
- Database: valueskins
- User: valueskins
- Password: password
- Volume: postgres_primary (persisted)
- Resources: 2 CPU, 4GB RAM

### 2. PostgreSQL Replica (Port 5433)
- Read-only replica for load distribution
- Volume: postgres_replica (persisted)
- Replication streaming enabled

### 3. PgBouncer (Port 6432)
- Connection pooling: 1000 max clients, 50 default pool size
- Replicates 2 instances for HA
- Resources: 1 CPU, 1GB RAM per instance

### 4. Redis (Port 6379)
- Cache, sessions, rate limiting
- Persistence: AOF enabled
- Memory limit: 2GB with LRU eviction
- Replicates 3 instances for distributed caching
- Resources: 1 CPU, 2GB RAM per instance

### 5. Rust API Gateway (Port 8080, 9090)
- All 24 microservices compiled into single binary
- Metrics on 9090 (Prometheus)
- Replicates 3 instances (load balanced)
- Resources: 2 CPU, 2GB RAM per instance
- Health check: GET /health/live

### 6. Next.js Frontend (Port 3000)
- Standalone production build
- Single instance (scale to 2+ in K8s)
- Resources: 1 CPU, 1GB RAM
- Health check: GET / (returns 200)

### 7. Prometheus (Optional, Port 9091)
- Scrapes backend metrics from :9090/metrics
- Retention: 15 days (configurable)
- Enable with: `--profile monitoring`

### 8. Grafana (Optional, Port 3001)
- Visualizes Prometheus data
- Default: admin/admin
- Enable with: `--profile monitoring`

---

## Build Verification

### Test Build Locally
```bash
# Build Rust backend only
cd backend
cargo build --release --bin api_gateway
./target/release/api_gateway &  # Run it

# Test health endpoint
curl http://localhost:8080/health/live
# Expected: {"status":"healthy"}

# Build frontend
cd ../nexus/frontend
npm ci && npm run build
npm run start &

# Test frontend
curl http://localhost:3000
# Expected: HTML of page
```

### Docker Build Test
```bash
# Build backend image (takes 5-10 min)
docker build -f backend/Dockerfile -t valueskins-api:latest backend/

# Build frontend image (takes 3-5 min)
docker build -f nexus/frontend/Dockerfile -t valueskins-frontend:latest nexus/frontend/

# Run images locally to test
docker run -d -p 8080:8080 \
  -e DATABASE_URL="postgres://user:pass@localhost:5432/db" \
  -e REDIS_URL="redis://localhost:6379" \
  valueskins-api:latest

docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="http://localhost:8080" \
  valueskins-frontend:latest

# Verify
curl http://localhost:8080/health/live
curl http://localhost:3000
```

---

## Production Deployment (Kubernetes)

### Prerequisites
- K8s cluster (EKS, GKE, AKS)
- kubectl configured
- Docker images pushed to registry (ECR, GCR, ACR)
- PostgreSQL, Redis running (managed services recommended)

### Deploy to K8s

```bash
# Create namespace
kubectl create namespace valueskins

# Create secrets for sensitive data
kubectl create secret generic app-secrets \
  -n valueskins \
  --from-literal=database-url="postgres://..." \
  --from-literal=redis-url="redis://..." \
  --from-literal=firebase-api-key="..." \
  --from-literal=jwt-secret="..." \
  --from-literal=session-secret="..."

# Deploy Rust backend (3 replicas)
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: valueskins
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: your-registry/valueskins-api:latest
        ports:
        - containerPort: 8080
        - containerPort: 9090
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: redis-url
        - name: RUST_LOG
          value: "info,api_gateway=debug"
        - name: WEBSOCKET_MAX_CONNECTIONS
          value: "100000"
        resources:
          requests:
            memory: "1Gi"
            cpu: "1000m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: valueskins
spec:
  type: LoadBalancer
  selector:
    app: api-gateway
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
    name: http
  - protocol: TCP
    port: 9090
    targetPort: 9090
    name: metrics
EOF

# Deploy Next.js frontend (2 replicas)
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: valueskins
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/valueskins-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "http://api-gateway:8080"
        - name: NEXT_PUBLIC_WS_URL
          value: "ws://api-gateway:8080"
        - name: NEXT_PUBLIC_FIREBASE_PROJECT_ID
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: firebase-project-id
        - name: NEXT_PUBLIC_FIREBASE_API_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: firebase-api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: valueskins
spec:
  type: LoadBalancer
  selector:
    app: frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
EOF

# Verify deployment
kubectl get pods -n valueskins
kubectl get svc -n valueskins
kubectl logs -n valueskins -l app=api-gateway -f
```

---

## Environment Variables Reference

### Backend (Rust)
```
DATABASE_URL=postgres://user:pass@host:5432/valueskins
DATABASE_POOL_SIZE=100
DATABASE_REPLICA_URL=postgres://user:pass@replica:5432/valueskins
REDIS_URL=redis://host:6379
REDIS_POOL_SIZE=100
RUST_LOG=info,api_gateway=debug
RUST_BACKTRACE=1
WEBSOCKET_MAX_CONNECTIONS=100000
RATE_LIMIT_ENABLED=true
READ_REPLICA_ENABLED=true
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret
```

### Frontend (Next.js)
```
NEXT_PUBLIC_API_URL=http://api.example.com
NEXT_PUBLIC_WS_URL=ws://api.example.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

---

## Monitoring & Observability

### Health Checks
```bash
# Backend health
curl http://localhost:8080/health/live      # Is it running?
curl http://localhost:8080/health/ready     # Is it ready for traffic?

# Frontend health
curl http://localhost:3000                  # Can you reach it?

# Database health (from PgBouncer)
PGPASSWORD=password psql -h localhost -U valueskins -d valueskins -c "SELECT 1;"

# Redis health
redis-cli -h localhost PING
# Expected: PONG
```

### Metrics (Prometheus)
```bash
# Scrape backend metrics
curl http://localhost:9090/metrics | head -20

# Import to Prometheus: scrape_configs
- job_name: 'valueskins-api'
  static_configs:
  - targets: ['localhost:9090']
```

### Logs
```bash
# View backend logs
docker-compose -f scalability/docker-compose.yml logs backend

# View frontend logs
docker-compose -f scalability/docker-compose.yml logs frontend

# View database logs
docker-compose -f scalability/docker-compose.yml logs postgres-primary

# Tail in real-time
docker-compose -f scalability/docker-compose.yml logs -f
```

---

## Performance Tuning

### For 100K Concurrent Users

**Backend**:
- Replicas: 50-100 pods (horizontal auto-scaling)
- Memory: 2GB per pod
- CPU: 2 per pod
- Connection pool: 100-200 per pod

**Database**:
- Primary: db.r6g.8xlarge (32 vCPU, 256GB RAM)
- Read replicas: db.r6g.4xlarge (16 vCPU, 128GB RAM) x 3
- PgBouncer: 10+ instances (1 per 10K connections)

**Redis**:
- Cluster: 5-10 nodes (16GB each)
- Replication: 3 replicas per shard
- Eviction policy: allkeys-lru

**Frontend**:
- Replicas: 5-10 pods
- CDN: CloudFront + S3 for static assets
- Caching: 1-year TTL on JS/CSS bundles

---

## Troubleshooting

### Service won't start
```bash
# Check logs
docker-compose -f scalability/docker-compose.yml logs backend

# Common issues:
# - DATABASE_URL wrong → psql: connection refused
# - REDIS_URL wrong → Redis: connection refused
# - Port already in use → bind: address already in use

# Solution:
docker-compose down -v  # Remove volumes
docker-compose up -d    # Recreate
```

### Health check failing
```bash
# Check if service is responding
curl http://localhost:8080/health/live

# If 500: Check logs
docker logs $(docker ps -qf "label=com.docker.compose.service=backend")

# If timeout: Service might be overloaded or unresponsive
```

### Performance degradation
```bash
# Check resource usage
docker stats

# If memory > limits: Increase memory in docker-compose.yml
# If CPU > limits: Increase CPU in docker-compose.yml
# If database slow: Check postgres logs

# Scale horizontally (K8s only)
kubectl scale deployment api-gateway --replicas=10 -n valueskins
```

---

## Cleanup

```bash
# Stop all services
docker-compose -f scalability/docker-compose.yml down

# Remove volumes (WARNING: deletes all data)
docker-compose -f scalability/docker-compose.yml down -v

# Delete K8s resources
kubectl delete namespace valueskins
```

---

## Next Steps

1. ✅ Docker images built (Dockerfile exists)
2. ✅ docker-compose.yml configured
3. ⏳ Set environment variables
4. ⏳ Push images to container registry (ECR, GCR, etc.)
5. ⏳ Deploy to K8s cluster
6. ⏳ Set up monitoring (Prometheus, Grafana)
7. ⏳ Configure auto-scaling (HPA)
8. ⏳ Set up CI/CD (GitHub Actions)

Ready to deploy. Run `docker-compose -f scalability/docker-compose.yml up -d` to start locally.
