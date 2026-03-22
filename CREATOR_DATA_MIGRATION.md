# Creator Data Source Migration Guide

**Current Status**: MVP with mock data
**Target**: Real Instagram, YouTube, TikTok, LinkedIn API data when platforms adopt

## Architecture Overview

The ValueSkins marketplace uses a pluggable creator data source system that supports seamless switching between mock data (MVP) and real social platform APIs (production).

### Components

#### Backend: `creator_source.rs`
- **`CreatorDataSource` trait**: Abstract interface for any creator data provider
  - `search_creators()` - Query creators by platform, profession, followers, etc.
  - `get_creator()` - Fetch single creator profile
  - `get_creators_by_profession()` - Filter by value skin/profession
  - `refresh_creator()` - Update creator data from source
  - `source_name()` - Logging identifier
  - `is_mock()` - Return true if using mock data

#### Implementations

**MockCreatorSource** (Currently Active)
- Hardcoded creator profiles for MVP testing
- Instagram, YouTube, TikTok, LinkedIn sample data
- No API calls, instant response
- Used until platforms officially adopt ValueSkins

**InstagramAPI** (Stub - Ready to implement)
- Fetches creator profiles from Instagram Graph API v18.0
- Calculates engagement rate from recent media
- Caches profiles in PostgreSQL
- Synced via background job

**YouTubeAPI** (Stub - Ready to implement)
- YouTube Data API v3 integration
- Channel analytics and subscriber metrics
- Video engagement tracking

**TikTokAPI** (Stub - Ready to implement)
- TikTok Business API
- Follower count, engagement rate, video analytics

**LinkedInAPI** (Stub - Ready to implement)
- LinkedIn Official Partner APIs
- Creator profile, follower metrics, engagement

#### Frontend: `useCreators.ts`
- React hooks that call backend creator endpoints
- Three main hooks:
  - `useCreators()` - Search/filter creators
  - `useCreator()` - Get single profile
  - `useCreatorsByProfession()` - Filter by profession
- Transparent switching: same hooks work whether backend uses mock or real data

## API Endpoints

All endpoints available at `/api/v1/creators/*`

### Search Creators
```
GET /api/v1/creators/search
?platform=instagram&profession=Technology&limit=20&offset=0
```
Response includes `is_mock` and `data_source` fields for debugging.

### Get Creator
```
GET /api/v1/creators/{platform}/{creator_id}
```

### List by Profession
```
GET /api/v1/creators/{platform}/profession/{profession}?limit=20
```

## Migration Path

### Phase 1: MVP (Current)
- ✅ Mock creator data in `MockCreatorSource`
- ✅ API endpoints return `is_mock: true`
- ✅ Frontend uses real API calls (to mock backend)
- No external dependencies, instant development

### Phase 2: API Integration (When platforms adopt)

For each platform, implement:

1. **Update `creator_source.rs`**
   - Create `InstagramAPI`, `YouTubeAPI`, etc. structs
   - Implement `CreatorDataSource` trait
   - Add database schema for caching

2. **Add background sync job** (`backend/shared/src/workers/creator_sync_worker.rs`)
   ```rust
   // Runs every 6 hours, fetches all profiles from Instagram API
   // Stores in `instagram_creators` table
   // Falls back to cache if API unavailable
   ```

3. **Update environment configuration**
   ```bash
   CREATOR_DATA_SOURCE=instagram  # or youtube, tiktok, linkedin
   INSTAGRAM_ACCESS_TOKEN=<token>
   INSTAGRAM_BUSINESS_ACCOUNT_ID=<id>
   YOUTUBE_API_KEY=<key>
   TIKTOK_API_KEY=<key>
   LINKEDIN_API_KEY=<key>
   ```

4. **Switch data source**
   ```rust
   // In api_gateway/src/main.rs
   let source = if env::var("CREATOR_DATA_SOURCE") == Ok("instagram".to_string()) {
       Arc::new(InstagramAPI::new(/* config */))
   } else {
       Arc::new(MockCreatorSource::new())
   };
   ```

5. **Test seamless handoff**
   - Deploy with new data source
   - Frontend makes same API calls
   - Existing UI works unchanged
   - `is_mock` flag confirms which backend is active

### Phase 3: Multi-Platform Support
- Run multiple data sources simultaneously
- Route `/api/v1/creators/search?platform=instagram` → InstagramAPI
- Route `/api/v1/creators/search?platform=youtube` → YouTubeAPI
- Unified response format for all platforms

## Database Schema (For Real APIs)

```sql
-- Instagram creators
CREATE TABLE instagram_creators (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  name TEXT,
  biography TEXT,
  followers_count BIGINT,
  media_count BIGINT,
  engagement_rate FLOAT,
  verified BOOLEAN,
  profile_picture_url TEXT,
  value_skin TEXT,
  profession TEXT,
  estimated_rate INT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- YouTube channels
CREATE TABLE youtube_channels (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  subscribers BIGINT,
  view_count BIGINT,
  video_count INT,
  engagement_rate FLOAT,
  thumbnail_url TEXT,
  verified BOOLEAN,
  profession TEXT,
  estimated_rate INT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TikTok creators
CREATE TABLE tiktok_creators (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  nickname TEXT,
  bio TEXT,
  followers BIGINT,
  following BIGINT,
  video_count BIGINT,
  engagement_rate FLOAT,
  avatar_url TEXT,
  verified BOOLEAN,
  profession TEXT,
  estimated_rate INT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn professionals
CREATE TABLE linkedin_professionals (
  id TEXT PRIMARY KEY,
  profile_url TEXT NOT NULL UNIQUE,
  name TEXT,
  headline TEXT,
  followers BIGINT,
  connection_count INT,
  engagement_rate FLOAT,
  profile_picture_url TEXT,
  verified BOOLEAN,
  profession TEXT,
  estimated_rate INT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creator sync jobs (for monitoring)
CREATE TABLE creator_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT, -- running, success, failed
  error_message TEXT,
  creators_synced INT,
  next_run TIMESTAMP WITH TIME ZONE
);
```

## Background Sync Worker

```rust
// backend/shared/src/workers/creator_sync_worker.rs
#[tokio::task]
async fn sync_instagram_creators(
    api: Arc<InstagramAPI>,
    pool: PgPool,
    cache: Arc<RedisCache>,
) {
    loop {
        tokio::time::sleep(Duration::from_secs(6 * 3600)).await; // Every 6 hours

        match api.fetch_all_creators().await {
            Ok(creators) => {
                for creator in creators {
                    let _ = api.cache_creator(&creator).await;
                }
                cache.set(
                    "instagram_sync_last_ok",
                    Utc::now().to_rfc3339(),
                    Duration::from_secs(24 * 3600),
                ).await.ok();
            }
            Err(e) => {
                tracing::error!("Instagram sync failed: {}", e);
                // Don't die, use cached data
            }
        }
    }
}
```

## Feature Flags & A/B Testing

```rust
// Use feature flags during transition
#[cfg(feature = "instagram_api_enabled")]
use instagram_api::InstagramAPI;

#[cfg(not(feature = "instagram_api_enabled"))]
use creator_source::MockCreatorSource;

// Gradually roll out real API to subset of users
if should_use_real_api(user_id) {  // Gradual rollout function
    CreatorSourceFactory::create(true)
} else {
    CreatorSourceFactory::create(false)
}
```

## Testing Strategy

### Unit Tests
- Mock data deterministic and repeatable
- Test filtering, sorting, pagination on mock data

### Integration Tests (Real APIs - Staging Only)
- Cache tests to ensure fallback works if API fails
- Rate limit handling for Instagram/YouTube/TikTok/LinkedIn API limits
- Concurrent request handling

### Load Tests
- Mock data: no external latency, focus on database
- Real API: respect rate limits, test cache hit rates

## Monitoring & Alerting

```yaml
# prometheus-local.yml
- alert: CreatorDataSourceDown
  expr: creator_api_request_errors_total > 10
  annotations:
    summary: "Creator data source unreachable"
    # Falls back to cache, but alert ops team

- alert: SyncJobFailed
  expr: creator_sync_job_status{status="failed"} == 1
  annotations:
    summary: "Creator profile sync failed for 6 hours"
```

## Rollback Plan

If real API integration causes issues:

1. **Set environment variable**: `CREATOR_DATA_SOURCE=mock`
2. **Redeploy API gateway**
3. **Frontend sees `is_mock: true` in response** → no code changes needed
4. Investigate issue asynchronously

## Cost Estimation

| Platform | API Type | Cost | Annual Budget |
|----------|----------|------|---|
| Instagram | Graph API | Free (with Business account) | $0 |
| YouTube | Data API | $0 for public data | $0 |
| TikTok | Business API | ~$0.001 per request | ~$86/year for 100k/day |
| LinkedIn | Partner APIs | Varies | Request quote |

## Implementation Checklist

- [ ] Create `InstagramAPI` struct implementing `CreatorDataSource`
- [ ] Add Instagram creator table migration
- [ ] Implement background sync worker for Instagram
- [ ] Test endpoint returns real data with `is_mock: false`
- [ ] Add Instagram to environment setup docs
- [ ] Set up API key rotation & expiry monitoring
- [ ] Create YouTube implementation
- [ ] Create TikTok implementation
- [ ] Create LinkedIn implementation
- [ ] Load test with real APIs
- [ ] Monitor sync job health metrics
- [ ] Document rate limiting behavior
- [ ] Set up fallback to mock if API fails
- [ ] A/B test real API with subset of users

## FAQ

**Q: How do I test real API integration locally?**
A: Set `CREATOR_DATA_SOURCE=instagram` and provide real API credentials in `.env`. Backend will fetch live data.

**Q: What happens if Instagram API goes down?**
A: `refresh_creator()` returns error, but cache serves stale data. Frontend doesn't know or care.

**Q: Can I run multiple data sources simultaneously?**
A: Yes. Update router to dispatch `/creators/search?platform=instagram` to InstagramAPI, `/creators/search?platform=youtube` to YouTubeAPI, etc.

**Q: Do I need to change the frontend when switching data sources?**
A: No. Frontend calls the same endpoints regardless. `useCreators()` hook works with mock or real data.

**Q: What if Instagram rejects my access request?**
A: Stay on mock data indefinitely. The architecture supports this. Add monitoring to alert when real API becomes available.
