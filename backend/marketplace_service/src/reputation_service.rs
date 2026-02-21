use chrono::Utc;
use sqlx::PgPool;

#[derive(Clone, Debug)]
pub struct ReputationScore {
    pub creator_user_id: i64,
    pub reputation_score: f64,
    pub on_time_rate: f64,
    pub avg_rating: f64,
    pub response_score: f64,
    pub revision_efficiency: f64,
    pub repeat_brand_rate: f64,
    pub total_deals: i32,
}

#[derive(Clone, Debug)]
pub enum ReputationError {
    NotFound,
    Database(String),
}

impl From<sqlx::Error> for ReputationError {
    fn from(err: sqlx::Error) -> Self {
        match err {
            sqlx::Error::RowNotFound => ReputationError::NotFound,
            _ => ReputationError::Database(err.to_string()),
        }
    }
}

pub struct ReputationService {
    pool: PgPool,
}

impl ReputationService {
    pub fn new(pool: PgPool) -> Self {
        ReputationService { pool }
    }

    /// Calculate reputation score for a creator
    /// Formula:
    /// score = (on_time_rate * 0.30) + (avg_rating/5.0 * 0.25) + (response_score * 0.20)
    ///         + (revision_efficiency * 0.15) + (repeat_brand_rate * 0.10)
    /// final = score * 100 (0-100 scale)
    pub async fn calculate_for_creator(
        &self,
        creator_user_id: i64,
    ) -> Result<ReputationScore, ReputationError> {
        // Get total completed deals for this creator
        let total_deals: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM completed_deals WHERE creator_user_id = $1"
        )
        .bind(creator_user_id)
        .fetch_one(&self.pool)
        .await
        .map_err(ReputationError::from)?;

        if total_deals == 0 {
            // No deals yet, return neutral score
            return Ok(ReputationScore {
                creator_user_id,
                reputation_score: 50.0,
                on_time_rate: 0.0,
                avg_rating: 0.0,
                response_score: 0.0,
                revision_efficiency: 0.0,
                repeat_brand_rate: 0.0,
                total_deals: 0,
            });
        }

        // Get trust scores
        let trust_scores: (Option<f64>, Option<f64>, Option<f64>) = sqlx::query_as(
            "SELECT COALESCE(completion_score, 0), COALESCE(response_reliability, 0),
                    CASE WHEN revision_abuse_flag THEN 0.5 ELSE 1.0 END
             FROM trust_scores WHERE persona_id IN (
                 SELECT id FROM personas WHERE user_id = $1 LIMIT 1
             )"
        )
        .bind(creator_user_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(ReputationError::from)?
        .unwrap_or((Some(0.0), Some(0.0), Some(1.0)));

        let on_time_rate = trust_scores.0.unwrap_or(0.0).min(1.0).max(0.0);
        let response_score = trust_scores.1.unwrap_or(0.0).min(1.0).max(0.0);
        let revision_efficiency = trust_scores.2.unwrap_or(0.5).min(1.0).max(0.0);

        // Get average rating from testimonials
        let avg_rating: Option<f64> = sqlx::query_scalar(
            "SELECT AVG(CAST(rating AS FLOAT)) FROM testimonials
             WHERE for_persona_id IN (
                 SELECT id FROM personas WHERE user_id = $1
             )"
        )
        .bind(creator_user_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(ReputationError::from)?
        .flatten();

        let avg_rating = avg_rating.unwrap_or(0.0);

        // Repeat brand rate: fraction of deals that are with a brand the creator
        // has worked with before. Higher = brands keep coming back = good signal.
        // Formula: 1 - (distinct_brands / total_deals). Clamped to [0, 1].
        let repeat_rate: Option<f64> = sqlx::query_scalar(
            "SELECT 1.0 - (CAST(COUNT(DISTINCT brand_user_id) AS FLOAT) /
                           CAST(GREATEST(COUNT(*), 1) AS FLOAT))
             FROM completed_deals WHERE creator_user_id = $1"
        )
        .bind(creator_user_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(ReputationError::from)?
        .flatten();

        let repeat_brand_rate = repeat_rate.unwrap_or(0.0).min(1.0).max(0.0);

        // Weighted formula
        let score = (on_time_rate * 0.30)
            + ((avg_rating / 5.0) * 0.25)
            + (response_score * 0.20)
            + (revision_efficiency * 0.15)
            + (repeat_brand_rate * 0.10);

        let final_score = (score * 100.0).min(100.0).max(0.0);

        // UPSERT into creator_reputation_metrics
        let now = Utc::now();
        sqlx::query(
            "INSERT INTO creator_reputation_metrics
             (creator_user_id, reputation_score, on_time_rate, avg_rating, response_score,
              revision_efficiency, repeat_brand_rate, total_deals, last_calculated_at, needs_refresh, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE, $10)
             ON CONFLICT (creator_user_id) DO UPDATE SET
               reputation_score = EXCLUDED.reputation_score,
               on_time_rate = EXCLUDED.on_time_rate,
               avg_rating = EXCLUDED.avg_rating,
               response_score = EXCLUDED.response_score,
               revision_efficiency = EXCLUDED.revision_efficiency,
               repeat_brand_rate = EXCLUDED.repeat_brand_rate,
               total_deals = EXCLUDED.total_deals,
               last_calculated_at = EXCLUDED.last_calculated_at,
               needs_refresh = FALSE,
               updated_at = EXCLUDED.updated_at"
        )
        .bind(creator_user_id)
        .bind(final_score)
        .bind(on_time_rate)
        .bind(avg_rating)
        .bind(response_score)
        .bind(revision_efficiency)
        .bind(repeat_brand_rate)
        .bind(total_deals as i32)
        .bind(now)
        .bind(now)
        .execute(&self.pool)
        .await
        .map_err(ReputationError::from)?;

        Ok(ReputationScore {
            creator_user_id,
            reputation_score: final_score,
            on_time_rate,
            avg_rating,
            response_score,
            revision_efficiency,
            repeat_brand_rate,
            total_deals: total_deals as i32,
        })
    }

    /// Batch refresh all creators' reputation scores
    pub async fn batch_refresh_all(&self) -> Result<usize, ReputationError> {
        let creator_ids: Vec<i64> = sqlx::query_scalar(
            "SELECT DISTINCT creator_user_id FROM completed_deals"
        )
        .fetch_all(&self.pool)
        .await
        .map_err(ReputationError::from)?;

        let mut count = 0;
        for creator_id in creator_ids {
            if self.calculate_for_creator(creator_id).await.is_ok() {
                count += 1;
            }
        }

        Ok(count)
    }

    /// Get calculated reputation for a creator
    pub async fn get_reputation(
        &self,
        creator_user_id: i64,
    ) -> Result<ReputationScore, ReputationError> {
        let row: (i64, f64, f64, f64, f64, f64, f64, i32) = sqlx::query_as(
            "SELECT creator_user_id, reputation_score, on_time_rate, avg_rating, response_score,
                    revision_efficiency, repeat_brand_rate, total_deals
             FROM creator_reputation_metrics WHERE creator_user_id = $1"
        )
        .bind(creator_user_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(ReputationError::from)?
        .ok_or(ReputationError::NotFound)?;

        Ok(ReputationScore {
            creator_user_id: row.0,
            reputation_score: row.1,
            on_time_rate: row.2,
            avg_rating: row.3,
            response_score: row.4,
            revision_efficiency: row.5,
            repeat_brand_rate: row.6,
            total_deals: row.7,
        })
    }
}
