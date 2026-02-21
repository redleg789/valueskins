/*
 * CREATOR INSURANCE & PROTECTION FUND
 * ══════════════════════════════════════════════════════════════════════════
 * PATENT-CRITICAL: Financial Safety Net for Content Creators
 *
 * THE PROBLEM:
 * - Brands ghost creators after work is done
 * - Platforms can demonetize overnight (no warning, no appeal)
 * - One viral controversy = career over
 * - No health insurance, no 401k, no safety net
 *
 * THE SOLUTION:
 * Valueskins Insurance - The first creator protection fund
 *
 * WHAT WE COVER:
 * 1. NON-PAYMENT PROTECTION - Brand doesn't pay? We cover it.
 * 2. INCOME INSURANCE - Sudden drop in earnings? We help bridge the gap.
 * 3. REPUTATION PROTECTION - False claims? We fund legal defense.
 * 4. PLATFORM BAN RECOVERY - Unjust ban? We help you fight back.
 * 5. EMERGENCY FUND - Life happens. We're here.
 *
 * HOW IT'S FUNDED:
 * - 2% of every deal goes to the protection pool
 * - Pool is managed transparently on-chain
 * - Creators vote on claims
 */

// ══════════════════════════════════════════════════════════════════════════
// INSURANCE POLICY
// ══════════════════════════════════════════════════════════════════════════

export interface CreatorInsurance {
  creatorId: string;
  policyId: string;

  // Policy Status
  status: 'active' | 'suspended' | 'lapsed' | 'cancelled';
  tier: InsuranceTier;
  startDate: Date;
  renewalDate: Date;

  // Coverage Limits
  coverage: {
    nonPaymentMax: number;          // Max claim for brand non-payment
    incomeProtectionMonthly: number; // Monthly income protection max
    legalDefenseMax: number;         // Max for legal defense
    emergencyFundMax: number;        // Max emergency withdrawal
  };

  // Contributions
  contributions: {
    totalContributed: number;
    lastContribution: number;
    lastContributionDate: Date;
  };

  // Claims History
  claims: InsuranceClaim[];
  totalClaimsPaid: number;

  // Eligibility
  eligibility: {
    monthsActive: number;
    dealsCompleted: number;
    claimsLast12Months: number;
    riskScore: number; // Lower is better
  };
}

export type InsuranceTier = 'Basic' | 'Standard' | 'Premium' | 'Elite';

export interface InsuranceClaim {
  id: string;
  creatorId: string;
  policyId: string;

  // Claim Details
  type: ClaimType;
  amount: number;
  description: string;
  evidence: ClaimEvidence[];

  // Processing
  status: 'submitted' | 'under_review' | 'approved' | 'denied' | 'paid';
  submittedAt: Date;
  reviewedAt?: Date;
  resolvedAt?: Date;

  // Review
  reviewNotes?: string;
  reviewerId?: string;
  communityVotes?: { for: number; against: number };

  // Payment
  amountApproved?: number;
  paymentDate?: Date;
  transactionHash?: string;
}

export type ClaimType =
  | 'non_payment'
  | 'partial_payment'
  | 'income_drop'
  | 'legal_defense'
  | 'platform_ban'
  | 'reputation_damage'
  | 'emergency';

export interface ClaimEvidence {
  type: 'contract' | 'invoice' | 'communication' | 'screenshot' | 'legal_document' | 'bank_statement';
  url: string;
  description: string;
  uploadedAt: Date;
  verified: boolean;
}

// ══════════════════════════════════════════════════════════════════════════
// PROTECTION POOL
// ══════════════════════════════════════════════════════════════════════════

export interface ProtectionPool {
  // Pool Balance
  totalBalance: number;
  availableBalance: number;
  reservedForClaims: number;

  // Funding
  contributionRate: number; // 2% of deals
  totalContributions: number;
  totalClaimsPaid: number;

  // Pool Health
  healthScore: number; // 0-100
  runwayMonths: number; // How many months of claims we can cover
  reinsurancePartner?: string;

  // Stats
  totalPolicies: number;
  activeClaims: number;
  avgClaimAmount: number;
  claimApprovalRate: number;

  // Governance
  lastAudit: Date;
  auditReport?: string;
  onChainAddress: string;

  updatedAt: Date;
}

// ══════════════════════════════════════════════════════════════════════════
// COVERAGE TIERS
// ══════════════════════════════════════════════════════════════════════════

export const INSURANCE_TIERS: Record<InsuranceTier, {
  monthlyPremium: number;
  nonPaymentMax: number;
  incomeProtectionMonthly: number;
  legalDefenseMax: number;
  emergencyFundMax: number;
  minDealsRequired: number;
  minMonthsActive: number;
}> = {
  Basic: {
    monthlyPremium: 0, // Free tier - funded by deal %
    nonPaymentMax: 2500_00,
    incomeProtectionMonthly: 500_00,
    legalDefenseMax: 1000_00,
    emergencyFundMax: 500_00,
    minDealsRequired: 1,
    minMonthsActive: 1,
  },
  Standard: {
    monthlyPremium: 25_00, // $25/month
    nonPaymentMax: 10000_00,
    incomeProtectionMonthly: 2000_00,
    legalDefenseMax: 5000_00,
    emergencyFundMax: 2500_00,
    minDealsRequired: 5,
    minMonthsActive: 3,
  },
  Premium: {
    monthlyPremium: 75_00, // $75/month
    nonPaymentMax: 50000_00,
    incomeProtectionMonthly: 5000_00,
    legalDefenseMax: 25000_00,
    emergencyFundMax: 10000_00,
    minDealsRequired: 15,
    minMonthsActive: 6,
  },
  Elite: {
    monthlyPremium: 200_00, // $200/month
    nonPaymentMax: 250000_00,
    incomeProtectionMonthly: 15000_00,
    legalDefenseMax: 100000_00,
    emergencyFundMax: 50000_00,
    minDealsRequired: 50,
    minMonthsActive: 12,
  },
};

// ══════════════════════════════════════════════════════════════════════════
// CLAIM PROCESSING
// ══════════════════════════════════════════════════════════════════════════

export function calculateClaimEligibility(
  policy: CreatorInsurance,
  claimType: ClaimType,
  amount: number
): { eligible: boolean; maxAmount: number; reason?: string } {
  // Check policy status
  if (policy.status !== 'active') {
    return { eligible: false, maxAmount: 0, reason: 'Policy is not active' };
  }

  // Check coverage limits
  const tierLimits = INSURANCE_TIERS[policy.tier];
  let maxCoverage = 0;

  switch (claimType) {
    case 'non_payment':
    case 'partial_payment':
      maxCoverage = policy.coverage.nonPaymentMax;
      break;
    case 'income_drop':
      maxCoverage = policy.coverage.incomeProtectionMonthly;
      break;
    case 'legal_defense':
    case 'reputation_damage':
    case 'platform_ban':
      maxCoverage = policy.coverage.legalDefenseMax;
      break;
    case 'emergency':
      maxCoverage = policy.coverage.emergencyFundMax;
      break;
  }

  // Check claim history (max 3 claims per year)
  if (policy.eligibility.claimsLast12Months >= 3) {
    return {
      eligible: false,
      maxAmount: 0,
      reason: 'Maximum claims per year reached (3)',
    };
  }

  // Check if amount exceeds coverage
  if (amount > maxCoverage) {
    return {
      eligible: true,
      maxAmount: maxCoverage,
      reason: `Amount exceeds coverage limit. Max covered: $${(maxCoverage / 100).toLocaleString()}`,
    };
  }

  return { eligible: true, maxAmount: amount };
}

export function calculateRiskScore(policy: CreatorInsurance): number {
  let score = 50; // Start neutral

  // Lower score (better) for:
  // - More months active
  score -= Math.min(20, policy.eligibility.monthsActive * 2);
  // - More deals completed
  score -= Math.min(15, policy.eligibility.dealsCompleted * 0.5);
  // - Good claim history
  score += policy.eligibility.claimsLast12Months * 10;

  // Normalize to 0-100
  return Math.max(0, Math.min(100, score));
}

export function estimatePremium(
  avgMonthlyEarnings: number,
  riskScore: number,
  tier: InsuranceTier
): number {
  const basePremium = INSURANCE_TIERS[tier].monthlyPremium;

  // Adjust based on risk score
  const riskMultiplier = 1 + (riskScore - 50) / 100; // ±50% based on risk

  // Also consider earnings (higher earners = higher coverage need)
  const earningsMultiplier = avgMonthlyEarnings > 10000_00 ? 1.5 : 1.0;

  return Math.round(basePremium * riskMultiplier * earningsMultiplier);
}

// ══════════════════════════════════════════════════════════════════════════
// INCOME PROTECTION
// ══════════════════════════════════════════════════════════════════════════

export interface IncomeProtectionClaim {
  creatorId: string;

  // Earnings data
  avgMonthlyEarnings12Month: number;
  currentMonthEarnings: number;
  earningsDrop: number; // Percentage

  // Protection calculation
  eligibleAmount: number;
  protectionPeriod: number; // Months

  // Verification
  verificationStatus: 'pending' | 'verified' | 'disputed';
  bankStatements: string[];
  platformEarningsReports: string[];
}

export function calculateIncomeProtection(
  avgEarnings: number,
  currentEarnings: number,
  tier: InsuranceTier
): { eligible: boolean; amount: number; reason?: string } {
  const dropPercentage = ((avgEarnings - currentEarnings) / avgEarnings) * 100;

  // Must be at least 40% drop
  if (dropPercentage < 40) {
    return {
      eligible: false,
      amount: 0,
      reason: `Earnings drop (${dropPercentage.toFixed(1)}%) below 40% threshold`,
    };
  }

  const maxMonthly = INSURANCE_TIERS[tier].incomeProtectionMonthly;
  const protectionAmount = Math.min(
    (avgEarnings - currentEarnings) * 0.5, // Cover 50% of the gap
    maxMonthly
  );

  return {
    eligible: true,
    amount: protectionAmount,
    reason: `Eligible for 50% gap coverage up to $${(maxMonthly / 100).toLocaleString()}/month`,
  };
}

// ══════════════════════════════════════════════════════════════════════════
// NON-PAYMENT CLAIMS
// ══════════════════════════════════════════════════════════════════════════

export interface NonPaymentClaim {
  dealId: string;
  brandId: string;
  brandName: string;

  // Deal Details
  contractAmount: number;
  amountPaid: number;
  amountOwed: number;

  // Evidence
  signedContract: string;
  invoices: string[];
  communications: string[];
  deliverableProof: string[];

  // Timeline
  paymentDueDate: Date;
  daysPastDue: number;
  collectionAttempts: CollectionAttempt[];

  // Resolution
  status: 'pending' | 'collecting' | 'paid' | 'claimed';
}

export interface CollectionAttempt {
  date: Date;
  method: 'email' | 'phone' | 'legal_notice' | 'mediation';
  outcome: 'no_response' | 'disputed' | 'promise_to_pay' | 'refused';
  notes: string;
}

export function isEligibleForNonPaymentClaim(claim: NonPaymentClaim): boolean {
  // Must be at least 30 days past due
  if (claim.daysPastDue < 30) return false;

  // Must have made at least 2 collection attempts
  if (claim.collectionAttempts.length < 2) return false;

  // Must have signed contract and delivered work
  if (!claim.signedContract || claim.deliverableProof.length === 0) return false;

  return true;
}

// ══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ══════════════════════════════════════════════════════════════════════════

export const MOCK_PROTECTION_POOL: ProtectionPool = {
  totalBalance: 2_850_000_00, // $2.85M
  availableBalance: 2_450_000_00,
  reservedForClaims: 400_000_00,

  contributionRate: 2, // 2%
  totalContributions: 4_200_000_00,
  totalClaimsPaid: 1_350_000_00,

  healthScore: 92,
  runwayMonths: 18,

  totalPolicies: 12_500,
  activeClaims: 47,
  avgClaimAmount: 3_500_00,
  claimApprovalRate: 87,

  lastAudit: new Date('2024-01-15'),
  onChainAddress: '0xpool_protection_001...',

  updatedAt: new Date(),
};

export const MOCK_INSURANCE: CreatorInsurance = {
  creatorId: 'creator-001',
  policyId: 'policy-001',

  status: 'active',
  tier: 'Premium',
  startDate: new Date('2023-03-15'),
  renewalDate: new Date('2024-03-15'),

  coverage: {
    nonPaymentMax: 50000_00,
    incomeProtectionMonthly: 5000_00,
    legalDefenseMax: 25000_00,
    emergencyFundMax: 10000_00,
  },

  contributions: {
    totalContributed: 4275_00,
    lastContribution: 225_00,
    lastContributionDate: new Date('2024-01-20'),
  },

  claims: [
    {
      id: 'claim-001',
      creatorId: 'creator-001',
      policyId: 'policy-001',
      type: 'non_payment',
      amount: 5000_00,
      description: 'Brand ghosted after receiving deliverables. No response to 5 follow-ups.',
      evidence: [
        {
          type: 'contract',
          url: '/evidence/contract-001.pdf',
          description: 'Signed sponsorship agreement',
          uploadedAt: new Date('2023-08-10'),
          verified: true,
        },
        {
          type: 'communication',
          url: '/evidence/emails-001.pdf',
          description: 'Email chain showing 5 follow-up attempts',
          uploadedAt: new Date('2023-08-10'),
          verified: true,
        },
      ],
      status: 'paid',
      submittedAt: new Date('2023-08-10'),
      reviewedAt: new Date('2023-08-15'),
      resolvedAt: new Date('2023-08-18'),
      amountApproved: 5000_00,
      paymentDate: new Date('2023-08-18'),
      transactionHash: '0xtx_claim_001...',
    },
  ],
  totalClaimsPaid: 5000_00,

  eligibility: {
    monthsActive: 10,
    dealsCompleted: 47,
    claimsLast12Months: 1,
    riskScore: 25,
  },
};

// ══════════════════════════════════════════════════════════════════════════
// EMERGENCY FUND ACCESS
// ══════════════════════════════════════════════════════════════════════════

export interface EmergencyRequest {
  creatorId: string;
  policyId: string;

  // Request Details
  reason: 'medical' | 'family' | 'housing' | 'equipment' | 'other';
  description: string;
  amountRequested: number;

  // Urgency
  urgency: 'critical' | 'high' | 'medium';
  neededBy: Date;

  // Verification
  supportingDocs: string[];
  status: 'submitted' | 'verified' | 'approved' | 'denied' | 'disbursed';
}

export function calculateEmergencyLimit(policy: CreatorInsurance): number {
  const baseLimit = policy.coverage.emergencyFundMax;

  // Reduce if already claimed emergency this year
  const emergencyClaims = policy.claims.filter(c => c.type === 'emergency').length;
  const reduction = Math.min(0.5, emergencyClaims * 0.25); // Max 50% reduction

  return Math.round(baseLimit * (1 - reduction));
}

// ══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════

export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString()}`;
}

export function getPoolHealthStatus(score: number): {
  status: 'excellent' | 'good' | 'fair' | 'poor';
  color: string;
} {
  if (score >= 90) return { status: 'excellent', color: '#10b981' };
  if (score >= 70) return { status: 'good', color: '#3b82f6' };
  if (score >= 50) return { status: 'fair', color: '#f59e0b' };
  return { status: 'poor', color: '#ef4444' };
}

export function getClaimStatusColor(status: InsuranceClaim['status']): string {
  const colors: Record<InsuranceClaim['status'], string> = {
    submitted: '#6b7280',
    under_review: '#f59e0b',
    approved: '#10b981',
    denied: '#ef4444',
    paid: '#8b5cf6',
  };
  return colors[status];
}
