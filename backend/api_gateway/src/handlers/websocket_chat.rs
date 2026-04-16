//! WebSocket Chat Handler — real-time deal room messaging

use actix_web::{web, HttpRequest, HttpResponse};
use actix_ws::ArcMessage;
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::broadcast;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub id: String,
    pub deal_room_id: i64,
    pub sender_user_id: i64,
    pub sender_name: String,
    pub content: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub read: bool,
}

#[derive(Clone)]
pub struct ChatBroadcaster {
    tx: broadcast::Sender<Arc<ChatMessage>>,
}

impl ChatBroadcaster {
    pub fn new(capacity: usize) -> Self {
        let (tx, _) = broadcast::channel(capacity);
        Self { tx }
    }

    pub fn broadcast(&self, message: Arc<ChatMessage>) {
        let _ = self.tx.send(message);
    }

    pub fn subscribe(&self) -> broadcast::Receiver<Arc<ChatMessage>> {
        self.tx.subscribe()
    }
}

/// WebSocket chat endpoint: /ws/deal-rooms/{deal_room_id}
pub async fn ws_chat_handler(
    req: HttpRequest,
    path: web::Path<i64>,
    stream: web::Payload,
    broadcaster: web::Data<ChatBroadcaster>,
) -> Result<HttpResponse, actix_web::Error> {
    let deal_room_id = path.into_inner();

    // Verify user is participant in deal room (extract from JWT)
    // TODO: Extract user_id from JWT in req

    let (response, session, mut msg_stream) = actix_ws::handle(&req, stream)?;

    let mut tx = broadcaster.subscribe();
    let session = Arc::new(tokio::sync::Mutex::new(session));

    actix_web::rt::spawn({
        let session = session.clone();
        async move {
            while let Ok(msg) = tx.recv().await {
                if msg.deal_room_id == deal_room_id {
                    let json = serde_json::to_string(&*msg).unwrap_or_default();
                    let _ = session.lock().await.text(json).await;
                }
            }
        }
    });

    actix_web::rt::spawn({
        let session = session.clone();
        let broadcaster = broadcaster.clone();
        async move {
            while let Some(Ok(msg)) = msg_stream.next().await {
                match msg {
                    actix_ws::Message::Text(text) => {
                        // Parse incoming message
                        if let Ok(chat_msg) = serde_json::from_str::<ChatMessage>(&text) {
                            // Store in database
                            // TODO: INSERT INTO chat_messages (deal_room_id, sender_user_id, content, ...)

                            // Broadcast to all subscribers
                            broadcaster.broadcast(Arc::new(chat_msg));
                        }
                    },
                    actix_ws::Message::Close(_) => break,
                    _ => {},
                }
            }
        }
    });

    Ok(response)
}

/// Send message via HTTP (fallback if WebSocket unavailable)
#[derive(Debug, Deserialize)]
pub struct SendMessageRequest {
    pub deal_room_id: i64,
    pub content: String,
}

pub async fn send_message_http(
    req: web::Json<SendMessageRequest>,
    pool: web::Data<sqlx::PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    // Extract user_id from JWT
    // TODO: let user_id = get_user_id(&req)?;

    let user_id = 1i64; // Placeholder

    let chat_message = ChatMessage {
        id: uuid::Uuid::new_v4().to_string(),
        deal_room_id: req.deal_room_id,
        sender_user_id: user_id,
        sender_name: "Creator".to_string(), // Fetch from DB
        content: req.content.clone(),
        timestamp: chrono::Utc::now(),
        read: false,
    };

    // Store in database
    sqlx::query(
        r#"
        INSERT INTO chat_messages (deal_room_id, sender_user_id, content, created_at)
        VALUES ($1, $2, $3, NOW())
        "#
    )
    .bind(req.deal_room_id)
    .bind(user_id)
    .bind(&req.content)
    .execute(pool.get_ref())
    .await
    .ok();

    Ok(HttpResponse::Ok().json(chat_message))
}

/// Get chat history for deal room
pub async fn get_chat_history(
    deal_room_id: web::Path<i64>,
    pool: web::Data<sqlx::PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let deal_room_id = deal_room_id.into_inner();

    let messages: Vec<ChatMessage> = sqlx::query_as(
        r#"
        SELECT id, deal_room_id, sender_user_id, 'Creator' as sender_name, content, created_at as timestamp, FALSE as read
        FROM chat_messages
        WHERE deal_room_id = $1
        ORDER BY created_at ASC
        LIMIT 100
        "#
    )
    .bind(deal_room_id)
    .fetch_all(pool.get_ref())
    .await
    .unwrap_or_default();

    Ok(HttpResponse::Ok().json(messages))
}

/// Mark messages as read
#[derive(Debug, Deserialize)]
pub struct MarkReadRequest {
    pub message_ids: Vec<String>,
}

pub async fn mark_messages_read(
    req: web::Json<MarkReadRequest>,
    pool: web::Data<sqlx::PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    sqlx::query(
        "UPDATE chat_messages SET read = TRUE WHERE id = ANY($1)"
    )
    .bind(&req.message_ids)
    .execute(pool.get_ref())
    .await
    .ok();

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "status": "marked_read",
        "count": req.message_ids.len()
    })))
}

/// Typing indicator (transient, not stored)
#[derive(Debug, Deserialize)]
pub struct TypingIndicator {
    pub deal_room_id: i64,
    pub user_id: i64,
    pub is_typing: bool,
}

pub async fn send_typing_indicator(
    req: web::Json<TypingIndicator>,
    broadcaster: web::Data<ChatBroadcaster>,
) -> Result<HttpResponse, actix_web::Error> {
    // Broadcast typing event (special message type)
    // TODO: Send via WebSocket to all subscribers in deal_room_id
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "status": "typing_sent"
    })))
}
