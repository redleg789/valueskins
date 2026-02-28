//! Admin API Handlers — leaderboard, platform stats, feature flags,
//! user management, GDPR requests, disputes, PII audit.
//!
//! All handlers enforce admin role via claims check.

use actix_web::{web, HttpRequest, HttpResponse, Responder};
use serde::Deserialize;
use sqlx::PgPool;

/// Extract and validate admin role from JWT claims.
fn require_admin(req: &HttpRequest) -> Result<i64, HttpResponse> {
    let claims = req.extensions()
        .get::<auth_service::token::Claims>()
        .cloned()
        .ok_or_else(|| HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Authentication required"
        })))?;

    if claims.role != "admin" {
        return Err(HttpResponse::Forbidden().json(serde_json::json!({
            "error": "Admin access required"
        })));
    }

    Ok(claims.user_id)
}

#[derive(Deserialize)]
pub struct PaginationParams {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

// ── Leaderboard ──────────────────────────────────────────────

pub async fn get_leaderboard(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    params: web::Query<PaginationParams>,
) -> impl Responder {
    if let Err(resp) = require_admin(&req) { return resp; }

    let limit = params.limit.unwrap_or(50).min(100);
    let offset = params.offset.unwrap_or(0);

    let rows: Vec<(i64, String, Option<String>, Option<String>, Option<f64>, Option<i64>, Option<f64>, i64)> =
        match sqlx::query_as(
            "SELECT user_id, username, display_name, avatar_url,
                    reputation_score, total_deals, avg_rating, rank
             FROM creator_leaderboard
             ORDER BY rank
             LIMIT $1 OFFSET $2"
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(pool.get_ref())
        .await {
            Ok(r) => r,
            Err(e) => {
                tracing::error!(error = %e, "Failed to fetch leaderboard");
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": "Failed to fetch leaderboard"
                }));
            }
        };

    let entries: Vec<serde_json::Value> = rows.iter().map(|r| {
        serde_json::json!({
            "user_id": r.0,
            "username": r.1,
            "display_name": r.2,
            "avatar_url": r.3,
            "reputation_score": r.4,
            "total_deals": r.5,
            "avg_rating": r.6,
            "rank": r.7,
        })
    }).collect();

    HttpResponse::Ok().json(serde_json::json!({
        "leaderboard": entries,
        "pagination": { "limit": limit, "offset": offset }
    }))
}

// ── Platform Stats ───────────────────────────────────────────

pub async fn get_platform_stats(
    req: HttpRequest,
    pool: web::Data<PgPool>,
) -> impl Responder {
    if let Err(resp) = require_admin(&req) { return resp; }

    let row: Option<(i64, i64, i64, f64, f64, i64, chrono::DateTime<chrono::Utc>)> =
        match sqlx::query_as(
            "SELECT total_users, total_personas, total_skins,
                    total_volume, total_revenue, total_deals, last_refreshed_at
             FROM platform_stats LIMIT 1"
        )
        .fetch_optional(pool.get_ref())
        .await {
            Ok(r) => r,
            Err(e) => {
                tracing::error!(error = %e, "Failed to fetch platform stats");
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": "Failed to fetch stats"
                }));
            }
        };

    match row {
        Some(r) => HttpResponse::Ok().json(serde_json::json!({
            "total_users": r.0,
            "total_personas": r.1,
            "total_skins": r.2,
            "total_volume": r.3,
            "total_revenue": r.4,
            "total_deals": r.5,
            "last_refreshed_at": r.6.to_rfc3339(),
        })),
        None => HttpResponse::Ok().json(serde_json::json!({
            "total_users": 0, "total_personas": 0, "total_skins": 0,
            "total_volume": 0, "total_revenue": 0, "total_deals": 0,
        })),
    }
}

// ── Feature Flags ────────────────────────────────────────────

pub async fn list_feature_flags(
    req: HttpRequest,
    pool: web::Data<PgPool>,
) -> impl Responder {
    if let Err(resp) = require_admin(&req) { return resp; }

    let flags: Vec<(i64, String, bool, Option<i32>, Option<String>, bool, Option<String>)> =
        match sqlx::query_as(
            "SELECT id, name, enabled, rollout_percentage, allowed_roles, shadow_mode, description
             FROM feature_flags WHERE deleted_at IS NULL ORDER BY name"
        )
        .fetch_all(pool.get_ref())
        .await {
            Ok(f) => f,
            Err(e) => {
                tracing::error!(error = %e, "Failed to fetch feature flags");
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": "Failed to fetch flags"
                }));
            }
        };

    let entries: Vec<serde_json::Value> = flags.iter().map(|f| {
        serde_json::json!({
            "id": f.0, "name": f.1, "enabled": f.2,
            "rollout_percentage": f.3, "allowed_roles": f.4,
            "shadow_mode": f.5, "description": f.6,
        })
    }).collect();

    HttpResponse::Ok().json(serde_json::json!({ "flags": entries }))
}

#[derive(Deserialize)]
pub struct UpdateFlagRequest {
    pub enabled: Option<bool>,
    pub rollout_percentage: Option<i32>,
    pub shadow_mode: Option<bool>,
}

pub async fn update_feature_flag(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    path: web::Path<String>,
    body: web::Json<UpdateFlagRequest>,
) -> impl Responder {
    if let Err(resp) = require_admin(&req) { return resp; }

    let name = path.into_inner();

    if let Some(pct) = body.rollout_percentage {
        if !(0..=100).contains(&pct) {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "rollout_percentage must be 0-100"
            }));
        }
    }

    let result = sqlx::query(
        "UPDATE feature_flags SET
            enabled = COALESCE($2, enabled),
            rollout_percentage = COALESCE($3, rollout_percentage),
            shadow_mode = COALESCE($4, shadow_mode),
            updated_at = NOW()
         WHERE name = $1 AND deleted_at IS NULL"
    )
    .bind(&name)
    .bind(body.enabled)
    .bind(body.rollout_percentage)
    .bind(body.shadow_mode)
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(r) if r.rows_affected() > 0 => {
            tracing::info!(flag = name.as_str(), "Feature flag updated");
            HttpResponse::Ok().json(serde_json::json!({ "updated": true }))
        }
        Ok(_) => HttpResponse::NotFound().json(serde_json::json!({ "error": "Flag not found" })),
        Err(e) => {
            tracing::error!(error = %e, "Failed to update flag");
            HttpResponse::InternalServerError().json(serde_json::json!({ "error": "Update failed" }))
        }
    }
}

pub async fn kill_feature_flag(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    path: web::Path<String>,
) -> impl Responder {
    if let Err(resp) = require_admin(&req) { return resp; }

    let name = path.into_inner();

    let result = sqlx::query(
        "UPDATE feature_flags SET enabled = FALSE, rollout_percentage = 0, updated_at = NOW()
         WHERE name = $1 AND deleted_at IS NULL"
    )
    .bind(&name)
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(r) if r.rows_affected() > 0 => {
            tracing::warn!(flag = name.as_str(), "Feature flag KILLED");
            HttpResponse::Ok().json(serde_json::json!({ "killed": true }))
        }
        Ok(_) => HttpResponse::NotFound().json(serde_json::json!({ "error": "Flag not found" })),
        Err(e) => {
            tracing::error!(error = %e, "Failed to kill flag");
            HttpResponse::InternalServerError().json(serde_json::json!({ "error": "Kill failed" }))
        }
    }
}

// ── Users Management ─────────────────────────────────────────

pub async fn list_users(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    params: web::Query<PaginationParams>,
) -> impl Responder {
    if let Err(resp) = require_admin(&req) { return resp; }

    let limit = params.limit.unwrap_or(50).min(100);
    let offset = params.offset.unwrap_or(0);

    let users: Vec<(i64, String, Option<String>, String, bool, chrono::DateTime<chrono::Utc>)> =
        match sqlx::query_as(
            "SELECT id, username, display_name, role, is_active, created_at
             FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2"
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(pool.get_ref())
        .await {
            Ok(u) => u,
            Err(e) => {
                tracing::error!(error = %e, "Failed to list users");
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": "Failed to list users"
                }));
            }
        };

    let entries: Vec<serde_json::Value> = users.iter().map(|u| {
        serde_json::json!({
            "id": u.0, "username": u.1, "display_name": u.2,
            "role": u.3, "is_active": u.4, "created_at": u.5.to_rfc3339(),
        })
    }).collect();

    let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users")
        .fetch_one(pool.get_ref())
        .await
        .unwrap_or(0);

    HttpResponse::Ok().json(serde_json::json!({
        "users": entries,
        "total": total,
        "pagination": { "limit": limit, "offset": offset }
    }))
}

pub async fn get_user(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    path: web::Path<i64>,
) -> impl Responder {
    let admin_id = match require_admin(&req) { Ok(id) => id, Err(resp) => return resp };

    let user_id = path.into_inner();

    // Log PII access
    let pii_logger = shared::pii_audit::PiiAuditLogger::new(pool.get_ref().clone());
    let _ = pii_logger.log(
        admin_id, user_id, "read",
        "id,username,display_name,email,role,instagram_user_id",
        "Admin user detail view", None, None,
    ).await;

    let user: Option<(i64, String, Option<String>, Option<String>, String, bool, Option<String>, chrono::DateTime<chrono::Utc>)> =
        match sqlx::query_as(
            "SELECT id, username, display_name, avatar_url, role, is_active, instagram_user_id, created_at
             FROM users WHERE id = $1"
        )
        .bind(user_id)
        .fetch_optional(pool.get_ref())
        .await {
            Ok(u) => u,
            Err(e) => {
                tracing::error!(error = %e, "Failed to get user");
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": "Failed to get user"
                }));
            }
        };

    match user {
        Some(u) => HttpResponse::Ok().json(serde_json::json!({
            "id": u.0, "username": u.1, "display_name": u.2,
            "avatar_url": u.3, "role": u.4, "is_active": u.5,
            "instagram_user_id": u.6, "created_at": u.7.to_rfc3339(),
        })),
        None => HttpResponse::NotFound().json(serde_json::json!({ "error": "User not found" })),
    }
}

pub async fn deactivate_user(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    path: web::Path<i64>,
) -> impl Responder {
    if let Err(resp) = require_admin(&req) { return resp; }

    let user_id = path.into_inner();

    let result = sqlx::query(
        "UPDATE users SET is_active = FALSE WHERE id = $1 AND is_active = TRUE"
    )
    .bind(user_id)
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(r) if r.rows_affected() > 0 => {
            // Revoke all refresh tokens for deactivated user
            let refresh_svc = shared::refresh_tokens::RefreshTokenService::new(pool.get_ref().clone());
            let _ = refresh_svc.revoke_all_for_user(user_id).await;
            tracing::warn!(user_id = user_id, "User deactivated by admin");
            HttpResponse::Ok().json(serde_json::json!({ "deactivated": true }))
        }
        Ok(_) => HttpResponse::NotFound().json(serde_json::json!({ "error": "User not found or already inactive" })),
        Err(e) => {
            tracing::error!(error = %e, "Failed to deactivate user");
            HttpResponse::InternalServerError().json(serde_json::json!({ "error": "Deactivation failed" }))
        }
    }
}

// ── GDPR Requests ────────────────────────────────────────────

pub async fn list_gdpr_requests(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    params: web::Query<PaginationParams>,
) -> impl Responder {
    if let Err(resp) = require_admin(&req) { return resp; }

    let limit = params.limit.unwrap_or(50).min(100);
    let offset = params.offset.unwrap_or(0);

    let requests: Vec<(i64, i64, String, String, chrono::DateTime<chrono::Utc>, Option<chrono::DateTime<chrono::Utc>>)> =
        match sqlx::query_as(
            "SELECT id, user_id, status, scope, requested_at, processed_at
             FROM data_deletion_requests
             ORDER BY requested_at DESC
             LIMIT $1 OFFSET $2"
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(pool.get_ref())
        .await {
            Ok(r) => r,
            Err(e) => {
                tracing::error!(error = %e, "Failed to list GDPR requests");
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": "Failed to list requests"
                }));
            }
        };

    let entries: Vec<serde_json::Value> = requests.iter().map(|r| {
        serde_json::json!({
            "id": r.0, "user_id": r.1, "status": r.2,
            "scope": r.3, "requested_at": r.4.to_rfc3339(),
            "processed_at": r.5.map(|t| t.to_rfc3339()),
        })
    }).collect();

    HttpResponse::Ok().json(serde_json::json!({
        "requests": entries,
        "pagination": { "limit": limit, "offset": offset }
    }))
}

pub async fn process_gdpr_request(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    path: web::Path<i64>,
) -> impl Responder {
    if let Err(resp) = require_admin(&req) { return resp; }

    let request_id = path.into_inner();

    // Mark as processing
    let result = sqlx::query(
        "UPDATE data_deletion_requests SET status = 'processing'
         WHERE id = $1 AND status = 'pending'"
    )
    .bind(request_id)
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(r) if r.rows_affected() > 0 => {
            tracing::info!(request_id = request_id, "GDPR request processing started");
            HttpResponse::Ok().json(serde_json::json!({
                "processing": true,
                "message": "Deletion processing started"
            }))
        }
        Ok(_) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "Request not found or already processed"
        })),
        Err(e) => {
            tracing::error!(error = %e, "Failed to process GDPR request");
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Processing failed"
            }))
        }
    }
}

// ── Disputes ─────────────────────────────────────────────────

pub async fn list_disputes(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    params: web::Query<PaginationParams>,
) -> impl Responder {
    if let Err(resp) = require_admin(&req) { return resp; }

    let limit = params.limit.unwrap_or(50).min(100);
    let offset = params.offset.unwrap_or(0);

    let disputes: Vec<(i64, i64, i64, String, String, Option<String>, chrono::DateTime<chrono::Utc>)> =
        match sqlx::query_as(
            "SELECT id, raised_by_user_id, deal_room_id, reason, status, resolution_notes, created_at
             FROM escrow_disputes
             ORDER BY created_at DESC
             LIMIT $1 OFFSET $2"
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(pool.get_ref())
        .await {
            Ok(d) => d,
            Err(e) => {
                tracing::error!(error = %e, "Failed to list disputes");
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": "Failed to list disputes"
                }));
            }
        };

    let entries: Vec<serde_json::Value> = disputes.iter().map(|d| {
        serde_json::json!({
            "id": d.0, "raised_by_user_id": d.1, "deal_room_id": d.2,
            "reason": d.3, "status": d.4, "resolution_notes": d.5,
            "created_at": d.6.to_rfc3339(),
        })
    }).collect();

    HttpResponse::Ok().json(serde_json::json!({
        "disputes": entries,
        "pagination": { "limit": limit, "offset": offset }
    }))
}

#[derive(Deserialize)]
pub struct ResolveDisputeRequest {
    pub resolution: String,
    pub notes: Option<String>,
}

pub async fn resolve_dispute(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    path: web::Path<i64>,
    body: web::Json<ResolveDisputeRequest>,
) -> impl Responder {
    let admin_id = match require_admin(&req) { Ok(id) => id, Err(resp) => return resp };

    let dispute_id = path.into_inner();

    let valid_resolutions = ["resolved_creator", "resolved_brand", "resolved_split", "dismissed"];
    if !valid_resolutions.contains(&body.resolution.as_str()) {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Resolution must be one of: resolved_creator, resolved_brand, resolved_split, dismissed"
        }));
    }

    let result = sqlx::query(
        "UPDATE escrow_disputes SET status = $2, resolved_by_user_id = $3, resolution_notes = $4, resolved_at = NOW()
         WHERE id = $1 AND status IN ('open', 'under_review')"
    )
    .bind(dispute_id)
    .bind(&body.resolution)
    .bind(admin_id)
    .bind(&body.notes)
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(r) if r.rows_affected() > 0 => {
            tracing::info!(dispute_id = dispute_id, resolution = body.resolution.as_str(), "Dispute resolved");
            HttpResponse::Ok().json(serde_json::json!({ "resolved": true }))
        }
        Ok(_) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "Dispute not found or already resolved"
        })),
        Err(e) => {
            tracing::error!(error = %e, "Failed to resolve dispute");
            HttpResponse::InternalServerError().json(serde_json::json!({ "error": "Resolution failed" }))
        }
    }
}

// ── PII Audit Log ────────────────────────────────────────────

pub async fn get_pii_audit_log(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    path: web::Path<i64>,
    params: web::Query<PaginationParams>,
) -> impl Responder {
    if let Err(resp) = require_admin(&req) { return resp; }

    let user_id = path.into_inner();
    let limit = params.limit.unwrap_or(50).min(100);
    let offset = params.offset.unwrap_or(0);

    let logs: Vec<(i64, i64, String, String, String, chrono::DateTime<chrono::Utc>)> =
        match sqlx::query_as(
            "SELECT accessor_user_id, target_user_id, action, fields_accessed, reason, accessed_at
             FROM pii_audit_log
             WHERE target_user_id = $1
             ORDER BY accessed_at DESC
             LIMIT $2 OFFSET $3"
        )
        .bind(user_id)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool.get_ref())
        .await {
            Ok(l) => l,
            Err(e) => {
                tracing::error!(error = %e, "Failed to fetch PII audit log");
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": "Failed to fetch audit log"
                }));
            }
        };

    let entries: Vec<serde_json::Value> = logs.iter().map(|l| {
        serde_json::json!({
            "accessor_user_id": l.0, "target_user_id": l.1,
            "action": l.2, "fields_accessed": l.3,
            "reason": l.4, "accessed_at": l.5.to_rfc3339(),
        })
    }).collect();

    HttpResponse::Ok().json(serde_json::json!({
        "audit_log": entries,
        "pagination": { "limit": limit, "offset": offset }
    }))
}

// ── API Keys Management ────────────────────────────────────────

pub async fn list_api_keys(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    params: web::Query<PaginationParams>,
) -> impl Responder {
    if let Err(resp) = require_admin(&req) { return resp; }

    let limit = params.limit.unwrap_or(50).min(100);
    let offset = params.offset.unwrap_or(0);

    let keys: Vec<(i64, String, String, String, i32, Option<chrono::DateTime<chrono::Utc>>, bool)> =
        match sqlx::query_as(
            "SELECT ak.id, ak.key_prefix,
                    COALESCE(u.display_name, u.username),
                    ak.tier, ak.requests_per_minute,
                    ak.last_used_at, ak.is_active
             FROM api_keys ak
             JOIN users u ON u.id = ak.owner_user_id
             ORDER BY ak.id DESC
             LIMIT $1 OFFSET $2"
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(pool.get_ref())
        .await {
            Ok(k) => k,
            Err(e) => {
                tracing::error!(error = %e, "Failed to fetch API keys");
                return HttpResponse::InternalServerError().json(serde_json::json!({"error": "Failed to fetch API keys"}));
            }
        };

    let entries: Vec<serde_json::Value> = keys.iter().map(|k| {
        serde_json::json!({
            "id": k.0, "prefix": k.1, "owner": k.2, "tier": k.3,
            "requests_per_minute": k.4,
            "last_used": k.5.map(|d| d.to_rfc3339()),
            "is_active": k.6
        })
    }).collect();

    HttpResponse::Ok().json(serde_json::json!({
        "api_keys": entries,
        "pagination": { "limit": limit, "offset": offset }
    }))
}

// ── Contracts / Deal Rooms ────────────────────────────────────────

pub async fn list_my_contracts(
    req: HttpRequest,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let user_id = match get_user_id(&req) { Ok(id) => id, Err(r) => return r };

    let deals: Vec<(i64, String, String, i64, chrono::DateTime<chrono::Utc>,
                     Option<String>, Option<String>, String)> =
        match sqlx::query_as(
            "SELECT dr.id,
                    COALESCE(u_brand.display_name, u_brand.username),
                    dr.status,
                    COALESCE((SELECT amount_cents FROM offer_rounds WHERE deal_room_id = dr.id ORDER BY id DESC LIMIT 1), 0),
                    dr.created_at,
                    dr.brief_title,
                    dr.brief_campaign_type,
                    COALESCE(u_creator.display_name, u_creator.username)
             FROM deal_rooms dr
             JOIN users u_brand ON u_brand.id = dr.brand_user_id
             JOIN personas p ON p.id = dr.creator_persona_id
             JOIN users u_creator ON u_creator.id = p.owner_user_id
             WHERE p.owner_user_id = $1 OR dr.brand_user_id = $1
             ORDER BY dr.created_at DESC
             LIMIT 100"
        )
        .bind(user_id)
        .fetch_all(pool.get_ref())
        .await {
            Ok(d) => d,
            Err(e) => {
                tracing::error!(error = %e, "Failed to fetch contracts");
                return HttpResponse::InternalServerError().json(serde_json::json!({"error": "Failed to fetch contracts"}));
            }
        };

    let contracts: Vec<serde_json::Value> = deals.iter().map(|d| {
        serde_json::json!({
            "id": d.0, "brand_name": d.1, "status": d.2,
            "amount_cents": d.3, "created_at": d.4.to_rfc3339(),
            "title": d.5, "campaign_type": d.6,
            "creator_name": d.7
        })
    }).collect();

    HttpResponse::Ok().json(serde_json::json!({ "contracts": contracts }))
}
