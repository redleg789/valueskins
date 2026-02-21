/*
 * CREATOR REVENUE SHARE & EQUITY SYSTEM
 * ══════════════════════════════════════════════════════════════════════════
 * PATENT-CRITICAL: Creators Become Shareholders, Not Just Users
 *
 * THE BILLION-DOLLAR MOAT:
 * Every creator who uses Valueskins earns equity in the platform.
 * The more they contribute, the more they own.
 *
 * WHY THIS CHANGES EVERYTHING:
 * 1. Creators have SKIN IN THE GAME - they want the platform to succeed
 * 2. Network effects compound - more creators = more value = more creators
 * 3. No other platform shares ownership with creators
 * 4. When Valueskins exits, creators get a piece of the pie
 *
 * HOW IT WORKS:
 * - 10% of all revenue goes into Creator Equity Pool
 * - Pool converts to equity tokens (blockchain-native)
 * - Tokens vest over time (encourages loyalty)
 * - At exit, token holders get proportional payout
 */

export interface CreatorEquityAccount {
  creatorId: string;
  creatorDid: string;

  // ══════════════════════════════════════════════════════════════════════
  // EQUITY TOKENS
  // ══════════════════════════════════════════════════════════════════════
  tokens: {
    total: number;           // Total tokens earned
    vested: number;          // Tokens that are fully owned
    unvested: number;        // Tokens still vesting
    vestingSchedule: VestingEvent[];
  };

  // ══════════════════════════════════════════════════════════════════════
  // CONTRIBUTION TRACKING
  // ══════════════════════════════════════════════════════════════════════
  contributions: {
    dealsCompleted: number;
    platformFeesGenerated: number;  // In cents
    referralsConverted: number;
    contentCreated: number;
    communityContributions: number;
  };

  // ══════════════════════════════════════════════════════════════════════
  // TIER & MULTIPLIERS
  // ══════════════════════════════════════════════════════════════════════
  tier: EquityTier;
  multiplier: number;        // Earning rate multiplier

  // ══════════════════════════════════════════════════════════════════════
  // DIVIDENDS (Revenue share before exit)
  // ══════════════════════════════════════════════════════════════════════
  dividends: {
    totalEarned: number;     // Lifetime dividends
    lastPayout: number;
    lastPayoutDate: Date;
    nextEstimatedPayout: number;
    payoutHistory: DividendPayout[];
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface VestingEvent {
  id: string;
  tokens: number;
  vestDate: Date;
  source: 'deal_completion' | 'referral' | 'loyalty_bonus' | 'community' | 'early_adopter';
  status: 'pending' | 'vested' | 'forfeited';
}

export type EquityTier = 'Seed' | 'Growth' | 'Scale' | 'Partner' | 'Founder';

export interface DividendPayout {
  id: string;
  amount: number;
  tokensHeld: number;
  payoutDate: Date;
  transactionHash?: string;
}

// ══════════════════════════════════════════════════════════════════════════
// EQUITY POOL - Platform-wide tracking
// ══════════════════════════════════════════════════════════════════════════

export interface EquityPool {
  // Total tokens in existence
  totalTokensIssued: number;
  totalTokensVested: number;

  // Pool value
  poolValueUsd: number;
  pricePerToken: number;

  // Revenue allocation
  revenueSharePercentage: number; // 10%
  totalRevenueAllocated: number;

  // Distribution stats
  totalCreatorsHolding: number;
  averageTokensPerCreator: number;
  topHolderTokens: number;

  // Quarterly dividends
  lastDividendDate: Date;
  nextDividendDate: Date;
  dividendPool: number;

  updatedAt: Date;
}

// ══════════════════════════════════════════════════════════════════════════
// TOKEN EARNING RATES
// ══════════════════════════════════════════════════════════════════════════

export const TOKEN_EARNING_RATES = {
  // Per deal completed (based on deal value)
  deal_completion: {
    under_1k: 10,
    '1k_5k': 25,
    '5k_10k': 50,
    '10k_50k': 100,
    over_50k: 250,
  },

  // Per successful referral
  referral: 50,

  // Monthly loyalty bonus (if active)
  monthly_loyalty: 10,

  // Community contributions
  community: {
    helpful_post: 2,
    verified_review: 5,
    mentoring_session: 25,
  },

  // Early adopter bonuses
  early_adopter: {
    first_1000: 500,
    first_10000: 250,
    first_100000: 100,
  },
};

export const TIER_MULTIPLIERS: Record<EquityTier, number> = {
  Seed: 1.0,
  Growth: 1.25,
  Scale: 1.5,
  Partner: 2.0,
  Founder: 3.0,
};

export const TIER_THRESHOLDS: Record<EquityTier, number> = {
  Seed: 0,
  Growth: 100,
  Scale: 500,
  Partner: 2500,
  Founder: 10000,
};

// ══════════════════════════════════════════════════════════════════════════
// VESTING RULES
// ══════════════════════════════════════════════════════════════════════════

export const VESTING_SCHEDULE = {
  cliff_months: 3,        // No tokens vest for first 3 months
  vesting_period_months: 12, // Tokens vest over 12 months after cliff
  early_departure_forfeit: 0.5, // Lose 50% of unvested if you leave early
};

// ══════════════════════════════════════════════════════════════════════════
// EQUITY CALCULATIONS
// ══════════════════════════════════════════════════════════════════════════

export function calculateTokensForDeal(dealValueCents: number, tier: EquityTier): number {
  const baseTokens = getBaseTokensForDealValue(dealValueCents);
  const multiplier = TIER_MULTIPLIERS[tier];
  return Math.round(baseTokens * multiplier);
}

function getBaseTokensForDealValue(cents: number): number {
  const dollars = cents / 100;
  if (dollars < 1000) return TOKEN_EARNING_RATES.deal_completion.under_1k;
  if (dollars < 5000) return TOKEN_EARNING_RATES.deal_completion['1k_5k'];
  if (dollars < 10000) return TOKEN_EARNING_RATES.deal_completion['5k_10k'];
  if (dollars < 50000) return TOKEN_EARNING_RATES.deal_completion['10k_50k'];
  return TOKEN_EARNING_RATES.deal_completion.over_50k;
}

export function calculateTier(totalTokens: number): EquityTier {
  if (totalTokens >= TIER_THRESHOLDS.Founder) return 'Founder';
  if (totalTokens >= TIER_THRESHOLDS.Partner) return 'Partner';
  if (totalTokens >= TIER_THRESHOLDS.Scale) return 'Scale';
  if (totalTokens >= TIER_THRESHOLDS.Growth) return 'Growth';
  return 'Seed';
}

export function calculateVestedTokens(
  vestingEvents: VestingEvent[],
  currentDate: Date = new Date()
): { vested: number; unvested: number } {
  let vested = 0;
  let unvested = 0;

  for (const event of vestingEvents) {
    if (event.status === 'forfeited') continue;

    if (event.vestDate <= currentDate) {
      vested += event.tokens;
    } else {
      unvested += event.tokens;
    }
  }

  return { vested, unvested };
}

export function calculateDividendShare(
  creatorTokens: number,
  totalTokensVested: number,
  dividendPool: number
): number {
  if (totalTokensVested === 0) return 0;
  const share = creatorTokens / totalTokensVested;
  return Math.round(dividendPool * share);
}

export function calculateExitPayout(
  creatorTokens: number,
  totalTokensVested: number,
  exitValueUsd: number
): number {
  if (totalTokensVested === 0) return 0;
  const share = creatorTokens / totalTokensVested;
  return Math.round(exitValueUsd * share * 100) / 100; // Round to cents
}

// ══════════════════════════════════════════════════════════════════════════
// EQUITY EVENTS
// ══════════════════════════════════════════════════════════════════════════

export function createVestingEvent(
  tokens: number,
  source: VestingEvent['source']
): VestingEvent {
  const vestDate = new Date();
  vestDate.setMonth(vestDate.getMonth() + VESTING_SCHEDULE.cliff_months);

  return {
    id: `vest-${Date.now()}`,
    tokens,
    vestDate,
    source,
    status: 'pending',
  };
}

export function processMonthlyVesting(
  account: CreatorEquityAccount,
  currentDate: Date = new Date()
): CreatorEquityAccount {
  const updatedEvents = account.tokens.vestingSchedule.map(event => {
    if (event.status === 'pending' && event.vestDate <= currentDate) {
      return { ...event, status: 'vested' as const };
    }
    return event;
  });

  const { vested, unvested } = calculateVestedTokens(updatedEvents, currentDate);

  return {
    ...account,
    tokens: {
      ...account.tokens,
      vested,
      unvested,
      vestingSchedule: updatedEvents,
    },
    tier: calculateTier(vested),
    multiplier: TIER_MULTIPLIERS[calculateTier(vested)],
    updatedAt: currentDate,
  };
}

// ══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ══════════════════════════════════════════════════════════════════════════

export const MOCK_EQUITY_POOL: EquityPool = {
  totalTokensIssued: 2500000,
  totalTokensVested: 1800000,

  poolValueUsd: 5000000, // $5M pool
  pricePerToken: 2.78,

  revenueSharePercentage: 10,
  totalRevenueAllocated: 5000000,

  totalCreatorsHolding: 12500,
  averageTokensPerCreator: 200,
  topHolderTokens: 15000,

  lastDividendDate: new Date('2024-01-01'),
  nextDividendDate: new Date('2024-04-01'),
  dividendPool: 125000, // $125K to distribute

  updatedAt: new Date(),
};

export const MOCK_CREATOR_EQUITY: CreatorEquityAccount = {
  creatorId: 'creator-001',
  creatorDid: 'did:valueskins:creator-001',

  tokens: {
    total: 2450,
    vested: 1850,
    unvested: 600,
    vestingSchedule: [
      {
        id: 'vest-001',
        tokens: 500,
        vestDate: new Date('2023-06-01'),
        source: 'early_adopter',
        status: 'vested',
      },
      {
        id: 'vest-002',
        tokens: 250,
        vestDate: new Date('2023-09-01'),
        source: 'deal_completion',
        status: 'vested',
      },
      {
        id: 'vest-003',
        tokens: 1100,
        vestDate: new Date('2023-12-01'),
        source: 'deal_completion',
        status: 'vested',
      },
      {
        id: 'vest-004',
        tokens: 600,
        vestDate: new Date('2024-06-01'),
        source: 'deal_completion',
        status: 'pending',
      },
    ],
  },

  contributions: {
    dealsCompleted: 47,
    platformFeesGenerated: 2137500, // $21,375 in fees
    referralsConverted: 8,
    contentCreated: 156,
    communityContributions: 23,
  },

  tier: 'Partner',
  multiplier: 2.0,

  dividends: {
    totalEarned: 12850,
    lastPayout: 3200,
    lastPayoutDate: new Date('2024-01-15'),
    nextEstimatedPayout: 3500,
    payoutHistory: [
      {
        id: 'div-001',
        amount: 2450,
        tokensHeld: 1200,
        payoutDate: new Date('2023-07-01'),
        transactionHash: '0xtx_div_001...',
      },
      {
        id: 'div-002',
        amount: 3800,
        tokensHeld: 1500,
        payoutDate: new Date('2023-10-01'),
        transactionHash: '0xtx_div_002...',
      },
      {
        id: 'div-003',
        amount: 3400,
        tokensHeld: 1650,
        payoutDate: new Date('2024-01-01'),
        transactionHash: '0xtx_div_003...',
      },
    ],
  },

  createdAt: new Date('2023-03-15'),
  updatedAt: new Date(),
};

// ══════════════════════════════════════════════════════════════════════════
// EXIT SCENARIOS
// ══════════════════════════════════════════════════════════════════════════

export interface ExitScenario {
  name: string;
  exitValueUsd: number;
  creatorPoolPercentage: number; // What % of exit goes to creators
  yourEstimatedPayout: number;
}

export function calculateExitScenarios(
  creatorTokens: number,
  totalTokensVested: number
): ExitScenario[] {
  const creatorPoolPercentage = 10; // 10% of exit to creators

  return [
    {
      name: 'Modest Exit ($50M)',
      exitValueUsd: 50000000,
      creatorPoolPercentage,
      yourEstimatedPayout: calculateExitPayout(
        creatorTokens,
        totalTokensVested,
        50000000 * 0.10
      ),
    },
    {
      name: 'Good Exit ($250M)',
      exitValueUsd: 250000000,
      creatorPoolPercentage,
      yourEstimatedPayout: calculateExitPayout(
        creatorTokens,
        totalTokensVested,
        250000000 * 0.10
      ),
    },
    {
      name: 'Great Exit ($1B)',
      exitValueUsd: 1000000000,
      creatorPoolPercentage,
      yourEstimatedPayout: calculateExitPayout(
        creatorTokens,
        totalTokensVested,
        1000000000 * 0.10
      ),
    },
    {
      name: 'Unicorn Exit ($5B)',
      exitValueUsd: 5000000000,
      creatorPoolPercentage,
      yourEstimatedPayout: calculateExitPayout(
        creatorTokens,
        totalTokensVested,
        5000000000 * 0.10
      ),
    },
  ];
}

// ══════════════════════════════════════════════════════════════════════════
// EQUITY DASHBOARD DATA
// ══════════════════════════════════════════════════════════════════════════

export interface EquityDashboardData {
  account: CreatorEquityAccount;
  pool: EquityPool;
  exitScenarios: ExitScenario[];
  ownershipPercentage: number;
  nextVestingEvent: VestingEvent | null;
  projectedAnnualDividends: number;
}

export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString()}`;
}

export function getEquityDashboardData(
  account: CreatorEquityAccount,
  pool: EquityPool
): EquityDashboardData {
  const ownershipPercentage = (account.tokens.vested / pool.totalTokensVested) * 100;

  const nextVestingEvent = account.tokens.vestingSchedule
    .filter(e => e.status === 'pending')
    .sort((a, b) => a.vestDate.getTime() - b.vestDate.getTime())[0] || null;

  // Project based on last 4 quarters
  const projectedAnnualDividends = account.dividends.lastPayout * 4;

  return {
    account,
    pool,
    exitScenarios: calculateExitScenarios(account.tokens.vested, pool.totalTokensVested),
    ownershipPercentage,
    nextVestingEvent,
    projectedAnnualDividends,
  };
}
