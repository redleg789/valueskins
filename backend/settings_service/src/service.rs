use sqlx::PgPool;
use crate::models::*;

pub struct SettingsService {
    pool: PgPool,
}

#[derive(Debug)]
pub enum SettingsError {
    Validation(&'static str),
    Database(sqlx::Error),
}

impl From<sqlx::Error> for SettingsError {
    fn from(e: sqlx::Error) -> Self {
        SettingsError::Database(e)
    }
}

impl SettingsService {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Get settings for a user. Creates default row if none exists (UPSERT pattern).
    pub async fn get_settings(&self, user_id: i64) -> Result<UserSettings, SettingsError> {
        let settings = sqlx::query_as::<_, UserSettings>(
            r#"
            INSERT INTO user_settings (user_id)
            VALUES ($1)
            ON CONFLICT (user_id) DO NOTHING;

            SELECT user_id, willing_to_barter, energy_state, price_band,
                   auto_escalation, notifications_enabled, profile_visibility, updated_at
            FROM user_settings
            WHERE user_id = $1
            "#,
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await;

        // SQLx doesn't support multi-statement in query_as, so split:
        match settings {
            Ok(s) => Ok(s),
            Err(_) => {
                // Ensure row exists
                sqlx::query(
                    "INSERT INTO user_settings (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING"
                )
                .bind(user_id)
                .execute(&self.pool)
                .await?;

                let s = sqlx::query_as::<_, UserSettings>(
                    r#"
                    SELECT user_id, willing_to_barter, energy_state, price_band,
                           auto_escalation, notifications_enabled, profile_visibility, updated_at
                    FROM user_settings
                    WHERE user_id = $1
                    "#,
                )
                .bind(user_id)
                .fetch_one(&self.pool)
                .await?;

                Ok(s)
            }
        }
    }

    /// Update settings — partial update, only specified fields change.
    pub async fn update_settings(
        &self,
        user_id: i64,
        req: &UpdateSettingsRequest,
    ) -> Result<UserSettings, SettingsError> {
        req.validate().map_err(SettingsError::Validation)?;

        // Ensure row exists first
        sqlx::query(
            "INSERT INTO user_settings (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING"
        )
        .bind(user_id)
        .execute(&self.pool)
        .await?;

        // Build dynamic UPDATE using COALESCE pattern — only overwrite if provided
        let settings = sqlx::query_as::<_, UserSettings>(
            r#"
            UPDATE user_settings SET
                willing_to_barter = COALESCE($2, willing_to_barter),
                energy_state = COALESCE($3, energy_state),
                price_band = COALESCE($4, price_band),
                auto_escalation = COALESCE($5, auto_escalation),
                notifications_enabled = COALESCE($6, notifications_enabled),
                profile_visibility = COALESCE($7, profile_visibility)
            WHERE user_id = $1
            RETURNING user_id, willing_to_barter, energy_state, price_band,
                      auto_escalation, notifications_enabled, profile_visibility, updated_at
            "#,
        )
        .bind(user_id)
        .bind(req.willing_to_barter)
        .bind(req.energy_state.as_deref())
        .bind(req.price_band.as_deref())
        .bind(req.auto_escalation)
        .bind(req.notifications_enabled)
        .bind(req.profile_visibility.as_deref())
        .fetch_one(&self.pool)
        .await?;

        Ok(settings)
    }
}
