/*
 * CREATOR COLLECTIVE BARGAINING & BIDDING WARS
 * ══════════════════════════════════════════════════════════════════════════
 * PATENT-CRITICAL: Unions Meet Web3 - Creators Negotiate Together
 *
 * THE BILLION-DOLLAR INSIGHT:
 * Individual creators have NO leverage. Together, they're unstoppable.
 *
 * WHAT THIS ENABLES:
 * 1. COLLECTIVE BARGAINING - Creators in a niche set minimum rates together
 * 2. BIDDING WARS - Brands compete for top creators (not the other way around)
 * 3. STRIKE CAPABILITY - If a brand mistreats creators, the whole collective boycotts
 * 4. RATE TRANSPARENCY - No more getting lowballed because you don't know market rates
 *
 * WHY NO PLATFORM HAS DONE THIS:
 * - Platforms profit from creator desperation
 * - Low rates = more deals = more platform fees
 * - Valueskins wins when CREATORS win (equity alignment)
 */

// ══════════════════════════════════════════════════════════════════════════
// CREATOR COLLECTIVES (Guilds/Unions)
// ══════════════════════════════════════════════════════════════════════════

export interface CreatorCollective {
  id: string;
  name: string;
  description: string;
  category: string; // e.g., "Gaming Creators", "Tech Reviewers"

  // Membership
  members: CollectiveMember[];
  totalMembers: number;
  totalCombinedFollowers: number;
  avgMemberLevel: number;

  // Governance
  leadership: {
    president: string; // creatorId
    council: string[]; // creatorIds
    votingThreshold: number; // % needed to pass proposals
  };

  // Collective Agreements
  minimumRates: MinimumRate[];
  blacklistedBrands: BlacklistedBrand[];
  activeStrikes: Strike[];

  // Collective Stats
  stats: {
    totalDealsNegotiated: number;
    avgDealValue: number;
    avgRateIncrease: number; // % increase vs non-collective creators
    brandsPartnered: number;
  };

  // Treasury (for strike funds, legal, etc.)
  treasury: {
    balance: number;
    monthlyContribution: number;
    usageHistory: TreasuryTransaction[];
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface CollectiveMember {
  creatorId: string;
  creatorName: string;
  joinedAt: Date;
  role: 'member' | 'council' | 'president';
  votingPower: number; // Based on contribution/level
  contributions: number;
  dealsThruCollective: number;
}

export interface MinimumRate {
  id: string;
  contentType: string; // e.g., "YouTube Video", "Instagram Reel"
  platform: string;
  minRate: number; // In cents
  perMetric: 'per_post' | 'per_1k_followers' | 'per_1k_views';
  effectiveDate: Date;
  votedOn: Date;
  votesFor: number;
  votesAgainst: number;
}

export interface BlacklistedBrand {
  brandId: string;
  brandName: string;
  reason: string;
  evidence: string[];
  blacklistedAt: Date;
  blacklistedUntil?: Date; // undefined = permanent
  votesFor: number;
  votesAgainst: number;
}

export interface Strike {
  id: string;
  targetBrandId: string;
  targetBrandName: string;
  reason: string;
  demands: string[];
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'won' | 'lost' | 'negotiating';
  participatingMembers: number;
  impactMetrics: {
    dealsDeclined: number;
    estimatedBrandLoss: number;
  };
}

export interface TreasuryTransaction {
  id: string;
  type: 'contribution' | 'strike_fund' | 'legal' | 'marketing';
  amount: number;
  description: string;
  date: Date;
}

// ══════════════════════════════════════════════════════════════════════════
// BIDDING WARS - Brands Compete for Creators
// ══════════════════════════════════════════════════════════════════════════

export interface CreatorAuction {
  id: string;
  creatorId: string;
  creatorName: string;

  // Auction Details
  auctionType: 'open' | 'sealed' | 'dutch';
  contentType: string;
  deliverables: string[];
  timeline: string;

  // Pricing
  startingBid: number;
  currentBid: number;
  reservePrice: number; // Minimum creator will accept
  buyNowPrice?: number; // Instant win price

  // Bidders
  bids: AuctionBid[];
  totalBids: number;
  uniqueBidders: number;

  // Timing
  startTime: Date;
  endTime: Date;
  status: 'upcoming' | 'live' | 'ended' | 'sold' | 'no_sale';

  // Winner
  winnerId?: string;
  winningBid?: number;
  finalizedAt?: Date;
}

export interface AuctionBid {
  id: string;
  brandId: string;
  brandName: string;
  brandLogo?: string;
  amount: number;
  bidTime: Date;
  message?: string; // "We love your content and want to..."
  status: 'active' | 'outbid' | 'won' | 'lost';
}

export interface BrandBiddingWar {
  id: string;
  creatorId: string;
  creatorName: string;

  // Multiple brands fighting for same creator
  participants: BiddingParticipant[];

  // War Progress
  currentLeader: string; // brandId
  currentHighBid: number;
  rounds: BiddingRound[];

  // Rules
  incrementMinimum: number; // Min bid increase
  maxRounds: number;
  timePerRound: number; // minutes

  status: 'active' | 'completed' | 'creator_declined';
  winner?: string;
}

export interface BiddingParticipant {
  brandId: string;
  brandName: string;
  currentBid: number;
  maxBudget?: number; // Hidden from others
  autoIncrement: boolean;
  isActive: boolean;
}

export interface BiddingRound {
  roundNumber: number;
  bids: { brandId: string; amount: number }[];
  highestBid: number;
  timestamp: Date;
}

// ══════════════════════════════════════════════════════════════════════════
// RATE TRANSPARENCY
// ══════════════════════════════════════════════════════════════════════════

export interface MarketRateData {
  category: string;
  platform: string;
  contentType: string;

  // Rate ranges by creator level
  rates: {
    level1: { min: number; median: number; max: number };
    level2: { min: number; median: number; max: number };
    level3: { min: number; median: number; max: number };
    level4: { min: number; median: number; max: number };
    level5: { min: number; median: number; max: number };
  };

  // Trends
  trend: 'rising' | 'stable' | 'falling';
  changeLastMonth: number; // % change

  // Sample size
  dataPoints: number;
  lastUpdated: Date;
}

// ══════════════════════════════════════════════════════════════════════════
// COLLECTIVE GOVERNANCE
// ══════════════════════════════════════════════════════════════════════════

export interface CollectiveProposal {
  id: string;
  collectiveId: string;
  proposerId: string;
  proposerName: string;

  type: 'rate_change' | 'blacklist' | 'strike' | 'governance' | 'treasury';
  title: string;
  description: string;
  data: Record<string, unknown>;

  // Voting
  votingStartDate: Date;
  votingEndDate: Date;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorumRequired: number;
  quorumMet: boolean;

  status: 'voting' | 'passed' | 'rejected' | 'implemented';
}

// ══════════════════════════════════════════════════════════════════════════
// FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════

export function calculateCollectivePower(collective: CreatorCollective): number {
  // Power = members × avg followers × avg level
  const avgFollowers = collective.totalCombinedFollowers / collective.totalMembers;
  return collective.totalMembers * (avgFollowers / 100000) * collective.avgMemberLevel;
}

export function calculateMemberVotingPower(
  member: CollectiveMember,
  collective: CreatorCollective
): number {
  // Voting power based on contribution and deals
  const contributionWeight = member.contributions / (collective.treasury.balance || 1);
  const dealWeight = member.dealsThruCollective / (collective.stats.totalDealsNegotiated || 1);
  return (contributionWeight * 0.3 + dealWeight * 0.7) * 100;
}

export function isRateBelowMinimum(
  rate: number,
  contentType: string,
  collective: CreatorCollective
): boolean {
  const minRate = collective.minimumRates.find(r => r.contentType === contentType);
  return minRate ? rate < minRate.minRate : false;
}

export function calculateBrandBlacklistImpact(
  brandId: string,
  collective: CreatorCollective
): { potentialLoss: number; creatorsAffected: number } {
  // Calculate how much the brand would lose if blacklisted
  const avgDealValue = collective.stats.avgDealValue;
  const potentialDeals = Math.round(collective.totalMembers * 0.2); // 20% might work with brand
  return {
    potentialLoss: potentialDeals * avgDealValue,
    creatorsAffected: potentialDeals,
  };
}

export function createAuction(
  creatorId: string,
  creatorName: string,
  contentType: string,
  deliverables: string[],
  startingBid: number,
  reservePrice: number,
  durationHours: number
): CreatorAuction {
  const now = new Date();
  const endTime = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

  return {
    id: `auction-${Date.now()}`,
    creatorId,
    creatorName,
    auctionType: 'open',
    contentType,
    deliverables,
    timeline: '2 weeks',
    startingBid,
    currentBid: startingBid,
    reservePrice,
    bids: [],
    totalBids: 0,
    uniqueBidders: 0,
    startTime: now,
    endTime,
    status: 'live',
  };
}

export function placeBid(
  auction: CreatorAuction,
  brandId: string,
  brandName: string,
  amount: number,
  message?: string
): CreatorAuction {
  if (amount <= auction.currentBid) {
    throw new Error('Bid must be higher than current bid');
  }

  // Mark previous bids as outbid
  const updatedBids = auction.bids.map(bid => ({
    ...bid,
    status: 'outbid' as const,
  }));

  const newBid: AuctionBid = {
    id: `bid-${Date.now()}`,
    brandId,
    brandName,
    amount,
    bidTime: new Date(),
    message,
    status: 'active',
  };

  const uniqueBidders = new Set([
    ...auction.bids.map(b => b.brandId),
    brandId,
  ]).size;

  return {
    ...auction,
    currentBid: amount,
    bids: [...updatedBids, newBid],
    totalBids: auction.totalBids + 1,
    uniqueBidders,
  };
}

// ══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ══════════════════════════════════════════════════════════════════════════

export const MOCK_COLLECTIVE: CreatorCollective = {
  id: 'collective-gaming',
  name: 'Gaming Creators Guild',
  description: 'United front for gaming content creators. We negotiate together, we win together.',
  category: 'Gaming',

  members: [
    {
      creatorId: 'creator-001',
      creatorName: 'Alex Tech',
      joinedAt: new Date('2023-06-01'),
      role: 'council',
      votingPower: 15.5,
      contributions: 25000,
      dealsThruCollective: 12,
    },
    {
      creatorId: 'creator-002',
      creatorName: 'GameMaster Pro',
      joinedAt: new Date('2023-04-15'),
      role: 'president',
      votingPower: 22.3,
      contributions: 45000,
      dealsThruCollective: 28,
    },
  ],
  totalMembers: 1247,
  totalCombinedFollowers: 89000000,
  avgMemberLevel: 3.2,

  leadership: {
    president: 'creator-002',
    council: ['creator-001', 'creator-003', 'creator-004', 'creator-005'],
    votingThreshold: 66, // 66% to pass
  },

  minimumRates: [
    {
      id: 'rate-001',
      contentType: 'YouTube Gaming Video',
      platform: 'youtube',
      minRate: 5000_00, // $5,000
      perMetric: 'per_post',
      effectiveDate: new Date('2024-01-01'),
      votedOn: new Date('2023-12-15'),
      votesFor: 892,
      votesAgainst: 124,
    },
    {
      id: 'rate-002',
      contentType: 'Twitch Stream Integration',
      platform: 'twitch',
      minRate: 100_00, // $100
      perMetric: 'per_1k_views',
      effectiveDate: new Date('2024-01-01'),
      votedOn: new Date('2023-12-15'),
      votesFor: 945,
      votesAgainst: 87,
    },
  ],

  blacklistedBrands: [
    {
      brandId: 'brand-scam-001',
      brandName: 'ShadyGames Inc',
      reason: 'Non-payment to 15 creators, totaling $47,000 in unpaid invoices',
      evidence: ['Invoice screenshots', 'Email chains', 'Contract documents'],
      blacklistedAt: new Date('2023-11-01'),
      votesFor: 1189,
      votesAgainst: 23,
    },
  ],

  activeStrikes: [],

  stats: {
    totalDealsNegotiated: 3456,
    avgDealValue: 8500_00, // $8,500
    avgRateIncrease: 34, // 34% higher than non-collective
    brandsPartnered: 287,
  },

  treasury: {
    balance: 156000_00, // $156,000
    monthlyContribution: 25_00, // $25/month per member
    usageHistory: [
      {
        id: 'tx-001',
        type: 'legal',
        amount: 15000_00,
        description: 'Legal action against ShadyGames Inc',
        date: new Date('2023-11-15'),
      },
    ],
  },

  createdAt: new Date('2023-01-01'),
  updatedAt: new Date(),
};

export const MOCK_AUCTION: CreatorAuction = {
  id: 'auction-001',
  creatorId: 'creator-001',
  creatorName: 'Alex Tech',

  auctionType: 'open',
  contentType: 'YouTube Review Video',
  deliverables: [
    'Dedicated 10-15 min review video',
    'Social media promotion (3 posts)',
    '60-day exclusivity in tech category',
  ],
  timeline: '3 weeks from deal close',

  startingBid: 5000_00,
  currentBid: 12500_00,
  reservePrice: 8000_00,
  buyNowPrice: 25000_00,

  bids: [
    {
      id: 'bid-001',
      brandId: 'brand-001',
      brandName: 'TechFlow Labs',
      brandLogo: '/brands/techflow.png',
      amount: 5000_00,
      bidTime: new Date('2024-02-01T10:00:00'),
      status: 'outbid',
    },
    {
      id: 'bid-002',
      brandId: 'brand-002',
      brandName: 'CloudBase',
      amount: 7500_00,
      bidTime: new Date('2024-02-01T11:30:00'),
      message: 'We\'d love to feature your review on our homepage too!',
      status: 'outbid',
    },
    {
      id: 'bid-003',
      brandId: 'brand-003',
      brandName: 'DevTools Pro',
      amount: 10000_00,
      bidTime: new Date('2024-02-01T14:00:00'),
      status: 'outbid',
    },
    {
      id: 'bid-004',
      brandId: 'brand-001',
      brandName: 'TechFlow Labs',
      brandLogo: '/brands/techflow.png',
      amount: 12500_00,
      bidTime: new Date('2024-02-01T16:45:00'),
      message: 'Really want this partnership - also offering future collaboration opportunities!',
      status: 'active',
    },
  ],
  totalBids: 4,
  uniqueBidders: 3,

  startTime: new Date('2024-02-01T09:00:00'),
  endTime: new Date('2024-02-03T09:00:00'),
  status: 'live',
};

export const MOCK_MARKET_RATES: MarketRateData[] = [
  {
    category: 'Gaming',
    platform: 'youtube',
    contentType: 'Dedicated Video',
    rates: {
      level1: { min: 500_00, median: 1500_00, max: 3000_00 },
      level2: { min: 2000_00, median: 4000_00, max: 7500_00 },
      level3: { min: 5000_00, median: 10000_00, max: 20000_00 },
      level4: { min: 15000_00, median: 30000_00, max: 75000_00 },
      level5: { min: 50000_00, median: 100000_00, max: 500000_00 },
    },
    trend: 'rising',
    changeLastMonth: 8.5,
    dataPoints: 1247,
    lastUpdated: new Date(),
  },
  {
    category: 'Gaming',
    platform: 'twitch',
    contentType: 'Stream Integration',
    rates: {
      level1: { min: 100_00, median: 300_00, max: 750_00 },
      level2: { min: 500_00, median: 1500_00, max: 3000_00 },
      level3: { min: 2000_00, median: 5000_00, max: 10000_00 },
      level4: { min: 7500_00, median: 15000_00, max: 35000_00 },
      level5: { min: 25000_00, median: 50000_00, max: 150000_00 },
    },
    trend: 'stable',
    changeLastMonth: 1.2,
    dataPoints: 892,
    lastUpdated: new Date(),
  },
  {
    category: 'Tech',
    platform: 'youtube',
    contentType: 'Review Video',
    rates: {
      level1: { min: 750_00, median: 2000_00, max: 4000_00 },
      level2: { min: 3000_00, median: 6000_00, max: 12000_00 },
      level3: { min: 8000_00, median: 15000_00, max: 30000_00 },
      level4: { min: 20000_00, median: 45000_00, max: 100000_00 },
      level5: { min: 75000_00, median: 150000_00, max: 750000_00 },
    },
    trend: 'rising',
    changeLastMonth: 12.3,
    dataPoints: 654,
    lastUpdated: new Date(),
  },
];

// ══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════

export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString()}`;
}

export function getMarketRate(
  category: string,
  platform: string,
  contentType: string,
  level: number
): { min: number; median: number; max: number } | null {
  const data = MOCK_MARKET_RATES.find(
    r => r.category === category && r.platform === platform && r.contentType === contentType
  );

  if (!data) return null;

  const levelKey = `level${level}` as keyof typeof data.rates;
  return data.rates[levelKey];
}

export function isRateCompetitive(
  rate: number,
  category: string,
  platform: string,
  contentType: string,
  level: number
): 'below' | 'competitive' | 'premium' {
  const marketRate = getMarketRate(category, platform, contentType, level);
  if (!marketRate) return 'competitive';

  if (rate < marketRate.min) return 'below';
  if (rate > marketRate.max) return 'premium';
  return 'competitive';
}
