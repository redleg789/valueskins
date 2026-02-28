use sqlx::postgres::{PgPool, PgPoolOptions};
use std::time::Duration;

/// Creates a production-grade connection pool.
///
/// max_connections=5 is a death sentence at scale. A single Actix worker
/// with 5 connections serving 1000 req/s means 200ms avg wait just for
/// a connection. At Meta scale this causes cascading timeouts.
///
/// The pool size is configurable via DATABASE_POOL_SIZE env var, defaulting
/// to 20 (safe for most deployments). Production should tune based on
/// (num_workers * pool_size) < PostgreSQL max_connections.
pub async fn get_db_pool(connection_string: &str) -> Result<PgPool, sqlx::Error> {
    let pool_size: u32 = std::env::var("DATABASE_POOL_SIZE")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(20);

    PgPoolOptions::new()
        .max_connections(pool_size)
        .min_connections(2)
        .acquire_timeout(Duration::from_secs(5))
        .idle_timeout(Duration::from_secs(600))
        .max_lifetime(Duration::from_secs(1800))
        .connect(connection_string)
        .await
}
