/*
 * PORTABLE CREATOR REPUTATION SYSTEM
 * ══════════════════════════════════════════════════════════════════════════
 * PATENT-CRITICAL: Platform-Agnostic Reputation Score with Blockchain Proof
 *
 * THE MOAT: Creators build reputation HERE that they OWN and can take ANYWHERE.
 * Instagram can't give you this. YouTube can't give you this. We can.
 *
 * This is NOT a vanity metric. This is:
 * 1. Cryptographically signed proof of completed deals
 * 2. Verifiable earnings history (without revealing exact amounts)
 * 3. Brand testimonials stored on-chain
 * 4. Portable to ANY platform, ANY marketplace, ANY future job
 *
 * WHY THIS MATTERS:
 * - Creator gets banned from Instagram? Reputation survives.
 * - Creator switches to new platform? Reputation comes with them.
 * - Creator applies for traditional job? Reputation is verifiable.
 * - Creator gets acquired by talent agency? Reputation has PROVABLE value.
 */

export interface ReputationScore {
  creatorId: string;

  // ══════════════════════════════════════════════════════════════════════
  // CORE SCORE (0-1000) - The number that follows you everywhere
  // ══════════════════════════════════════════════════════════════════════
  score: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  percentile: number; // Top X% of all creators

  // ══════════════════════════════════════════════════════════════════════
  // VERIFIABLE METRICS (Blockchain-anchored)
  // ══════════════════════════════════════════════════════════════════════
  verifiedMetrics: {
    totalDealsCompleted: number;
    totalEarningsRange: '$1K-$10K' | '$10K-$50K' | '$50K-$100K' | '$100K-$500K' | '$500K+';
    avgDealRating: number;
    onTimeDeliveryRate: number;
    repeatBrandRate: number; // % of brands that work with them again
    disputeRate: number;
    avgResponseTime: number; // hours
  };

  // ══════════════════════════════════════════════════════════════════════
  // BLOCKCHAIN PROOFS
  // ══════════════════════════════════════════════════════════════════════
  proofs: {
    reputationTokenId: string; // NFT that stores reputation
    lastAnchoredBlock: number;
    merkleRoot: string; // Root of all deal proofs
    ipfsHash: string; // Full reputation data on IPFS
    verificationUrl: string; // Anyone can verify
  };

  // ══════════════════════════════════════════════════════════════════════
  // EARNED BADGES (Soulbound - can't be transferred)
  // ══════════════════════════════════════════════════════════════════════
  badges: ReputationBadge[];

  // ══════════════════════════════════════════════════════════════════════
  // BRAND ENDORSEMENTS (Signed by brands, stored on-chain)
  // ══════════════════════════════════════════════════════════════════════
  endorsements: BrandEndorsement[];

  // ══════════════════════════════════════════════════════════════════════
  // PORTABILITY
  // ══════════════════════════════════════════════════════════════════════
  portability: {
    exportFormats: ('json' | 'pdf' | 'linkedin' | 'verifiable_credential')[];
    embedCode: string; // Embed reputation badge on any website
    apiEndpoint: string; // Third parties can verify
    qrCode: string; // Scan to verify reputation
  };

  updatedAt: Date;
  anchoredAt: Date;
}

export interface ReputationBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  earnedAt: Date;
  proofHash: string; // On-chain proof

  // Criteria that earned this badge
  criteria: {
    type: string;
    threshold: number;
    achieved: number;
  };
}

export interface BrandEndorsement {
  id: string;
  brandId: string;
  brandName: string;
  brandLogo?: string;
  brandVerified: boolean;

  endorsement: string;
  rating: number;
  dealId: string;
  dealValue: '$500-$1K' | '$1K-$5K' | '$5K-$10K' | '$10K-$50K' | '$50K+';

  // Cryptographic proof
  signature: string; // Brand's cryptographic signature
  timestamp: Date;
  blockNumber?: number;
  transactionHash?: string;
}

// ══════════════════════════════════════════════════════════════════════════
// REPUTATION CALCULATION
// ══════════════════════════════════════════════════════════════════════════

export function calculateReputationScore(metrics: ReputationScore['verifiedMetrics']): number {
  let score = 0;

  // Deal Volume (25%)
  if (metrics.totalDealsCompleted >= 100) score += 250;
  else if (metrics.totalDealsCompleted >= 50) score += 200;
  else if (metrics.totalDealsCompleted >= 20) score += 150;
  else if (metrics.totalDealsCompleted >= 10) score += 100;
  else if (metrics.totalDealsCompleted >= 5) score += 50;
  else score += metrics.totalDealsCompleted * 10;

  // Rating Quality (25%)
  score += Math.round((metrics.avgDealRating / 5) * 250);

  // Reliability (25%)
  score += Math.round(metrics.onTimeDeliveryRate * 2.5);

  // Brand Loyalty (15%)
  score += Math.round(metrics.repeatBrandRate * 1.5);

  // Clean Record (10%)
  const disputePenalty = Math.round(metrics.disputeRate * 100);
  score += Math.max(0, 100 - disputePenalty);

  return Math.min(1000, score);
}

export function getReputationTier(score: number): ReputationScore['tier'] {
  if (score >= 900) return 'Diamond';
  if (score >= 750) return 'Platinum';
  if (score >= 550) return 'Gold';
  if (score >= 350) return 'Silver';
  return 'Bronze';
}

export const TIER_COLORS: Record<ReputationScore['tier'], string> = {
  Bronze: '#cd7f32',
  Silver: '#c0c0c0',
  Gold: '#ffd700',
  Platinum: '#e5e4e2',
  Diamond: '#b9f2ff',
};

export const TIER_BENEFITS: Record<ReputationScore['tier'], string[]> = {
  Bronze: ['Basic marketplace access', 'Standard matching'],
  Silver: ['Priority in search', '10% lower platform fees', 'Silver badge on profile'],
  Gold: ['Featured in brand searches', '15% lower fees', 'Gold badge', 'Priority support'],
  Platinum: ['VIP brand access', '20% lower fees', 'Platinum badge', 'Dedicated account manager'],
  Diamond: ['Exclusive enterprise deals', '25% lower fees', 'Diamond badge', 'Revenue share eligibility', 'Board voting rights'],
};

// ══════════════════════════════════════════════════════════════════════════
// SOULBOUND BADGES (Non-transferable achievements)
// ══════════════════════════════════════════════════════════════════════════

export const REPUTATION_BADGES: Omit<ReputationBadge, 'id' | 'earnedAt' | 'proofHash' | 'criteria'>[] = [
  {
    name: 'First Deal',
    description: 'Completed your first brand deal',
    icon: '🎯',
    rarity: 'Common',
  },
  {
    name: 'Rising Star',
    description: 'Completed 10 deals with 4.5+ average rating',
    icon: '⭐',
    rarity: 'Common',
  },
  {
    name: 'Reliable Creator',
    description: '100% on-time delivery for 20+ deals',
    icon: '⏰',
    rarity: 'Rare',
  },
  {
    name: 'Brand Favorite',
    description: '5+ brands have worked with you multiple times',
    icon: '💝',
    rarity: 'Rare',
  },
  {
    name: 'Six Figure Creator',
    description: 'Earned $100K+ through the platform',
    icon: '💰',
    rarity: 'Epic',
  },
  {
    name: 'Perfect Record',
    description: '50+ deals with zero disputes',
    icon: '✨',
    rarity: 'Epic',
  },
  {
    name: 'Industry Leader',
    description: 'Top 1% reputation score in your category',
    icon: '👑',
    rarity: 'Legendary',
  },
  {
    name: 'Million Dollar Creator',
    description: 'Earned $1M+ through the platform',
    icon: '💎',
    rarity: 'Legendary',
  },
  {
    name: 'OG Creator',
    description: 'Among the first 1000 creators on Valueskins',
    icon: '🏆',
    rarity: 'Legendary',
  },
];

// ══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ══════════════════════════════════════════════════════════════════════════

export const MOCK_REPUTATION: ReputationScore = {
  creatorId: 'creator-001',
  score: 847,
  tier: 'Platinum',
  percentile: 92,

  verifiedMetrics: {
    totalDealsCompleted: 47,
    totalEarningsRange: '$100K-$500K',
    avgDealRating: 4.87,
    onTimeDeliveryRate: 98,
    repeatBrandRate: 68,
    disputeRate: 0,
    avgResponseTime: 2.4,
  },

  proofs: {
    reputationTokenId: 'vs-rep-001-0x7a3b...',
    lastAnchoredBlock: 18543921,
    merkleRoot: '0x8f3a2b1c...',
    ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    verificationUrl: 'https://valueskins.com/verify/creator-001',
  },

  badges: [
    {
      id: 'badge-001',
      name: 'First Deal',
      description: 'Completed your first brand deal',
      icon: '🎯',
      rarity: 'Common',
      earnedAt: new Date('2023-03-15'),
      proofHash: '0x1a2b3c...',
      criteria: { type: 'deals_completed', threshold: 1, achieved: 1 },
    },
    {
      id: 'badge-002',
      name: 'Rising Star',
      description: 'Completed 10 deals with 4.5+ average rating',
      icon: '⭐',
      rarity: 'Common',
      earnedAt: new Date('2023-06-20'),
      proofHash: '0x4d5e6f...',
      criteria: { type: 'deals_with_rating', threshold: 10, achieved: 10 },
    },
    {
      id: 'badge-003',
      name: 'Reliable Creator',
      description: '100% on-time delivery for 20+ deals',
      icon: '⏰',
      rarity: 'Rare',
      earnedAt: new Date('2023-09-10'),
      proofHash: '0x7g8h9i...',
      criteria: { type: 'on_time_streak', threshold: 20, achieved: 20 },
    },
    {
      id: 'badge-004',
      name: 'Six Figure Creator',
      description: 'Earned $100K+ through the platform',
      icon: '💰',
      rarity: 'Epic',
      earnedAt: new Date('2024-01-05'),
      proofHash: '0xabc123...',
      criteria: { type: 'total_earnings', threshold: 100000, achieved: 142500 },
    },
  ],

  endorsements: [
    {
      id: 'end-001',
      brandId: 'brand-001',
      brandName: 'TechFlow Labs',
      brandLogo: '/brands/techflow.png',
      brandVerified: true,
      endorsement: 'Alex delivered exceptional work that exceeded our campaign goals by 340%. His audience engagement is genuine and his professionalism is unmatched.',
      rating: 5,
      dealId: 'deal-045',
      dealValue: '$10K-$50K',
      signature: '0xsig_techflow_001...',
      timestamp: new Date('2024-01-20'),
      blockNumber: 18543800,
      transactionHash: '0xtx_end_001...',
    },
    {
      id: 'end-002',
      brandId: 'brand-002',
      brandName: 'GameZone Studios',
      brandVerified: true,
      endorsement: 'We\'ve worked with Alex on 5 campaigns now. Every single one has outperformed. He\'s our go-to creator for gaming content.',
      rating: 5,
      dealId: 'deal-042',
      dealValue: '$5K-$10K',
      signature: '0xsig_gamezone_001...',
      timestamp: new Date('2023-12-15'),
      blockNumber: 18432100,
      transactionHash: '0xtx_end_002...',
    },
  ],

  portability: {
    exportFormats: ['json', 'pdf', 'linkedin', 'verifiable_credential'],
    embedCode: '<script src="https://valueskins.com/embed/creator-001.js"></script>',
    apiEndpoint: 'https://api.valueskins.com/v1/reputation/creator-001',
    qrCode: 'https://valueskins.com/qr/creator-001.png',
  },

  updatedAt: new Date(),
  anchoredAt: new Date(),
};
