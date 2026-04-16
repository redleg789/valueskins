//! Unified OAuth handler supporting multiple platforms
//! Routes OAuth flows for: Google, Instagram, YouTube, TikTok, LinkedIn

use actix_web::{web, HttpResponse, HttpRequest};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;
use chrono::Utc;

#[derive(Debug, Serialize, Deserialize)]
pub struct OAuthCallbackRequest {
    pub code: String,
    pub state: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OAuthLoginResponse {
    pub jwt_token: String,
    pub user_id: i64,
    pub persona_id: i64,
    pub platform: String,
    pub username: Option<String>,
    pub profile_picture: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OAuthStartRequest {
    pub platform: String, // "google", "instagram", "youtube", "tiktok", "linkedin"
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OAuthUrlResponse {
    pub auth_url: String,
    pub state: String,
}

/// POST /auth/oauth/start — Generate OAuth login URL for platform
pub async fn start_oauth(
    req: web::Json<OAuthStartRequest>,
    pool: web::Data<PgPool>,
) -> HttpResponse {
    let platform = req.platform.to_lowercase();
    let state = Uuid::new_v4().to_string();

    // Store state in Redis for CSRF protection (implementation pending)
    // For now, state validation happens at callback

    let auth_url = match platform.as_str() {
        "google" => {
            // Get config from env
            let client_id = std::env::var("GOOGLE_CLIENT_ID").unwrap_or_default();
            let redirect_uri = format!("{}/auth/oauth/callback/google",
                std::env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:3000".to_string()));

            format!(
                "https://accounts.google.com/o/oauth2/v2/auth?client_id={}&redirect_uri={}&response_type=code&scope=openid%20email%20profile&state={}",
                client_id,
                urlencoding::encode(&redirect_uri),
                state
            )
        },
        "instagram" => {
            let client_id = std::env::var("INSTAGRAM_CLIENT_ID").unwrap_or_default();
            let redirect_uri = format!("{}/auth/oauth/callback/instagram",
                std::env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:3000".to_string()));

            format!(
                "https://api.instagram.com/oauth/authorize?client_id={}&redirect_uri={}&scope=user_profile,user_media&response_type=code&state={}",
                client_id,
                urlencoding::encode(&redirect_uri),
                state
            )
        },
        "youtube" => {
            let client_id = std::env::var("YOUTUBE_CLIENT_ID").unwrap_or_default();
            let redirect_uri = format!("{}/auth/oauth/callback/youtube",
                std::env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:3000".to_string()));

            format!(
                "https://accounts.google.com/o/oauth2/v2/auth?client_id={}&redirect_uri={}&response_type=code&scope=https://www.googleapis.com/auth/youtube.readonly%20https://www.googleapis.com/auth/yt-analytics.readonly&state={}&access_type=offline",
                client_id,
                urlencoding::encode(&redirect_uri),
                state
            )
        },
        "tiktok" => {
            let client_key = std::env::var("TIKTOK_CLIENT_KEY").unwrap_or_default();
            let redirect_uri = format!("{}/auth/oauth/callback/tiktok",
                std::env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:3000".to_string()));

            format!(
                "https://www.tiktok.com/v3/oauth/authorize/?client_key={}&scope=user.info.basic,user.read&redirect_uri={}&response_type=code&state={}",
                client_key,
                urlencoding::encode(&redirect_uri),
                state
            )
        },
        "linkedin" => {
            let client_id = std::env::var("LINKEDIN_CLIENT_ID").unwrap_or_default();
            let redirect_uri = format!("{}/auth/oauth/callback/linkedin",
                std::env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:3000".to_string()));

            format!(
                "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={}&redirect_uri={}&scope=openid%20profile%20email&state={}",
                client_id,
                urlencoding::encode(&redirect_uri),
                state
            )
        },
        _ => return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "unsupported_platform",
            "message": format!("Platform '{}' not supported", platform)
        })),
    };

    HttpResponse::Ok().json(OAuthUrlResponse {
        auth_url,
        state,
    })
}

/// GET /auth/oauth/callback/:platform — Handle OAuth callback for platform
pub async fn oauth_callback(
    platform: web::Path<String>,
    query: web::Query<OAuthCallbackRequest>,
    pool: web::Data<PgPool>,
) -> HttpResponse {
    let platform = platform.to_lowercase();
    let code = &query.code;

    // Verify state token (implement Redis lookup)

    match platform.as_str() {
        "google" => handle_google_callback(code, &pool).await,
        "instagram" => handle_instagram_callback(code, &pool).await,
        "youtube" => handle_youtube_callback(code, &pool).await,
        "tiktok" => handle_tiktok_callback(code, &pool).await,
        "linkedin" => handle_linkedin_callback(code, &pool).await,
        _ => HttpResponse::BadRequest().json(serde_json::json!({
            "error": "unsupported_platform"
        })),
    }
}

/// Handle Google OAuth callback
async fn handle_google_callback(code: &str, pool: &PgPool) -> HttpResponse {
    // TODO: Exchange code for token via auth_service::google_oauth
    // TODO: Get user info from Google
    // TODO: Upsert user into database
    // TODO: Create JWT token
    // TODO: Return login response

    HttpResponse::Ok().json(serde_json::json!({
        "status": "pending_implementation",
        "platform": "google"
    }))
}

/// Handle Instagram OAuth callback
async fn handle_instagram_callback(code: &str, pool: &PgPool) -> HttpResponse {
    // TODO: Exchange code for token via auth_service::instagram_oauth
    // TODO: Sync creator profile data from Instagram API
    // TODO: Upsert into users + personas tables
    // TODO: Create JWT token

    HttpResponse::Ok().json(serde_json::json!({
        "status": "pending_implementation",
        "platform": "instagram"
    }))
}

/// Handle YouTube OAuth callback
async fn handle_youtube_callback(code: &str, pool: &PgPool) -> HttpResponse {
    // TODO: Exchange code for token via auth_service::youtube_oauth
    // TODO: Sync creator channel info and stats
    // TODO: Upsert into users + personas tables
    // TODO: Create JWT token

    HttpResponse::Ok().json(serde_json::json!({
        "status": "pending_implementation",
        "platform": "youtube"
    }))
}

/// Handle TikTok OAuth callback
async fn handle_tiktok_callback(code: &str, pool: &PgPool) -> HttpResponse {
    // TODO: Exchange code for token via auth_service::tiktok_oauth
    // TODO: Sync creator profile and stats
    // TODO: Upsert into users + personas tables
    // TODO: Create JWT token

    HttpResponse::Ok().json(serde_json::json!({
        "status": "pending_implementation",
        "platform": "tiktok"
    }))
}

/// Handle LinkedIn OAuth callback
async fn handle_linkedin_callback(code: &str, pool: &PgPool) -> HttpResponse {
    // TODO: Exchange code for token via auth_service::linkedin_oauth
    // TODO: Sync profile info
    // TODO: Upsert into users + personas tables
    // TODO: Create JWT token

    HttpResponse::Ok().json(serde_json::json!({
        "status": "pending_implementation",
        "platform": "linkedin"
    }))
}
