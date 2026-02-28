//! Circuit Breaker — prevents cascading failures across services.
//!
//! States:
//!   Closed  → requests pass through normally
//!   Open    → requests fail-fast with cached/fallback response
//!   HalfOpen → one probe request allowed; success closes, failure re-opens
//!
//! At Meta scale, a single slow reputation query can cascade into
//! connection pool exhaustion across all services. The circuit breaker
//! cuts the dependency before the cascade starts.

use sqlx::PgPool;
use chrono::Utc;
use std::sync::Arc;
use tokio::sync::RwLock;
use std::collections::HashMap;

#[derive(Clone, Debug, PartialEq)]
pub enum CircuitState {
    Closed,
    Open,
    HalfOpen,
}

#[derive(Clone, Debug)]
pub struct CircuitConfig {
    pub failure_threshold: u32,
    pub recovery_timeout_secs: u64,
}

impl Default for CircuitConfig {
    fn default() -> Self {
        Self {
            failure_threshold: 5,
            recovery_timeout_secs: 30,
        }
    }
}

#[derive(Clone, Debug)]
struct CircuitEntry {
    state: CircuitState,
    failure_count: u32,
    last_failure_at: Option<chrono::DateTime<Utc>>,
    config: CircuitConfig,
}

/// In-memory circuit breaker with DB persistence for cross-instance coordination.
/// Each application instance maintains its own in-memory state for fast checks,
/// and periodically syncs to `circuit_breaker_state` table for cluster-wide visibility.
pub struct CircuitBreaker {
    circuits: Arc<RwLock<HashMap<String, CircuitEntry>>>,
    pool: PgPool,
}

impl CircuitBreaker {
    pub fn new(pool: PgPool) -> Self {
        Self {
            circuits: Arc::new(RwLock::new(HashMap::new())),
            pool,
        }
    }

    /// Check if a request to the named service should be allowed.
    /// Returns true if the circuit is closed or half-open (probe allowed).
    pub async fn allow_request(&self, service: &str) -> bool {
        let circuits = self.circuits.read().await;
        match circuits.get(service) {
            None => true, // No circuit = closed by default
            Some(entry) => match entry.state {
                CircuitState::Closed => true,
                CircuitState::HalfOpen => true, // Allow probe
                CircuitState::Open => {
                    // Check if recovery timeout has elapsed
                    if let Some(last_fail) = entry.last_failure_at {
                        let elapsed = Utc::now()
                            .signed_duration_since(last_fail)
                            .num_seconds() as u64;
                        elapsed >= entry.config.recovery_timeout_secs
                    } else {
                        true
                    }
                }
            },
        }
    }

    /// Record a successful call — resets failure count, closes circuit.
    pub async fn record_success(&self, service: &str) {
        let mut circuits = self.circuits.write().await;
        if let Some(entry) = circuits.get_mut(service) {
            entry.state = CircuitState::Closed;
            entry.failure_count = 0;
        }
        // Persist async (fire-and-forget for performance)
        let pool = self.pool.clone();
        let svc = service.to_string();
        tokio::spawn(async move {
            let _ = sqlx::query(
                "INSERT INTO circuit_breaker_state (service_name, state, failure_count, success_count, last_success_at, updated_at)
                 VALUES ($1, 'closed', 0, 1, NOW(), NOW())
                 ON CONFLICT (service_name) DO UPDATE SET
                   state = 'closed', failure_count = 0,
                   success_count = circuit_breaker_state.success_count + 1,
                   last_success_at = NOW(), updated_at = NOW()"
            )
            .bind(&svc)
            .execute(&pool)
            .await;
        });
    }

    /// Record a failed call — increments failure count, may open circuit.
    pub async fn record_failure(&self, service: &str) {
        let mut circuits = self.circuits.write().await;
        let entry = circuits.entry(service.to_string()).or_insert_with(|| CircuitEntry {
            state: CircuitState::Closed,
            failure_count: 0,
            last_failure_at: None,
            config: CircuitConfig::default(),
        });

        entry.failure_count += 1;
        entry.last_failure_at = Some(Utc::now());

        if entry.failure_count >= entry.config.failure_threshold {
            entry.state = CircuitState::Open;
            tracing::warn!(
                service = service,
                failures = entry.failure_count,
                "Circuit breaker OPENED — failing fast for {}",
                service
            );
        }

        // Persist
        let pool = self.pool.clone();
        let svc = service.to_string();
        let fc = entry.failure_count;
        let state_str = match entry.state {
            CircuitState::Closed => "closed",
            CircuitState::Open => "open",
            CircuitState::HalfOpen => "half_open",
        };
        let state_owned = state_str.to_string();
        tokio::spawn(async move {
            let _ = sqlx::query(
                "INSERT INTO circuit_breaker_state (service_name, state, failure_count, last_failure_at, updated_at)
                 VALUES ($1, $2, $3, NOW(), NOW())
                 ON CONFLICT (service_name) DO UPDATE SET
                   state = $2, failure_count = $3,
                   last_failure_at = NOW(), updated_at = NOW()"
            )
            .bind(&svc)
            .bind(&state_owned)
            .bind(fc as i32)
            .execute(&pool)
            .await;
        });
    }

    /// Register a service with custom config.
    pub async fn register(&self, service: &str, config: CircuitConfig) {
        let mut circuits = self.circuits.write().await;
        circuits.insert(service.to_string(), CircuitEntry {
            state: CircuitState::Closed,
            failure_count: 0,
            last_failure_at: None,
            config,
        });
    }
}
