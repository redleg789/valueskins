//! S3 Storage Service — Video/file uploads with presigned URLs

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PresignedUrl {
    pub url: String,
    pub expires_in_seconds: i32,
    pub key: String,
    pub bucket: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UploadMetadata {
    pub key: String,
    pub size_bytes: i64,
    pub mime_type: String,
    pub uploaded_at: chrono::DateTime<chrono::Utc>,
    pub expires_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug)]
pub enum StorageError {
    NotConfigured,
    InvalidBucket,
    InvalidKey,
    UploadFailed(String),
    AccessDenied,
}

pub struct S3StorageService {
    bucket: String,
    region: String,
    expiry_seconds: i32,
}

impl S3StorageService {
    pub fn new(bucket: String, region: String) -> Self {
        Self {
            bucket,
            region,
            expiry_seconds: 900, // 15 minutes
        }
    }

    /// Generate presigned PUT URL for creator to upload deliverable
    pub fn generate_upload_url(
        &self,
        user_id: i64,
        deal_id: i64,
        filename: &str,
    ) -> Result<PresignedUrl, StorageError> {
        if self.bucket.is_empty() {
            return Err(StorageError::NotConfigured);
        }

        // S3 key: deliverables/{user_id}/{deal_id}/{timestamp}_{filename}
        let timestamp = chrono::Utc::now().timestamp();
        let key = format!("deliverables/{}/{}/{}_{}", user_id, deal_id, timestamp, filename);

        // TODO: Call AWS SDK to generate presigned PUT URL
        // For now, return template that SDK will fill in
        let presigned_url = format!(
            "https://{}.s3.{}.amazonaws.com/{}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires={}",
            self.bucket, self.region, key, self.expiry_seconds
        );

        Ok(PresignedUrl {
            url: presigned_url,
            expires_in_seconds: self.expiry_seconds,
            key,
            bucket: self.bucket.clone(),
        })
    }

    /// Generate presigned GET URL for brand to view deliverable
    pub fn generate_download_url(&self, key: &str) -> Result<PresignedUrl, StorageError> {
        if self.bucket.is_empty() {
            return Err(StorageError::NotConfigured);
        }

        let presigned_url = format!(
            "https://{}.s3.{}.amazonaws.com/{}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires={}",
            self.bucket, self.region, key, 86400 // 24 hours for viewing
        );

        Ok(PresignedUrl {
            url: presigned_url,
            expires_in_seconds: 86400,
            key: key.to_string(),
            bucket: self.bucket.clone(),
        })
    }

    /// Get file metadata from S3
    pub async fn get_metadata(&self, key: &str) -> Result<UploadMetadata, StorageError> {
        // TODO: Call AWS SDK to get object metadata (size, mime type, modified date)
        // For MVP: return placeholder
        Ok(UploadMetadata {
            key: key.to_string(),
            size_bytes: 0,
            mime_type: "video/mp4".to_string(),
            uploaded_at: chrono::Utc::now(),
            expires_at: chrono::Utc::now() + chrono::Duration::days(90),
        })
    }

    /// Delete file from S3
    pub async fn delete_file(&self, key: &str) -> Result<(), StorageError> {
        // TODO: Call AWS SDK to delete object
        // Should be called after 90 days (auto-cleanup)
        Ok(())
    }

    /// List all files for a creator (pagination support)
    pub async fn list_creator_files(
        &self,
        user_id: i64,
        limit: i32,
        continuation_token: Option<String>,
    ) -> Result<(Vec<UploadMetadata>, Option<String>), StorageError> {
        // TODO: Call AWS SDK to list objects with prefix "deliverables/{user_id}/"
        // Return files + pagination token
        Ok((vec![], None))
    }
}

/// CloudFront CDN for playback
pub struct CloudFrontCdn {
    distribution_id: String,
    domain: String,
}

impl CloudFrontCdn {
    pub fn new(distribution_id: String, domain: String) -> Self {
        Self { distribution_id, domain }
    }

    /// Convert S3 key to CloudFront URL (for fast playback)
    pub fn get_playback_url(&self, s3_key: &str) -> String {
        format!("https://{}/{}", self.domain, s3_key)
    }

    /// Invalidate CloudFront cache (when file updated/deleted)
    pub async fn invalidate_cache(&self, paths: Vec<String>) -> Result<(), StorageError> {
        // TODO: Call AWS CloudFront invalidation API
        // Used when creator re-uploads a file or it's deleted
        Ok(())
    }
}
