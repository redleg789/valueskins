use actix_web::{web, HttpResponse, Responder};
use serde::Deserialize;
use sqlx::PgPool;
use tracing::{info, error};
use auth_service::verify::verify_instagram_token;
use auth_service::token::TokenManager;

#[derive(Deserialize)]
pub struct LoginRequest {
    access_token: String,
    role: String,
}

/// POST /auth/login
///
/// Authenticates a user via their Instagram access token.
/// 1. Calls Meta Graph API to verify the token and get profile
/// 2. Upserts the user in the database (creates on first login)
/// 3. Creates/updates a persona for the user
/// 4. Issues a JWT with user_id, ig_user_id, role, and persona_id
pub async fn login(
    req: web::Json<LoginRequest>,
    pool: web::Data<PgPool>,
    token_manager: web::Data<TokenManager>,
) -> impl Responder {
    let role = req.role.as_str();
    if role != "creator" && role != "brand" {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Role must be 'creator' or 'brand'"
        }));
    }

    // Step 1: Verify Instagram token with Meta Graph API
    let profile = match verify_instagram_token(&req.access_token).await {
        Ok(profile) => profile,
        Err(e) => {
            error!("Instagram token verification failed: {:?}", e);
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "Invalid Instagram access token"
            }));
        }
    };

    info!("Instagram user verified: @{} (id: {})", profile.username, profile.id);

    // Extract fields from profile before it's partially moved
    let ig_user_id = profile.id;
    let username = profile.username;
    let display_name = profile.name.unwrap_or_else(|| username.clone());
    let avatar_url = profile.profile_picture_url;
    let followers_count = profile.followers_count;

    // Step 2: Upsert user in database
    let user_id: i64 = match sqlx::query_scalar::<_, i64>(
        r#"
        INSERT INTO users (instagram_user_id, username, display_name, avatar_url, role, followers_count)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (instagram_user_id) DO UPDATE SET
            username = EXCLUDED.username,
            display_name = COALESCE(EXCLUDED.display_name, users.display_name),
            avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
            role = EXCLUDED.role,
            followers_count = COALESCE(EXCLUDED.followers_count, users.followers_count),
            last_login_at = NOW()
        RETURNING id
        "#
    )
    .bind(&ig_user_id)
    .bind(&username)
    .bind(&display_name)
    .bind(&avatar_url)
    .bind(role)
    .bind(followers_count)
    .fetch_one(pool.get_ref())
    .await {
        Ok(id) => id,
        Err(e) => {
            error!("Failed to upsert user: {:?}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to create user account"
            }));
        }
    };

    // Step 3: Upsert persona (public-facing identity)
    let persona_id: Option<i64> = match sqlx::query_scalar::<_, i64>(
        r#"
        INSERT INTO personas (owner_user_id, owner_address, display_name, avatar_uri, created_at, last_active_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (owner_user_id) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            avatar_uri = COALESCE(EXCLUDED.avatar_uri, personas.avatar_uri),
            last_active_at = NOW()
        RETURNING id
        "#
    )
    .bind(user_id)
    .bind(&ig_user_id)
    .bind(&display_name)
    .bind(&avatar_url)
    .fetch_optional(pool.get_ref())
    .await {
        Ok(id) => id,
        Err(e) => {
            error!("Failed to upsert persona: {:?}", e);
            None
        }
    };

    // Step 4: Create JWT
    let token = match token_manager.create_token(user_id, &ig_user_id, role, persona_id) {
        Ok(token) => token,
        Err(_) => {
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to create session token"
            }));
        }
    };

    HttpResponse::Ok().json(serde_json::json!({
        "token": token,
        "user": {
            "id": user_id,
            "instagram_user_id": ig_user_id,
            "username": username,
            "display_name": display_name,
            "avatar_url": avatar_url,
            "role": role,
            "persona_id": persona_id,
        }
    }))
}
