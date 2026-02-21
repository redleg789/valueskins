/*
 * MEDIA KIT AUTO-GENERATION
 * ──────────────────────────────────────────────────────────────────────────
 * PATENT-RELEVANT: AI-Powered Professional Portfolio Generation
 *
 * This system auto-generates professional media kits for creators:
 * 1. Pulls data from connected platforms
 * 2. Generates beautiful PDF layouts
 * 3. Creates shareable portfolio URLs
 * 4. Updates automatically as metrics change
 *
 * KEY VALUE PROPOSITION:
 * - Creators save hours of manual media kit creation
 * - Always up-to-date with latest metrics
 * - Professional design without design skills
 * - One-click sharing with brands
 */

import { Platform } from './professions';
import { AggregatedProfile, PlatformAccount } from './aggregation';

export interface MediaKit {
  id: string;
  creatorId: string;
  creatorName: string;

  // Branding
  profileImage?: string;
  coverImage?: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  tagline: string;

  // Bio Section
  bio: string;
  location?: string;
  languages: string[];
  niche: string;
  specialties: string[];

  // Platform Stats (auto-pulled)
  platforms: {
    platform: Platform | 'tiktok' | 'twitter' | 'twitch';
    username: string;
    followers: number;
    engagementRate: number;
    primaryContent: string;
  }[];

  // Aggregated Stats
  totalFollowers: number;
  avgEngagementRate: number;
  monthlyReach: number;
  contentCategories: string[];

  // Audience Demographics
  audienceDemo: {
    ageRanges: { range: string; percentage: number }[];
    genderSplit: { male: number; female: number; other: number };
    topLocations: { location: string; percentage: number }[];
  };

  // Content Examples
  featuredContent: {
    id: string;
    platform: string;
    type: 'video' | 'image' | 'post';
    thumbnailUrl: string;
    url: string;
    metrics: {
      views?: number;
      likes: number;
      comments: number;
    };
  }[];

  // Past Collaborations
  collaborations: {
    brandName: string;
    brandLogo?: string;
    campaignType: string;
    results?: string;
    date: Date;
  }[];

  // Testimonials
  testimonials: {
    brandName: string;
    quote: string;
    contactName?: string;
    contactTitle?: string;
  }[];

  // Rates
  showRates: boolean;
  rates: {
    type: string;
    platform: string;
    price: number;
    description: string;
  }[];

  // Contact
  email: string;
  website?: string;
  bookingUrl?: string;

  // Sharing
  publicUrl: string;
  isPublic: boolean;
  customSlug?: string;
  password?: string;

  // Metadata
  views: number;
  downloads: number;
  lastUpdated: Date;
  createdAt: Date;
}

export interface MediaKitTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  layout: 'modern' | 'classic' | 'minimal' | 'bold';
  colorSchemes: {
    name: string;
    primary: string;
    secondary: string;
    accent: string;
  }[];
  isPremium: boolean;
}

// ═════════════════════════════════════════════════════════════════════════
// TEMPLATES
// ═════════════════════════════════════════════════════════════════════════

export const MEDIA_KIT_TEMPLATES: MediaKitTemplate[] = [
  {
    id: 'modern-dark',
    name: 'Modern Dark',
    description: 'Sleek dark theme with gradient accents',
    thumbnail: '/templates/modern-dark.png',
    layout: 'modern',
    colorSchemes: [
      { name: 'Purple Gradient', primary: '#8b5cf6', secondary: '#6366f1', accent: '#ec4899' },
      { name: 'Blue Ocean', primary: '#0095f6', secondary: '#0077b6', accent: '#00b4d8' },
      { name: 'Sunset', primary: '#f59e0b', secondary: '#ef4444', accent: '#ec4899' },
    ],
    isPremium: false,
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    description: 'Clean, professional light theme',
    thumbnail: '/templates/minimal-light.png',
    layout: 'minimal',
    colorSchemes: [
      { name: 'Monochrome', primary: '#000000', secondary: '#333333', accent: '#666666' },
      { name: 'Forest', primary: '#10b981', secondary: '#047857', accent: '#065f46' },
      { name: 'Ocean', primary: '#0a66c2', secondary: '#004182', accent: '#0077b6' },
    ],
    isPremium: false,
  },
  {
    id: 'bold-creative',
    name: 'Bold Creative',
    description: 'Eye-catching design for creative professionals',
    thumbnail: '/templates/bold-creative.png',
    layout: 'bold',
    colorSchemes: [
      { name: 'Neon', primary: '#f0f', secondary: '#0ff', accent: '#ff0' },
      { name: 'Electric', primary: '#7c3aed', secondary: '#ec4899', accent: '#06b6d4' },
    ],
    isPremium: true,
  },
  {
    id: 'classic-professional',
    name: 'Classic Professional',
    description: 'Traditional layout for B2B creators',
    thumbnail: '/templates/classic-pro.png',
    layout: 'classic',
    colorSchemes: [
      { name: 'Corporate Blue', primary: '#1e40af', secondary: '#1e3a8a', accent: '#3b82f6' },
      { name: 'Executive', primary: '#374151', secondary: '#1f2937', accent: '#6b7280' },
    ],
    isPremium: true,
  },
];

// ═════════════════════════════════════════════════════════════════════════
// GENERATION FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════

export function generateMediaKitFromProfile(
  profile: AggregatedProfile,
  creatorEmail: string,
  template: MediaKitTemplate,
  colorScheme: { primary: string; secondary: string; accent: string }
): MediaKit {
  const slug = profile.creatorName.toLowerCase().replace(/\s+/g, '-');

  return {
    id: `mediakit-${profile.creatorId}`,
    creatorId: profile.creatorId,
    creatorName: profile.creatorName,

    brandColors: colorScheme,
    tagline: `${profile.primaryNiche} | ${formatNumber(profile.totalFollowers)} Followers`,

    bio: `Professional content creator specializing in ${profile.contentCategories.join(', ')}. Creating engaging content across ${profile.totalAccounts} platforms with a combined reach of ${formatNumber(profile.estimatedUniqueReach)} unique viewers.`,
    languages: ['English'],
    niche: profile.primaryNiche,
    specialties: profile.contentCategories,

    platforms: profile.accounts.map(acc => ({
      platform: acc.platform,
      username: acc.username,
      followers: acc.followers,
      engagementRate: acc.engagementRate,
      primaryContent: acc.primaryContentType,
    })),

    totalFollowers: profile.totalFollowers,
    avgEngagementRate: profile.combinedEngagementRate,
    monthlyReach: profile.estimatedUniqueReach * 4, // Estimate monthly reach
    contentCategories: profile.contentCategories,

    audienceDemo: {
      ageRanges: [
        { range: '18-24', percentage: 33 },
        { range: '25-34', percentage: 40 },
        { range: '35-44', percentage: 18 },
        { range: '45+', percentage: 9 },
      ],
      genderSplit: { male: 68, female: 30, other: 2 },
      topLocations: [
        { location: 'United States', percentage: 45 },
        { location: 'India', percentage: 18 },
        { location: 'United Kingdom', percentage: 12 },
      ],
    },

    featuredContent: [],
    collaborations: [],
    testimonials: [],

    showRates: true,
    rates: [
      { type: 'Instagram Reel', platform: 'meta', price: 150000, description: '60-90 second Reel with product integration' },
      { type: 'YouTube Video', platform: 'youtube', price: 350000, description: 'Dedicated 8-12 minute review video' },
      { type: 'Instagram Story', platform: 'meta', price: 50000, description: 'Set of 3 stories with swipe-up' },
      { type: 'LinkedIn Post', platform: 'linkedin', price: 80000, description: 'Thought leadership post with brand mention' },
    ],

    email: creatorEmail,
    publicUrl: `https://valueskins.com/creators/${slug}`,
    isPublic: true,
    customSlug: slug,

    views: 0,
    downloads: 0,
    lastUpdated: new Date(),
    createdAt: new Date(),
  };
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
}

// ═════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═════════════════════════════════════════════════════════════════════════

export const MOCK_MEDIA_KIT: MediaKit = {
  id: 'mediakit-001',
  creatorId: 'creator-001',
  creatorName: 'Alex Tech',

  profileImage: '/avatars/alex.jpg',
  coverImage: '/covers/tech-cover.jpg',
  brandColors: {
    primary: '#8b5cf6',
    secondary: '#6366f1',
    accent: '#ec4899',
  },
  tagline: 'Tech Creator | Reviews & Tutorials | 238K+ Community',

  bio: 'I create honest, in-depth tech content that helps people make better buying decisions. From detailed reviews to practical tutorials, I focus on making technology accessible to everyone. My community trusts my recommendations because I only partner with brands I genuinely believe in.',
  location: 'San Francisco, CA',
  languages: ['English', 'Spanish'],
  niche: 'Tech Creator',
  specialties: ['Product Reviews', 'Tutorials', 'Tech News', 'Career Advice'],

  platforms: [
    { platform: 'meta', username: 'alextech', followers: 125000, engagementRate: 4.2, primaryContent: 'video' },
    { platform: 'youtube', username: 'AlexTechYT', followers: 85000, engagementRate: 6.8, primaryContent: 'video' },
    { platform: 'linkedin', username: 'alextech-creator', followers: 28000, engagementRate: 4.8, primaryContent: 'text' },
  ],

  totalFollowers: 238000,
  avgEngagementRate: 5.3,
  monthlyReach: 618800,
  contentCategories: ['Tech', 'Reviews', 'Tutorials', 'Career'],

  audienceDemo: {
    ageRanges: [
      { range: '18-24', percentage: 33 },
      { range: '25-34', percentage: 40 },
      { range: '35-44', percentage: 18 },
      { range: '45+', percentage: 9 },
    ],
    genderSplit: { male: 68, female: 30, other: 2 },
    topLocations: [
      { location: 'United States', percentage: 45 },
      { location: 'India', percentage: 18 },
      { location: 'United Kingdom', percentage: 12 },
      { location: 'Canada', percentage: 8 },
      { location: 'Germany', percentage: 5 },
    ],
  },

  featuredContent: [
    {
      id: 'content-001',
      platform: 'youtube',
      type: 'video',
      thumbnailUrl: '/content/review-macbook.jpg',
      url: 'https://youtube.com/watch?v=example1',
      metrics: { views: 125000, likes: 8500, comments: 420 },
    },
    {
      id: 'content-002',
      platform: 'meta',
      type: 'video',
      thumbnailUrl: '/content/tech-reel.jpg',
      url: 'https://instagram.com/reel/example2',
      metrics: { views: 89000, likes: 12500, comments: 380 },
    },
    {
      id: 'content-003',
      platform: 'linkedin',
      type: 'post',
      thumbnailUrl: '/content/linkedin-post.jpg',
      url: 'https://linkedin.com/posts/example3',
      metrics: { likes: 2800, comments: 185 },
    },
  ],

  collaborations: [
    {
      brandName: 'TechFlow Labs',
      brandLogo: '/brands/techflow.png',
      campaignType: 'Product Launch',
      results: '2.5M impressions, 125K engagements',
      date: new Date('2024-01-15'),
    },
    {
      brandName: 'CloudBase',
      brandLogo: '/brands/cloudbase.png',
      campaignType: 'Sponsored Tutorial',
      results: '180K views, 12K sign-ups',
      date: new Date('2023-11-20'),
    },
    {
      brandName: 'DevTools Pro',
      brandLogo: '/brands/devtools.png',
      campaignType: 'Brand Ambassador',
      results: '6-month partnership, 4.2x ROI',
      date: new Date('2023-08-01'),
    },
  ],

  testimonials: [
    {
      brandName: 'TechFlow Labs',
      quote: 'Alex delivered exceptional content that exceeded our expectations. His authentic approach resonated perfectly with our target audience, and the campaign results spoke for themselves.',
      contactName: 'Sarah Chen',
      contactTitle: 'Marketing Director',
    },
    {
      brandName: 'CloudBase',
      quote: 'Working with Alex was seamless. His technical knowledge combined with his ability to explain complex concepts made our product tutorial one of our best-performing pieces of content.',
      contactName: 'Mike Johnson',
      contactTitle: 'Head of Growth',
    },
  ],

  showRates: true,
  rates: [
    { type: 'Instagram Reel', platform: 'meta', price: 250000, description: '60-90 second Reel with product integration' },
    { type: 'YouTube Review', platform: 'youtube', price: 500000, description: 'Dedicated 8-12 minute honest review' },
    { type: 'YouTube Integration', platform: 'youtube', price: 300000, description: '60-90 second integration in existing video' },
    { type: 'Instagram Story Set', platform: 'meta', price: 75000, description: 'Set of 3-5 stories with swipe-up' },
    { type: 'LinkedIn Article', platform: 'linkedin', price: 150000, description: 'Thought leadership article with brand mention' },
    { type: 'Full Campaign', platform: 'meta', price: 1500000, description: 'Multi-platform campaign (Instagram + YouTube + LinkedIn)' },
  ],

  email: 'alex@alextech.com',
  website: 'https://alextech.com',
  bookingUrl: 'https://valueskins.com/book/alextech',

  publicUrl: 'https://valueskins.com/creators/alex-tech',
  isPublic: true,
  customSlug: 'alex-tech',

  views: 1250,
  downloads: 48,
  lastUpdated: new Date(),
  createdAt: new Date('2024-01-01'),
};

// ═════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString()}`;
}

export function getMediaKitShareUrl(kit: MediaKit): string {
  if (kit.customSlug) {
    return `https://valueskins.com/creators/${kit.customSlug}`;
  }
  return kit.publicUrl;
}

export function canDownloadPdf(kit: MediaKit): boolean {
  // In production, this would check if creator has premium subscription
  return true;
}
