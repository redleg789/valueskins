# Nexus Production Readiness - Part 34: Scaling Notifications, DMs, Comments

**Status**: MVP ✓ | Production-Ready ⏳

---

## PART 34: NOTIFICATIONS AT SCALE

### Current State (MVP)
- In-memory notifications array
- Server-side polling (mark-as-read, create)
- Fetched on 5-second intervals
- All user notifications returned (pagination missing)

### Production Gaps

| Component | MVP | Need | Timeline | Cost |
|-----------|-----|------|----------|------|
| Database persistence | In-memory | PostgreSQL table | 1 week | $0 (Supabase free) |
| Push notifications | None | FCM/APNs | 2 weeks | $5-50K/mo scale |
| Filtering/unread | Basic | Full filter API | 3 days | $0 |
| Pagination | None | Cursor-based | 2 days | $0 |
| Real-time updates | 5-sec polling | WebSocket/SSE | 1 week | $500-5K/mo |
| Rate limiting | None | Per-user quota | 2 days | $0 |
| Retention policy | Unlimited | 90-day cleanup | 2 days | $0 |

### Production Implementation

#### 1. Database Schema
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,  -- 'like', 'comment', 'follow', 'mention', 'reply'
  actor_id UUID NOT NULL REFERENCES users(id),
  actor_name TEXT NOT NULL,
  actor_avatar TEXT,
  post_id UUID REFERENCES posts(id),
  post_content TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  read BOOLEAN DEFAULT FALSE,
  
  INDEX idx_user_created (user_id, created_at DESC),
  INDEX idx_read_filter (user_id, read),
  CONSTRAINT notify_self_protection CHECK (user_id != actor_id)
);

-- Auto-delete old notifications (GDPR compliance)
CREATE TABLE notification_cleanup_queue (
  user_id UUID PRIMARY KEY,
  last_cleanup TIMESTAMP DEFAULT NOW(),
  deletion_age_days INT DEFAULT 90
);

-- Cron job: DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '90 days'
```

#### 2. Real-Time Push (WebSocket vs. Server-Sent Events)

**Option A: WebSocket (Choose this for Nexus)**
```typescript
// Server: /pages/api/notifications/subscribe.ts
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ noServer: true });
const userConnections = new Map<string, Set<WebSocket>>();

// On connection: client sends user_id, server subscribes to notifications channel
// On notification event: broadcast to all user's connections
// Keeps connection alive with heartbeat (30-second ping)

Benefits:
- Low latency (< 100ms)
- Full duplex (server can push instantly)
- Can handle 100K+ concurrent connections
- Used by: Discord, Slack, Meta

Drawbacks:
- Requires connection pooling (Redis pub/sub for multi-server)
- Must handle reconnection + missed messages
- Heavier infrastructure cost (~$500-5K/mo for production scale)
```

**Option B: Server-Sent Events (SSE)**
```typescript
// Client: new EventSource('/api/notifications/stream')
// Server keeps connection open, sends notifications as events
// Easier than WebSocket (HTTP protocol), but half-duplex (server → client only)
// Good for 1-10K users, not 100K+
```

**Recommendation**: Start with 5-second polling (current), upgrade to WebSocket when user base hits 10K.

#### 3. Notification Types & Rules

```typescript
// Notification creation triggers:
const NotificationRules = {
  'like': {
    trigger: 'User A likes User B's post',
    actor: 'User A',
    recipient: 'User B (post author)',
    batch: true,  // Combine 5+ likes into single "5 people liked your post"
    dedup_window: 60 * 60 * 1000,  // Don't notify twice within 1 hour
  },
  'comment': {
    trigger: 'User A comments on User B's post',
    actor: 'User A',
    recipient: 'User B (post author)',
    batch: false,
    dedup_window: 0,  // Always notify (each comment is unique)
  },
  'follow': {
    trigger: 'User A follows User B',
    actor: 'User A',
    recipient: 'User B',
    batch: true,  // "10 new followers"
    dedup_window: 0,
  },
  'reply': {
    trigger: 'User A replies to User B's comment',
    actor: 'User A',
    recipient: 'User B (comment author)',
    batch: false,
    dedup_window: 0,
  },
  'mention': {
    trigger: 'User A mentions User B in post/comment',
    actor: 'User A',
    recipient: 'User B',
    batch: false,
    dedup_window: 0,
  },
};

// Avoid notification spam:
if (lastNotification[type][actor][recipient] && 
    Date.now() - lastNotification[type][actor][recipient] < dedup_window) {
  return; // Skip notification
}
```

#### 4. Rate Limiting Notifications
```
Rule: Prevent notification flood (abuse, bugs)

Per-user limits:
- Max 100 notifications/day
- Max 10 notifications/minute
- Max 1 notification/second from same actor

Implementation:
- Use Redis counter: `notifications:user_123:day` (TTL 24h)
- If counter > 100, drop notification (log for investigation)
- Critical notifications (follow requests) bypass limits
```

#### 5. Notification Retention
```
Rule: Delete old notifications (GDPR, storage optimization)

Retention:
- Keep all notifications 90 days (audit trail)
- Archive notifications 90+ days to cold storage (S3)
- Delete permanently after 2 years

Implementation:
- Cron job: daily cleanup at 2 AM UTC
- DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '90 days'
- Run VACUUM ANALYZE after delete (reclaim storage)
```

---

## PART 35: DIRECT MESSAGING AT SCALE

### Current State (MVP)
- In-memory conversations array
- In-memory messages array
- 3-second polling for new messages
- Message list returned in full (no pagination)

### Production Gaps

| Component | MVP | Need | Timeline | Cost |
|-----------|-----|------|----------|------|
| Database persistence | In-memory | PostgreSQL | 1 week | $0 |
| Message encryption | None | TLS only | 2 days | $0 |
| Typing indicators | None | WebSocket | 1 week | $0 |
| Read receipts | Basic | Full UI | 3 days | $0 |
| Message search | None | Full-text index | 1 week | $0 |
| Media upload | None | S3 + preview | 1 week | $50-500/mo |
| Reactions/emojis | None | Emoji picker | 2 days | $0 |
| Message deletion | None | Soft delete | 1 day | $0 |
| Group DMs | None | Conversation.participants[] | 1 week | $0 |
| Real-time delivery | 3-sec poll | WebSocket/Redis | 1 week | $500-5K/mo |

### Production Implementation

#### 1. Database Schema
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  participants UUID[] NOT NULL,  -- ARRAY of user IDs
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CHECK (array_length(participants, 1) >= 2),
  CONSTRAINT unique_conversation UNIQUE (participants)  -- No duplicate 1-to-1 convos
);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  attachment_url TEXT,  -- Image/video URL
  created_at TIMESTAMP DEFAULT NOW(),
  edited_at TIMESTAMP,
  deleted_at TIMESTAMP,  -- Soft delete
  
  INDEX idx_conversation_created (conversation_id, created_at DESC),
  INDEX idx_search (conversation_id, content),  -- For full-text search
);

-- Read receipts per-user
CREATE TABLE message_read_receipts (
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  read_at TIMESTAMP,
  
  PRIMARY KEY (message_id, user_id),
  INDEX idx_unread (user_id, read_at) WHERE read_at IS NULL
);

-- Typing indicators (ephemeral, not persisted)
-- Stored in Redis: "typing:conv_123:user_456" = expires in 3 seconds
```

#### 2. Real-Time Message Delivery

**Flow**:
1. Client A sends message via POST `/api/messages/send`
2. Server saves to PostgreSQL
3. Server publishes to Redis channel: `messages:conv_123`
4. WebSocket server subscribes to Redis channel
5. Broadcast to all users in conversation (Client B receives < 100ms)
6. Client B receives push notification (if offline)

**Code**:
```typescript
// Server: messages/send
const newMessage = await db.insert('messages', { conversation_id, sender_id, content });

// Publish to Redis
redis.publish(`messages:${conversation_id}`, JSON.stringify(newMessage));

// Push notification
await firebase.messaging().sendMulticast({
  tokens: getDeviceTokens(conversation.participants.filter(p => p !== sender_id)),
  notification: { title: senderName, body: messagePreview },
  data: { conversation_id, message_id: newMessage.id },
});
```

#### 3. Message Reactions & Emojis
```sql
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  emoji TEXT NOT NULL,  -- '❤️', '🔥', etc.
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE (message_id, user_id, emoji)  -- Only one reaction per user per emoji
);

-- Query: Get all reactions on a message
SELECT emoji, COUNT(*) as count
FROM message_reactions
WHERE message_id = 'msg_123'
GROUP BY emoji
ORDER BY count DESC;
```

#### 4. Conversation Unread Count
```typescript
// Current unread count for user
SELECT conversation_id, COUNT(*) as unread_count
FROM messages m
LEFT JOIN message_read_receipts r ON m.id = r.message_id AND r.user_id = $1
WHERE m.conversation_id = ANY(
  SELECT id FROM conversations WHERE $1 = ANY(participants)
)
AND r.read_at IS NULL
AND m.sender_id != $1
GROUP BY conversation_id;
```

#### 5. Search Messages
```sql
-- Enable full-text search
ALTER TABLE messages ADD COLUMN search_vector tsvector;

CREATE INDEX idx_search_vector ON messages USING gin(search_vector);

-- Create trigger to auto-update search vector
CREATE TRIGGER messages_search_update BEFORE INSERT OR UPDATE ON messages
FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(search_vector, 'pg_catalog.english', content);

-- Query
SELECT * FROM messages
WHERE conversation_id = 'conv_123'
AND search_vector @@ plainto_tsquery('english', 'nike campaign')
LIMIT 50;
```

#### 6. Typing Indicators (Ephemeral, Redis)
```typescript
// Client: User starts typing
fetch('/api/messages/typing', {
  method: 'POST',
  body: JSON.stringify({ conversation_id, user_id })
});

// Server: Store in Redis (3-second TTL)
redis.setex(`typing:${conversation_id}:${user_id}`, 3, '1');

// WebSocket: Broadcast typing status
// Periodically (every 500ms):
const typing = redis.keys(`typing:${conversation_id}:*`);
// Send to all users in conversation: "Sarah is typing..."
```

---

## PART 36: COMMENTS AT SCALE

### Current State (MVP)
- In-memory comments per post
- Flat structure (no nested replies)
- No comment editing/deletion
- No pagination

### Production Gaps

| Component | MVP | Need | Timeline | Cost |
|-----------|-----|------|----------|------|
| Database persistence | In-memory | PostgreSQL | 1 week | $0 |
| Nested replies | Flat | Tree structure (closure table) | 1 week | $0 |
| Comment threading | None | Show reply chains | 1 week | $0 |
| Comment deletion | None | Soft delete + "deleted" marker | 1 day | $0 |
| Comment editing | None | Edit + show "edited" label | 2 days | $0 |
| Comment pagination | None | Cursor-based (newest first) | 2 days | $0 |
| Comment moderation | None | Flag/report button | 2 days | $0 |
| Comment search | None | Full-text index | 1 week | $0 |
| Mention notifications | Stub | Parse @mentions, create notifications | 1 week | $0 |
| Like on comments | None | Comment likes + UI | 2 days | $0 |

### Production Implementation

#### 1. Database Schema (Nested Replies)
```sql
-- Closure table pattern for nested comments
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  author_name TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,  -- For replies
  created_at TIMESTAMP DEFAULT NOW(),
  edited_at TIMESTAMP,
  deleted_at TIMESTAMP,  -- Soft delete
  likes INT DEFAULT 0,
  
  INDEX idx_post_created (post_id, parent_comment_id, created_at DESC),
  INDEX idx_author_created (author_id, created_at DESC),
  CONSTRAINT no_delete_edit CHECK (deleted_at IS NULL OR edited_at IS NULL)  -- Can't edit deleted
);

-- Reply tree closure table (optional, for fast ancestor queries)
CREATE TABLE comment_hierarchy (
  ancestor_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  descendant_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  depth INT NOT NULL,
  
  PRIMARY KEY (ancestor_id, descendant_id),
  INDEX idx_descendants (ancestor_id)
);

-- Trigger: Auto-insert into closure table when comment inserted
CREATE TRIGGER populate_comment_hierarchy
AFTER INSERT ON comments
FOR EACH ROW
WHEN (NEW.parent_comment_id IS NOT NULL)
EXECUTE FUNCTION insert_comment_ancestors(NEW.id, NEW.parent_comment_id);
```

#### 2. Comment Thread Queries

```typescript
// Get all comments on a post (with replies collapsed)
SELECT * FROM comments
WHERE post_id = $1 AND parent_comment_id IS NULL
ORDER BY created_at DESC
LIMIT 20;

// Get replies to a comment
SELECT * FROM comments
WHERE parent_comment_id = $1
ORDER BY created_at ASC;

// Get full thread (comment + all nested replies)
WITH RECURSIVE comment_tree AS (
  SELECT id, post_id, author_id, content, created_at, parent_comment_id, 0 as depth
  FROM comments
  WHERE id = $1
  
  UNION ALL
  
  SELECT c.id, c.post_id, c.author_id, c.content, c.created_at, c.parent_comment_id, ct.depth + 1
  FROM comments c
  INNER JOIN comment_tree ct ON c.parent_comment_id = ct.id
  WHERE c.deleted_at IS NULL
)
SELECT * FROM comment_tree ORDER BY depth, created_at ASC;
```

#### 3. Mention Parsing & Notifications

```typescript
// Parse mentions in comment text
const mentions = comment.content.match(/@[\w]+/g) || [];

for (const mention of mentions) {
  const handle = mention.slice(1);  // Remove @
  const mentionedUser = await db.query('SELECT id FROM users WHERE handle = $1', [handle]);
  
  if (mentionedUser) {
    // Create mention notification
    await db.insert('notifications', {
      type: 'mention',
      actor_id: author_id,
      recipient_id: mentionedUser.id,
      post_id: post_id,
      message: `mentioned you in a comment`
    });
  }
}
```

#### 4. Comment Moderation

```sql
CREATE TABLE comment_flags (
  id UUID PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL,  -- 'spam', 'harassment', 'nsfw', 'other'
  created_at TIMESTAMP DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  
  INDEX idx_unresolved (resolved, created_at DESC)
);

-- Show comment in feed until 10+ flags or manual moderation
SELECT * FROM comments
WHERE post_id = $1
AND (
  SELECT COUNT(*) FROM comment_flags WHERE comment_id = comments.id
) < 10
ORDER BY created_at DESC;
```

---

## PART 37: RATE LIMITING NOTIFICATIONS/DMS/COMMENTS

```typescript
// Redis-based rate limiting
const LIMITS = {
  notifications: {
    per_user_per_day: 100,
    per_user_per_minute: 10,
    per_actor_per_user_per_hour: 5,  // Max 5 notifications from User A to User B per hour
  },
  messages: {
    per_user_per_minute: 30,  // Max 30 messages/minute
    per_conversation_per_minute: 60,  // But allow concurrent conversations
  },
  comments: {
    per_user_per_minute: 10,
    per_post_per_minute: 100,  // Post can get 100 comments/minute (popular post)
  },
};

async function checkRateLimit(key: string, limit: number, window_seconds: number) {
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, window_seconds);
  }
  return count <= limit;
}

// Check before creating notification
const key = `notifications:${recipient_id}:day`;
if (!await checkRateLimit(key, 100, 86400)) {
  return res.status(429).json({ error: 'Rate limit exceeded' });
}
```

---

## PART 38: DEPLOYMENT CHECKLIST (NOTIFICATIONS/DMS/COMMENTS)

**Before Production**:
```
Notifications:
☐ PostgreSQL schema created + tested
☐ Cleanup cron job scheduled (90-day retention)
☐ Deduplication logic tested (prevent notification spam)
☐ Rate limiting configured (100/day, 10/minute)
☐ Unread count accurate after batch reads
☐ Push notifications integrated (FCM/APNs)
☐ Monitoring: Unread notifications per user, notification lag

Direct Messages:
☐ PostgreSQL conversation + message tables created
☐ Read receipts working (shows when user read message)
☐ Typing indicators via Redis (3-second TTL)
☐ Message search full-text indexed
☐ Conversation list shows unread count badge
☐ Pagination working (load older messages on scroll)
☐ Media upload working (images/videos in DMs)
☐ Rate limiting: 30 messages/minute per user
☐ Monitoring: Message delivery latency, unread DM count

Comments:
☐ Nested replies working (closure table)
☐ Comment threading UI shows replies properly
☐ Mention parsing creates @mention notifications
☐ Comment moderation flags working
☐ Comment search via full-text index
☐ Pagination (show top 20 comments, "load more")
☐ Comment deletion soft-deletes correctly
☐ Rate limiting: 10 comments/minute per user
☐ Monitoring: Comment count per post, spam detection

All Features:
☐ WebSocket/SSE connection handling tested
☐ Graceful degradation (fallback to polling if WebSocket fails)
☐ Memory leaks checked (old connections cleaned up)
☐ Database indexes optimized (EXPLAIN ANALYZE on queries)
☐ Query timeouts set (no query > 5 seconds)
☐ Monitoring alerts configured (notification lag, DM lag, comment spam)
☐ Backup strategy (notifications/messages/comments backed up daily)
☐ GDPR: Message deletion 30 days after account delete
☐ GDPR: User can export all messages/comments
```

---

## Summary

**MVP → Production Timeline**: 4-6 weeks

**Phase 1 (Week 1-2)**: Database, basic persistence, polling
**Phase 2 (Week 2-3)**: WebSocket/real-time, push notifications
**Phase 3 (Week 3-4)**: Moderation, search, threading
**Phase 4 (Week 4-5)**: Scale testing, monitoring, optimization
**Phase 5 (Week 5-6)**: GDPR, compliance, incident response

**Estimated Cost at 100K users**:
- Database: $200-500/mo (Supabase)
- WebSocket server: $1-5K/mo (Vercel, AWS, custom)
- S3 media storage: $100-1K/mo
- Push notifications: $100-500/mo
- Monitoring: $200-500/mo

**Total**: ~$2-8K/mo for 100K users

If Meta adopts Nexus: Your cost is FREE (Meta's infrastructure), but Nexus becomes a white-label component + ValueSkins integration = $10M+ valuation (licensing fees).

---

**Status**: ✓ MVP complete | ⏳ Production readiness plan complete | ⚠️ Scale testing pending
