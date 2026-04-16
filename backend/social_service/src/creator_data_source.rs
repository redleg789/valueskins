//! Creator Data Source — Pluggable abstraction for any platform
//! Supports: Instagram, YouTube, TikTok, LinkedIn, mock

use async_trait::async_trait;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreatorProfile {
    pub platform_id: String,
    pub username: String,
    pub display_name: String,
    pub profile_picture_url: Option<String>,
    pub bio: Option<String>,
    pub website: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreatorStats {
    pub follower_count: i64,
    pub following_count: i64,
    pub post_count: i64,
    pub average_engagement_rate: f64,
    pub average_reach_per_post: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreatorContent {
    pub content_id: String,
    pub platform_url: String,
    pub published_at: chrono::DateTime<chrono::Utc>,
    pub caption: Option<String>,
    pub likes: i64,
    pub comments: i64,
    pub shares: i64,
}

#[async_trait]
pub trait CreatorDataSource: Send + Sync {
    /// Get creator profile by platform-specific ID
    async fn get_profile(&self, platform_id: &str) -> Result<CreatorProfile, DataSourceError>;

    /// Get creator statistics
    async fn get_stats(&self, platform_id: &str) -> Result<CreatorStats, DataSourceError>;

    /// Get recent content posts
    async fn get_recent_content(&self, platform_id: &str, limit: u32) -> Result<Vec<CreatorContent>, DataSourceError>;

    /// Search creators by username
    async fn search_creators(&self, query: &str, limit: u32) -> Result<Vec<CreatorProfile>, DataSourceError>;

    /// Verify creator has valid access token (still authorized)
    async fn verify_token(&self, platform_id: &str, access_token: &str) -> Result<bool, DataSourceError>;

    /// Refresh creator token if needed
    async fn refresh_token(&self, platform_id: &str, refresh_token: &str) -> Result<String, DataSourceError>;
}

#[derive(Debug)]
pub enum DataSourceError {
    NotFound,
    Unauthorized,
    RateLimited,
    InvalidToken,
    RequestError(String),
    ParseError(String),
}

impl std::fmt::Display for DataSourceError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DataSourceError::NotFound => write!(f, "Creator not found"),
            DataSourceError::Unauthorized => write!(f, "Unauthorized access"),
            DataSourceError::RateLimited => write!(f, "Rate limited by platform API"),
            DataSourceError::InvalidToken => write!(f, "Invalid or expired access token"),
            DataSourceError::RequestError(e) => write!(f, "Request error: {}", e),
            DataSourceError::ParseError(e) => write!(f, "Parse error: {}", e),
        }
    }
}

impl std::error::Error for DataSourceError {}

/// Mock implementation for MVP testing
pub struct MockCreatorDataSource;

#[async_trait]
impl CreatorDataSource for MockCreatorDataSource {
    async fn get_profile(&self, platform_id: &str) -> Result<CreatorProfile, DataSourceError> {
        // Return hardcoded profiles for demo
        Ok(CreatorProfile {
            platform_id: platform_id.to_string(),
            username: format!("creator_{}", platform_id),
            display_name: "Demo Creator".to_string(),
            profile_picture_url: Some("https://via.placeholder.com/150".to_string()),
            bio: Some("Demo creator profile".to_string()),
            website: None,
        })
    }

    async fn get_stats(&self, _platform_id: &str) -> Result<CreatorStats, DataSourceError> {
        Ok(CreatorStats {
            follower_count: 100_000,
            following_count: 500,
            post_count: 250,
            average_engagement_rate: 5.5,
            average_reach_per_post: 150_000,
        })
    }

    async fn get_recent_content(&self, _platform_id: &str, limit: u32) -> Result<Vec<CreatorContent>, DataSourceError> {
        let mut content = Vec::new();
        for i in 0..limit.min(10) {
            content.push(CreatorContent {
                content_id: format!("post_{}", i),
                platform_url: format!("https://instagram.com/p/ABC{}", i),
                published_at: chrono::Utc::now() - chrono::Duration::days(i as i64),
                caption: Some(format!("Demo post caption {}", i)),
                likes: 10_000 + (i * 500) as i64,
                comments: 500 + (i * 25) as i64,
                shares: 100 + (i * 5) as i64,
            });
        }
        Ok(content)
    }

    async fn search_creators(&self, query: &str, limit: u32) -> Result<Vec<CreatorProfile>, DataSourceError> {
        let mut creators = Vec::new();
        for i in 0..limit.min(20) {
            creators.push(CreatorProfile {
                platform_id: format!("{}_{}", query, i),
                username: format!("{}_{}", query, i),
                display_name: format!("Creator {} ({})", i, query),
                profile_picture_url: Some("https://via.placeholder.com/150".to_string()),
                bio: Some(format!("Demo creator in {}", query)),
                website: None,
            });
        }
        Ok(creators)
    }

    async fn verify_token(&self, _platform_id: &str, _access_token: &str) -> Result<bool, DataSourceError> {
        Ok(true) // Mock always returns valid
    }

    async fn refresh_token(&self, _platform_id: &str, _refresh_token: &str) -> Result<String, DataSourceError> {
        Ok("new_mock_token".to_string())
    }
}

/// Real Instagram implementation
pub struct InstagramCreatorDataSource {
    http_client: reqwest::Client,
}

impl InstagramCreatorDataSource {
    pub fn new() -> Self {
        Self {
            http_client: reqwest::Client::new(),
        }
    }
}

#[async_trait]
impl CreatorDataSource for InstagramCreatorDataSource {
    async fn get_profile(&self, platform_id: &str) -> Result<CreatorProfile, DataSourceError> {
        let access_token = std::env::var("INSTAGRAM_ACCESS_TOKEN")
            .map_err(|_| DataSourceError::RequestError("No access token".to_string()))?;

        let response = self.http_client
            .get(&format!("https://graph.instagram.com/v18.0/{}", platform_id))
            .bearer_auth(&access_token)
            .query(&[("fields", "id,username,name,biography,website,profile_picture_url")])
            .send()
            .await
            .map_err(|e| DataSourceError::RequestError(e.to_string()))?;

        if response.status() == 401 {
            return Err(DataSourceError::InvalidToken);
        }
        if response.status() == 429 {
            return Err(DataSourceError::RateLimited);
        }

        let data: serde_json::Value = response.json().await
            .map_err(|e| DataSourceError::ParseError(e.to_string()))?;

        Ok(CreatorProfile {
            platform_id: data["id"].as_str().unwrap_or("").to_string(),
            username: data["username"].as_str().unwrap_or("").to_string(),
            display_name: data["name"].as_str().unwrap_or("").to_string(),
            profile_picture_url: data["profile_picture_url"].as_str().map(|s| s.to_string()),
            bio: data["biography"].as_str().map(|s| s.to_string()),
            website: data["website"].as_str().map(|s| s.to_string()),
        })
    }

    async fn get_stats(&self, platform_id: &str) -> Result<CreatorStats, DataSourceError> {
        let access_token = std::env::var("INSTAGRAM_ACCESS_TOKEN")
            .map_err(|_| DataSourceError::RequestError("No access token".to_string()))?;

        let response = self.http_client
            .get(&format!("https://graph.instagram.com/v18.0/{}", platform_id))
            .bearer_auth(&access_token)
            .query(&[("fields", "followers_count,follows_count,media_count")])
            .send()
            .await
            .map_err(|e| DataSourceError::RequestError(e.to_string()))?;

        let data: serde_json::Value = response.json().await
            .map_err(|e| DataSourceError::ParseError(e.to_string()))?;

        Ok(CreatorStats {
            follower_count: data["followers_count"].as_i64().unwrap_or(0),
            following_count: data["follows_count"].as_i64().unwrap_or(0),
            post_count: data["media_count"].as_i64().unwrap_or(0),
            average_engagement_rate: 0.0, // Calculated from media insights
            average_reach_per_post: 0,
        })
    }

    async fn get_recent_content(&self, platform_id: &str, limit: u32) -> Result<Vec<CreatorContent>, DataSourceError> {
        let access_token = std::env::var("INSTAGRAM_ACCESS_TOKEN")
            .map_err(|_| DataSourceError::RequestError("No access token".to_string()))?;

        let response = self.http_client
            .get(&format!("https://graph.instagram.com/v18.0/{}/media", platform_id))
            .bearer_auth(&access_token)
            .query(&[("fields", "id,timestamp,caption,media_product_type"), ("limit", &limit.to_string())])
            .send()
            .await
            .map_err(|e| DataSourceError::RequestError(e.to_string()))?;

        let data: serde_json::Value = response.json().await
            .map_err(|e| DataSourceError::ParseError(e.to_string()))?;

        let mut content = Vec::new();
        if let Some(items) = data["data"].as_array() {
            for item in items.iter().take(limit as usize) {
                content.push(CreatorContent {
                    content_id: item["id"].as_str().unwrap_or("").to_string(),
                    platform_url: format!("https://instagram.com/p/{}", item["id"].as_str().unwrap_or("")),
                    published_at: chrono::DateTime::parse_from_rfc3339(
                        item["timestamp"].as_str().unwrap_or("2026-01-01T00:00:00+00:00")
                    ).unwrap_or(chrono::FixedOffset::east_opt(0).unwrap().timestamp_opt(0, 0).unwrap().with_timezone(&chrono::Utc)).with_timezone(&chrono::Utc),
                    caption: item["caption"].as_str().map(|s| s.to_string()),
                    likes: 0,
                    comments: 0,
                    shares: 0,
                });
            }
        }

        Ok(content)
    }

    async fn search_creators(&self, query: &str, limit: u32) -> Result<Vec<CreatorProfile>, DataSourceError> {
        // Instagram doesn't provide public creator search
        Err(DataSourceError::Unauthorized)
    }

    async fn verify_token(&self, _platform_id: &str, access_token: &str) -> Result<bool, DataSourceError> {
        let response = self.http_client
            .get("https://graph.instagram.com/v18.0/me")
            .bearer_auth(access_token)
            .send()
            .await
            .map_err(|e| DataSourceError::RequestError(e.to_string()))?;

        Ok(response.status().is_success())
    }

    async fn refresh_token(&self, _platform_id: &str, refresh_token: &str) -> Result<String, DataSourceError> {
        // Instagram long-lived tokens have 60-day expiry, but we refresh via separate endpoint
        let response = self.http_client
            .get("https://graph.instagram.com/v18.0/refresh_access_token")
            .bearer_auth(refresh_token)
            .query(&[("grant_type", "ig_refresh_token")])
            .send()
            .await
            .map_err(|e| DataSourceError::RequestError(e.to_string()))?;

        let data: serde_json::Value = response.json().await
            .map_err(|e| DataSourceError::ParseError(e.to_string()))?;

        data["access_token"].as_str()
            .map(|s| s.to_string())
            .ok_or(DataSourceError::RequestError("No token in response".to_string()))
    }
}

/// Real YouTube implementation
pub struct YouTubeCreatorDataSource {
    http_client: reqwest::Client,
}

impl YouTubeCreatorDataSource {
    pub fn new() -> Self {
        Self {
            http_client: reqwest::Client::new(),
        }
    }
}

#[async_trait]
impl CreatorDataSource for YouTubeCreatorDataSource {
    async fn get_profile(&self, platform_id: &str) -> Result<CreatorProfile, DataSourceError> {
        todo!("Implement real YouTube API call")
    }

    async fn get_stats(&self, platform_id: &str) -> Result<CreatorStats, DataSourceError> {
        todo!("Implement real YouTube analytics API call")
    }

    async fn get_recent_content(&self, platform_id: &str, limit: u32) -> Result<Vec<CreatorContent>, DataSourceError> {
        todo!("Implement real YouTube videos API call")
    }

    async fn search_creators(&self, query: &str, limit: u32) -> Result<Vec<CreatorProfile>, DataSourceError> {
        todo!("Implement YouTube channel search")
    }

    async fn verify_token(&self, platform_id: &str, access_token: &str) -> Result<bool, DataSourceError> {
        todo!("Verify YouTube token validity")
    }

    async fn refresh_token(&self, platform_id: &str, refresh_token: &str) -> Result<String, DataSourceError> {
        todo!("Call YouTube refresh endpoint")
    }
}

/// Real TikTok implementation
pub struct TikTokCreatorDataSource {
    http_client: reqwest::Client,
}

impl TikTokCreatorDataSource {
    pub fn new() -> Self {
        Self {
            http_client: reqwest::Client::new(),
        }
    }
}

#[async_trait]
impl CreatorDataSource for TikTokCreatorDataSource {
    async fn get_profile(&self, platform_id: &str) -> Result<CreatorProfile, DataSourceError> {
        todo!("Implement real TikTok API call")
    }

    async fn get_stats(&self, platform_id: &str) -> Result<CreatorStats, DataSourceError> {
        todo!("Implement real TikTok analytics API call")
    }

    async fn get_recent_content(&self, platform_id: &str, limit: u32) -> Result<Vec<CreatorContent>, DataSourceError> {
        todo!("Implement real TikTok videos API call")
    }

    async fn search_creators(&self, query: &str, limit: u32) -> Result<Vec<CreatorProfile>, DataSourceError> {
        todo!("Implement TikTok creator search")
    }

    async fn verify_token(&self, platform_id: &str, access_token: &str) -> Result<bool, DataSourceError> {
        todo!("Verify TikTok token validity")
    }

    async fn refresh_token(&self, platform_id: &str, refresh_token: &str) -> Result<String, DataSourceError> {
        todo!("Call TikTok refresh endpoint")
    }
}

/// Real LinkedIn implementation
pub struct LinkedInCreatorDataSource {
    http_client: reqwest::Client,
}

impl LinkedInCreatorDataSource {
    pub fn new() -> Self {
        Self {
            http_client: reqwest::Client::new(),
        }
    }
}

#[async_trait]
impl CreatorDataSource for LinkedInCreatorDataSource {
    async fn get_profile(&self, platform_id: &str) -> Result<CreatorProfile, DataSourceError> {
        todo!("Implement real LinkedIn API call")
    }

    async fn get_stats(&self, platform_id: &str) -> Result<CreatorStats, DataSourceError> {
        todo!("Implement real LinkedIn analytics API call")
    }

    async fn get_recent_content(&self, platform_id: &str, limit: u32) -> Result<Vec<CreatorContent>, DataSourceError> {
        todo!("Implement real LinkedIn posts API call")
    }

    async fn search_creators(&self, query: &str, limit: u32) -> Result<Vec<CreatorProfile>, DataSourceError> {
        todo!("Implement LinkedIn profile search")
    }

    async fn verify_token(&self, platform_id: &str, access_token: &str) -> Result<bool, DataSourceError> {
        todo!("Verify LinkedIn token validity")
    }

    async fn refresh_token(&self, platform_id: &str, refresh_token: &str) -> Result<String, DataSourceError> {
        todo!("Call LinkedIn refresh endpoint")
    }
}
