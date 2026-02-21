-- Notification queue for async event processing
-- Triggers insert here, background workers consume and send
CREATE TABLE IF NOT EXISTS notification_queue (
    id              BIGSERIAL PRIMARY KEY,
    recipient_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type      TEXT NOT NULL,
    payload         JSONB NOT NULL,
    is_sent         BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at         TIMESTAMPTZ,
    error_message   TEXT,
    retry_count     INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_queue_unsent ON notification_queue(is_sent, created_at)
    WHERE is_sent = FALSE;
CREATE INDEX IF NOT EXISTS idx_notif_queue_recipient ON notification_queue(recipient_user_id);
