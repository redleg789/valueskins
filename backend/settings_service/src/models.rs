use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct UserSettings {
    pub user_id: i64,
    pub willing_to_barter: bool,
    pub energy_state: String,
    pub price_band: String,
    pub auto_escalation: bool,
    pub notifications_enabled: bool,
    pub profile_visibility: String,
    pub updated_at: DateTime<Utc>,
}

/// Partial update — only specified fields are changed.
/// All fields are optional so clients send only what they want to update.
#[derive(Debug, Deserialize)]
pub struct UpdateSettingsRequest {
    pub willing_to_barter: Option<bool>,
    pub energy_state: Option<String>,
    pub price_band: Option<String>,
    pub auto_escalation: Option<bool>,
    pub notifications_enabled: Option<bool>,
    pub profile_visibility: Option<String>,
}

impl UpdateSettingsRequest {
    /// Validate enum fields before applying.
    pub fn validate(&self) -> Result<(), &'static str> {
        if let Some(ref e) = self.energy_state {
            if !["available", "limited", "burnout", "pause"].contains(&e.as_str()) {
                return Err("energy_state must be one of: available, limited, burnout, pause");
            }
        }
        if let Some(ref p) = self.price_band {
            if !["experimental", "mid-tier", "premium", "exclusive"].contains(&p.as_str()) {
                return Err("price_band must be one of: experimental, mid-tier, premium, exclusive");
            }
        }
        if let Some(ref v) = self.profile_visibility {
            if !["public", "private", "connections_only"].contains(&v.as_str()) {
                return Err("profile_visibility must be one of: public, private, connections_only");
            }
        }
        Ok(())
    }
}
