//! Deal room messages — POST/GET handlers for `/deal-rooms/{id}/messages`.

use actix_web::{web, HttpMessage, HttpRequest, HttpResponse, Responder};
use sqlx::PgPool;
use serde::Deserialize;

fn get_user_id(req: &HttpRequest) -> Result<i64, HttpResponse> {
    req.extensions()
        .get::<auth_service::token::Claims>()
        .map(|c| c.sub.parse::<i64>().unwrap_or(0))
        .ok_or_else(|| HttpResponse::Unauthorized().json(serde_json::json!({"error": "Authentication required"})))
}

#[derive(Deserialize)]
pub struct SendMessageBody {
    pub content: String,
}

#[derive(Deserialize)]
pub struct MessageQuery {
    pub limit: Option<i64>,
    pub before_id: Option<i64>,
}

/// POST /deal-rooms/{id}/messages
pub async fn post_message(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    path: web::Path<i64>,
    body: web::Json<SendMessageBody>,
) -> impl Responder {
    let user_id = match get_user_id(&req) { Ok(id) => id, Err(r) => return r };
    let deal_room_id = path.into_inner();
    let content = body.content.trim();

    if content.is_empty() || content.len() > 5000 {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Message must be 1-5000 characters"
        }));
    }

    // Verify user is participant in this deal room
    let is_participant: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM deal_rooms dr JOIN personas p ON p.id = dr.creator_persona_id WHERE dr.id = $1 AND (p.user_id = $2 OR dr.brand_user_id = $2))"
    )
    .bind(deal_room_id)
    .bind(user_id)
    .fetch_one(pool.get_ref())
    .await
    .unwrap_or(false);

    if !is_participant {
        return HttpResponse::Forbidden().json(serde_json::json!({
            "error": "You are not a participant in this deal room"
        }));
    }

    match sqlx::query_as::<_, (i64, String, i64, String, chrono::DateTime<chrono::Utc>)>(
        r#"INSERT INTO deal_room_messages (deal_room_id, sender_user_id, message_type, content)
           VALUES ($1, $2, 'text', $3)
           RETURNING id, content, sender_user_id, message_type, server_timestamp"#
    )
    .bind(deal_room_id)
    .bind(user_id)
    .bind(content)
    .fetch_one(pool.get_ref())
    .await
    {
        Ok((id, msg_content, sender, msg_type, ts)) => {
            HttpResponse::Created().json(serde_json::json!({
                "id": id,
                "deal_room_id": deal_room_id,
                "sender_user_id": sender,
                "message_type": msg_type,
                "content": msg_content,
                "server_timestamp": ts,
            }))
        }
        Err(e) => {
            tracing::error!(error = %e, "Failed to send message");
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Failed to send message"}))
        }
    }
}

/// GET /deal-rooms/{id}/messages
pub async fn get_messages(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    path: web::Path<i64>,
    query: web::Query<MessageQuery>,
) -> impl Responder {
    let user_id = match get_user_id(&req) { Ok(id) => id, Err(r) => return r };
    let deal_room_id = path.into_inner();
    let limit = query.limit.unwrap_or(100).min(200).max(1);

    // Verify user is participant
    let is_participant: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM deal_rooms dr JOIN personas p ON p.id = dr.creator_persona_id WHERE dr.id = $1 AND (p.user_id = $2 OR dr.brand_user_id = $2))"
    )
    .bind(deal_room_id)
    .bind(user_id)
    .fetch_one(pool.get_ref())
    .await
    .unwrap_or(false);

    if !is_participant {
        return HttpResponse::Forbidden().json(serde_json::json!({
            "error": "You are not a participant in this deal room"
        }));
    }

    let messages: Vec<(i64, i64, String, String, chrono::DateTime<chrono::Utc>)> = match sqlx::query_as(
        r#"SELECT id, sender_user_id, message_type, content, server_timestamp
           FROM deal_room_messages
           WHERE deal_room_id = $1 AND ($2::int8 IS NULL OR id < $2)
           ORDER BY server_timestamp ASC
           LIMIT $3"#
    )
    .bind(deal_room_id)
    .bind(query.before_id)
    .bind(limit)
    .fetch_all(pool.get_ref())
    .await
    {
        Ok(rows) => rows,
        Err(e) => {
            tracing::error!(error = %e, "Failed to fetch messages");
            return HttpResponse::InternalServerError().json(serde_json::json!({"error": "Failed to fetch messages"}));
        }
    };

    let msgs: Vec<serde_json::Value> = messages.iter().map(|(id, sender, msg_type, content, ts)| {
        serde_json::json!({
            "id": id,
            "deal_room_id": deal_room_id,
            "sender_user_id": sender,
            "message_type": msg_type,
            "content": content,
            "server_timestamp": ts,
        })
    }).collect();

    HttpResponse::Ok().json(serde_json::json!({
        "messages": msgs,
        "deal_room_id": deal_room_id,
    }))
}
