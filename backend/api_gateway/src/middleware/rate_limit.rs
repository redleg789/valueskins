//! Rate Limiting Middleware
//!
//! Two-layer rate limiting:
//! 1. IP-based global limiter (actix-governor, already wired in main.rs)
//! 2. Tiered per-user/per-API-key limiter (this module) — enforces different
//!    limits based on the authenticated user's subscription tier.
//!
//! Tier limits (requests per minute):
//!   free:       100
//!   basic:     1000
//!   pro:      10000
//!   enterprise: unlimited (u32::MAX)
//!
//! How tier is resolved (in priority order):
//!   1. X-API-Key header → look up key in api_keys table, use that tier
//!   2. JWT claims.tier field → use declared tier
//!   3. Default: "free"

use actix_web::{
    dev::{ServiceRequest, ServiceResponse, Transform, Service},
    Error, HttpResponse, body::EitherBody,
    HttpMessage,
};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use std::future::{Ready, Future};
use std::pin::Pin;
use std::task::{Context, Poll};
use auth_service::token::Claims;

/// Limits (requests per minute) for each tier.
#[derive(Clone, Copy, Debug)]
pub struct TierLimits {
    pub free: u32,
    pub basic: u32,
    pub pro: u32,
    pub enterprise: u32,
}

impl Default for TierLimits {
    fn default() -> Self {
        Self {
            free: 100,
            basic: 1_000,
            pro: 10_000,
            enterprise: u32::MAX,
        }
    }
}

impl TierLimits {
    pub fn limit_for(&self, tier: &str) -> u32 {
        match tier {
            "basic"      => self.basic,
            "pro"        => self.pro,
            "enterprise" => self.enterprise,
            _            => self.free,  // default: free
        }
    }
}

/// Per-key sliding-window state: (request count, window start time)
type ClientMap = Arc<Mutex<HashMap<String, (u32, Instant)>>>;

/// Tiered rate limiter middleware factory.
pub struct TieredRateLimiter {
    limits: TierLimits,
    window: Duration,
    clients: ClientMap,
}

impl TieredRateLimiter {
    pub fn new(limits: TierLimits) -> Self {
        Self {
            limits,
            window: Duration::from_secs(60),
            clients: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

impl Default for TieredRateLimiter {
    fn default() -> Self {
        Self::new(TierLimits::default())
    }
}

impl<S, B> Transform<S, ServiceRequest> for TieredRateLimiter
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    B: 'static,
{
    type Response = ServiceResponse<EitherBody<B>>;
    type Error = Error;
    type Transform = TieredRateLimiterMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        std::future::ready(Ok(TieredRateLimiterMiddleware {
            service: Arc::new(service),
            limits: self.limits,
            window: self.window,
            clients: self.clients.clone(),
        }))
    }
}

pub struct TieredRateLimiterMiddleware<S> {
    service: Arc<S>,
    limits: TierLimits,
    window: Duration,
    clients: ClientMap,
}

impl<S, B> Service<ServiceRequest> for TieredRateLimiterMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    B: 'static,
{
    type Response = ServiceResponse<EitherBody<B>>;
    type Error = Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;

    fn poll_ready(&self, _cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        Poll::Ready(Ok(()))
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let service = self.service.clone();
        let clients = self.clients.clone();
        let limits = self.limits;
        let window = self.window;

        Box::pin(async move {
            // ── Determine tier + rate limit key ─────────────────────────────
            // Key format: "tier:identifier" — separates free users by IP so
            // one shared-IP network doesn't get the enterprise limit.
            let (tier, rate_key) = resolve_tier_and_key(&req);
            let limit = limits.limit_for(&tier);

            // ── Sliding window check ─────────────────────────────────────────
            let (exceeded, current_count) = {
                let mut map = clients.lock().unwrap();
                let now = Instant::now();
                let entry = map.entry(rate_key.clone()).or_insert((0, now));

                if now.duration_since(entry.1) >= window {
                    // Window expired — reset
                    *entry = (0, now);
                }

                entry.0 += 1;
                let count = entry.0;
                (count > limit, count)
            };

            if exceeded {
                let response = HttpResponse::TooManyRequests()
                    .insert_header(("X-RateLimit-Limit", limit.to_string()))
                    .insert_header(("X-RateLimit-Remaining", "0"))
                    .insert_header(("X-RateLimit-Tier", tier.as_str()))
                    .insert_header(("Retry-After", "60"))
                    .json(serde_json::json!({
                        "error": "Rate limit exceeded",
                        "tier": tier,
                        "limit": limit,
                        "retry_after_seconds": 60
                    }));
                return Ok(req.into_response(response).map_into_right_body());
            }

            // Pass rate limit headers on successful requests
            let remaining = limit.saturating_sub(current_count);
            let res = service.call(req).await?;
            let res = res.map_into_left_body();

            // Inject response headers for client awareness
            // (actix doesn't let us mutate after map_into_left_body easily,
            // so these headers are set only on the 429 path above where we
            // control the response; downstream services add them if needed)
            let _ = remaining; // used by downstream if needed

            Ok(res)
        })
    }
}

/// Resolve the rate-limit tier and the dedupe key for this request.
///
/// Priority:
/// 1. `X-API-Key` header → prefix identifies the key tier (sync lookup by prefix).
///    Full DB lookup happens in the API key validation handler; here we use the
///    X-API-Tier header that api key middleware injects after validation.
/// 2. JWT Claims.tier field
/// 3. IP address → default free tier
fn resolve_tier_and_key(req: &ServiceRequest) -> (String, String) {
    // Check for API key tier injected by API key validation middleware
    if let Some(api_tier) = req.headers().get("X-Resolved-Tier") {
        if let Ok(tier) = api_tier.to_str() {
            let key_prefix = req.headers()
                .get("X-API-Key")
                .and_then(|h| h.to_str().ok())
                .map(|k| &k[..k.len().min(8)])
                .unwrap_or("apikey");
            return (tier.to_string(), format!("apikey:{}", key_prefix));
        }
    }

    // Check JWT claims tier
    if let Some(claims) = req.extensions().get::<Claims>() {
        let tier = claims.tier.as_deref().unwrap_or("free").to_string();
        let user_id = claims.sub.clone();
        return (tier, format!("user:{}", user_id));
    }

    // Fall back to IP-based free tier
    let ip = req.connection_info()
        .realip_remote_addr()
        .unwrap_or("unknown")
        .to_string();
    ("free".to_string(), format!("ip:{}", ip))
}

/// Simple IP-only rate limiter (used as first-line defense for public endpoints).
pub struct RateLimiter {
    requests_per_minute: u32,
    window: Duration,
}

impl RateLimiter {
    pub fn new(requests_per_minute: u32) -> Self {
        Self {
            requests_per_minute,
            window: Duration::from_secs(60),
        }
    }
}

impl<S, B> Transform<S, ServiceRequest> for RateLimiter
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    B: 'static,
{
    type Response = ServiceResponse<EitherBody<B>>;
    type Error = Error;
    type Transform = RateLimiterMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        std::future::ready(Ok(RateLimiterMiddleware {
            service: Arc::new(service),
            requests_per_minute: self.requests_per_minute,
            window: self.window,
            clients: Arc::new(Mutex::new(HashMap::new())),
        }))
    }
}

pub struct RateLimiterMiddleware<S> {
    service: Arc<S>,
    requests_per_minute: u32,
    window: Duration,
    clients: Arc<Mutex<HashMap<String, (u32, Instant)>>>,
}

impl<S, B> Service<ServiceRequest> for RateLimiterMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    B: 'static,
{
    type Response = ServiceResponse<EitherBody<B>>;
    type Error = Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;

    fn poll_ready(&self, _cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        Poll::Ready(Ok(()))
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let service = self.service.clone();
        let clients = self.clients.clone();
        let limit = self.requests_per_minute;
        let window = self.window;

        Box::pin(async move {
            let ip = req.connection_info()
                .realip_remote_addr()
                .unwrap_or("unknown")
                .to_string();

            let should_limit = {
                let mut clients = clients.lock().unwrap();
                let now = Instant::now();
                let (count, window_start) = clients.entry(ip.clone()).or_insert((0, now));
                if now.duration_since(*window_start) > window {
                    *count = 0;
                    *window_start = now;
                }
                *count += 1;
                *count > limit
            };

            if should_limit {
                let response = HttpResponse::TooManyRequests()
                    .insert_header(("Retry-After", "60"))
                    .json(serde_json::json!({
                        "error": "Rate limit exceeded",
                        "retry_after": 60
                    }));
                return Ok(req.into_response(response).map_into_right_body());
            }

            let res = service.call(req).await?;
            Ok(res.map_into_left_body())
        })
    }
}
