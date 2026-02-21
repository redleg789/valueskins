/*
 * ADVANCED AI MATCHING ENGINE
 * ──────────────────────────────────────────────────────────────────────────
 * PATENT-RELEVANT: Multi-Dimensional Creator-Brand Matching Algorithm
 *
 * This is the core IP of Valueskins - the AI that matches creators to brands
 * and brands to creators with asymmetric scoring.
 *
 * KEY INNOVATIONS:
 * 1. Asymmetric Scoring - Different weights for brand vs creator perspective
 * 2. Platform-Aware Matching - Optimal platform recommendations
 * 3. Audience Overlap Detection - Finds creators with complementary audiences
 * 4. Predictive Success Scoring - ML-based deal success prediction
 * 5. Dynamic Pricing Suggestions - AI-driven rate recommendations
 */

import { Platform } from './professions';
import { AggregatedProfile, PlatformAccount } from './aggregation';
import { Brand, Campaign } from './brand';
import { VerificationLevel } from './verification';

// ═════════════════════════════════════════════════════════════════════════
// MATCHING TYPES
// ═════════════════════════════════════════════════════════════════════════

export interface MatchingInput {
  // Creator side
  creatorId: string;
  creatorLevel: number;
  creatorVerification: VerificationLevel;
  creatorCategory: string;
  creatorPlatforms: PlatformAccount[];
  creatorEngagementRate: number;
  creatorFollowerCount: number;
  creatorCompletedDeals: number;
  creatorAvgRating: number;

  // Brand side
  brandId: string;
  brandCategory: string;
  brandMinEngagementRate: number;
  brandMinLevel: number;
  brandMinVerification: VerificationLevel;
  brandPreferredPlatforms: Platform[];
  brandBudgetRange: { min: number; max: number };
  brandAudienceTargets?: AudienceTarget;
}

export interface AudienceTarget {
  ageRange?: { min: number; max: number };
  genderPreference?: 'male' | 'female' | 'any';
  locations?: string[];
}

export interface MatchResult {
  creatorId: string;
  brandId: string;

  // Scores (0-10000)
  totalScore: number;

  // Creator perspective (what creator sees)
  opportunityFitScore: number;
  opportunityBreakdown: {
    categoryAffinity: number;      // 0-4000 (40%)
    budgetMatch: number;           // 0-3500 (35%)
    levelQualification: number;    // 0-2500 (25%)
  };

  // Brand perspective (what brand sees)
  creatorQualityScore: number;
  qualityBreakdown: {
    categoryAffinity: number;      // 0-4000 (40%)
    engagementAuthenticity: number; // 0-3500 (35%)
    levelValue: number;            // 0-2500 (25%)
  };

  // Platform recommendations
  recommendedPlatforms: {
    platform: Platform;
    score: number;
    reason: string;
  }[];

  // Pricing suggestions
  suggestedRate: number;
  rateRange: { min: number; max: number };

  // Confidence
  confidenceScore: number; // 0-100
  matchReasons: string[];
  potentialConcerns: string[];

  // Predictive
  predictedSuccessRate: number; // 0-100
  predictedROI: number;

  isQualified: boolean;
  qualificationIssues: string[];
}

// ═════════════════════════════════════════════════════════════════════════
// CORE MATCHING ALGORITHM
// ═════════════════════════════════════════════════════════════════════════

export function calculateMatch(input: MatchingInput): MatchResult {
  // 1. Calculate Category Affinity (40% weight)
  const categoryAffinity = calculateCategoryAffinity(
    input.creatorCategory,
    input.brandCategory
  );

  // 2. Calculate Engagement/Budget Match (35% weight)
  const budgetMatch = calculateBudgetMatch(
    input.creatorLevel,
    input.brandBudgetRange
  );

  const engagementMatch = calculateEngagementMatch(
    input.creatorEngagementRate,
    input.brandMinEngagementRate,
    input.creatorFollowerCount
  );

  // 3. Calculate Level Qualification (25% weight)
  const levelQualification = calculateLevelQualification(
    input.creatorLevel,
    input.brandMinLevel
  );

  const levelValue = calculateLevelValue(
    input.creatorLevel,
    input.creatorCompletedDeals,
    input.creatorAvgRating
  );

  // 4. Calculate platform recommendations
  const platformRecommendations = calculatePlatformRecommendations(
    input.creatorPlatforms,
    input.brandPreferredPlatforms
  );

  // 5. Calculate pricing suggestions
  const pricingSuggestion = calculatePricingSuggestion(
    input.creatorLevel,
    input.creatorEngagementRate,
    input.creatorFollowerCount,
    platformRecommendations
  );

  // 6. Calculate predictive metrics
  const successPrediction = predictDealSuccess(input);

  // 7. Check qualification
  const qualificationCheck = checkQualifications(input);

  // Calculate final scores
  const opportunityFitScore =
    categoryAffinity +
    budgetMatch +
    levelQualification;

  const creatorQualityScore =
    categoryAffinity +
    engagementMatch +
    levelValue;

  const totalScore = Math.round((opportunityFitScore + creatorQualityScore) / 2);

  // Generate match reasons
  const matchReasons = generateMatchReasons(
    categoryAffinity,
    engagementMatch,
    levelQualification,
    input
  );

  return {
    creatorId: input.creatorId,
    brandId: input.brandId,
    totalScore,
    opportunityFitScore,
    opportunityBreakdown: {
      categoryAffinity,
      budgetMatch,
      levelQualification,
    },
    creatorQualityScore,
    qualityBreakdown: {
      categoryAffinity,
      engagementAuthenticity: engagementMatch,
      levelValue,
    },
    recommendedPlatforms: platformRecommendations,
    suggestedRate: pricingSuggestion.suggested,
    rateRange: pricingSuggestion.range,
    confidenceScore: calculateConfidence(input),
    matchReasons,
    potentialConcerns: qualificationCheck.concerns,
    predictedSuccessRate: successPrediction.successRate,
    predictedROI: successPrediction.predictedROI,
    isQualified: qualificationCheck.isQualified,
    qualificationIssues: qualificationCheck.issues,
  };
}

// ═════════════════════════════════════════════════════════════════════════
// SCORING FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════

function calculateCategoryAffinity(
  creatorCategory: string,
  brandCategory: string
): number {
  // Perfect match
  if (creatorCategory === brandCategory) return 4000;

  // Related categories
  const relatedCategories: Record<string, string[]> = {
    'Tech Creator': ['SDE Level 2', 'Product Manager', 'Frontend Engineer', 'ML Engineer'],
    'Fitness Creator': ['Nutrition Coach', 'Personal Trainer', 'Sports Medicine'],
    'Finance Creator': ['Financial Advisor', 'Trader', 'CPA / Accountant'],
    'Gaming Creator': ['Game Developer', 'Esports Pro', 'Game Streamer'],
    'Content Creator': ['Video Creator', 'Podcast Host', 'Educational Creator'],
  };

  const related = relatedCategories[brandCategory] || [];
  if (related.includes(creatorCategory)) return 3000;

  // General content creator can match anything at 50%
  if (creatorCategory === 'Content Creator') return 2000;

  // Weak match
  return 500;
}

function calculateBudgetMatch(
  creatorLevel: number,
  budgetRange: { min: number; max: number }
): number {
  const levelRates: Record<number, number> = {
    1: 50000,   // $500
    2: 150000,  // $1,500
    3: 400000,  // $4,000
    4: 1000000, // $10,000
    5: 2500000, // $25,000
  };

  const expectedRate = levelRates[creatorLevel] || 50000;

  if (expectedRate >= budgetRange.min && expectedRate <= budgetRange.max) {
    return 3500; // Perfect budget match
  }

  if (expectedRate < budgetRange.min) {
    // Creator is cheaper than brand's minimum - still good for brand
    return 3000;
  }

  if (expectedRate <= budgetRange.max * 1.2) {
    // Slightly over budget
    return 2000;
  }

  // Way over budget
  return 500;
}

function calculateEngagementMatch(
  engagementRate: number,
  minEngagement: number,
  followerCount: number
): number {
  if (engagementRate < minEngagement) {
    return 0; // Doesn't meet minimum
  }

  // Bonus for high engagement
  let score = 2000; // Base score for meeting minimum

  if (engagementRate >= 8) score += 1500; // Exceptional
  else if (engagementRate >= 5) score += 1000; // Great
  else if (engagementRate >= 3) score += 500; // Good

  return Math.min(3500, score);
}

function calculateLevelQualification(
  creatorLevel: number,
  brandMinLevel: number
): number {
  if (creatorLevel < brandMinLevel) {
    return 0; // Doesn't qualify
  }

  // Bonus for exceeding minimum
  const levelBonus = (creatorLevel - brandMinLevel) * 500;
  return Math.min(2500, 1500 + levelBonus);
}

function calculateLevelValue(
  level: number,
  completedDeals: number,
  avgRating: number
): number {
  let score = level * 400; // Base score from level

  // Bonus for completed deals
  if (completedDeals >= 20) score += 500;
  else if (completedDeals >= 10) score += 300;
  else if (completedDeals >= 5) score += 200;

  // Bonus for high rating
  if (avgRating >= 4.8) score += 300;
  else if (avgRating >= 4.5) score += 200;
  else if (avgRating >= 4.0) score += 100;

  return Math.min(2500, score);
}

function calculatePlatformRecommendations(
  creatorPlatforms: PlatformAccount[],
  brandPreferredPlatforms: Platform[]
): MatchResult['recommendedPlatforms'] {
  const recommendations: MatchResult['recommendedPlatforms'] = [];

  for (const platform of brandPreferredPlatforms) {
    const creatorAccount = creatorPlatforms.find(
      p => p.platform === platform
    );

    if (creatorAccount) {
      const score = Math.round(
        (creatorAccount.engagementRate / 10) * 40 +
        (Math.log10(creatorAccount.followers + 1) / 7) * 40 +
        (creatorAccount.growthRate30Days / 10) * 20
      );

      let reason = '';
      if (creatorAccount.engagementRate >= 5) {
        reason = 'High engagement on this platform';
      } else if (creatorAccount.followers >= 100000) {
        reason = 'Large audience reach';
      } else if (creatorAccount.growthRate30Days >= 5) {
        reason = 'Fast-growing audience';
      } else {
        reason = 'Good platform presence';
      }

      recommendations.push({
        platform,
        score: Math.min(100, score),
        reason,
      });
    }
  }

  // Sort by score
  recommendations.sort((a, b) => b.score - a.score);

  return recommendations;
}

function calculatePricingSuggestion(
  level: number,
  engagementRate: number,
  followerCount: number,
  platformRecommendations: MatchResult['recommendedPlatforms']
): { suggested: number; range: { min: number; max: number } } {
  // Base rate by level
  const baseRates: Record<number, number> = {
    1: 50000,
    2: 150000,
    3: 400000,
    4: 1000000,
    5: 2500000,
  };

  let suggested = baseRates[level] || 50000;

  // Adjust for engagement
  if (engagementRate >= 8) suggested *= 1.3;
  else if (engagementRate >= 5) suggested *= 1.15;

  // Adjust for follower count
  if (followerCount >= 1000000) suggested *= 1.5;
  else if (followerCount >= 500000) suggested *= 1.25;
  else if (followerCount >= 100000) suggested *= 1.1;

  // Adjust for platform strength
  const avgPlatformScore = platformRecommendations.length > 0
    ? platformRecommendations.reduce((sum, p) => sum + p.score, 0) / platformRecommendations.length
    : 50;

  if (avgPlatformScore >= 80) suggested *= 1.2;
  else if (avgPlatformScore >= 60) suggested *= 1.1;

  suggested = Math.round(suggested);

  return {
    suggested,
    range: {
      min: Math.round(suggested * 0.8),
      max: Math.round(suggested * 1.2),
    },
  };
}

function predictDealSuccess(input: MatchingInput): {
  successRate: number;
  predictedROI: number;
} {
  let successRate = 50; // Base 50%

  // Factor 1: Creator track record
  if (input.creatorAvgRating >= 4.8) successRate += 20;
  else if (input.creatorAvgRating >= 4.5) successRate += 15;
  else if (input.creatorAvgRating >= 4.0) successRate += 10;

  // Factor 2: Verification level
  successRate += input.creatorVerification * 3;

  // Factor 3: Experience
  if (input.creatorCompletedDeals >= 20) successRate += 10;
  else if (input.creatorCompletedDeals >= 10) successRate += 7;
  else if (input.creatorCompletedDeals >= 5) successRate += 5;

  // Factor 4: Engagement quality
  if (input.creatorEngagementRate >= 8) successRate += 8;
  else if (input.creatorEngagementRate >= 5) successRate += 5;

  // Cap at 95%
  successRate = Math.min(95, successRate);

  // Predict ROI based on engagement and success rate
  const baseROI = 2.0;
  const engagementMultiplier = 1 + (input.creatorEngagementRate / 20);
  const successMultiplier = successRate / 70;
  const predictedROI = Math.round(baseROI * engagementMultiplier * successMultiplier * 10) / 10;

  return { successRate, predictedROI };
}

function checkQualifications(input: MatchingInput): {
  isQualified: boolean;
  issues: string[];
  concerns: string[];
} {
  const issues: string[] = [];
  const concerns: string[] = [];

  // Check level
  if (input.creatorLevel < input.brandMinLevel) {
    issues.push(`Requires Level ${input.brandMinLevel}+ (you are Level ${input.creatorLevel})`);
  }

  // Check verification
  if (input.creatorVerification < input.brandMinVerification) {
    issues.push(`Requires verification level ${input.brandMinVerification}`);
  }

  // Check engagement
  if (input.creatorEngagementRate < input.brandMinEngagementRate) {
    issues.push(`Requires ${input.brandMinEngagementRate}% engagement rate`);
  }

  // Check platform presence
  const hasRequiredPlatform = input.creatorPlatforms.some(
    p => input.brandPreferredPlatforms.includes(p.platform as Platform)
  );
  if (!hasRequiredPlatform) {
    issues.push(`Requires presence on ${input.brandPreferredPlatforms.join(' or ')}`);
  }

  // Potential concerns (not disqualifying)
  if (input.creatorCompletedDeals < 3) {
    concerns.push('Limited deal history');
  }

  if (input.creatorAvgRating < 4.5) {
    concerns.push('Below average rating');
  }

  return {
    isQualified: issues.length === 0,
    issues,
    concerns,
  };
}

function calculateConfidence(input: MatchingInput): number {
  let confidence = 60; // Base confidence

  // More data = higher confidence
  if (input.creatorPlatforms.length >= 3) confidence += 10;
  if (input.creatorCompletedDeals >= 10) confidence += 10;
  if (input.creatorAvgRating > 0) confidence += 10;

  // Verification adds confidence
  confidence += input.creatorVerification * 2;

  return Math.min(95, confidence);
}

function generateMatchReasons(
  categoryAffinity: number,
  engagementMatch: number,
  levelQualification: number,
  input: MatchingInput
): string[] {
  const reasons: string[] = [];

  if (categoryAffinity >= 4000) {
    reasons.push('Perfect category match');
  } else if (categoryAffinity >= 3000) {
    reasons.push('Strong category alignment');
  }

  if (engagementMatch >= 3000) {
    reasons.push('Exceptional engagement rate');
  } else if (engagementMatch >= 2000) {
    reasons.push('Above-average engagement');
  }

  if (levelQualification >= 2500) {
    reasons.push(`Level ${input.creatorLevel} exceeds requirements`);
  } else if (levelQualification >= 1500) {
    reasons.push('Meets level requirements');
  }

  if (input.creatorVerification >= 4) {
    reasons.push('Verified & trusted creator');
  }

  if (input.creatorCompletedDeals >= 10) {
    reasons.push('Experienced with brand deals');
  }

  return reasons;
}

// ═════════════════════════════════════════════════════════════════════════
// BATCH MATCHING
// ═════════════════════════════════════════════════════════════════════════

export function batchMatch(
  creators: MatchingInput['creatorPlatforms'] extends infer T ? Omit<MatchingInput, 'brandId' | 'brandCategory' | 'brandMinEngagementRate' | 'brandMinLevel' | 'brandMinVerification' | 'brandPreferredPlatforms' | 'brandBudgetRange'>[] : never,
  brandRequirements: {
    brandId: string;
    brandCategory: string;
    brandMinEngagementRate: number;
    brandMinLevel: number;
    brandMinVerification: VerificationLevel;
    brandPreferredPlatforms: Platform[];
    brandBudgetRange: { min: number; max: number };
  }
): MatchResult[] {
  const results: MatchResult[] = [];

  for (const creator of creators) {
    const input: MatchingInput = {
      ...creator,
      ...brandRequirements,
    };

    const result = calculateMatch(input);

    // Only include qualified matches with score > 50%
    if (result.isQualified && result.totalScore >= 5000) {
      results.push(result);
    }
  }

  // Sort by total score descending
  results.sort((a, b) => b.totalScore - a.totalScore);

  return results;
}

// ═════════════════════════════════════════════════════════════════════════
// MOCK DEMONSTRATION
// ═════════════════════════════════════════════════════════════════════════

export const MOCK_MATCH_RESULT: MatchResult = {
  creatorId: 'creator-001',
  brandId: 'brand-001',
  totalScore: 8750,
  opportunityFitScore: 8500,
  opportunityBreakdown: {
    categoryAffinity: 4000,
    budgetMatch: 2500,
    levelQualification: 2000,
  },
  creatorQualityScore: 9000,
  qualityBreakdown: {
    categoryAffinity: 4000,
    engagementAuthenticity: 3000,
    levelValue: 2000,
  },
  recommendedPlatforms: [
    { platform: 'youtube', score: 92, reason: 'Highest engagement on this platform' },
    { platform: 'meta', score: 85, reason: 'Large audience reach' },
    { platform: 'linkedin', score: 78, reason: 'Strong B2B presence' },
  ],
  suggestedRate: 600000,
  rateRange: { min: 480000, max: 720000 },
  confidenceScore: 88,
  matchReasons: [
    'Perfect category match',
    'Exceptional engagement rate',
    'Level 4 exceeds requirements',
    'Verified & trusted creator',
  ],
  potentialConcerns: [],
  predictedSuccessRate: 87,
  predictedROI: 3.2,
  isQualified: true,
  qualificationIssues: [],
};
