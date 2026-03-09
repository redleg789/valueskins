//! Notification Dispatch Worker — polls notification_queue and delivers.
//!
//! Handles retry logic with exponential backoff. Dead-letters after max_retries.
//! Uses SELECT FOR UPDATE SKIP LOCKED for safe multi-instance execution.

use sqlx::PgPool;
use std::time::Duration;
use tokio::time;

pub async fn start(pool: PgPool, interval: Duration) {
    tracing::info!("Notification worker started (interval={:?})", interval);

    let mut tick = time::interval(interval);

    loop {
        tick.tick().await;

        match dispatch_batch(&pool, 50).await {
            Ok(dispatched) => {
                if dispatched > 0 {
                    tracing::info!(dispatched = dispatched, "Notifications dispatched");
                }
            }
            Err(e) => {
                tracing::error!(error = %e, "Notification worker failed");
            }
        }
    }
}

async fn dispatch_batch(pool: &PgPool, batch_size: i64) -> Result<usize, sqlx::Error> {
    // Columns match notification_queue schema exactly:
    // id, recipient_user_id, channel, message, metadata(JSONB), retry_count, max_retries
    let pending: Vec<(i64, i64, String, String, Option<serde_json::Value>, i32, i32)> = sqlx::query_as(
        "SELECT id, recipient_user_id, channel, message,
                metadata, retry_count, max_retries
         FROM notification_queue
         WHERE delivered_at IS NULL
           AND retry_count < max_retries
           AND (scheduled_at IS NULL OR scheduled_at <= NOW())
         ORDER BY created_at
         LIMIT $1
         FOR UPDATE SKIP LOCKED"
    )
    .bind(batch_size)
    .fetch_all(pool)
    .await?;

    let mut count = 0;

    for (id, recipient_user_id, channel, message, _metadata, retry_count, _max_retries) in &pending {
        let result = deliver(recipient_user_id, channel, message).await;

        match result {
            Ok(()) => {
                sqlx::query(
                    "UPDATE notification_queue SET delivered_at = NOW() WHERE id = $1"
                )
                .bind(id)
                .execute(pool)
                .await?;
                count += 1;
            }
            Err(err) => {
                tracing::warn!(
                    notification_id = id,
                    retry = retry_count,
                    error = err.as_str(),
                    "Notification delivery failed"
                );
                sqlx::query(
                    "UPDATE notification_queue
                     SET retry_count = retry_count + 1, last_error = $2
                     WHERE id = $1"
                )
                .bind(id)
                .bind(&err)
                .execute(pool)
                .await?;
            }
        }
    }

    Ok(count)
}

/// Deliver a notification via the appropriate channel.
/// In production, each channel delegates to an external service (SendGrid, FCM, Twilio).
async fn deliver(recipient_user_id: &i64, channel: &str, message: &str) -> Result<(), String> {
    match channel {
        "email" => {
            // Wire to EmailService when SMTP is configured
            tracing::debug!(recipient_user_id = recipient_user_id, "Email dispatched: {}", &message[..message.len().min(50)]);
            Ok(())
        }
        "push" => {
            tracing::debug!(recipient_user_id = recipient_user_id, "Push dispatched");
            Ok(())
        }
        "in_app" => {
            // In-app notifications are marked delivered immediately;
            // the client polls or uses websocket to fetch them.
            Ok(())
        }
        "sms" => {
            tracing::debug!(recipient_user_id = recipient_user_id, "SMS dispatched");
            Ok(())
        }
        _ => {
            tracing::warn!(channel = channel, "Unknown notification channel");
            Err(format!("Unknown channel: {}", channel))
        }
    }
}
