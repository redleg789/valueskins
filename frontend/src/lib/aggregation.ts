/*
 * MULTI-PLATFORM ACCOUNT AGGREGATION
 * ──────────────────────────────────────────────────────────────────────────
 * PATENT-RELEVANT: Unified Creator Persona Across Platforms
 *
 * This system aggregates creator metrics from multiple platforms into
 * a single "creator persona" that can be sold to brands.
 *
 * KEY INNOVATION:
 * - Single unified profile showing combined reach
 * - Cross-platform engagement scoring
 * - Platform-weighted performance metrics
 * - Unified "creator score" that feeds into AI matching
 */

import { Platform } from './professions';

export interface PlatformAccount {
  id: string;
  platform: Platform | 'tiktok' | 'twitter' | 'twitch';
  username: string;
  displayName: string;
  profileUrl: string;
  profileImageUrl?: string;
  bio?: string;

  // Verification
  isVerified: boolean;          // Platform's native verification
  isLinked: boolean;            // Linked to Valueskins
  linkedAt?: Date;
  lastSyncedAt?: Date;

  // Follower Metrics
  followers: number;
  following: number;
  totalPosts: number;

  // Engagement Metrics
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  avgViews?: number;           // For video platforms
  avgSaves?: number;           // For Instagram

  // Calculated
  engagementRate: number;       // (likes + comments + shares) / followers
  growthRate30Days: number;     // % follower growth in last 30 days

  // Content Analysis
  primaryContentType: 'video' | 'image' | 'text' | 'mixed';
  postingFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  peakPostingTimes: string[];   // e.g., ["10:00 AM", "7:00 PM"]

  // Audience Demographics (where available)
  audienceGender?: { male: number; female: number; other: number };
  audienceAge?: { '13-17': number; '18-24': number; '25-34': number; '35-44': number; '45+': number };
  audienceLocations?: { country: string; percentage: number }[];
}

export interface AggregatedProfile {
  creatorId: string;
  creatorName: string;
  primaryPlatform: Platform;

  // Linked Accounts
  accounts: PlatformAccount[];
  totalAccounts: number;

  // Aggregated Metrics
  totalFollowers: number;
  totalReach: number;           // Estimated unique reach across all platforms
  combinedEngagementRate: number;
  avgGrowthRate: number;

  // Unified Score (feeds into AI matching)
  unifiedScore: number;         // 0-10000
  scoreBreakdown: {
    followerScore: number;      // 0-2500
    engagementScore: number;    // 0-2500
    consistencyScore: number;   // 0-2500
    diversityScore: number;     // 0-2500 (multi-platform bonus)
  };

  // Platform Strength Analysis
  platformStrengths: {
    platform: Platform;
    strengthScore: number;      // 0-100
    bestFor: string[];          // e.g., ["Long-form content", "B2B audience"]
  }[];

  // Content Analysis
  contentCategories: string[];
  primaryNiche: string;

  // Audience Overlap Estimation
  estimatedUniqueReach: number;
  overlapFactor: number;        // 0.0-1.0, how much audience overlaps

  updatedAt: Date;
}

// ═════════════════════════════════════════════════════════════════════════
// AGGREGATION CALCULATIONS
// ═════════════════════════════════════════════════════════════════════════

export function calculateUnifiedScore(accounts: PlatformAccount[]): AggregatedProfile['scoreBreakdown'] {
  // Follower Score (25%)
  const totalFollowers = accounts.reduce((sum, a) => sum + a.followers, 0);
  const followerScore = Math.min(2500, Math.round((Math.log10(totalFollowers + 1) / 7) * 2500));

  // Engagement Score (25%)
  const weightedEngagement = accounts.reduce((sum, a) => {
    return sum + (a.engagementRate * a.followers);
  }, 0);
  const avgEngagement = weightedEngagement / totalFollowers || 0;
  const engagementScore = Math.min(2500, Math.round((avgEngagement / 15) * 2500));

  // Consistency Score (25%)
  const avgPostFrequency = accounts.filter(a =>
    ['daily', 'weekly'].includes(a.postingFrequency)
  ).length / accounts.length;
  const consistencyScore = Math.round(avgPostFrequency * 2500);

  // Diversity Score (25%) - Multi-platform bonus
  const platformCount = accounts.length;
  const diversityScore = Math.min(2500, platformCount * 625);

  return {
    followerScore,
    engagementScore,
    consistencyScore,
    diversityScore,
  };
}

export function calculateOverlapFactor(accounts: PlatformAccount[]): number {
  // Estimate how much audience overlaps across platforms
  // More platforms = more overlap assumed
  if (accounts.length <= 1) return 0;
  if (accounts.length === 2) return 0.2;
  if (accounts.length === 3) return 0.35;
  return 0.45; // 4+ platforms
}

export function calculateUniqueReach(accounts: PlatformAccount[]): number {
  const totalFollowers = accounts.reduce((sum, a) => sum + a.followers, 0);
  const overlapFactor = calculateOverlapFactor(accounts);
  return Math.round(totalFollowers * (1 - overlapFactor));
}

export function calculatePlatformStrengths(accounts: PlatformAccount[]): AggregatedProfile['platformStrengths'] {
  return accounts.map(account => {
    const strengthScore = Math.round(
      (account.engagementRate / 10) * 40 +
      (Math.log10(account.followers + 1) / 7) * 30 +
      (account.growthRate30Days / 20) * 30
    );

    const bestFor: string[] = [];
    if (account.platform === 'youtube') bestFor.push('Long-form content', 'Tutorials');
    if (account.platform === 'linkedin') bestFor.push('B2B audience', 'Professional content');
    if (account.platform === 'meta') bestFor.push('Visual content', 'Lifestyle');
    if (account.engagementRate > 5) bestFor.push('High engagement');
    if (account.followers > 100000) bestFor.push('Large reach');

    return {
      platform: account.platform as Platform,
      strengthScore: Math.min(100, strengthScore),
      bestFor,
    };
  });
}

// ═════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═════════════════════════════════════════════════════════════════════════

export const MOCK_AGGREGATED_PROFILE: AggregatedProfile = {
  creatorId: 'creator-001',
  creatorName: 'Alex Tech',
  primaryPlatform: 'meta',

  accounts: [
    {
      id: 'acc-001',
      platform: 'meta',
      username: 'alextech',
      displayName: 'Alex Tech',
      profileUrl: 'https://instagram.com/alextech',
      profileImageUrl: '/avatars/alex.jpg',
      bio: 'Tech creator | Reviews & Tutorials | 125K+ community',
      isVerified: false,
      isLinked: true,
      linkedAt: new Date('2024-01-01'),
      lastSyncedAt: new Date('2024-02-01'),
      followers: 125000,
      following: 450,
      totalPosts: 342,
      avgLikes: 5250,
      avgComments: 180,
      avgShares: 85,
      avgViews: 45000,
      avgSaves: 420,
      engagementRate: 4.2,
      growthRate30Days: 2.5,
      primaryContentType: 'video',
      postingFrequency: 'daily',
      peakPostingTimes: ['10:00 AM', '7:00 PM'],
      audienceGender: { male: 68, female: 30, other: 2 },
      audienceAge: { '13-17': 5, '18-24': 35, '25-34': 40, '35-44': 15, '45+': 5 },
      audienceLocations: [
        { country: 'United States', percentage: 45 },
        { country: 'India', percentage: 18 },
        { country: 'United Kingdom', percentage: 12 },
      ],
    },
    {
      id: 'acc-002',
      platform: 'youtube',
      username: 'AlexTechYT',
      displayName: 'Alex Tech',
      profileUrl: 'https://youtube.com/@AlexTech',
      isVerified: false,
      isLinked: true,
      linkedAt: new Date('2024-01-01'),
      lastSyncedAt: new Date('2024-02-01'),
      followers: 85000,
      following: 120,
      totalPosts: 156,
      avgLikes: 3200,
      avgComments: 420,
      avgShares: 95,
      avgViews: 28000,
      engagementRate: 6.8,
      growthRate30Days: 3.2,
      primaryContentType: 'video',
      postingFrequency: 'weekly',
      peakPostingTimes: ['3:00 PM', '6:00 PM'],
      audienceGender: { male: 72, female: 26, other: 2 },
      audienceAge: { '13-17': 8, '18-24': 32, '25-34': 38, '35-44': 16, '45+': 6 },
      audienceLocations: [
        { country: 'United States', percentage: 42 },
        { country: 'India', percentage: 22 },
        { country: 'Canada', percentage: 8 },
      ],
    },
    {
      id: 'acc-003',
      platform: 'linkedin',
      username: 'alextech-creator',
      displayName: 'Alex Chen',
      profileUrl: 'https://linkedin.com/in/alextech-creator',
      isVerified: false,
      isLinked: true,
      linkedAt: new Date('2024-01-15'),
      lastSyncedAt: new Date('2024-02-01'),
      followers: 28000,
      following: 850,
      totalPosts: 89,
      avgLikes: 1200,
      avgComments: 85,
      avgShares: 45,
      engagementRate: 4.8,
      growthRate30Days: 4.1,
      primaryContentType: 'text',
      postingFrequency: 'weekly',
      peakPostingTimes: ['9:00 AM', '12:00 PM'],
      audienceGender: { male: 65, female: 33, other: 2 },
      audienceAge: { '13-17': 1, '18-24': 15, '25-34': 45, '35-44': 28, '45+': 11 },
      audienceLocations: [
        { country: 'United States', percentage: 55 },
        { country: 'United Kingdom', percentage: 15 },
        { country: 'India', percentage: 10 },
      ],
    },
  ],
  totalAccounts: 3,

  totalFollowers: 238000,
  totalReach: 238000,
  combinedEngagementRate: 5.3,
  avgGrowthRate: 3.3,

  unifiedScore: 8450,
  scoreBreakdown: {
    followerScore: 2100,
    engagementScore: 2200,
    consistencyScore: 2200,
    diversityScore: 1950,
  },

  platformStrengths: [
    {
      platform: 'meta',
      strengthScore: 85,
      bestFor: ['Visual content', 'Lifestyle', 'High engagement'],
    },
    {
      platform: 'youtube',
      strengthScore: 92,
      bestFor: ['Long-form content', 'Tutorials', 'High engagement'],
    },
    {
      platform: 'linkedin',
      strengthScore: 78,
      bestFor: ['B2B audience', 'Professional content'],
    },
  ],

  contentCategories: ['Tech', 'Reviews', 'Tutorials', 'Career Advice'],
  primaryNiche: 'Tech Creator',

  estimatedUniqueReach: 154700,
  overlapFactor: 0.35,

  updatedAt: new Date(),
};

// ═════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════

export function formatFollowers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return count.toString();
}

export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    meta: '📸',
    youtube: '📹',
    linkedin: '💼',
    tiktok: '🎵',
    twitter: '🐦',
    twitch: '🎮',
  };
  return icons[platform] || '🔗';
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    meta: '#E1306C',
    youtube: '#FF0000',
    linkedin: '#0A66C2',
    tiktok: '#000000',
    twitter: '#1DA1F2',
    twitch: '#9146FF',
  };
  return colors[platform] || '#8b5cf6';
}
