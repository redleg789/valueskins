#[cfg(test)]
mod tests {
    use actix_web::{test, web, App, HttpResponse, Responder};

    async fn health_check() -> impl Responder {
        HttpResponse::Ok().json(serde_json::json!({"status": "operational"}))
    }

    #[actix_web::test]
    async fn test_health_check() {
        let app = test::init_service(
            App::new().route("/health", web::get().to(health_check))
        ).await;

        let req = test::TestRequest::get()
            .uri("/health")
            .to_request();

        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
    }

    #[actix_web::test]
    async fn test_rate_limit_headers() {
        let app = test::init_service(
            App::new().route("/health", web::get().to(health_check))
        ).await;

        let req = test::TestRequest::get()
            .uri("/health")
            .to_request();

        let resp = test::call_service(&app, req).await;
        assert!(resp.headers().contains_key("x-ratelimit-limit"));
    }

    #[actix_web::test]
    async fn test_csp_headers_present() {
        let app = test::init_service(
            App::new().route("/health", web::get().to(health_check))
        ).await;

        let req = test::TestRequest::get()
            .uri("/health")
            .to_request();

        let resp = test::call_service(&app, req).await;
        assert!(resp.headers().get("Content-Security-Policy").is_some());
    }

    #[actix_web::test]
    async fn test_no_powered_by_header() {
        let app = test::init_service(
            App::new().route("/health", web::get().to(health_check))
        ).await;

        let req = test::TestRequest::get()
            .uri("/health")
            .to_request();

        let resp = test::call_service(&app, req).await;
        assert!(resp.headers().get("Server").is_none() || !resp.headers().get("Server").unwrap().to_str().unwrap_or("").contains("actix"));
    }
}
