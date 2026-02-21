use thiserror::Error;

#[derive(Error, Debug)]
pub enum AuthError {
    #[error("Invalid Instagram access token")]
    InvalidAccessToken,
    #[error("Instagram API error: {0}")]
    InstagramApiError(String),
    #[error("Token creation error")]
    TokenCreationError,
    #[error("Invalid token")]
    InvalidToken,
    #[error("Token expired")]
    TokenExpired,
    #[error("User not found")]
    UserNotFound,
    #[error("Insufficient permissions: {0}")]
    InsufficientPermissions(String),
    #[error("Database error")]
    DatabaseError(#[from] sqlx::Error),
    #[error("Network error: {0}")]
    NetworkError(String),
}
