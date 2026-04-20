# Nexus ML System - Frontend Integration Guide

## API Endpoints

### 1. Score Post (Ethical Review)
```
POST /score
Request:
  {
    "content": "Just started therapy and feeling better",
    "user_id": "user_123"
  }

Response:
  {
    "therapeutic": 0.85,
    "harmful": 0.05,
    "converter": 0.30,
    "allowed": true,
    "confidence": 0.85,
    "model_version": "v1"
  }
```

**Usage in frontend**:
```typescript
// nexus/frontend/src/lib/ethicalGuards.ts
export async function checkPost(content: string, userId: string) {
  const response = await fetch('http://localhost:8000/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, user_id: userId })
  });
  
  const result = await response.json();
  
  if (!result.allowed) {
    return {
      blocked: true,
      reason: result.confidence > 0.9 ? 'Harmful content detected' : 'Content needs review'
    };
  }
  
  return { blocked: false };
}
```

### 2. Get Personalized Feed
```
GET /feed/{user_id}?num_posts=10

Response:
  {
    "posts": [
      {
        "post_id": "post_001",
        "content": "Started therapy and it changed my life...",
        "therapeutic_score": 0.92,
        "is_genuine": true,
        "ranking_score": 0.88
      },
      ...
    ]
  }
```

**Usage in frontend**:
```typescript
// nexus/frontend/src/pages/feed.tsx
export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [userId] = useAuth();

  useEffect(() => {
    async function loadFeed() {
      const response = await fetch(`http://localhost:8000/feed/${userId}?num_posts=10`);
      const data = await response.json();
      setPosts(data.posts);
    }
    loadFeed();
  }, [userId]);

  return (
    <div>
      {posts.map(post => (
        <PostCard
          key={post.post_id}
          content={post.content}
          therapeuticScore={post.therapeutic_score}
          isGenuine={post.is_genuine}
          onView={() => logInteraction(userId, post.post_id, 'viewed')}
          onLike={() => logInteraction(userId, post.post_id, 'liked')}
        />
      ))}
    </div>
  );
}
```

### 3. Log User Interaction
```
POST /interaction
Request:
  {
    "user_id": "user_123",
    "post_id": "post_001",
    "interaction_type": "liked"  // or "viewed", "shared"
  }

Response:
  { "status": "logged" }
```

**Usage in frontend**:
```typescript
async function logInteraction(userId: string, postId: string, type: string) {
  await fetch('http://localhost:8000/interaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      post_id: postId,
      interaction_type: type
    })
  });
}
```

### 4. Submit User Correction (for retraining)
```
POST /feedback
Request:
  {
    "text": "Some harmful content the model misclassified",
    "predicted_label": 1,  // model said genuine (1=genuine, 0=harmful)
    "correct_label": 0,     // but actually harmful
    "user_id": "user_123"
  }

Response:
  { "status": "recorded" }
```

**Usage in frontend** (admin/moderator):
```typescript
async function reportIncorrectClassification(
  postContent: string,
  modelPredictionWasAllowed: boolean,
  actuallyHarmful: boolean,
  userId: string
) {
  await fetch('http://localhost:8000/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: postContent,
      predicted_label: modelPredictionWasAllowed ? 1 : 0,
      correct_label: actuallyHarmful ? 0 : 1,
      user_id: userId
    })
  });
}
```

### 5. System Metrics
```
GET /metrics

Response:
  {
    "performance": {
      "p50_latency_ms": 45,
      "p95_latency_ms": 120,
      "p99_latency_ms": 250,
      "error_rate": 0.001,
      "total_inferences": 50000
    },
    "data_distribution": {
      "samples": 1200,
      "therapeutic_mean": 0.62,
      "therapeutic_std": 0.18,
      "harmful_mean": 0.28,
      "harmful_std": 0.22
    },
    "model_accuracy_from_feedback": 0.94,
    "retrain_needed": false
  }
```

## Setup Instructions

### 1. Install dependencies
```bash
cd nexus/ml
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Train baseline model
```bash
python ml_pipeline.py
# Output: Models saved to ./models/v1/
```

### 3. Start API server
```bash
python api.py
# Output: Uvicorn running on http://localhost:8000
```

### 4. Test endpoints
```bash
# Score a post
curl -X POST http://localhost:8000/score \
  -H "Content-Type: application/json" \
  -d '{"content": "Started therapy today", "user_id": "test_user"}'

# Get feed
curl http://localhost:8000/feed/test_user

# Check health
curl http://localhost:8000/health
```

## Configuration

### Model Version
Change in `api.py`:
```python
inference = InferenceServer(model_version="v1")  # or "v2", "v3", etc.
```

### Retraining Threshold
Change in `monitoring.py`:
```python
def should_retrain(self, min_corrections: int = 100):  # trigger at 100 corrections
```

### Ranking Weights
Change in `recommendation_engine.py`:
```python
def rank_candidates(self, user_id, candidate_posts):
    # Primary: therapeutic value
    score = therapeutic * 0.5
    # Secondary: authenticity
    score += (label * 1.0 if label else 0) * 0.3
    # Tertiary: feedback accuracy
    score += feedback_ratio * 0.2
```

## Monitoring Production

### Check system health
```bash
curl http://localhost:8000/health
curl http://localhost:8000/metrics
```

### Monitor latency (p99 should stay <200ms)
```bash
# In production, integrate with CloudWatch/Datadog/New Relic
# Look for alerts when p99_latency_ms > 500
```

### Check for data/model drift
```bash
curl http://localhost:8000/metrics | jq '.data_distribution'
curl http://localhost:8000/metrics | jq '.model_accuracy_from_feedback'
```

### Trigger retraining when accuracy drops
```bash
# When retrain_needed = true:
python ml_pipeline.py  # Trains new model (v2)

# A/B test new model
# If better: deploy v2 as production
# If worse: keep v1
```

## Frontend Integration Files to Update

### 1. nexus/frontend/src/lib/ethicalGuards.ts
```typescript
// Replace hardcoded guards with API call
export async function runMLEthicalGuards(content: string, userId: string) {
  const response = await fetch('http://localhost:8000/score', {
    method: 'POST',
    body: JSON.stringify({ content, user_id: userId })
  });
  return response.json();
}
```

### 2. nexus/frontend/src/pages/feed.tsx
```typescript
// Fetch personalized feed from API
async function loadFeed(userId) {
  const response = await fetch(`http://localhost:8000/feed/${userId}`);
  const { posts } = await response.json();
  return posts;
}
```

### 3. nexus/frontend/src/pages/post-creation.tsx
```typescript
// Before submitting post, check with API
const result = await runMLEthicalGuards(content, userId);
if (!result.allowed) {
  showError(result.reason);
} else {
  submitPost(content);
}
```

### 4. nexus/frontend/src/components/PostCard.tsx
```typescript
// Log interactions for ranking updates
<button onClick={() => logInteraction(userId, postId, 'viewed')} />
<button onClick={() => logInteraction(userId, postId, 'liked')} />
```

## Production Checklist

- [ ] API server deployed (Cloud Run / Lambda / EC2)
- [ ] Model weights uploaded to cloud storage (GCS / S3)
- [ ] Feature store database configured (PostgreSQL)
- [ ] Monitoring alerts set up (latency, drift, errors)
- [ ] Feedback collection enabled (moderator dashboard)
- [ ] A/B testing framework ready (Statsig / LaunchDarkly)
- [ ] Retraining pipeline scheduled (nightly)
- [ ] Data retention policies enforced (30-day logs, 7-year audit)
- [ ] Cost tracking enabled (billing alerts)
- [ ] Disaster recovery tested (model rollback, DB restore)

## Performance Targets

| Metric | Target | Action if exceeded |
|--------|--------|-------------------|
| p99 latency | <200ms | Optimize model, add caching |
| p50 latency | <50ms | Baseline, good |
| Error rate | <0.5% | Investigate failure mode |
| Accuracy | >90% | Retrain if drops |
| Throughput | >100 req/s | Scale inference |
| Data drift | None | Investigate distribution shift |
| Model drift | None | Retrain from new feedback |

