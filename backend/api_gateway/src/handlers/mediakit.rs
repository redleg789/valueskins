//! Media Kit — auto-generated creator portfolios.

use actix_web::{web, HttpRequest, HttpResponse, Responder};
use serde::Deserialize;
use sqlx::PgPool;

fn get_user_id(req: &HttpRequest) -> Result<i64, HttpResponse> {
    req.extensions()
        .get::<auth_service::token::Claims>()
        .map(|c| c.user_id)
        .ok_or_else(|| HttpResponse::Unauthorized().json(serde_json::json!({"error": "Authentication required"})))
}

/// GET /mediakit/me — creator's media kit
pub async fn get_my_mediakit(req: HttpRequest, pool: web::Data<PgPool>) -> impl Responder {
    let user_id = match get_user_id(&req) { Ok(id) => id, Err(r) => return r };

    // Auto-provision kit from user data
    sqlx::query(
        "INSERT INTO creator_media_kits (user_id, tagline, bio, niche)
         SELECT $1, COALESCE(u.display_name, u.username) || ' | Creator', '', ''
         FROM users u WHERE u.id = $1
         ON CONFLICT (user_id) DO NOTHING"
    )
    .bind(user_id)
    .execute(pool.get_ref())
    .await
    .ok();

    let kit: Option<(i32, String, String, Option<String>, String, String, i64, f64, i64, bool, Option<String>, i32, i32, bool, String, String, String, String)> =
        sqlx::query_as(
            "SELECT mk.id, mk.tagline, mk.bio, mk.location, mk.niche,
                    array_to_string(mk.specialties, ','),
                    mk.total_followers, mk.avg_engagement_rate::float8, mk.monthly_reach,
                    mk.is_public, mk.custom_slug, mk.views, mk.downloads, mk.show_rates,
                    mk.brand_color_primary, mk.brand_color_secondary, mk.brand_color_accent,
                    array_to_string(mk.languages, ',')
             FROM creator_media_kits mk WHERE mk.user_id = $1"
        )
        .bind(user_id)
        .fetch_optional(pool.get_ref())
        .await
        .unwrap_or(None);

    let kit = match kit {
        Some(k) => k,
        None => return HttpResponse::InternalServerError().json(serde_json::json!({"error": "Kit not found"})),
    };

    let kit_id = kit.0;

    // Rates
    let rates: Vec<(i32, String, String, i64, String)> = sqlx::query_as(
        "SELECT id, rate_type, platform, price_cents, description
         FROM mediakit_rates WHERE mediakit_id = $1 ORDER BY id"
    )
    .bind(kit_id)
    .fetch_all(pool.get_ref())
    .await
    .unwrap_or_default();

    // Featured content
    let content: Vec<(i32, String, String, Option<String>, String, i32, i32, i32)> = sqlx::query_as(
        "SELECT id, platform, content_type, thumbnail_url, url, views, likes, comments
         FROM mediakit_featured_content WHERE mediakit_id = $1 ORDER BY sort_order"
    )
    .bind(kit_id)
    .fetch_all(pool.get_ref())
    .await
    .unwrap_or_default();

    // Collaborations
    let collabs: Vec<(i32, String, String, Option<String>, String)> = sqlx::query_as(
        "SELECT id, brand_name, campaign_type, results,
                to_char(collab_date, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"')
         FROM mediakit_collaborations WHERE mediakit_id = $1 ORDER BY collab_date DESC"
    )
    .bind(kit_id)
    .fetch_all(pool.get_ref())
    .await
    .unwrap_or_default();

    // Creator username for public URL
    let username: Option<(String,)> = sqlx::query_as(
        "SELECT username FROM users WHERE id = $1"
    )
    .bind(user_id)
    .fetch_optional(pool.get_ref())
    .await
    .unwrap_or(None);

    let specialties: Vec<&str> = kit.5.split(',').filter(|s| !s.is_empty()).collect();
    let languages: Vec<&str> = kit.17.split(',').filter(|s| !s.is_empty()).collect();

    HttpResponse::Ok().json(serde_json::json!({
        "id": kit_id,
        "tagline": kit.1,
        "bio": kit.2,
        "location": kit.3,
        "niche": kit.4,
        "specialties": specialties,
        "total_followers": kit.6,
        "avg_engagement_rate": kit.7,
        "monthly_reach": kit.8,
        "is_public": kit.9,
        "custom_slug": kit.10,
        "views": kit.11,
        "downloads": kit.12,
        "show_rates": kit.13,
        "brand_colors": {
            "primary": kit.14,
            "secondary": kit.15,
            "accent": kit.16
        },
        "languages": languages,
        "public_url": format!("/creators/{}", kit.10.as_deref().unwrap_or(
            username.as_ref().map(|u| u.0.as_str()).unwrap_or("unknown")
        )),
        "rates": rates.iter().map(|r| serde_json::json!({
            "id": r.0, "type": r.1, "platform": r.2, "price_cents": r.3, "description": r.4
        })).collect::<Vec<_>>(),
        "featured_content": content.iter().map(|c| serde_json::json!({
            "id": c.0, "platform": c.1, "content_type": c.2, "thumbnail_url": c.3,
            "url": c.4, "views": c.5, "likes": c.6, "comments": c.7
        })).collect::<Vec<_>>(),
        "collaborations": collabs.iter().map(|c| serde_json::json!({
            "id": c.0, "brand_name": c.1, "campaign_type": c.2, "results": c.3, "date": c.4
        })).collect::<Vec<_>>()
    }))
}

#[derive(Deserialize)]
pub struct UpdateMediaKitBody {
    pub tagline: Option<String>,
    pub bio: Option<String>,
    pub location: Option<String>,
    pub niche: Option<String>,
    pub show_rates: Option<bool>,
    pub is_public: Option<bool>,
    pub custom_slug: Option<String>,
    pub brand_color_primary: Option<String>,
    pub brand_color_secondary: Option<String>,
    pub brand_color_accent: Option<String>,
}

/// PATCH /mediakit/me — update media kit fields
pub async fn update_mediakit(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    body: web::Json<UpdateMediaKitBody>,
) -> impl Responder {
    let user_id = match get_user_id(&req) { Ok(id) => id, Err(r) => return r };

    // Build dynamic update
    let result = sqlx::query(
        "UPDATE creator_media_kits SET
            tagline = COALESCE($2, tagline),
            bio = COALESCE($3, bio),
            location = COALESCE($4, location),
            niche = COALESCE($5, niche),
            show_rates = COALESCE($6, show_rates),
            is_public = COALESCE($7, is_public),
            custom_slug = COALESCE($8, custom_slug),
            brand_color_primary = COALESCE($9, brand_color_primary),
            brand_color_secondary = COALESCE($10, brand_color_secondary),
            brand_color_accent = COALESCE($11, brand_color_accent),
            updated_at = NOW()
         WHERE user_id = $1"
    )
    .bind(user_id)
    .bind(&body.tagline)
    .bind(&body.bio)
    .bind(&body.location)
    .bind(&body.niche)
    .bind(body.show_rates)
    .bind(body.is_public)
    .bind(&body.custom_slug)
    .bind(&body.brand_color_primary)
    .bind(&body.brand_color_secondary)
    .bind(&body.brand_color_accent)
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({"updated": true})),
        Err(e) => {
            tracing::error!(error = %e, "Failed to update media kit");
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Update failed"}))
        }
    }
}

/// GET /mediakit/public/{slug} — public media kit view (no auth)
pub async fn get_public_mediakit(
    pool: web::Data<PgPool>,
    path: web::Path<String>,
) -> impl Responder {
    let slug = path.into_inner();

    // Increment view count
    let kit: Option<(i32, i32)> = sqlx::query_as(
        "UPDATE creator_media_kits SET views = views + 1
         WHERE custom_slug = $1 AND is_public = true
         RETURNING id, user_id"
    )
    .bind(&slug)
    .fetch_optional(pool.get_ref())
    .await
    .unwrap_or(None);

    let (kit_id, user_id) = match kit {
        Some(k) => (k.0, k.1),
        None => return HttpResponse::NotFound().json(serde_json::json!({"error": "Media kit not found"})),
    };

    // Fetch same data as get_my_mediakit but without auth
    let data: Option<(String, String, Option<String>, String, i64, f64, String, String, String, bool)> =
        sqlx::query_as(
            "SELECT tagline, bio, location, niche, total_followers,
                    avg_engagement_rate::float8,
                    brand_color_primary, brand_color_secondary, brand_color_accent,
                    show_rates
             FROM creator_media_kits WHERE id = $1"
        )
        .bind(kit_id)
        .fetch_optional(pool.get_ref())
        .await
        .unwrap_or(None);

    let data = match data {
        Some(d) => d,
        None => return HttpResponse::NotFound().json(serde_json::json!({"error": "Not found"})),
    };

    let rates = if data.9 {
        sqlx::query_as::<_, (String, String, i64, String)>(
            "SELECT rate_type, platform, price_cents, description
             FROM mediakit_rates WHERE mediakit_id = $1 ORDER BY id"
        )
        .bind(kit_id)
        .fetch_all(pool.get_ref())
        .await
        .unwrap_or_default()
    } else {
        vec![]
    };

    let creator_name: Option<(String, Option<String>)> = sqlx::query_as(
        "SELECT username, display_name FROM users WHERE id = $1"
    )
    .bind(user_id)
    .fetch_optional(pool.get_ref())
    .await
    .unwrap_or(None);

    HttpResponse::Ok().json(serde_json::json!({
        "creator_name": creator_name.as_ref().map(|c| c.1.as_deref().unwrap_or(&c.0)),
        "tagline": data.0,
        "bio": data.1,
        "location": data.2,
        "niche": data.3,
        "total_followers": data.4,
        "avg_engagement_rate": data.5,
        "brand_colors": { "primary": data.6, "secondary": data.7, "accent": data.8 },
        "rates": rates.iter().map(|r| serde_json::json!({
            "type": r.0, "platform": r.1, "price_cents": r.2, "description": r.3
        })).collect::<Vec<_>>()
    }))
}
