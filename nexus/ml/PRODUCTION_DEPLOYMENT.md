# Nexus Production ML System - Deployment & Scaling

## Architecture Overview

```
User Request
    ↓
[FastAPI Inference Server] (low-latency scoring)
    ↓
[ML Model (DistilBERT)] (ethical content detection)
    ↓
[Recommendation Engine] (two-stage: candidate gen → ranking)
    ↓
[Feature Store (SQLite)] (embeddings, metrics, feedback)
    ↓
[Monitoring] (drift detection, performance tracking)
    ↓
[Feedback Loop] (user corrections → retraining)
```

## Components

### 1. ml_pipeline.py
- **FeatureStore**: SQLite DB for all predictions + metrics
- **DataPipeline**: ETL from public datasets
- **ModelTrainer**: DistilBERT fine-tuning on therapeutic/harmful labels
- **InferenceServer**: Real-time scoring (therapeutic, harmful, converter, allowed)

### 2. recommendation_engine.py
- **ContentEmbedding**: Embed posts by therapeutic value, authenticity, creator quality
- **UserEmbedding**: Embed users by interaction history (what genuine content do they like?)
- **CandidateGenerator**: Stage 1 - Fast ANN search (Faiss in production)
- **RankingModel**: Stage 2 - Precise ranking by multi-objective (therapeutic > authenticity > creator quality)
- **RecommendationEngine**: Full pipeline with diversification

### 3. monitoring.py
- **DataDriftDetector**: Monitor input distribution changes
- **ModelDriftDetector**: Monitor prediction accuracy from user feedback
- **PerformanceMonitor**: Track latency, throughput, error rates (p50, p95, p99)
- **FeedbackLoop**: Collect user corrections, trigger retraining

### 4. api.py
- **POST /score**: Score a post (returns therapeutic, harmful, converter, allowed)
- **POST /feedback**: User marks prediction as wrong (triggers learning)
- **GET /feed/{user_id}**: Personalized feed (genuine content first)
- **POST /interaction**: Log user view/like/share (updates rankings)
- **GET /metrics**: System health + drift detection

## Deployment

### Local Development
```bash
cd nexus/ml
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Train baseline model
python ml_pipeline.py

# Start API
python api.py
# API runs on http://localhost:8000
```

### Production Deployment (Vercel + Cloud Run)

#### Option A: Google Cloud Run (Recommended)
```bash
# Build Docker image
docker build -t nexus-ml:v1 .

# Push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/nexus-ml:v1

# Deploy
gcloud run deploy nexus-ml \
  --image gcr.io/PROJECT_ID/nexus-ml:v1 \
  --platform managed \
  --memory 8G \
  --cpu 4 \
  --timeout 300
```

#### Option B: AWS Lambda (Serverless)
```bash
# Package model for lambda
pip install -r requirements.txt -t package/
cp *.py package/
cd package && zip -r ../function.zip . && cd ..

# Upload and deploy
aws lambda create-function \
  --function-name nexus-ml-inference \
  --runtime python3.11 \
  --role arn:aws:iam::ACCOUNT:role/lambda-role \
  --handler api.lambda_handler \
  --zip-file fileb://function.zip \
  --memory-size 3008 \
  --timeout 300
```

## Scaling

### Phase 1: Baseline (0-100K users)
- Single DistilBERT model
- SQLite feature store (on disk)
- Simple ANN search (linear scan top-1000 posts)
- Batch retraining weekly

### Phase 2: Growth (100K-1M users)
- Model quantization (DistilBERT → 4-bit)
- Redis for embeddings cache (instead of SQLite reads)
- Faiss for true ANN search (10M vectors, 100ms latency)
- Retraining every 2 days

### Phase 3: Scale (1M+ users)
- Distributed training (PyTorch DDP across 4 GPUs)
- Feature store sharding (PostgreSQL + partitioning)
- Multi-model ensemble (DistilBERT + RoBERTa for diversity)
- Retraining nightly with latest feedback

### Phase 4: Enterprise (10M+ users)
- Serving farm (NVIDIA Triton server)
- Real-time feature computation (Spark Streaming)
- Online learning (continuous model updates)
- Edge inference (on-device scoring in app)

## Monitoring & Alerting

### Key Metrics
```
Inference:
  - p50 latency: target <50ms
  - p99 latency: target <200ms
  - throughput: posts/sec
  - error rate: % failures

Model:
  - accuracy (from user feedback)
  - precision / recall for harmful detection
  - AUC-ROC

Data:
  - therapeutic_score distribution (drift?)
  - harmful_score distribution (drift?)
  - % genuine vs fake content

Recommendations:
  - CTR (click-through rate)
  - diversification ratio (posts from unique creators)
  - user retention (next day / weekly active)
```

### Alerting Rules
```
- Inference latency p99 > 500ms → page on-call
- Error rate > 1% → page on-call
- Accuracy from feedback drops > 5% → retrain
- Data drift detected → investigate
- 100+ corrections accumulated → retrain
```

## Feedback Loops

### User Correction Flow
```
1. User sees post
2. Model scores it (e.g., therapeutic=0.8, allowed=true)
3. User marks as "incorrect" (e.g., actually harmful)
4. FeedbackLoop.record_correction()
5. Monitoring detects pattern (100+ corrections)
6. Retraining triggered with corrected labels
7. New model evaluated against baseline
8. If better: deploy; if worse: rollback
```

### Metrics for Evaluation
- **Precision**: Of posts we allowed, % that were actually genuine
- **Recall**: Of harmful posts, % that we caught
- **F1**: Balance between precision & recall
- **User agreement**: % of user corrections we got right

## Data Retention & Privacy

- Raw posts: 30 days (legal hold)
- Embeddings: indefinite (no PII)
- User feedback: 7 days (confidential)
- Model versions: indefinite (audit trail)
- Training data: encrypted (compliance)

## Cost Estimation

### Baseline (1M posts, 100K users, 1QPS)
- Inference: $500/month (Cloud Run, 4 vCPU)
- Storage: $50/month (SQLite + backups)
- Model training: $200/month (GPU time)
- **Total: ~$750/month**

### Scale (100M posts, 10M users, 100QPS)
- Inference: $15K/month (Triton + A100 GPU)
- Storage: $5K/month (PostgreSQL + Redis)
- Model training: $5K/month (distributed, nightly)
- **Total: ~$25K/month**

## Timeline

- **Week 1**: Deploy baseline (DistilBERT + simple ANN)
- **Week 2**: Set up monitoring & alerting
- **Week 3**: Feedback collection + 1st retrain
- **Week 4**: A/B test (baseline vs retrained model)
- **Weeks 5-8**: Optimize for latency, cost, accuracy
- **Week 9+**: Scale to production load

## What Makes This Different from Instagram

| Instagram | Nexus |
|-----------|-------|
| Optimize for watch time | Optimize for therapeutic value |
| Surface engaging content (often fake) | Surface genuine creator content |
| Heavy recommendation bias (favor popular creators) | Fair ranking (new creators get chance) |
| Engagement-bait detection (late) | Engagement-bait prevention (early) |
| Trap users in feed | Respectful feed (stop after 30 min) |
| Monetize attention | Monetize value creation |

