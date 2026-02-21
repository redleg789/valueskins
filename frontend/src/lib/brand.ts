/*
 * BRAND MANAGEMENT PLATFORM
 * ──────────────────────────────────────────────────────────────────────────
 * PATENT-RELEVANT: B2B Creator Marketplace with Campaign ROI Tracking
 *
 * This enables brands to:
 * 1. Create and manage campaigns
 * 2. Discover and vet creators
 * 3. Track campaign performance
 * 4. Calculate ROI per creator
 * 5. Build creator relationships
 */

import { Platform } from './professions';
import { Deal, DealStatus } from './deals';
import { VerificationLevel } from './verification';

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  description: string;
  website: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'enterprise';

  // Contact
  primaryContact: {
    name: string;
    email: string;
    role: string;
  };

  // Preferences
  preferredCategories: string[];
  preferredPlatforms: Platform[];
  minCreatorLevel: number;
  minVerificationLevel: VerificationLevel;
  budgetRange: {
    min: number;
    max: number;
  };

  // Stats
  totalSpent: number;
  activeCampaigns: number;
  completedCampaigns: number;
  averageCreatorRating: number;
  totalCreatorsWorkedWith: number;

  // Settings
  autoApproveDeliverables: boolean;
  paymentMethod: 'card' | 'bank' | 'wire';

  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  brandId: string;
  brandName: string;

  // Details
  name: string;
  description: string;
  objective: 'awareness' | 'engagement' | 'conversion' | 'content';
  category: string;

  // Budget
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  costPerCreator: number;

  // Timeline
  startDate: Date;
  endDate: Date;
  applicationDeadline: Date;

  // Requirements
  platforms: Platform[];
  requiredCreatorLevel: number;
  requiredVerificationLevel: VerificationLevel;
  targetFollowerRange: {
    min: number;
    max: number;
  };
  contentRequirements: string[];
  brandGuidelines: string;
  hashtags: string[];
  mentions: string[];

  // Slots
  totalSlots: number;
  filledSlots: number;
  pendingApplications: number;

  // Performance
  totalReach: number;
  totalEngagement: number;
  totalConversions: number;
  roi: number;

  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignCreator {
  id: string;
  campaignId: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorLevel: number;
  creatorVerificationLevel: VerificationLevel;
  creatorFollowers: number;
  creatorEngagementRate: number;

  // Deal
  dealId: string;
  amount: number;
  status: DealStatus;

  // Performance
  deliverables: {
    required: number;
    submitted: number;
    approved: number;
  };
  reach: number;
  engagement: number;
  conversions: number;
  roi: number;

  // Rating
  brandRating?: number;
  brandReview?: string;

  joinedAt: Date;
  completedAt?: Date;
}

export interface CreatorDiscovery {
  id: string;
  name: string;
  username: string;
  profileImage?: string;
  level: number;
  verificationLevel: VerificationLevel;
  profession: string;
  category: string;

  // Platform metrics
  platforms: {
    platform: Platform;
    followers: number;
    engagementRate: number;
    avgViews?: number;
  }[];
  totalFollowers: number;
  avgEngagementRate: number;

  // Performance
  completedDeals: number;
  averageRating: number;
  totalEarnings: number;

  // Match
  matchScore: number;
  matchReasons: string[];

  // Pricing
  estimatedRate: number;
  levelMultiplier: number;
}

// ═════════════════════════════════════════════════════════════════════════
// BRAND DASHBOARD METRICS
// ═════════════════════════════════════════════════════════════════════════

export interface BrandDashboardMetrics {
  // Overview
  totalSpent: number;
  totalReach: number;
  totalEngagement: number;
  averageROI: number;

  // Campaigns
  activeCampaigns: number;
  completedCampaigns: number;
  draftCampaigns: number;

  // Creators
  totalCreatorsWorkedWith: number;
  favoriteCreators: number;
  pendingApplications: number;

  // Performance
  bestPerformingCampaign?: {
    id: string;
    name: string;
    roi: number;
  };
  topCreator?: {
    id: string;
    name: string;
    roi: number;
  };

  // Trends
  spendTrend: { month: string; amount: number }[];
  reachTrend: { month: string; amount: number }[];
}

// ═════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═════════════════════════════════════════════════════════════════════════

export const MOCK_BRAND: Brand = {
  id: 'brand-demo',
  name: 'TechFlow Labs',
  logo: '/brands/techflow.png',
  description: 'AI-powered productivity tools for modern teams',
  website: 'https://techflow.com',
  industry: 'Technology',
  size: 'medium',

  primaryContact: {
    name: 'Sarah Chen',
    email: 'sarah@techflow.com',
    role: 'Marketing Director',
  },

  preferredCategories: ['Tech Creator', 'SDE Level 2', 'Product Manager'],
  preferredPlatforms: ['meta', 'linkedin', 'youtube'],
  minCreatorLevel: 2,
  minVerificationLevel: 3,
  budgetRange: {
    min: 100000,
    max: 1000000,
  },

  totalSpent: 15600000, // $156,000
  activeCampaigns: 3,
  completedCampaigns: 12,
  averageCreatorRating: 4.6,
  totalCreatorsWorkedWith: 45,

  autoApproveDeliverables: false,
  paymentMethod: 'card',

  createdAt: new Date('2023-06-01'),
  updatedAt: new Date('2024-02-01'),
};

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'campaign-001',
    brandId: 'brand-demo',
    brandName: 'TechFlow Labs',
    name: 'AI Product Launch 2024',
    description: 'Launch campaign for our new AI assistant feature. Looking for authentic tech creators to demonstrate the product.',
    objective: 'awareness',
    category: 'Tech Creator',

    totalBudget: 5000000, // $50,000
    spentBudget: 2500000,
    remainingBudget: 2500000,
    costPerCreator: 500000, // $5,000 avg

    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-03-31'),
    applicationDeadline: new Date('2024-02-15'),

    platforms: ['meta', 'youtube'],
    requiredCreatorLevel: 3,
    requiredVerificationLevel: 3,
    targetFollowerRange: { min: 50000, max: 500000 },
    contentRequirements: ['1 YouTube video (5-10 min)', '2 Instagram Reels', '3 Stories'],
    brandGuidelines: 'Focus on productivity benefits. Show real use cases. Be authentic.',
    hashtags: ['#TechFlowAI', '#ProductivityHack', '#AIAssistant'],
    mentions: ['@techflowlabs'],

    totalSlots: 10,
    filledSlots: 5,
    pendingApplications: 18,

    totalReach: 2450000,
    totalEngagement: 125000,
    totalConversions: 3200,
    roi: 2.4,

    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: 'campaign-002',
    brandId: 'brand-demo',
    brandName: 'TechFlow Labs',
    name: 'B2B LinkedIn Thought Leadership',
    description: 'Looking for professional creators to publish thought leadership content about productivity and team collaboration.',
    objective: 'engagement',
    category: 'Product Manager',

    totalBudget: 2000000,
    spentBudget: 800000,
    remainingBudget: 1200000,
    costPerCreator: 400000,

    startDate: new Date('2024-02-15'),
    endDate: new Date('2024-04-15'),
    applicationDeadline: new Date('2024-02-28'),

    platforms: ['linkedin'],
    requiredCreatorLevel: 4,
    requiredVerificationLevel: 3,
    targetFollowerRange: { min: 10000, max: 200000 },
    contentRequirements: ['2 LinkedIn articles', '4 LinkedIn posts'],
    brandGuidelines: 'Professional tone. Focus on ROI and team efficiency.',
    hashtags: ['#Productivity', '#TeamEfficiency', '#TechTools'],
    mentions: ['TechFlow Labs'],

    totalSlots: 5,
    filledSlots: 2,
    pendingApplications: 8,

    totalReach: 450000,
    totalEngagement: 28000,
    totalConversions: 850,
    roi: 1.8,

    status: 'active',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-10'),
  },
];

export const MOCK_CREATOR_DISCOVERY: CreatorDiscovery[] = [
  {
    id: 'creator-disc-001',
    name: 'Alex Tech',
    username: 'alextech',
    level: 4,
    verificationLevel: 4,
    profession: 'SDE Level 3',
    category: 'Tech',
    platforms: [
      { platform: 'meta', followers: 125000, engagementRate: 4.2, avgViews: 45000 },
      { platform: 'youtube', followers: 85000, engagementRate: 6.8, avgViews: 28000 },
    ],
    totalFollowers: 210000,
    avgEngagementRate: 5.5,
    completedDeals: 12,
    averageRating: 4.8,
    totalEarnings: 4500000,
    matchScore: 92,
    matchReasons: ['Perfect category match', 'High engagement rate', 'Verified creator'],
    estimatedRate: 600000,
    levelMultiplier: 5.0,
  },
  {
    id: 'creator-disc-002',
    name: 'Sarah PM',
    username: 'sarahpm',
    level: 3,
    verificationLevel: 3,
    profession: 'Product Manager',
    category: 'Tech',
    platforms: [
      { platform: 'linkedin', followers: 45000, engagementRate: 8.2 },
    ],
    totalFollowers: 45000,
    avgEngagementRate: 8.2,
    completedDeals: 6,
    averageRating: 4.6,
    totalEarnings: 1800000,
    matchScore: 88,
    matchReasons: ['LinkedIn specialist', 'B2B audience', 'High engagement'],
    estimatedRate: 350000,
    levelMultiplier: 2.5,
  },
  {
    id: 'creator-disc-003',
    name: 'Dev Diaries',
    username: 'devdiaries',
    level: 5,
    verificationLevel: 5,
    profession: 'Frontend Engineer',
    category: 'Tech',
    platforms: [
      { platform: 'youtube', followers: 450000, engagementRate: 5.1, avgViews: 120000 },
      { platform: 'meta', followers: 180000, engagementRate: 3.8, avgViews: 55000 },
    ],
    totalFollowers: 630000,
    avgEngagementRate: 4.5,
    completedDeals: 28,
    averageRating: 4.9,
    totalEarnings: 12500000,
    matchScore: 95,
    matchReasons: ['Elite verified', 'Huge reach', 'Top performer'],
    estimatedRate: 1500000,
    levelMultiplier: 10.0,
  },
];

export const MOCK_BRAND_DASHBOARD: BrandDashboardMetrics = {
  totalSpent: 15600000,
  totalReach: 8500000,
  totalEngagement: 425000,
  averageROI: 2.8,

  activeCampaigns: 3,
  completedCampaigns: 12,
  draftCampaigns: 2,

  totalCreatorsWorkedWith: 45,
  favoriteCreators: 8,
  pendingApplications: 26,

  bestPerformingCampaign: {
    id: 'campaign-old-001',
    name: 'Summer Product Launch',
    roi: 4.2,
  },
  topCreator: {
    id: 'creator-disc-003',
    name: 'Dev Diaries',
    roi: 5.1,
  },

  spendTrend: [
    { month: 'Sep', amount: 850000 },
    { month: 'Oct', amount: 1200000 },
    { month: 'Nov', amount: 1450000 },
    { month: 'Dec', amount: 980000 },
    { month: 'Jan', amount: 1650000 },
    { month: 'Feb', amount: 1100000 },
  ],
  reachTrend: [
    { month: 'Sep', amount: 650000 },
    { month: 'Oct', amount: 850000 },
    { month: 'Nov', amount: 1200000 },
    { month: 'Dec', amount: 780000 },
    { month: 'Jan', amount: 1450000 },
    { month: 'Feb', amount: 920000 },
  ],
};

// ═════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════

export function getCampaignStatusInfo(status: Campaign['status']): {
  label: string;
  color: string;
  bgColor: string;
} {
  const statusMap: Record<Campaign['status'], { label: string; color: string; bgColor: string }> = {
    draft: { label: 'Draft', color: '#737373', bgColor: '#26262620' },
    active: { label: 'Active', color: '#10b981', bgColor: '#10b98120' },
    paused: { label: 'Paused', color: '#f59e0b', bgColor: '#f59e0b20' },
    completed: { label: 'Completed', color: '#8b5cf6', bgColor: '#8b5cf620' },
    cancelled: { label: 'Cancelled', color: '#ef4444', bgColor: '#ef444420' },
  };

  return statusMap[status];
}

export function calculateCampaignROI(
  spent: number,
  conversions: number,
  avgConversionValue: number = 10000 // $100 default
): number {
  if (spent === 0) return 0;
  const revenue = conversions * avgConversionValue;
  return Math.round((revenue / spent) * 10) / 10;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
