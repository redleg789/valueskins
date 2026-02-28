use jsonwebtoken::{encode, decode, Header, Algorithm, Validation, EncodingKey, DecodingKey};
use serde::{Deserialize, Serialize};
use chrono::{Utc, Duration};
use crate::error::AuthError;

const VALID_ROLES: [&str; 2] = ["creator", "brand"];
const VALID_TIERS: [&str; 4] = ["free", "basic", "pro", "enterprise"];

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
        // Reject invalid roles at token creation — prevents privilege escalation
        // via tampered role strings embedded in JWTs
        if !VALID_ROLES.contains(&role) {
            return Err(AuthError::TokenCreationError);
        }

        // Reject invalid tiers — prevents rate-limit bypass via forged tier claims
        if let Some(ref t) = tier {
            if !VALID_TIERS.contains(&t.as_str()) {
                return Err(AuthError::TokenCreationError);
            }
        }

        let now = Utc::now();
        let expiration = now
            .checked_add_signed(Duration::try_hours(24).expect("valid duration"))
            .expect("valid timestamp")
            .timestamp();

        let claims = Claims {
            sub: user_id.to_string(),
            ig_user_id: ig_user_id.to_owned(),
            role: role.to_owned(),
            persona_id,
            tier,
            iat: now.timestamp() as usize,
            exp: expiration as usize,
        };

        // Pin to HS256 — Header::default() uses HS256 but being explicit
        // prevents accidental algorithm change in dependency upgrades
        let header = Header::new(Algorithm::HS256);
        encode(&header, &claims, &self.encoding_key)
            .map_err(|_| AuthError::TokenCreationError)
    }

    pub fn validate_token(&self, token: &str) -> Result<Claims, AuthError> {
        // Pin algorithm to HS256 to prevent algorithm confusion attacks.
        // Validation::default() accepts any algorithm — an attacker could
        // forge a token using "none" or switch to RS256 with the HMAC secret
        // as a public key, bypassing signature verification entirely.
        let mut validation = Validation::new(Algorithm::HS256);
        validation.validate_exp = true;
        validation.validate_nbf = false;
        validation.leeway = 30; // 30-second clock skew tolerance for distributed deploys

        let token_data = decode::<Claims>(
            token,
            &self.decoding_key,
            &validation,
        ).map_err(|_| AuthError::InvalidToken)?;

        // Post-decode validation: reject tokens with invalid role/tier claims
        // even if signature is valid (defense-in-depth against DB corruption)
        if !VALID_ROLES.contains(&token_data.claims.role.as_str()) {
            return Err(AuthError::InvalidToken);
        }
        if let Some(ref t) = token_data.claims.tier {
            if !VALID_TIERS.contains(&t.as_str()) {
                return Err(AuthError::InvalidToken);
            }
        }

        Ok(token_data.claims)
    }
}
