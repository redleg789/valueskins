use actix_web::{web, HttpResponse, Responder};
use sqlx::PgPool;
use tracing::error;

pub async fn get_personas(
    pool: web::Data<PgPool>,
    query: web::Query<PaginationQuery>,
) -> impl Responder {
    let limit = query.limit.unwrap_or(20).min(100) as i64;
    let offset = query.offset.unwrap_or(0) as i64;

    let result = sqlx::query_as::<_, PersonaResponse>(
        r#"
        SELECT p.id, p.owner_user_id, u.username, p.display_name, p.avatar_uri,
               p.created_at, p.last_active_at
        FROM personas p
        JOIN users u ON p.owner_user_id = u.id
        WHERE p.exists = true
        ORDER BY p.last_active_at DESC
        LIMIT $1 OFFSET $2
        "#,
    )
    .bind(limit)
    .bind(offset)
    .fetch_all(pool.get_ref())
    .await;

    match result {
        Ok(personas) => HttpResponse::Ok().json(personas),
        Err(e) => {
            error!("Error fetching personas: {:?}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

pub async fn get_persona(
    pool: web::Data<PgPool>,
    path: web::Path<i64>,
) -> impl Responder {
    let persona_id = path.into_inner();

    let result = sqlx::query_as::<_, PersonaResponse>(
        r#"
        SELECT p.id, p.owner_user_id, u.username, p.display_name, p.avatar_uri,
               p.created_at, p.last_active_at
        FROM personas p
        JOIN users u ON p.owner_user_id = u.id
        WHERE p.id = $1 AND p.exists = true
        "#,
    )
    .bind(persona_id)
    .fetch_optional(pool.get_ref())
    .await;

    match result {
        Ok(Some(persona)) => HttpResponse::Ok().json(persona),
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({ "error": "Persona not found" })),
        Err(e) => {
            error!("Error fetching persona: {:?}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

pub async fn get_persona_skins(
    pool: web::Data<PgPool>,
    path: web::Path<i64>,
) -> impl Responder {
    let persona_id = path.into_inner();

    let result = sqlx::query_as::<_, SkinResponse>(
        r#"
        SELECT
            pp.persona_id,
            pp.profession_id,
            pr.name as profession_name,
            pp.slot,
            pp.level,
            pp.real_score as score
        FROM persona_professions pp
        JOIN professions pr ON pp.profession_id = pr.id
        WHERE pp.persona_id = $1
        ORDER BY pp.level DESC
        "#,
    )
    .bind(persona_id)
    .fetch_all(pool.get_ref())
    .await;

    match result {
        Ok(skins) => HttpResponse::Ok().json(skins),
        Err(e) => {
            error!("Error fetching persona skins: {:?}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[derive(serde::Deserialize)]
pub struct PaginationQuery {
    pub limit: Option<i32>,
    pub offset: Option<i32>,
}

#[derive(serde::Serialize, sqlx::FromRow)]
pub struct PersonaResponse {
    pub id: i64,
    pub owner_user_id: i64,
    pub username: String,
    pub display_name: String,
    pub avatar_uri: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub last_active_at: chrono::DateTime<chrono::Utc>,
}

#[derive(serde::Serialize, sqlx::FromRow)]
pub struct SkinResponse {
    pub persona_id: i64,
    pub profession_id: i64,
    pub profession_name: String,
    pub slot: String,
    pub level: i32,
    pub score: i64,
}
