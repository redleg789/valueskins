use actix_web::{web, HttpRequest, HttpResponse, Responder, HttpMessage};
use sqlx::PgPool;
use tracing::error;

use crate::models::*;
use crate::service::{MatchingService, MatchingError};

fn error_response(err: MatchingError) -> HttpResponse {
    match err {
        MatchingError::NoProfessionSpecified => {
            HttpResponse::BadRequest().json(serde_json::json!({
                "error": "At least one profession (ValuSkin field) must be specified"
            }))
        }
        MatchingError::InvalidLevel => {
            HttpResponse::BadRequest().json(serde_json::json!({
                "error": "Level must be between 1 and 5"
            }))
        }
        MatchingError::Database(sqlx::Error::RowNotFound) => {
            HttpResponse::NotFound().json(serde_json::json!({
                "error": "Resource not found or access denied"
            }))
        }
        MatchingError::Database(e) => {
            error!(error = %e, "Matching service database error");
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

/// GET /matching/creators?profession=Software+Engineer&min_level=2&barter_only=true
///
/// Brand discovers creators filtered by ValuSkin match.
/// Only returns creators who hold the specified profession as a ValuSkin.
pub async fn discover_creators(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    query: web::Query<DiscoverCreatorsQuery>,
) -> impl Responder {
    let claims = match req.extensions().get::<auth_service::token::Claims>() {
        Some(c) => c.clone(),
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    let user_id: i64 = match claims.sub.parse() {
        Ok(id) => id,
        Err(_) => return HttpResponse::BadRequest().json(serde_json::json!({"error": "Invalid user ID"})),
    };

    let service = MatchingService::new(pool.get_ref().clone());
    match service.discover_creators(user_id, &query).await {
        Ok(creators) => HttpResponse::Ok().json(serde_json::json!({
            "creators": creators,
            "matching_rule": "ValuSkin-based: only creators with matching profession are shown",
            "total": creators.len(),
        })),
        Err(e) => error_response(e),
    }
}

/// GET /matching/opportunities?valueskin=Software+Engineer
///
/// Creator discovers opportunities matched to their ValuSkin.
/// Only returns opportunities from brands targeting the creator's profession.
pub async fn discover_opportunities(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    query: web::Query<DiscoverOpportunitiesQuery>,
) -> impl Responder {
    let claims = match req.extensions().get::<auth_service::token::Claims>() {
        Some(c) => c.clone(),
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    let user_id: i64 = match claims.sub.parse() {
        Ok(id) => id,
        Err(_) => return HttpResponse::BadRequest().json(serde_json::json!({"error": "Invalid user ID"})),
    };

    let service = MatchingService::new(pool.get_ref().clone());
    match service.discover_opportunities(user_id, &query).await {
        Ok(opps) => HttpResponse::Ok().json(serde_json::json!({
            "opportunities": opps,
            "matching_rule": "Only opportunities requiring your ValuSkin profession are shown",
            "valueskin": &query.valueskin,
            "total": opps.len(),
        })),
        Err(e) => error_response(e),
    }
}

/// POST /matching/opportunities/{id}/requirements
///
/// Brand sets which ValuSkin field(s) an opportunity targets.
/// At least one profession must be specified.
pub async fn set_requirements(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    path: web::Path<i64>,
    body: web::Json<SetMatchingRequirementsRequest>,
) -> impl Responder {
    let claims = match req.extensions().get::<auth_service::token::Claims>() {
        Some(c) => c.clone(),
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    let user_id: i64 = match claims.sub.parse() {
        Ok(id) => id,
        Err(_) => return HttpResponse::BadRequest().json(serde_json::json!({"error": "Invalid user ID"})),
    };

    let opportunity_id = path.into_inner();
    let service = MatchingService::new(pool.get_ref().clone());
    match service.set_requirements(opportunity_id, user_id, &body).await {
        Ok(reqs) => HttpResponse::Ok().json(serde_json::json!({
            "requirements": reqs,
            "message": "Matching requirements updated — only creators with these ValuSkins will see this opportunity",
        })),
        Err(e) => error_response(e),
    }
}

/// GET /matching/opportunities/{id}/requirements
///
/// Get the matching requirements for an opportunity.
pub async fn get_requirements(
    pool: web::Data<PgPool>,
    path: web::Path<i64>,
) -> impl Responder {
    let opportunity_id = path.into_inner();
    let service = MatchingService::new(pool.get_ref().clone());
    match service.get_requirements(opportunity_id).await {
        Ok(reqs) => HttpResponse::Ok().json(reqs),
        Err(e) => error_response(e),
    }
}

/// GET /matching/audit
///
/// Get match audit log for the authenticated user (brand or creator).
pub async fn get_audit_log(
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

    let service = MatchingService::new(pool.get_ref().clone());
    match service.get_audit_log(user_id, 50).await {
        Ok(log) => HttpResponse::Ok().json(log),
        Err(e) => error_response(e),
    }
}
