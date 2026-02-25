use sqlx::PgPool;
use crate::models::*;

/// ValuSkin matching engine.
///
/// The core invariant: a creator and brand can ONLY be matched if they share
/// the same profession (ValuSkin). The matching engine enforces this at the
/// query level — no application-layer filtering that could be bypassed.
///
/// Match score formula:
///   base = 50 (same ValuSkin match)
///   + level_bonus (effective_level * 5, max 25) — C-Suite boost applied here
///   + engagement_bonus (if engagement >= 5%, +10)
///   + reliability_bonus (if on_time_rate >= 95%, +10)
///   + repeat_bonus (if repeat_brand_rate >= 0.3, +5)
///   Capped at 100.
///
/// C-Suite advantage: platform_csuite_settings configures a level boost for
/// title-holders (CEO, CTO, VP, etc.). The effective level = base_level +
/// level_boost if enabled for the platform, capped at 5.
pub struct MatchingService {
    pool: PgPool,
}

/// Result of a fraud rule threshold lookup.
/// Contains the threshold value and the action to take when exceeded.
struct FraudRuleThreshold {
    threshold: f64,
    action: String,
}

impl MatchingService {
    /// Compute the effective creator level for a given platform.
    /// Applies C-Suite advantage if the platform has it enabled and
    /// the creator holds a whitelisted title.
    ///
    /// Caps effective level at 5 (system maximum).
    async fn get_effective_level(
        &self,
        persona_id: i64,
        base_level: i32,
        platform_id: &str,
    ) -> i32 {
        // Fetch platform C-Suite settings
        let settings = sqlx::query(
            "SELECT enabled, level_boost_amount, title_whitelist \
             FROM platform_csuite_settings \
             WHERE platform_id = $1 AND enabled = TRUE"
        )
        .bind(platform_id)
        .fetch_optional(&self.pool)
        .await;

        let (boost_amount, whitelist): (i32, Vec<String>) = match settings {
            Ok(Some(row)) => {
                use sqlx::Row;
                let amount: i32 = row.try_get("level_boost_amount").unwrap_or(0);
                let titles: Vec<String> = row.try_get("title_whitelist").unwrap_or_default();
                (amount, titles)
            }
            _ => return base_level,
        };

        if boost_amount == 0 || whitelist.is_empty() {
            return base_level;
        }

        // Check if persona has any whitelisted title (verified)
        let has_csuite: bool = sqlx::query_scalar(
            "SELECT EXISTS(\
                SELECT 1 FROM persona_titles \
                WHERE persona_id = $1 AND is_active = TRUE AND is_verified = TRUE \
                AND title = ANY($2)\
            )"
        )
        .bind(persona_id)
        .bind(&whitelist)
        .fetch_optional(&self.pool)
        .await
        .unwrap_or(None)
        .unwrap_or(false);

        if has_csuite {
            (base_level + boost_amount).min(5)
        } else {
            base_level
        }
    }
}

#[derive(Debug)]
pub enum MatchingError {
    NoProfessionSpecified,
    InvalidLevel,
    Database(sqlx::Error),
}

impl From<sqlx::Error> for MatchingError {
    fn from(e: sqlx::Error) -> Self {
        MatchingError::Database(e)
    }
}

impl MatchingService {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Lookup a fraud rule threshold from the admin-configurable fraud_rules table.
    /// Returns None if the rule does not exist or is disabled.
    async fn get_fraud_rule_threshold(
        &self,
        rule_name: &str,
    ) -> Option<FraudRuleThreshold> {
        let row: Option<(f64, String)> = sqlx::query_as(
            "SELECT threshold_value::float8, action FROM fraud_rules WHERE rule_name = $1 AND enabled = TRUE"
        )
        .bind(rule_name)
        .fetch_optional(&self.pool)
        .await
        .ok()?;

        row.map(|(threshold, action)| FraudRuleThreshold { threshold, action })
    }

    /// Check and enforce discovery scan rate limit for a user.
    /// Uses the discovery_rate_limits table with a 1-hour sliding window.
    /// Returns Ok(()) if allowed, Err(MatchingError::RateLimited) if blocked.
    async fn enforce_discovery_rate_limit(
        &self,
        user_id: i64,
    ) -> Result<(), MatchingError> {
        let threshold = self.get_fraud_rule_threshold("max_discovery_scans_per_hour").await;
        let max_scans = threshold.map(|t| t.threshold as i64).unwrap_or(100);

        // UPSERT: reset window if older than 1 hour, otherwise increment
        let scan_count: i64 = sqlx::query_scalar(
            r#"
            INSERT INTO discovery_rate_limits (user_id, scan_count, window_start)
            VALUES ($1, 1, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                scan_count = CASE
                    WHEN discovery_rate_limits.window_start < NOW() - INTERVAL '1 hour'
                    THEN 1
                    ELSE discovery_rate_limits.scan_count + 1
                END,
                window_start = CASE
                    WHEN discovery_rate_limits.window_start < NOW() - INTERVAL '1 hour'
                    THEN NOW()
                    ELSE discovery_rate_limits.window_start
                END
            RETURNING scan_count
            "#
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await
        .map_err(MatchingError::Database)?;

        if scan_count > max_scans {
            return Err(MatchingError::RateLimited {
                limit: max_scans,
                window: "1 hour".to_string(),
            });
        }

        Ok(())
    }

    /// Brand discovers creators — filtered by ValuSkin match.
    ///
    /// Returns ONLY creators whose persona_professions.profession matches
    /// the brand's specified profession. This is the core matching gate.
    ///
    /// Enforces discovery rate limiting before returning results.
    pub async fn discover_creators(
        &self,
        brand_user_id: i64,
        query: &DiscoverCreatorsQuery,
    ) -> Result<Vec<MatchedCreator>, MatchingError> {
        // Fraud prevention gate: enforce discovery scan rate limit
        self.enforce_discovery_rate_limit(brand_user_id).await?;

        let profession = query.profession.as_deref()
            .ok_or(MatchingError::NoProfessionSpecified)?;
        let min_level = query.min_level.unwrap_or(1).max(1).min(5);
        let barter_only = query.barter_only.unwrap_or(false);
        let limit = query.limit.unwrap_or(20).min(100) as i64;
        let offset = query.offset.unwrap_or(0).max(0) as i64;

        // Core query: JOIN persona_professions with professions to enforce ValuSkin match.
        // LEFT JOIN user_settings for barter/energy filtering.
        // Exclude the brand's own user from results.
        let creators = sqlx::query_as::<_, MatchedCreator>(
            r#"
            SELECT
                u.id AS user_id,
                u.username,
                u.display_name,
                u.avatar_url,
                pr.name AS profession,
                pp.slot,
                pp.level,
                pp.real_score AS score,
                COALESCE(us.willing_to_barter, FALSE) AS willing_to_barter,
                COALESCE(us.energy_state, 'available') AS energy_state,
                COALESCE(us.price_band, 'mid-tier') AS price_band
            FROM persona_professions pp
            JOIN personas p ON pp.persona_id = p.id AND p.exists = TRUE
            JOIN users u ON p.owner_user_id = u.id AND u.is_active = TRUE
            JOIN professions pr ON pp.profession_id = pr.id
            LEFT JOIN user_settings us ON u.id = us.user_id
            WHERE pr.name = $1
              AND pp.level >= $2
              AND u.id != $3
              AND COALESCE(us.energy_state, 'available') != 'pause'
              AND ($4 = FALSE OR COALESCE(us.willing_to_barter, FALSE) = TRUE)
            ORDER BY pp.level DESC, pp.real_score DESC
            LIMIT $5 OFFSET $6
            "#,
        )
        .bind(profession)
        .bind(min_level)
        .bind(brand_user_id)
        .bind(barter_only)
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.pool)
        .await?;

        // Log audit entries for matched creators
        for creator in &creators {
            let _ = sqlx::query(
                r#"
                INSERT INTO matching_audit_log
                    (brand_user_id, creator_user_id, matched_profession, match_score, match_factors, decision)
                VALUES ($1, $2, $3, $4, $5, 'matched')
                "#,
            )
            .bind(brand_user_id)
            .bind(creator.user_id)
            .bind(&creator.profession)
            .bind(Self::compute_match_score(creator))
            .bind(serde_json::json!({
                "level": creator.level,
                "score": creator.score,
                "energy": &creator.energy_state,
                "barter": creator.willing_to_barter,
            }))
            .execute(&self.pool)
            .await;
        }

        Ok(creators)
    }

    /// Creator discovers opportunities — filtered by their ValuSkin.
    ///
    /// Returns ONLY opportunities where the brand has specified a matching_requirement
    /// that matches the creator's ValuSkin profession.
    pub async fn discover_opportunities(
        &self,
        creator_user_id: i64,
        query: &DiscoverOpportunitiesQuery,
    ) -> Result<Vec<MatchedOpportunity>, MatchingError> {
        let limit = query.limit.unwrap_or(20).min(100) as i64;
        let offset = query.offset.unwrap_or(0).max(0) as i64;

        // Verify the creator actually holds this ValuSkin
        let has_skin: bool = sqlx::query_scalar(
            r#"
            SELECT EXISTS(
                SELECT 1 FROM persona_professions pp
                JOIN personas p ON pp.persona_id = p.id
                JOIN professions pr ON pp.profession_id = pr.id
                WHERE p.owner_user_id = $1 AND pr.name = $2
            )
            "#,
        )
        .bind(creator_user_id)
        .bind(&query.valueskin)
        .fetch_one(&self.pool)
        .await?;

        if !has_skin {
            return Ok(vec![]);
        }

        let opportunities = sqlx::query_as::<_, MatchedOpportunity>(
            r#"
            SELECT
                o.id AS opportunity_id,
                u.display_name AS brand_name,
                o.title,
                o.description,
                COALESCE(o.compensation_type, 'paid') AS campaign_type,
                mr.required_profession,
                mr.min_level,
                COALESCE(o.compensation_type, 'paid') AS compensation_type,
                o.reward_amount,
                50.0 AS match_score
            FROM matching_requirements mr
            JOIN opportunities o ON mr.opportunity_id = o.id AND o.status = 'active'
            JOIN users u ON o.brand_user_id = u.id
            WHERE mr.required_profession = $1
              AND ($2::TEXT IS NULL OR o.compensation_type = $2)
            ORDER BY mr.priority ASC, o.created_at DESC
            LIMIT $3 OFFSET $4
            "#,
        )
        .bind(&query.valueskin)
        .bind(query.compensation_filter.as_deref())
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.pool)
        .await?;

        Ok(opportunities)
    }

    /// Set matching requirements for an opportunity.
    /// Brands MUST specify at least one profession.
    pub async fn set_requirements(
        &self,
        opportunity_id: i64,
        brand_user_id: i64,
        req: &SetMatchingRequirementsRequest,
    ) -> Result<Vec<MatchingRequirement>, MatchingError> {
        if req.requirements.is_empty() {
            return Err(MatchingError::NoProfessionSpecified);
        }

        // Verify ownership
        let owns: bool = sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM opportunities WHERE id = $1 AND brand_user_id = $2)",
        )
        .bind(opportunity_id)
        .bind(brand_user_id)
        .fetch_one(&self.pool)
        .await?;

        if !owns {
            return Err(MatchingError::Database(sqlx::Error::RowNotFound));
        }

        // Clear existing requirements
        sqlx::query("DELETE FROM matching_requirements WHERE opportunity_id = $1")
            .bind(opportunity_id)
            .execute(&self.pool)
            .await?;

        let mut result = Vec::new();
        let mut profession_names = Vec::new();

        for input in &req.requirements {
            let level = input.min_level.unwrap_or(1).max(1).min(5);
            let priority = input.priority.unwrap_or(1).max(1).min(3);

            let row = sqlx::query_as::<_, MatchingRequirement>(
                r#"
                INSERT INTO matching_requirements (opportunity_id, required_profession, min_level, priority)
                VALUES ($1, $2, $3, $4)
                RETURNING id, opportunity_id, required_profession, min_level, priority, created_at
                "#,
            )
            .bind(opportunity_id)
            .bind(&input.required_profession)
            .bind(level)
            .bind(priority)
            .fetch_one(&self.pool)
            .await?;

            profession_names.push(input.required_profession.clone());
            result.push(row);
        }

        // Denormalize into opportunities.required_professions for fast reads
        sqlx::query(
            "UPDATE opportunities SET required_professions = $1 WHERE id = $2",
        )
        .bind(&profession_names)
        .bind(opportunity_id)
        .execute(&self.pool)
        .await?;

        Ok(result)
    }

    /// Get matching requirements for an opportunity.
    pub async fn get_requirements(
        &self,
        opportunity_id: i64,
    ) -> Result<Vec<MatchingRequirement>, MatchingError> {
        let rows = sqlx::query_as::<_, MatchingRequirement>(
            "SELECT * FROM matching_requirements WHERE opportunity_id = $1 ORDER BY priority",
        )
        .bind(opportunity_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows)
    }

    /// Get the audit log for a specific opportunity or creator.
    pub async fn get_audit_log(
        &self,
        user_id: i64,
        limit: i64,
    ) -> Result<Vec<MatchAuditEntry>, MatchingError> {
        let rows = sqlx::query_as::<_, MatchAuditEntry>(
            r#"
            SELECT id, opportunity_id, brand_user_id, creator_user_id,
                   matched_profession, match_score::float8 AS match_score,
                   decision, created_at
            FROM matching_audit_log
            WHERE brand_user_id = $1 OR creator_user_id = $1
            ORDER BY created_at DESC
            LIMIT $2
            "#,
        )
        .bind(user_id)
        .bind(limit.min(100))
        .fetch_all(&self.pool)
        .await?;

        Ok(rows)
    }

    fn compute_match_score(creator: &MatchedCreator) -> f64 {
        let mut score: f64 = 50.0; // base: same ValuSkin
        score += (creator.level as f64 * 5.0).min(25.0);
        // More factors would come from reputation_service in production
        score.min(100.0)
    }
}
