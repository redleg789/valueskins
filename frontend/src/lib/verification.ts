/*
 * VERIFICATION & TRUST SYSTEM
 * ──────────────────────────────────────────────────────────────────────────
 * PATENT-RELEVANT: Multi-Factor Creator Verification with AI Fraud Detection
 *
 * Verification Levels:
 * 1. Email Verified - Basic account confirmation
 * 2. Platform Linked - Connected social accounts
 * 3. Identity Verified - Selfie + ID match
 * 4. Trusted Creator - Completed deals + good standing
 * 5. Elite Verified - Top performers with audit trail
 *
 * Trust Score Components:
 * - Verification level (25%)
 * - Deal completion rate (25%)
 * - Average brand rating (25%)
 * - Bot/fraud score (25%)
 */

import { Platform } from './professions';

export type VerificationLevel = 1 | 2 | 3 | 4 | 5;

export interface VerificationBadge {
  level: VerificationLevel;
  name: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
  requirements: string[];
}

export const VERIFICATION_BADGES: Record<VerificationLevel, VerificationBadge> = {
  1: {
    level: 1,
    name: 'Verified',
    color: '#737373',
    bgColor: '#26262620',
    icon: '✓',
    description: 'Email verified',
    requirements: ['Confirm email address'],
  },
  2: {
    level: 2,
    name: 'Linked',
    color: '#0095f6',
    bgColor: '#0095f620',
    icon: '🔗',
    description: 'Platform accounts connected',
    requirements: ['Link at least 1 social account', 'Minimum 1,000 followers'],
  },
  3: {
    level: 3,
    name: 'ID Verified',
    color: '#10b981',
    bgColor: '#10b98120',
    icon: '🆔',
    description: 'Identity confirmed',
    requirements: ['Upload government ID', 'Complete selfie verification', 'ID matches account holder'],
  },
  4: {
    level: 4,
    name: 'Trusted',
    color: '#8b5cf6',
    bgColor: '#8b5cf620',
    icon: '⭐',
    description: 'Proven track record',
    requirements: ['Complete 3+ deals', 'Average rating 4.5+', 'No disputes in 90 days'],
  },
  5: {
    level: 5,
    name: 'Elite',
    color: '#f59e0b',
    bgColor: '#f59e0b20',
    icon: '👑',
    description: 'Top 1% performer',
    requirements: ['Complete 20+ deals', 'Average rating 4.8+', '$50K+ total earnings', 'Manual audit passed'],
  },
};

export interface LinkedAccount {
  id: string;
  platform: Platform | 'tiktok' | 'twitter' | 'twitch';
  username: string;
  displayName: string;
  profileUrl: string;
  profileImageUrl?: string;
  followerCount: number;
  engagementRate: number;
  isVerified: boolean;
  linkedAt: Date;
  lastSyncedAt: Date;
  metrics: {
    avgLikes: number;
    avgComments: number;
    avgViews?: number;
    postsLast30Days: number;
    followerGrowth30Days: number;
  };
}

export interface CreatorVerification {
  creatorId: string;
  verificationLevel: VerificationLevel;

  // Step 1: Email
  emailVerified: boolean;
  emailVerifiedAt?: Date;

  // Step 2: Platform Links
  linkedAccounts: LinkedAccount[];
  totalFollowers: number;
  primaryPlatform?: Platform;

  // Step 3: Identity
  idVerified: boolean;
  idVerifiedAt?: Date;
  idType?: 'passport' | 'drivers_license' | 'national_id';
  selfieVerified: boolean;
  selfieVerifiedAt?: Date;

  // Step 4: Trust Metrics
  completedDeals: number;
  averageRating: number;
  totalEarnings: number;
  disputeCount: number;
  lastDisputeAt?: Date;

  // Step 5: Elite Audit
  eliteAuditPassed: boolean;
  eliteAuditAt?: Date;
  eliteAuditNotes?: string;

  // Fraud Detection
  fraudScore: number; // 0-100, lower is better
  fraudFlags: FraudFlag[];

  // Overall Trust Score
  trustScore: number; // 0-100
  trustScoreBreakdown: TrustScoreBreakdown;

  updatedAt: Date;
}

export interface FraudFlag {
  id: string;
  type: 'bot_followers' | 'engagement_manipulation' | 'fake_reviews' | 'identity_mismatch' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high';
  description: string;
  detectedAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface TrustScoreBreakdown {
  verificationScore: number;      // 0-25
  completionScore: number;        // 0-25
  ratingScore: number;            // 0-25
  authenticityScore: number;      // 0-25
}

// ═════════════════════════════════════════════════════════════════════════
// TRUST SCORE CALCULATION
// ═════════════════════════════════════════════════════════════════════════

export function calculateTrustScore(verification: CreatorVerification): TrustScoreBreakdown {
  // Verification Score (0-25)
  const verificationScore = verification.verificationLevel * 5;

  // Completion Score (0-25)
  let completionScore = 0;
  if (verification.completedDeals >= 20) completionScore = 25;
  else if (verification.completedDeals >= 10) completionScore = 20;
  else if (verification.completedDeals >= 5) completionScore = 15;
  else if (verification.completedDeals >= 1) completionScore = 10;
  else completionScore = 5;

  // Rating Score (0-25)
  const ratingScore = Math.round((verification.averageRating / 5) * 25);

  // Authenticity Score (0-25) - Inverse of fraud score
  const authenticityScore = Math.round(25 - (verification.fraudScore / 4));

  return {
    verificationScore,
    completionScore,
    ratingScore: Math.min(25, ratingScore),
    authenticityScore: Math.max(0, authenticityScore),
  };
}

export function getTotalTrustScore(breakdown: TrustScoreBreakdown): number {
  return breakdown.verificationScore + breakdown.completionScore + breakdown.ratingScore + breakdown.authenticityScore;
}

// ═════════════════════════════════════════════════════════════════════════
// FRAUD DETECTION (AI-POWERED MOCK)
// ═════════════════════════════════════════════════════════════════════════

export function detectFraudIndicators(linkedAccounts: LinkedAccount[]): FraudFlag[] {
  const flags: FraudFlag[] = [];

  for (const account of linkedAccounts) {
    // Check engagement rate
    if (account.engagementRate < 0.5 && account.followerCount > 10000) {
      flags.push({
        id: `fraud-${account.id}-low-engagement`,
        type: 'bot_followers',
        severity: 'medium',
        description: `Low engagement rate (${account.engagementRate}%) with high follower count suggests potential bot followers`,
        detectedAt: new Date(),
        resolved: false,
      });
    }

    // Check for suspicious growth
    if (account.metrics.followerGrowth30Days > account.followerCount * 0.5) {
      flags.push({
        id: `fraud-${account.id}-suspicious-growth`,
        type: 'suspicious_activity',
        severity: 'high',
        description: `Follower count grew ${Math.round(account.metrics.followerGrowth30Days / account.followerCount * 100)}% in 30 days - potential purchased followers`,
        detectedAt: new Date(),
        resolved: false,
      });
    }

    // Check like/comment ratio
    const likeCommentRatio = account.metrics.avgLikes / (account.metrics.avgComments || 1);
    if (likeCommentRatio > 100) {
      flags.push({
        id: `fraud-${account.id}-ratio`,
        type: 'engagement_manipulation',
        severity: 'low',
        description: `Unusual like-to-comment ratio (${Math.round(likeCommentRatio)}:1) - possible engagement pods or bots`,
        detectedAt: new Date(),
        resolved: false,
      });
    }
  }

  return flags;
}

export function calculateFraudScore(flags: FraudFlag[]): number {
  let score = 0;

  for (const flag of flags) {
    if (!flag.resolved) {
      switch (flag.severity) {
        case 'low': score += 10; break;
        case 'medium': score += 25; break;
        case 'high': score += 40; break;
      }
    }
  }

  return Math.min(100, score);
}

// ═════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═════════════════════════════════════════════════════════════════════════

export const MOCK_CREATOR_VERIFICATION: CreatorVerification = {
  creatorId: 'creator-001',
  verificationLevel: 4,

  emailVerified: true,
  emailVerifiedAt: new Date('2024-01-01'),

  linkedAccounts: [
    {
      id: 'link-001',
      platform: 'meta',
      username: 'alexgaming',
      displayName: 'Alex Gaming',
      profileUrl: 'https://instagram.com/alexgaming',
      followerCount: 125000,
      engagementRate: 4.2,
      isVerified: false,
      linkedAt: new Date('2024-01-05'),
      lastSyncedAt: new Date('2024-02-01'),
      metrics: {
        avgLikes: 5250,
        avgComments: 180,
        avgViews: 45000,
        postsLast30Days: 28,
        followerGrowth30Days: 3200,
      },
    },
    {
      id: 'link-002',
      platform: 'youtube',
      username: 'AlexGamingYT',
      displayName: 'Alex Gaming',
      profileUrl: 'https://youtube.com/@AlexGaming',
      followerCount: 85000,
      engagementRate: 6.8,
      isVerified: false,
      linkedAt: new Date('2024-01-05'),
      lastSyncedAt: new Date('2024-02-01'),
      metrics: {
        avgLikes: 3200,
        avgComments: 420,
        avgViews: 28000,
        postsLast30Days: 12,
        followerGrowth30Days: 2100,
      },
    },
  ],
  totalFollowers: 210000,
  primaryPlatform: 'meta',

  idVerified: true,
  idVerifiedAt: new Date('2024-01-10'),
  idType: 'drivers_license',
  selfieVerified: true,
  selfieVerifiedAt: new Date('2024-01-10'),

  completedDeals: 8,
  averageRating: 4.7,
  totalEarnings: 2850000, // $28,500
  disputeCount: 0,

  eliteAuditPassed: false,

  fraudScore: 5,
  fraudFlags: [],

  trustScore: 92,
  trustScoreBreakdown: {
    verificationScore: 20,
    completionScore: 20,
    ratingScore: 24,
    authenticityScore: 24,
  },

  updatedAt: new Date(),
};

// ═════════════════════════════════════════════════════════════════════════
// VERIFICATION FLOW HELPERS
// ═════════════════════════════════════════════════════════════════════════

export function getNextVerificationStep(verification: CreatorVerification): {
  step: number;
  title: string;
  description: string;
  action: string;
} | null {
  if (!verification.emailVerified) {
    return {
      step: 1,
      title: 'Verify Email',
      description: 'Confirm your email address to get started',
      action: 'Send verification email',
    };
  }

  if (verification.linkedAccounts.length === 0) {
    return {
      step: 2,
      title: 'Link Social Accounts',
      description: 'Connect your Instagram, YouTube, or LinkedIn',
      action: 'Connect account',
    };
  }

  if (!verification.idVerified) {
    return {
      step: 3,
      title: 'Verify Identity',
      description: 'Upload your ID and take a selfie for verification',
      action: 'Start verification',
    };
  }

  if (verification.completedDeals < 3 || verification.averageRating < 4.5) {
    return {
      step: 4,
      title: 'Build Trust',
      description: `Complete ${3 - verification.completedDeals} more deals with 4.5+ rating`,
      action: 'View opportunities',
    };
  }

  if (!verification.eliteAuditPassed && verification.completedDeals >= 20) {
    return {
      step: 5,
      title: 'Elite Verification',
      description: 'You qualify for Elite status! Request an audit.',
      action: 'Request audit',
    };
  }

  return null;
}

export function canAccessDeal(
  verification: CreatorVerification,
  requiredLevel: VerificationLevel
): { allowed: boolean; reason?: string } {
  if (verification.verificationLevel >= requiredLevel) {
    return { allowed: true };
  }

  const badge = VERIFICATION_BADGES[requiredLevel];
  return {
    allowed: false,
    reason: `This deal requires ${badge.name} status. ${badge.requirements[0]}`,
  };
}
