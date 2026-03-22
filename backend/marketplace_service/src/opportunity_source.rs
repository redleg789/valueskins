//! Pluggable opportunity/campaign data source system
//! Replaces hardcoded opportunities in frontend with real database + API

use serde::{Deserialize, Serialize};
use async_trait::async_trait;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Opportunity {
    pub id: String,
    pub platform: String, // "instagram", "youtube", "tiktok", "linkedin"
    pub brand_id: String,
    pub brand_name: String,
    pub title: String,
    pub description: String,
    pub category: String,
    pub deal_type: String, // "paid", "barter", "c2c_paid", "c2c_collab"
    pub budget_min: i32,
    pub budget_max: i32,
    pub timeline_days: i32,
    pub deliverables: String, // JSON: video, posts, stories, etc.
    pub brief_url: Option<String>,
    pub script_required: bool,
    pub script_mode: Option<String>, // "locked", "collaborative", "freedom"
    pub script_text: Option<String>,
    pub required_professions: Vec<String>, // JSON array
    pub required_followers_min: Option<i64>,
    pub geo_targeting: Option<String>, // JSON: countries/regions
    pub languages_required: Option<Vec<String>>, // JSON array
    pub status: String, // "open", "in_progress", "closed", "completed"
    pub applications_count: i32,
    pub created_at: DateTime<Utc>,
    pub deadline_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpportunityQuery {
    pub platform: String,
    pub profession: Option<String>,
    pub min_budget: Option<i32>,
    pub max_budget: Option<i32>,
    pub deal_type: Option<String>,
    pub status: String, // "open", "closed", "all"
    pub limit: i32,
    pub offset: i32,
}

/// Abstract trait for opportunity data sources
#[async_trait]
pub trait OpportunityDataSource: Send + Sync {
    /// Search opportunities matching criteria
    async fn search_opportunities(&self, query: OpportunityQuery) -> Result<Vec<Opportunity>, SourceError>;

    /// Get single opportunity by ID
    async fn get_opportunity(&self, opportunity_id: &str) -> Result<Opportunity, SourceError>;

    /// Get opportunities by brand
    async fn get_brand_opportunities(&self, brand_id: &str, limit: i32) -> Result<Vec<Opportunity>, SourceError>;

    /// Get opportunities for a specific profession
    async fn get_opportunities_by_profession(&self, platform: &str, profession: &str, limit: i32) -> Result<Vec<Opportunity>, SourceError>;

    /// Create new opportunity (brand submission)
    async fn create_opportunity(&self, opp: CreateOpportunityRequest) -> Result<Opportunity, SourceError>;

    /// Update opportunity
    async fn update_opportunity(&self, id: &str, updates: UpdateOpportunityRequest) -> Result<Opportunity, SourceError>;

    /// Close opportunity (no more applications)
    async fn close_opportunity(&self, id: &str) -> Result<(), SourceError>;

    /// Source name for logging
    fn source_name(&self) -> &str;

    /// Is this mock data?
    fn is_mock(&self) -> bool;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateOpportunityRequest {
    pub platform: String,
    pub brand_id: String,
    pub brand_name: String,
    pub title: String,
    pub description: String,
    pub category: String,
    pub deal_type: String,
    pub budget_min: i32,
    pub budget_max: i32,
    pub timeline_days: i32,
    pub deliverables: String,
    pub brief_url: Option<String>,
    pub script_required: bool,
    pub script_mode: Option<String>,
    pub script_text: Option<String>,
    pub required_professions: Vec<String>,
    pub required_followers_min: Option<i64>,
    pub geo_targeting: Option<String>,
    pub languages_required: Option<Vec<String>>,
    pub deadline_days_from_now: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateOpportunityRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub budget_min: Option<i32>,
    pub budget_max: Option<i32>,
    pub status: Option<String>,
    pub deadline_at: Option<DateTime<Utc>>,
}

#[derive(Debug)]
pub enum SourceError {
    NotFound,
    ValidationError(String),
    DatabaseError(String),
    APIError(String),
}

impl std::fmt::Display for SourceError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SourceError::NotFound => write!(f, "Opportunity not found"),
            SourceError::ValidationError(e) => write!(f, "Validation error: {}", e),
            SourceError::DatabaseError(e) => write!(f, "Database error: {}", e),
            SourceError::APIError(e) => write!(f, "API error: {}", e),
        }
    }
}

impl std::error::Error for SourceError {}

/// Database-backed opportunity source (Production)
pub struct DatabaseOpportunitySource {
    pool: sqlx::PgPool,
}

impl DatabaseOpportunitySource {
    pub fn new(pool: sqlx::PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl OpportunityDataSource for DatabaseOpportunitySource {
    async fn search_opportunities(&self, query: OpportunityQuery) -> Result<Vec<Opportunity>, SourceError> {
        let status_filter = if query.status == "all" {
            vec!["open", "in_progress", "closed", "completed"].join("','")
        } else {
            query.status.clone()
        };

        let mut sql = format!(
            "SELECT * FROM opportunities WHERE platform = '{}' AND status IN ('{}')",
            query.platform, status_filter
        );

        if let Some(prof) = &query.profession {
            sql.push_str(&format!(" AND required_professions @> '[\"{}\"]'", prof));
        }
        if let Some(min_budget) = query.min_budget {
            sql.push_str(&format!(" AND budget_max >= {}", min_budget));
        }
        if let Some(max_budget) = query.max_budget {
            sql.push_str(&format!(" AND budget_min <= {}", max_budget));
        }
        if let Some(deal_type) = &query.deal_type {
            sql.push_str(&format!(" AND deal_type = '{}'", deal_type));
        }

        sql.push_str(&format!(
            " ORDER BY created_at DESC LIMIT {} OFFSET {}",
            query.limit, query.offset
        ));

        sqlx::query_as::<_, Opportunity>(&sql)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| SourceError::DatabaseError(e.to_string()))
    }

    async fn get_opportunity(&self, opportunity_id: &str) -> Result<Opportunity, SourceError> {
        sqlx::query_as::<_, Opportunity>("SELECT * FROM opportunities WHERE id = $1")
            .bind(opportunity_id)
            .fetch_optional(&self.pool)
            .await
            .map_err(|e| SourceError::DatabaseError(e.to_string()))?
            .ok_or(SourceError::NotFound)
    }

    async fn get_brand_opportunities(&self, brand_id: &str, limit: i32) -> Result<Vec<Opportunity>, SourceError> {
        sqlx::query_as::<_, Opportunity>(
            "SELECT * FROM opportunities WHERE brand_id = $1 ORDER BY created_at DESC LIMIT $2"
        )
        .bind(brand_id)
        .bind(limit)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| SourceError::DatabaseError(e.to_string()))
    }

    async fn get_opportunities_by_profession(&self, platform: &str, profession: &str, limit: i32) -> Result<Vec<Opportunity>, SourceError> {
        sqlx::query_as::<_, Opportunity>(
            "SELECT * FROM opportunities WHERE platform = $1 AND required_professions @> $2 AND status = 'open' ORDER BY created_at DESC LIMIT $3"
        )
        .bind(platform)
        .bind(format!("[\"{}\"]", profession))
        .bind(limit)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| SourceError::DatabaseError(e.to_string()))
    }

    async fn create_opportunity(&self, req: CreateOpportunityRequest) -> Result<Opportunity, SourceError> {
        let id = uuid::Uuid::new_v4().to_string();
        let now = Utc::now();
        let deadline = now + chrono::Duration::days(req.deadline_days_from_now as i64);

        let deliverables_json = req.deliverables;
        let professions_json = serde_json::to_string(&req.required_professions)
            .map_err(|_| SourceError::ValidationError("Invalid professions format".to_string()))?;
        let langs_json = req.languages_required
            .as_ref()
            .map(|l| serde_json::to_string(l).ok())
            .flatten();

        sqlx::query_as::<_, Opportunity>(
            r#"
            INSERT INTO opportunities
            (id, platform, brand_id, brand_name, title, description, category, deal_type, budget_min, budget_max,
             timeline_days, deliverables, brief_url, script_required, script_mode, script_text,
             required_professions, required_followers_min, geo_targeting, languages_required,
             status, applications_count, created_at, deadline_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
            RETURNING *
            "#
        )
        .bind(&id)
        .bind(&req.platform)
        .bind(&req.brand_id)
        .bind(&req.brand_name)
        .bind(&req.title)
        .bind(&req.description)
        .bind(&req.category)
        .bind(&req.deal_type)
        .bind(req.budget_min)
        .bind(req.budget_max)
        .bind(req.timeline_days)
        .bind(&deliverables_json)
        .bind(&req.brief_url)
        .bind(req.script_required)
        .bind(&req.script_mode)
        .bind(&req.script_text)
        .bind(&professions_json)
        .bind(req.required_followers_min)
        .bind(&req.geo_targeting)
        .bind(&langs_json)
        .bind("open")
        .bind(0)
        .bind(now)
        .bind(deadline)
        .bind(now)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| SourceError::DatabaseError(e.to_string()))
    }

    async fn update_opportunity(&self, id: &str, updates: UpdateOpportunityRequest) -> Result<Opportunity, SourceError> {
        let mut sql = "UPDATE opportunities SET updated_at = NOW()".to_string();

        if let Some(title) = &updates.title {
            sql.push_str(&format!(", title = '{}'", title.replace("'", "''")));
        }
        if let Some(desc) = &updates.description {
            sql.push_str(&format!(", description = '{}'", desc.replace("'", "''")));
        }
        if let Some(min) = updates.budget_min {
            sql.push_str(&format!(", budget_min = {}", min));
        }
        if let Some(max) = updates.budget_max {
            sql.push_str(&format!(", budget_max = {}", max));
        }
        if let Some(status) = &updates.status {
            sql.push_str(&format!(", status = '{}'", status));
        }
        if let Some(deadline) = updates.deadline_at {
            sql.push_str(&format!(", deadline_at = '{}'", deadline.to_rfc3339()));
        }

        sql.push_str(&format!(" WHERE id = '{}' RETURNING *", id));

        sqlx::query_as::<_, Opportunity>(&sql)
            .fetch_optional(&self.pool)
            .await
            .map_err(|e| SourceError::DatabaseError(e.to_string()))?
            .ok_or(SourceError::NotFound)
    }

    async fn close_opportunity(&self, id: &str) -> Result<(), SourceError> {
        sqlx::query("UPDATE opportunities SET status = 'closed', updated_at = NOW() WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| SourceError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    fn source_name(&self) -> &str {
        "DatabaseOpportunitySource"
    }

    fn is_mock(&self) -> bool {
        false
    }
}

/// Factory for opportunity data sources
pub struct OpportunitySourceFactory;

impl OpportunitySourceFactory {
    pub fn create_database(pool: sqlx::PgPool) -> std::sync::Arc<dyn OpportunityDataSource> {
        std::sync::Arc::new(DatabaseOpportunitySource::new(pool))
    }
}
