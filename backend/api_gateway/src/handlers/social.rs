use actix_web::{web, HttpResponse, Responder};
use social_service::models::CreatePostRequest;
use social_service::service::SocialService;
use tracing::error;

pub async fn create_post(
    req: web::Json<CreatePostRequest>,
    service: web::Data<SocialService>,
) -> impl Responder {
    // In real implementation, we would extract user ID from JWT token (from request extension)
    // and verify it matches author_persona_id or if they own the persona.
    
    match service.create_post(req.into_inner()).await {
        Ok(post) => HttpResponse::Ok().json(post),
        Err(e) => {
            error!("Error creating post: {:?}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}
