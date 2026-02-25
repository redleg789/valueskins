use actix_web::{web, HttpResponse, Responder};
use serde::Deserialize;
use sqlx::PgPool;
use tracing::{info, error, warn};
use auth_service::verify::verify_instagram_token;
use auth_service::token::TokenManager;

#[derive(Deserialize)]
pub struct LoginRequest {
    /// Instagram access token (direct token flow, kept for backward compatibility)
    access_token: Option<String>,
    /// OAuth authorization code (code exchange flow)
    code: Option<String>,
    /// redirect_uri used in the OAuth flow; required when `code` is provided
    redirect_uri: Option<String>,
    role: String,
}

/// Exchange an Instagram authorization code for a short-lived access token.
///
/// POST https://api.instagram.com/oauth/access_token
/// with form-urlencoded: client_id, client_secret, grant_type, redirect_uri, code
///
/// Returns the short-lived token and the user_id on success.
async fn exchange_instagram_code(code: &str, redirect_uri: &str) -> Result<String, String> {
    let client_id = std::env::var("INSTAGRAM_CLIENT_ID")
        .map_err(|_| "INSTAGRAM_CLIENT_ID not configured".to_string())?;
    let client_secret = std::env::var("INSTAGRAM_CLIENT_SECRET")
        .map_err(|_| "INSTAGRAM_CLIENT_SECRET not configured".to_string())?;

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| format!("Failed to build HTTP client: {}", e))?;

    #[derive(Deserialize)]
    struct TokenResponse {
        access_token: String,
        #[allow(dead_code)]
        user_id: Option<u64>,
    }

    #[derive(Deserialize)]
    struct ErrorDetail {
        message: Option<String>,
        error_type: Option<String>,
    }

    #[derive(Deserialize)]
    struct ErrorResponse {
        error: Option<ErrorDetail>,
        error_message: Option<String>,
    }

    let response = client
        .post("https://api.instagram.com/oauth/access_token")
        .form(&[
            ("client_id", client_id.as_str()),
            ("client_secret", client_secret.as_str()),
            ("grant_type", "authorization_code"),
            ("redirect_uri", redirect_uri),
            ("code", code),
        ])
        .send()
        .await
        .map_err(|e| format!("Instagram token exchange network error: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let body_text = response.text().await.unwrap_or_default();
        // Attempt to parse structured error
        if let Ok(err_resp) = serde_json::from_str::<ErrorResponse>(&body_text) {
            let msg = err_resp.error
                .and_then(|e| e.message)
                .or(err_resp.error_message)
                .unwrap_or_else(|| body_text.clone());
            return Err(format!("Instagram token exchange failed ({}): {}", status, msg));
        }
        return Err(format!("Instagram token exchange failed ({}): {}", status, body_text));
    }

    let token_resp: TokenResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Instagram token response: {}", e))?;

    Ok(token_resp.access_token)
}

/// POST /auth/login
///
/// Authenticates a user via Instagram OAuth.
///
/// Accepts either:
///   1. { code, redirect_uri, role } -- Authorization code flow (preferred).
///      The backend exchanges the code with Instagram for an access token.
///   2. { access_token, role } -- Direct token flow (backward-compatible).
///      The backend verifies the token against the Graph API.
///
/// In both cases:
///   - Calls Meta Graph API to verify the token and get profile
///   - Upserts the user in the database (creates on first login)
///   - Creates/updates a persona for the user
///   - Issues a JWT with user_id, ig_user_id, role, and persona_id
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

    // Resolve the Instagram access token from either the code or direct token
    let access_token: String = if let Some(ref code) = req.code {
        let redirect_uri = match &req.redirect_uri {
            Some(uri) => uri.clone(),
            None => {
                return HttpResponse::BadRequest().json(serde_json::json!({
                    "error": "redirect_uri is required when using authorization code flow"
                }));
            }
        };

        // Validate redirect_uri format (basic check to prevent open redirect abuse)
        if !redirect_uri.starts_with("https://") && !redirect_uri.starts_with("http://localhost") {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "redirect_uri must use HTTPS (or http://localhost for development)"
            }));
        }

        info!("Exchanging Instagram authorization code for access token");
        match exchange_instagram_code(code, &redirect_uri).await {
            Ok(token) => token,
            Err(e) => {
                error!("Instagram code exchange failed: {}", e);
                return HttpResponse::Unauthorized().json(serde_json::json!({
                    "error": "Failed to exchange authorization code with Instagram"
                }));
            }
        }
    } else if let Some(ref token) = req.access_token {
        token.clone()
    } else {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Either 'code' (with 'redirect_uri') or 'access_token' must be provided"
        }));
    };

    // Step 1: Verify Instagram token with Meta Graph API
    let profile = match verify_instagram_token(&access_token).await {
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
            warn!("Failed to upsert persona (non-fatal): {:?}", e);
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
