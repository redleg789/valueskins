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
    _req: HttpRequest,
    _path: web::Path<i64>,
    _stream: web::Payload,
    _broadcaster: web::Data<ChatBroadcaster>,
) -> Result<HttpResponse, actix_web::Error> {
    Ok(HttpResponse::NotImplemented().json(serde_json::json!({
        "error": "WebSocket chat is disabled until participant auth is fully implemented"
    })))
}

/// Send message via HTTP (fallback if WebSocket unavailable)
#[derive(Debug, Deserialize)]
pub struct SendMessageRequest {
    pub deal_room_id: i64,
    pub content: String,
}

pub async fn send_message_http(
    _req: web::Json<SendMessageRequest>,
    _pool: web::Data<sqlx::PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    Ok(HttpResponse::NotImplemented().json(serde_json::json!({
        "error": "HTTP fallback chat is disabled until participant auth is fully implemented"
    })))
}

/// Get chat history for deal room
pub async fn get_chat_history(
    _deal_room_id: web::Path<i64>,
    _pool: web::Data<sqlx::PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    Ok(HttpResponse::NotImplemented().json(serde_json::json!({
        "error": "WebSocket chat history is disabled until participant auth is fully implemented"
    })))
}

/// Mark messages as read
#[derive(Debug, Deserialize)]
pub struct MarkReadRequest {
    pub message_ids: Vec<String>,
}

pub async fn mark_messages_read(
    _req: web::Json<MarkReadRequest>,
    _pool: web::Data<sqlx::PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    Ok(HttpResponse::NotImplemented().json(serde_json::json!({
        "error": "Message read receipts are disabled until participant auth is fully implemented"
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
    _req: web::Json<TypingIndicator>,
    _broadcaster: web::Data<ChatBroadcaster>,
) -> Result<HttpResponse, actix_web::Error> {
    Ok(HttpResponse::NotImplemented().json(serde_json::json!({
        "error": "Typing indicators are disabled until participant auth is fully implemented"
    })))
}
