use actix_web::{web, HttpRequest, HttpResponse, Responder, HttpMessage};
use sqlx::PgPool;
use tracing::{error, info};

/// GET /personas/me/profile
/// Returns authenticated user's full profile with persona and profession info
pub async fn get_my_profile(
    req: HttpRequest,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let claims = match req.extensions().get::<auth_service::token::Claims>() {
        Some(c) => c.clone(),
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    let user_id: i64 = match claims.sub.parse() {
        Ok(id) => id,
        Err(_) => return HttpResponse::BadRequest().json(serde_json::json!({"error": "Invalid user ID"})),
    };

    // Fetch persona with profession info
    let result = sqlx::query_as::<_, ProfileResponse>(
        r#"
        SELECT
            p.id as persona_id,
            p.owner_user_id,
            u.username,
            p.display_name,
            p.avatar_uri,
            COALESCE(MAX(pp.level), 1) as level,
            COALESCE(MAX(pp.real_score), 0) as score,
            STRING_AGG(DISTINCT prof.name, ', ') as professions,
            p.created_at,
            p.last_active_at
        FROM personas p
        JOIN users u ON p.owner_user_id = u.id
        LEFT JOIN persona_professions pp ON p.id = pp.persona_id
        LEFT JOIN professions prof ON pp.profession_id = prof.id
        WHERE p.owner_user_id = $1 AND p.exists = true
        GROUP BY p.id, p.owner_user_id, u.username, p.display_name, p.avatar_uri, p.created_at, p.last_active_at
        "#
    )
    .bind(user_id)
    .fetch_optional(pool.get_ref())
    .await;

    match result {
        Ok(Some(profile)) => HttpResponse::Ok().json(profile),
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({"error": "Persona not found"})),
        Err(e) => {
            error!("Error fetching profile: {:?}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Internal server error"}))
        }
    }
}

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

/// POST /personas/me/profession
///
/// Assigns a profession (ValuSkin) to the authenticated user's persona.
/// Creates the persona_professions row with level 1 and 'primary' slot.
/// Idempotent: ON CONFLICT updates the profession if already set.
pub async fn set_my_profession(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    body: web::Json<SetProfessionRequest>,
) -> impl Responder {
    let claims = match req.extensions().get::<auth_service::token::Claims>() {
        Some(c) => c.clone(),
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    let user_id: i64 = match claims.sub.parse() {
        Ok(id) => id,
        Err(_) => return HttpResponse::BadRequest().json(serde_json::json!({"error": "Invalid user ID"})),
    };

    // Get user's persona_id
    let persona_id: i64 = match sqlx::query_scalar::<_, i64>(
        "SELECT id FROM personas WHERE owner_user_id = $1 AND exists = true"
    )
    .bind(user_id)
    .fetch_optional(pool.get_ref())
    .await {
        Ok(Some(id)) => id,
        Ok(None) => return HttpResponse::NotFound().json(serde_json::json!({"error": "No persona found. Complete login first."})),
        Err(e) => {
            error!("Error fetching persona: {:?}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({"error": "Internal server error"}));
        }
    };

    // Resolve profession_id: accept either numeric id or string name
    let profession_id: i64 = if let Some(id) = body.profession_id {
        // Verify numeric id exists
        let exists: bool = sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM professions WHERE id = $1)"
        )
        .bind(id)
        .fetch_one(pool.get_ref())
        .await
        .unwrap_or(false);
        if !exists {
            return HttpResponse::BadRequest().json(serde_json::json!({"error": "Invalid profession_id"}));
        }
        id
    } else if let Some(ref name) = body.profession_name {
        // Look up by name (case-insensitive), create if missing
        match sqlx::query_scalar::<_, i64>(
            "SELECT id FROM professions WHERE LOWER(name) = LOWER($1) AND is_active = true"
        )
        .bind(name)
        .fetch_optional(pool.get_ref())
        .await {
            Ok(Some(id)) => id,
            Ok(None) => {
                // Auto-create profession from frontend catalog
                let category = body.profession_category.as_deref().unwrap_or("General");
                match sqlx::query_scalar::<_, i64>(
                    "INSERT INTO professions (name, category, description, is_active) VALUES ($1, $2, $3, true) RETURNING id"
                )
                .bind(name)
                .bind(category)
                .bind(body.profession_description.as_deref().unwrap_or(""))
                .fetch_one(pool.get_ref())
                .await {
                    Ok(id) => id,
                    Err(e) => {
                        error!("Error creating profession: {:?}", e);
                        return HttpResponse::InternalServerError().json(serde_json::json!({"error": "Failed to create profession"}));
                    }
                }
            }
            Err(e) => {
                error!("Error looking up profession: {:?}", e);
                return HttpResponse::InternalServerError().json(serde_json::json!({"error": "Internal server error"}));
            }
        }
    } else {
        return HttpResponse::BadRequest().json(serde_json::json!({"error": "Either profession_id or profession_name is required"}));
    };

    // Upsert persona_professions (idempotent)
    match sqlx::query(
        r#"
        INSERT INTO persona_professions (persona_id, profession_id, level, slot, real_score)
        VALUES ($1, $2, 1, 'primary', 50)
        ON CONFLICT (persona_id, profession_id) DO UPDATE SET
            slot = 'primary',
            level = GREATEST(persona_professions.level, 1)
        "#
    )
    .bind(persona_id)
    .bind(profession_id)
    .execute(pool.get_ref())
    .await {
        Ok(_) => {
            info!(user_id, persona_id, profession_id, "Profession assigned");
            HttpResponse::Ok().json(serde_json::json!({
                "persona_id": persona_id,
                "profession_id": profession_id,
                "slot": "primary",
                "level": 1
            }))
        }
        Err(e) => {
            error!("Error setting profession: {:?}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Failed to set profession"}))
        }
    }
}

#[derive(serde::Deserialize)]
pub struct SetProfessionRequest {
    pub profession_id: Option<i64>,
    pub profession_name: Option<String>,
    pub profession_category: Option<String>,
    pub profession_description: Option<String>,
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
pub struct ProfileResponse {
    pub persona_id: i64,
    pub owner_user_id: i64,
    pub username: String,
    pub display_name: String,
    pub avatar_uri: Option<String>,
    pub level: i32,
    pub score: i64,
    pub professions: Option<String>,
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
