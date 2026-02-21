use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use serde::{Deserialize, Serialize};
use chrono::{Utc, Duration};
use crate::error::AuthError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    /// Internal user ID (primary key in users table)
    pub sub: String,
    /// Instagram user ID (from Meta Graph API)
    pub ig_user_id: String,
    /// User role: "creator" or "brand"
    pub role: String,
    /// Persona ID if the user has one
    pub persona_id: Option<i64>,
    /// API rate limit tier: "free" | "basic" | "pro" | "enterprise"
    /// Defaults to "free" if not set; embedded in JWT to avoid per-request DB lookup.
    pub tier: Option<String>,
    /// Token expiration (Unix timestamp)
    pub exp: usize,
    /// Token issued at (Unix timestamp)
    pub iat: usize,
}

pub struct TokenManager {
    encoding_key: EncodingKey,
    decoding_key: DecodingKey,
}

impl TokenManager {
    pub fn new(secret: &str) -> Self {
        Self {
            encoding_key: EncodingKey::from_secret(secret.as_bytes()),
            decoding_key: DecodingKey::from_secret(secret.as_bytes()),
        }
    }

    pub fn create_token(
        &self,
        user_id: i64,
        ig_user_id: &str,
        role: &str,
        persona_id: Option<i64>,
    ) -> Result<String, AuthError> {
        self.create_token_with_tier(user_id, ig_user_id, role, persona_id, None)
    }

    pub fn create_token_with_tier(
        &self,
        user_id: i64,
        ig_user_id: &str,
        role: &str,
        persona_id: Option<i64>,
        tier: Option<String>,
    ) -> Result<String, AuthError> {
        let expiration = Utc::now()
            .checked_add_signed(Duration::try_hours(24).expect("valid duration"))
            .expect("valid timestamp")
            .timestamp();

        let claims = Claims {
            sub: user_id.to_string(),
            ig_user_id: ig_user_id.to_owned(),
            role: role.to_owned(),
            persona_id,
            tier,
            iat: Utc::now().timestamp() as usize,
            exp: expiration as usize,
        };

        encode(&Header::default(), &claims, &self.encoding_key)
            .map_err(|_| AuthError::TokenCreationError)
    }

    pub fn validate_token(&self, token: &str) -> Result<Claims, AuthError> {
        let token_data = decode::<Claims>(
            token,
            &self.decoding_key,
            &Validation::default()
        ).map_err(|_| AuthError::InvalidToken)?;

        Ok(token_data.claims)
    }
}
