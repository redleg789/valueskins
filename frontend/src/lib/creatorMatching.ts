/**
 * Creator Matching & Filtering Algorithm
 *
 * PLUGGABLE ARCHITECTURE:
 * - MVP: Returns all creators as matching (assumes creator has everything brand wants)
 * - Production: Swap CreatorDataProvider to fetch real audience data from Meta/Instagram API
 *
 * META INTEGRATION POINTS:
 * - CreatorDataProvider.getAudienceData() → Meta Marketing API / Instagram Graph API
 * - CreatorDataProvider.getContentMetrics() → Instagram Insights API
 * - CreatorDataProvider.getEngagementHistory() → Meta Business Suite API
 *
 * DATABASE REQUIREMENTS (for Meta to attach):
 * - creator_audience_demographics (creator_id, age_range, gender_split, location, language)
 * - creator_content_metrics (creator_id, avg_views, avg_engagement, content_categories)
 * - creator_brand_safety (creator_id, brand_safety_score, flagged_content, last_audit_date)
 * - campaign_match_history (campaign_id, creator_id, match_score, selected, outcome)
 */

// ---- Types ----

export interface CampaignRequirements {
  skin: string;                    // Required ValueSkin (e.g., "Software Engineer")
  minLevel?: number;               // Minimum creator level (1-5)
  maxLevel?: number;               // Maximum creator level (1-5)
  budgetPerCreator?: number;       // Budget in USD
  location?: string;               // Target location (e.g., "USA", "India", "Global")
  audienceAgeRange?: string;       // e.g., "18-24", "25-34"
  audienceGender?: string;         // e.g., "any", "male", "female"
  audienceLanguage?: string;       // e.g., "English", "Hindi"
  minFollowers?: number;           // Minimum follower count
  maxFollowers?: number;           // Maximum follower count
  minEngagement?: number;          // Minimum engagement rate (e.g., 3.0 for 3%)
  contentCategories?: string[];    // e.g., ["tech", "coding", "startups"]
  excludeCreatorIds?: string[];    // Blacklisted creators
  brandSafetyRequired?: boolean;   // Require brand safety audit
}

export interface CreatorProfile {
  id: string;
  name: string;
  handle: string;
  skin: string;
  followers: number;
  engagement: number;
  level: number;
  rate: number;
  location?: string;
  audienceData?: AudienceData;
  contentMetrics?: ContentMetrics;
  brandSafety?: BrandSafetyScore;
}

export interface AudienceData {
  ageDistribution: Record<string, number>;   // e.g., {"18-24": 0.35, "25-34": 0.45}
  genderSplit: { male: number; female: number; other: number };
  topLocations: Array<{ country: string; percentage: number }>;
  primaryLanguage: string;
  secondaryLanguages: string[];
}

export interface ContentMetrics {
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  postFrequency: number;           // Posts per week
  topContentCategories: string[];
  recentGrowthRate: number;        // Monthly follower growth %
}

export interface BrandSafetyScore {
  score: number;                   // 0-100
  flaggedContent: number;          // Count of flagged posts
  lastAuditDate: string;           // ISO date
  categories: string[];            // Safe categories
}

export interface MatchResult {
  creator: CreatorProfile;
  score: number;                   // 0-100 overall match
  breakdown: {
    skinMatch: number;             // 0-100
    levelMatch: number;            // 0-100
    budgetMatch: number;           // 0-100
    audienceMatch: number;         // 0-100
    engagementMatch: number;       // 0-100
    brandSafetyMatch: number;      // 0-100
  };
  eligible: boolean;               // Hard filter pass/fail
  reason?: string;                 // Why ineligible
}

// ---- Data Provider Interface (pluggable for Meta) ----

export interface CreatorDataProvider {
  /**
   * Fetch audience demographics for a creator.
   * MVP: Returns null (assumed match).
   * Production: Calls Meta Marketing API / Instagram Graph API.
   */
  getAudienceData(creatorId: string): Promise<AudienceData | null>;

  /**
   * Fetch content performance metrics.
   * MVP: Returns null (assumed match).
   * Production: Calls Instagram Insights API.
   */
  getContentMetrics(creatorId: string): Promise<ContentMetrics | null>;

  /**
   * Fetch brand safety score.
   * MVP: Returns null (assumed safe).
   * Production: Calls brand safety API or internal audit system.
   */
  getBrandSafetyScore(creatorId: string): Promise<BrandSafetyScore | null>;
}

// ---- MVP Provider (assumes everything matches) ----

export class MVPCreatorDataProvider implements CreatorDataProvider {
  async getAudienceData(_creatorId: string): Promise<AudienceData | null> {
    return null; // MVP: no audience data available, assume match
  }

  async getContentMetrics(_creatorId: string): Promise<ContentMetrics | null> {
    return null; // MVP: no content metrics, assume good
  }

  async getBrandSafetyScore(_creatorId: string): Promise<BrandSafetyScore | null> {
    return null; // MVP: no brand safety audit, assume safe
  }
}

// ---- Production Provider Template (for Meta to implement) ----

/**
 * Production implementation — connects to real APIs.
 *
 * Required environment variables:
 * - META_APP_ID: Meta app ID for Graph API access
 * - META_APP_SECRET: Meta app secret
 * - INSTAGRAM_BUSINESS_ACCOUNT_TOKEN: Long-lived token for Insights API
 * - BRAND_SAFETY_API_KEY: Third-party brand safety service key
 *
 * Required database tables:
 * - creator_audience_cache (creator_id, data JSONB, fetched_at TIMESTAMP, ttl_hours INT)
 * - creator_metrics_cache (creator_id, data JSONB, fetched_at TIMESTAMP, ttl_hours INT)
 * - brand_safety_audits (creator_id, score INT, flags JSONB, audited_at TIMESTAMP)
 *
 * CREATE TABLE creator_audience_cache (
 *   creator_id VARCHAR(255) PRIMARY KEY,
 *   data JSONB NOT NULL,
 *   fetched_at TIMESTAMP DEFAULT NOW(),
 *   ttl_hours INT DEFAULT 24
 * );
 *
 * CREATE TABLE creator_metrics_cache (
 *   creator_id VARCHAR(255) PRIMARY KEY,
 *   data JSONB NOT NULL,
 *   fetched_at TIMESTAMP DEFAULT NOW(),
 *   ttl_hours INT DEFAULT 6
 * );
 *
 * CREATE TABLE brand_safety_audits (
 *   creator_id VARCHAR(255) PRIMARY KEY,
 *   score INT NOT NULL CHECK (score >= 0 AND score <= 100),
 *   flags JSONB DEFAULT '[]',
 *   audited_at TIMESTAMP DEFAULT NOW()
 * );
 */

// Uncomment and implement when Meta provides API access:
// export class MetaCreatorDataProvider implements CreatorDataProvider {
//   private metaAppId: string;
//   private metaAppSecret: string;
//   private dbPool: any; // PostgreSQL pool
//
//   constructor(config: { metaAppId: string; metaAppSecret: string; dbPool: any }) {
//     this.metaAppId = config.metaAppId;
//     this.metaAppSecret = config.metaAppSecret;
//     this.dbPool = config.dbPool;
//   }
//
//   async getAudienceData(creatorId: string): Promise<AudienceData | null> {
//     // 1. Check cache
//     const cached = await this.dbPool.query(
//       'SELECT data FROM creator_audience_cache WHERE creator_id = $1 AND fetched_at > NOW() - INTERVAL \'1 hour\' * ttl_hours',
//       [creatorId]
//     );
//     if (cached.rows.length > 0) return cached.rows[0].data;
//
//     // 2. Fetch from Meta Graph API
//     const response = await fetch(
//       `https://graph.facebook.com/v19.0/${creatorId}/insights?metric=audience_city,audience_country,audience_gender_age,audience_locale&access_token=${this.metaAppSecret}`
//     );
//     const data = await response.json();
//
//     // 3. Transform and cache
//     const audienceData = this.transformMetaInsights(data);
//     await this.dbPool.query(
//       'INSERT INTO creator_audience_cache (creator_id, data) VALUES ($1, $2) ON CONFLICT (creator_id) DO UPDATE SET data = $2, fetched_at = NOW()',
//       [creatorId, audienceData]
//     );
//
//     return audienceData;
//   }
//
//   async getContentMetrics(creatorId: string): Promise<ContentMetrics | null> {
//     // Similar pattern: cache → Meta Insights API → transform → cache
//     return null;
//   }
//
//   async getBrandSafetyScore(creatorId: string): Promise<BrandSafetyScore | null> {
//     // Query brand_safety_audits table
//     return null;
//   }
//
//   private transformMetaInsights(raw: any): AudienceData {
//     // Transform Meta Graph API response to our AudienceData format
//     return { ageDistribution: {}, genderSplit: { male: 0, female: 0, other: 0 }, topLocations: [], primaryLanguage: 'English', secondaryLanguages: [] };
//   }
// }

// ---- Matching Algorithm ----

const WEIGHTS = {
  skinMatch: 30,        // Must match — hard filter
  levelMatch: 15,       // Creator level within range
  budgetMatch: 15,      // Creator rate vs brand budget
  audienceMatch: 20,    // Audience demographics alignment
  engagementMatch: 10,  // Engagement rate quality
  brandSafetyMatch: 10, // Brand safety score
};

/**
 * Score a single creator against campaign requirements.
 * Returns a MatchResult with overall score and per-dimension breakdown.
 */
export function scoreCreator(
  creator: CreatorProfile,
  requirements: CampaignRequirements,
): MatchResult {
  const breakdown = {
    skinMatch: 0,
    levelMatch: 0,
    budgetMatch: 0,
    audienceMatch: 0,
    engagementMatch: 0,
    brandSafetyMatch: 0,
  };

  // ---- Hard filters (must pass or ineligible) ----

  // Skin must match
  if (creator.skin !== requirements.skin) {
    return { creator, score: 0, breakdown, eligible: false, reason: 'ValueSkin mismatch' };
  }
  breakdown.skinMatch = 100;

  // Level range
  const minLevel = requirements.minLevel ?? 1;
  const maxLevel = requirements.maxLevel ?? 5;
  if (creator.level < minLevel || creator.level > maxLevel) {
    return { creator, score: 0, breakdown, eligible: false, reason: `Level ${creator.level} outside range ${minLevel}-${maxLevel}` };
  }
  // Score: 100 if in range, bonus for being mid-range
  const levelRange = maxLevel - minLevel;
  const levelMid = (minLevel + maxLevel) / 2;
  breakdown.levelMatch = levelRange === 0 ? 100 : Math.round(100 - Math.abs(creator.level - levelMid) / levelRange * 40);

  // Excluded creators
  if (requirements.excludeCreatorIds?.includes(creator.id)) {
    return { creator, score: 0, breakdown, eligible: false, reason: 'Creator excluded' };
  }

  // Follower range
  if (requirements.minFollowers && creator.followers < requirements.minFollowers) {
    return { creator, score: 0, breakdown, eligible: false, reason: `${creator.followers} followers below minimum ${requirements.minFollowers}` };
  }
  if (requirements.maxFollowers && creator.followers > requirements.maxFollowers) {
    return { creator, score: 0, breakdown, eligible: false, reason: `${creator.followers} followers above maximum ${requirements.maxFollowers}` };
  }

  // ---- Soft scores ----

  // Budget alignment: how close is creator's rate to brand's budget?
  if (requirements.budgetPerCreator) {
    const ratio = creator.rate / requirements.budgetPerCreator;
    if (ratio <= 1.0) {
      // Creator rate is at or below budget — good
      breakdown.budgetMatch = Math.round(70 + ratio * 30);
    } else if (ratio <= 1.3) {
      // Slightly over budget — still possible with negotiation
      breakdown.budgetMatch = Math.round(100 - (ratio - 1.0) * 200);
    } else {
      // Way over budget
      breakdown.budgetMatch = Math.max(0, Math.round(40 - (ratio - 1.3) * 100));
    }
  } else {
    breakdown.budgetMatch = 80; // No budget constraint
  }

  // Engagement quality
  if (requirements.minEngagement && creator.engagement < requirements.minEngagement) {
    breakdown.engagementMatch = Math.round((creator.engagement / requirements.minEngagement) * 70);
  } else {
    // Good engagement — score based on absolute quality
    breakdown.engagementMatch = Math.min(100, Math.round(creator.engagement * 15));
  }

  // Audience match (MVP: assume full match since we don't have real data)
  if (creator.audienceData) {
    let audienceScore = 0;
    let checks = 0;

    // Age range match
    if (requirements.audienceAgeRange && creator.audienceData.ageDistribution) {
      checks++;
      const targetAge = requirements.audienceAgeRange;
      const agePercent = creator.audienceData.ageDistribution[targetAge] ?? 0;
      audienceScore += agePercent > 0.3 ? 100 : agePercent > 0.15 ? 70 : agePercent > 0.05 ? 40 : 10;
    }

    // Location match
    if (requirements.location && creator.audienceData.topLocations) {
      checks++;
      const locationMatch = creator.audienceData.topLocations.find(
        l => l.country.toLowerCase() === requirements.location!.toLowerCase()
      );
      audienceScore += locationMatch ? Math.min(100, locationMatch.percentage * 200) : 20;
    }

    // Language match
    if (requirements.audienceLanguage && creator.audienceData.primaryLanguage) {
      checks++;
      audienceScore += creator.audienceData.primaryLanguage.toLowerCase() === requirements.audienceLanguage.toLowerCase()
        ? 100
        : creator.audienceData.secondaryLanguages.some(l => l.toLowerCase() === requirements.audienceLanguage!.toLowerCase())
          ? 60
          : 20;
    }

    breakdown.audienceMatch = checks > 0 ? Math.round(audienceScore / checks) : 90;
  } else {
    // MVP: no audience data → assume good match
    breakdown.audienceMatch = 90;
  }

  // Brand safety
  if (creator.brandSafety) {
    breakdown.brandSafetyMatch = creator.brandSafety.score;
  } else {
    // MVP: no audit → assume safe
    breakdown.brandSafetyMatch = 85;
  }

  // ---- Weighted total ----
  const totalWeight = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  const score = Math.round(
    (breakdown.skinMatch * WEIGHTS.skinMatch +
     breakdown.levelMatch * WEIGHTS.levelMatch +
     breakdown.budgetMatch * WEIGHTS.budgetMatch +
     breakdown.audienceMatch * WEIGHTS.audienceMatch +
     breakdown.engagementMatch * WEIGHTS.engagementMatch +
     breakdown.brandSafetyMatch * WEIGHTS.brandSafetyMatch) / totalWeight
  );

  return { creator, score, breakdown, eligible: true };
}

/**
 * Match and rank all creators against campaign requirements.
 * Returns sorted list (best match first) with only eligible creators.
 */
export function matchCreators(
  creators: CreatorProfile[],
  requirements: CampaignRequirements,
): MatchResult[] {
  return creators
    .map(creator => scoreCreator(creator, requirements))
    .filter(result => result.eligible)
    .sort((a, b) => b.score - a.score);
}

// ---- Singleton provider ----

let _provider: CreatorDataProvider = new MVPCreatorDataProvider();

export function setCreatorDataProvider(provider: CreatorDataProvider) {
  _provider = provider;
}

export function getCreatorDataProvider(): CreatorDataProvider {
  return _provider;
}
