/*
 * DEAL & ESCROW SYSTEM
 * ──────────────────────────────────────────────────────────────────────────
 * PATENT-RELEVANT: Credential-Gated Escrow with Platform-Aware Pricing
 *
 * This system handles the complete deal lifecycle:
 * 1. Deal Creation (Brand creates campaign)
 * 2. Creator Application (Apply via MIM)
 * 3. Brand Acceptance (Select creator)
 * 4. Escrow Deposit (Brand funds deal)
 * 5. Deliverable Submission (Creator submits work)
 * 6. Approval & Payout (Brand approves, funds release)
 * 7. Dispute Resolution (If issues arise)
 *
 * REVENUE MODEL:
 * - Platform takes 15% commission on all deals
 * - Level-based pricing multipliers (Level 5 = 10x base rate)
 * - Cross-platform deals pay 1.5x premium
 */

import { Platform } from './professions';

export type DealStatus =
  | 'draft'           // Brand creating
  | 'active'          // Open for applications
  | 'pending'         // Creator applied, awaiting brand decision
  | 'accepted'        // Brand accepted creator
  | 'funded'          // Escrow deposited
  | 'in_progress'     // Creator working on deliverables
  | 'submitted'       // Creator submitted deliverables
  | 'revision'        // Brand requested revision
  | 'approved'        // Brand approved deliverables
  | 'completed'       // Payment released
  | 'disputed'        // In dispute resolution
  | 'cancelled';      // Deal cancelled

export type DeliverableType =
  | 'post'            // Single feed post
  | 'story'           // Stories/ephemeral content
  | 'reel'            // Short-form video
  | 'video'           // Long-form video
  | 'article'         // LinkedIn article / blog
  | 'review'          // Product review
  | 'mention'         // Brand mention
  | 'custom';         // Custom deliverable

export interface Deliverable {
  id: string;
  type: DeliverableType;
  description: string;
  quantity: number;
  platform: Platform;
  dueDate: Date;
  status: 'pending' | 'submitted' | 'approved' | 'revision_needed';
  submissionUrl?: string;
  submissionNotes?: string;
  feedbackNotes?: string;
}

export interface Deal {
  id: string;
  brandId: string;
  brandName: string;
  brandLogo?: string;
  creatorId?: string;
  creatorName?: string;
  creatorLevel?: number;

  // Campaign details
  title: string;
  description: string;
  category: string;

  // Pricing
  baseBudget: number;           // In cents ($25.00 = 2500)
  levelMultiplier: number;      // 1.0 to 10.0 based on creator level
  platformPremium: number;      // 1.0 or 1.5 for cross-platform
  platformFee: number;          // 15% commission
  totalAmount: number;          // Final amount to creator
  escrowAmount: number;         // Amount held in escrow

  // Requirements
  platforms: Platform[];
  requiredLevel: number;
  deliverables: Deliverable[];

  // Timeline
  applicationDeadline: Date;
  deliveryDeadline: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;

  // Status
  status: DealStatus;
  applicantCount: number;

  // Contract
  contractId?: string;
  contractSigned?: boolean;

  // Ratings
  brandRating?: number;
  creatorRating?: number;
  brandReview?: string;
  creatorReview?: string;
}

export interface DealApplication {
  id: string;
  dealId: string;
  creatorId: string;
  creatorName: string;
  creatorLevel: number;
  creatorProfession: string;
  pitch: string;
  portfolioLinks: string[];
  proposedRate?: number;
  submittedAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface EscrowTransaction {
  id: string;
  dealId: string;
  type: 'deposit' | 'release' | 'refund' | 'partial_release';
  amount: number;
  fromAccount: string;       // brand_id or 'platform'
  toAccount: string;         // creator_id, brand_id, or 'platform'
  status: 'pending' | 'completed' | 'failed';
  stripePaymentIntentId?: string;
  stripeTransferId?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Dispute {
  id: string;
  dealId: string;
  raisedBy: 'brand' | 'creator';
  reason: string;
  description: string;
  evidence: string[];
  status: 'open' | 'investigating' | 'resolved' | 'escalated';
  resolution?: string;
  resolvedAt?: Date;
  refundAmount?: number;
}

// ═════════════════════════════════════════════════════════════════════════
// PRICING CALCULATIONS
// ═════════════════════════════════════════════════════════════════════════

export const LEVEL_MULTIPLIERS: Record<number, number> = {
  1: 1.0,
  2: 1.5,
  3: 2.5,
  4: 5.0,
  5: 10.0,
};

export const PLATFORM_FEE_PERCENT = 0.15; // 15% platform commission
export const CROSS_PLATFORM_PREMIUM = 1.5; // 50% extra for multi-platform deals

export function calculateDealPricing(
  baseBudget: number,        // In cents
  creatorLevel: number,
  isCrossPlatform: boolean
): {
  levelMultiplier: number;
  platformPremium: number;
  platformFee: number;
  creatorPayout: number;
  totalBrandCost: number;
} {
  const levelMultiplier = LEVEL_MULTIPLIERS[creatorLevel] || 1.0;
  const platformPremium = isCrossPlatform ? CROSS_PLATFORM_PREMIUM : 1.0;

  const adjustedBudget = baseBudget * levelMultiplier * platformPremium;
  const platformFee = Math.round(adjustedBudget * PLATFORM_FEE_PERCENT);
  const totalBrandCost = Math.round(adjustedBudget + platformFee);
  const creatorPayout = Math.round(adjustedBudget);

  return {
    levelMultiplier,
    platformPremium,
    platformFee,
    creatorPayout,
    totalBrandCost,
  };
}

export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ═════════════════════════════════════════════════════════════════════════
// MOCK DATA FOR DEMO
// ═════════════════════════════════════════════════════════════════════════

export const MOCK_DEALS: Deal[] = [
  {
    id: 'deal-001',
    brandId: 'brand-001',
    brandName: 'TechFlow Labs',
    title: 'AI Product Launch Campaign',
    description: 'We\'re launching a new AI-powered productivity tool and looking for tech creators to create authentic review content. Full creative freedom with talking points provided.',
    category: 'Tech Creator',
    baseBudget: 200000, // $2,000 base
    levelMultiplier: 2.5,
    platformPremium: 1.0,
    platformFee: 75000,
    totalAmount: 500000, // $5,000 total
    escrowAmount: 575000,
    platforms: ['meta', 'youtube'],
    requiredLevel: 3,
    deliverables: [
      {
        id: 'del-001',
        type: 'reel',
        description: 'Product demo Reel (60-90 seconds)',
        quantity: 2,
        platform: 'meta',
        dueDate: new Date('2024-03-15'),
        status: 'pending',
      },
      {
        id: 'del-002',
        type: 'video',
        description: 'Full review video (5-10 minutes)',
        quantity: 1,
        platform: 'youtube',
        dueDate: new Date('2024-03-20'),
        status: 'pending',
      },
    ],
    applicationDeadline: new Date('2024-02-28'),
    deliveryDeadline: new Date('2024-03-25'),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    status: 'active',
    applicantCount: 12,
  },
  {
    id: 'deal-002',
    brandId: 'brand-002',
    brandName: 'FitLife Pro',
    title: 'Fitness App Ambassador',
    description: '3-month ambassador program for fitness creators. Weekly content requirements with performance bonuses.',
    category: 'Fitness Creator',
    baseBudget: 300000, // $3,000 base/month
    levelMultiplier: 1.5,
    platformPremium: 1.5, // Cross-platform
    platformFee: 101250,
    totalAmount: 675000, // $6,750/month
    escrowAmount: 776250,
    platforms: ['meta', 'youtube', 'across'],
    requiredLevel: 2,
    deliverables: [
      {
        id: 'del-003',
        type: 'post',
        description: 'Weekly workout post featuring app',
        quantity: 4,
        platform: 'meta',
        dueDate: new Date('2024-03-01'),
        status: 'pending',
      },
      {
        id: 'del-004',
        type: 'story',
        description: 'Daily story check-ins',
        quantity: 20,
        platform: 'meta',
        dueDate: new Date('2024-03-01'),
        status: 'pending',
      },
    ],
    applicationDeadline: new Date('2024-02-20'),
    deliveryDeadline: new Date('2024-05-01'),
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05'),
    status: 'active',
    applicantCount: 28,
  },
  {
    id: 'deal-003',
    brandId: 'brand-003',
    brandName: 'LegalTech Solutions',
    title: 'B2B LinkedIn Thought Leadership',
    description: 'Looking for law creators to produce educational content about legal tech trends.',
    category: 'Law Creator',
    baseBudget: 400000, // $4,000 base
    levelMultiplier: 5.0,
    platformPremium: 1.0,
    platformFee: 300000,
    totalAmount: 2000000, // $20,000 for Level 4
    escrowAmount: 2300000,
    platforms: ['linkedin'],
    requiredLevel: 4,
    deliverables: [
      {
        id: 'del-005',
        type: 'article',
        description: 'Weekly LinkedIn article',
        quantity: 4,
        platform: 'linkedin',
        dueDate: new Date('2024-03-30'),
        status: 'pending',
      },
    ],
    applicationDeadline: new Date('2024-02-25'),
    deliveryDeadline: new Date('2024-04-01'),
    createdAt: new Date('2024-02-08'),
    updatedAt: new Date('2024-02-08'),
    status: 'active',
    applicantCount: 5,
  },
];

// Creator's active deals
export const MOCK_CREATOR_DEALS: Deal[] = [
  {
    id: 'deal-active-001',
    brandId: 'brand-004',
    brandName: 'GameZone Studios',
    creatorId: 'creator-001',
    creatorName: 'Alex Gaming',
    creatorLevel: 4,
    title: 'Game Launch Partnership',
    description: 'Full game review and streaming series for new RPG launch.',
    category: 'Gaming Creator',
    baseBudget: 500000,
    levelMultiplier: 5.0,
    platformPremium: 1.0,
    platformFee: 375000,
    totalAmount: 2500000,
    escrowAmount: 2875000,
    platforms: ['youtube'],
    requiredLevel: 4,
    deliverables: [
      {
        id: 'del-active-001',
        type: 'video',
        description: 'First impressions video',
        quantity: 1,
        platform: 'youtube',
        dueDate: new Date('2024-02-15'),
        status: 'approved',
        submissionUrl: 'https://youtube.com/watch?v=example',
      },
      {
        id: 'del-active-002',
        type: 'video',
        description: 'Full review video',
        quantity: 1,
        platform: 'youtube',
        dueDate: new Date('2024-02-25'),
        status: 'submitted',
        submissionUrl: 'https://youtube.com/watch?v=example2',
      },
    ],
    applicationDeadline: new Date('2024-01-15'),
    deliveryDeadline: new Date('2024-03-01'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-20'),
    status: 'in_progress',
    applicantCount: 0,
    contractSigned: true,
  },
];

// ═════════════════════════════════════════════════════════════════════════
// STATUS HELPERS
// ═════════════════════════════════════════════════════════════════════════

export function getDealStatusInfo(status: DealStatus): {
  label: string;
  color: string;
  bgColor: string;
  description: string;
} {
  const statusMap: Record<DealStatus, { label: string; color: string; bgColor: string; description: string }> = {
    draft: { label: 'Draft', color: '#737373', bgColor: '#26262620', description: 'Campaign is being created' },
    active: { label: 'Open', color: '#10b981', bgColor: '#10b98120', description: 'Accepting applications' },
    pending: { label: 'Applied', color: '#f59e0b', bgColor: '#f59e0b20', description: 'Awaiting brand decision' },
    accepted: { label: 'Accepted', color: '#0095f6', bgColor: '#0095f620', description: 'You\'ve been selected!' },
    funded: { label: 'Funded', color: '#8b5cf6', bgColor: '#8b5cf620', description: 'Payment in escrow' },
    in_progress: { label: 'In Progress', color: '#0095f6', bgColor: '#0095f620', description: 'Working on deliverables' },
    submitted: { label: 'Submitted', color: '#f59e0b', bgColor: '#f59e0b20', description: 'Awaiting brand approval' },
    revision: { label: 'Revision', color: '#ef4444', bgColor: '#ef444420', description: 'Changes requested' },
    approved: { label: 'Approved', color: '#10b981', bgColor: '#10b98120', description: 'Deliverables approved' },
    completed: { label: 'Completed', color: '#10b981', bgColor: '#10b98120', description: 'Payment released' },
    disputed: { label: 'Disputed', color: '#ef4444', bgColor: '#ef444420', description: 'In dispute resolution' },
    cancelled: { label: 'Cancelled', color: '#737373', bgColor: '#26262620', description: 'Deal was cancelled' },
  };

  return statusMap[status];
}
