-- Deal Room Messages Schema
-- Implements real-time chat for deal negotiation rooms

CREATE TABLE IF NOT EXISTS deal_room_messages (
    id                  BIGSERIAL PRIMARY KEY,
    deal_room_id        BIGINT NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
    sender_user_id      BIGINT NOT NULL REFERENCES users(id),
    message             TEXT NOT NULL CHECK (LENGTH(message) > 0 AND LENGTH(message) <= 5000),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient chronological fetches
CREATE INDEX idx_drm_room_created ON deal_room_messages(deal_room_id, created_at ASC);

-- Index for user activity tracking
CREATE INDEX idx_drm_sender ON deal_room_messages(sender_user_id, created_at DESC);

-- Enable fast cleanup of old messages (if data retention policy is applied)
CREATE INDEX idx_drm_created ON deal_room_messages(created_at DESC)
    WHERE created_at < (NOW() - INTERVAL '6 months');
