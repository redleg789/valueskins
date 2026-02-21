/*
 * CONTRACT MANAGEMENT SYSTEM
 * ──────────────────────────────────────────────────────────────────────────
 * PATENT-RELEVANT: AI-Generated Template Contracts with Rights Management
 *
 * Features:
 * 1. Pre-built contract templates for common deal types
 * 2. Auto-fill with deal terms (price, dates, deliverables)
 * 3. Digital signature integration (mock for MVP)
 * 4. Rights management (who owns content after campaign)
 * 5. Archive of all executed contracts
 */

import { Deal, Deliverable } from './deals';
import { Platform } from './professions';

export type ContractType =
  | 'sponsorship'      // Standard sponsorship deal
  | 'ambassador'       // Long-term ambassador program
  | 'product_review'   // Product review/unboxing
  | 'affiliate'        // Affiliate/commission-based
  | 'licensing'        // Content licensing
  | 'custom';          // Custom terms

export type ContentRights =
  | 'creator_owned'              // Creator retains all rights
  | 'shared_usage'               // Brand can use for 1 year
  | 'brand_perpetual'            // Brand owns perpetual usage
  | 'full_transfer';             // Full rights transfer to brand

export interface ContractTemplate {
  id: string;
  name: string;
  type: ContractType;
  description: string;
  sections: ContractSection[];
  defaultRights: ContentRights;
  minLevel: number;
  platforms: Platform[];
}

export interface ContractSection {
  id: string;
  title: string;
  content: string; // Markdown with {{variables}}
  required: boolean;
  order: number;
}

export interface Contract {
  id: string;
  dealId: string;
  templateId: string;
  type: ContractType;

  // Parties
  brandId: string;
  brandName: string;
  brandSignatory: string;
  brandEmail: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;

  // Terms
  totalAmount: number;
  paymentSchedule: PaymentMilestone[];
  deliverables: Deliverable[];
  contentRights: ContentRights;
  exclusivityPeriod?: number; // Days
  exclusivityScope?: string;

  // Dates
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  signedAt?: Date;

  // Signatures
  brandSigned: boolean;
  brandSignedAt?: Date;
  brandSignatureHash?: string;
  creatorSigned: boolean;
  creatorSignedAt?: Date;
  creatorSignatureHash?: string;

  // Status
  status: 'draft' | 'pending_brand' | 'pending_creator' | 'active' | 'completed' | 'terminated';

  // Document
  documentUrl?: string;
  pdfUrl?: string;
}

export interface PaymentMilestone {
  id: string;
  description: string;
  amount: number; // In cents
  dueDate: Date;
  status: 'pending' | 'due' | 'paid';
  paidAt?: Date;
}

// ═════════════════════════════════════════════════════════════════════════
// CONTRACT TEMPLATES
// ═════════════════════════════════════════════════════════════════════════

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'template-sponsorship',
    name: 'Standard Sponsorship Agreement',
    type: 'sponsorship',
    description: 'Basic sponsorship deal for single campaign or content series',
    defaultRights: 'shared_usage',
    minLevel: 1,
    platforms: ['meta', 'linkedin', 'youtube', 'across'],
    sections: [
      {
        id: 'intro',
        title: 'Introduction',
        content: `This Sponsorship Agreement ("Agreement") is entered into as of **{{startDate}}** between:

**Brand:** {{brandName}} ("Brand")
**Creator:** {{creatorName}} ("Creator")

collectively referred to as the "Parties".`,
        required: true,
        order: 1,
      },
      {
        id: 'scope',
        title: 'Scope of Work',
        content: `The Creator agrees to produce and publish the following deliverables:

{{deliverablesList}}

All content must be published on the following platforms: {{platforms}}`,
        required: true,
        order: 2,
      },
      {
        id: 'compensation',
        title: 'Compensation',
        content: `The Brand agrees to pay the Creator a total of **{{totalAmount}}** for the services described in this Agreement.

Payment Schedule:
{{paymentSchedule}}

All payments will be processed through the Valueskins escrow system.`,
        required: true,
        order: 3,
      },
      {
        id: 'content-rights',
        title: 'Content Rights & Usage',
        content: `**Rights Grant:** {{contentRightsDescription}}

The Creator grants the Brand the right to:
- Repost content on Brand's social media channels
- Use content in Brand's marketing materials
- Feature content on Brand's website

**Exclusivity:** {{exclusivityClause}}`,
        required: true,
        order: 4,
      },
      {
        id: 'guidelines',
        title: 'Content Guidelines',
        content: `The Creator agrees to:
- Disclose the sponsored nature of content per FTC guidelines
- Use required hashtags: #ad #sponsored #{{brandName}}Partner
- Submit content for Brand review 48 hours before publication
- Make reasonable revisions based on Brand feedback (max 2 rounds)`,
        required: true,
        order: 5,
      },
      {
        id: 'termination',
        title: 'Termination',
        content: `Either party may terminate this Agreement with 7 days written notice. In case of termination:
- Completed deliverables will be compensated pro-rata
- Unused escrow funds will be returned to Brand
- Any disputes will be resolved through Valueskins arbitration`,
        required: true,
        order: 6,
      },
    ],
  },
  {
    id: 'template-ambassador',
    name: 'Brand Ambassador Agreement',
    type: 'ambassador',
    description: 'Long-term partnership with recurring content requirements',
    defaultRights: 'shared_usage',
    minLevel: 3,
    platforms: ['meta', 'linkedin', 'youtube', 'across'],
    sections: [
      {
        id: 'intro',
        title: 'Ambassador Program Introduction',
        content: `This Brand Ambassador Agreement ("Agreement") establishes a long-term partnership between **{{brandName}}** and **{{creatorName}}** for a period of **{{contractDuration}}**.`,
        required: true,
        order: 1,
      },
      {
        id: 'scope',
        title: 'Ambassador Responsibilities',
        content: `As a Brand Ambassador, the Creator agrees to:

1. **Monthly Content Requirements:**
{{deliverablesList}}

2. **Exclusivity:** The Creator will not promote competing products in the {{category}} space during the agreement period.

3. **Brand Representation:** The Creator will positively represent the Brand in all public communications.`,
        required: true,
        order: 2,
      },
      {
        id: 'compensation',
        title: 'Ambassador Compensation',
        content: `**Monthly Retainer:** {{monthlyAmount}}
**Performance Bonus:** Up to {{bonusAmount}} based on engagement metrics

Payment is processed monthly through Valueskins escrow. Performance bonuses are calculated and paid quarterly.`,
        required: true,
        order: 3,
      },
    ],
  },
  {
    id: 'template-product-review',
    name: 'Product Review Agreement',
    type: 'product_review',
    description: 'Honest product review with disclosure requirements',
    defaultRights: 'creator_owned',
    minLevel: 1,
    platforms: ['meta', 'youtube', 'across'],
    sections: [
      {
        id: 'intro',
        title: 'Review Agreement',
        content: `This Product Review Agreement is for an honest review of **{{productName}}** by **{{creatorName}}**.

**Important:** This is a sponsored review, but the Creator maintains full editorial control over opinions expressed.`,
        required: true,
        order: 1,
      },
      {
        id: 'honesty',
        title: 'Honest Review Policy',
        content: `The Creator agrees to:
- Provide an honest, unbiased review
- Disclose that the product was provided for review
- Include both pros and cons in the review
- Not make false claims about the product

The Brand acknowledges that the Creator may express negative opinions if warranted.`,
        required: true,
        order: 2,
      },
    ],
  },
];

// ═════════════════════════════════════════════════════════════════════════
// RIGHTS DESCRIPTIONS
// ═════════════════════════════════════════════════════════════════════════

export const RIGHTS_DESCRIPTIONS: Record<ContentRights, string> = {
  creator_owned: 'Creator retains full ownership of all content. Brand receives limited display rights only.',
  shared_usage: 'Creator owns content. Brand receives non-exclusive usage rights for 12 months.',
  brand_perpetual: 'Creator owns content. Brand receives perpetual, worldwide usage rights.',
  full_transfer: 'Full copyright transfer to Brand upon payment. Creator retains portfolio usage only.',
};

// ═════════════════════════════════════════════════════════════════════════
// CONTRACT GENERATION
// ═════════════════════════════════════════════════════════════════════════

export function generateContract(
  deal: Deal,
  template: ContractTemplate,
  brandSignatory: string,
  brandEmail: string,
  creatorEmail: string,
  contentRights: ContentRights = 'shared_usage',
  exclusivityDays?: number
): Contract {
  const now = new Date();
  const contractId = `contract-${deal.id}-${now.getTime()}`;

  // Generate payment milestones based on deliverables
  const paymentMilestones: PaymentMilestone[] = [
    {
      id: `milestone-${contractId}-1`,
      description: 'Initial deposit (50%)',
      amount: Math.round(deal.totalAmount * 0.5),
      dueDate: now,
      status: 'pending',
    },
    {
      id: `milestone-${contractId}-2`,
      description: 'Completion payment (50%)',
      amount: Math.round(deal.totalAmount * 0.5),
      dueDate: deal.deliveryDeadline,
      status: 'pending',
    },
  ];

  return {
    id: contractId,
    dealId: deal.id,
    templateId: template.id,
    type: template.type,

    brandId: deal.brandId,
    brandName: deal.brandName,
    brandSignatory,
    brandEmail,
    creatorId: deal.creatorId || '',
    creatorName: deal.creatorName || '',
    creatorEmail,

    totalAmount: deal.totalAmount,
    paymentSchedule: paymentMilestones,
    deliverables: deal.deliverables,
    contentRights,
    exclusivityPeriod: exclusivityDays,
    exclusivityScope: deal.category,

    startDate: now,
    endDate: deal.deliveryDeadline,
    createdAt: now,

    brandSigned: false,
    creatorSigned: false,

    status: 'draft',
  };
}

// Mock contracts for demo
export const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'contract-001',
    dealId: 'deal-active-001',
    templateId: 'template-sponsorship',
    type: 'sponsorship',

    brandId: 'brand-004',
    brandName: 'GameZone Studios',
    brandSignatory: 'John Marketing',
    brandEmail: 'john@gamezone.com',
    creatorId: 'creator-001',
    creatorName: 'Alex Gaming',
    creatorEmail: 'alex@creator.com',

    totalAmount: 2500000,
    paymentSchedule: [
      {
        id: 'milestone-001',
        description: 'Initial deposit (50%)',
        amount: 1250000,
        dueDate: new Date('2024-01-15'),
        status: 'paid',
        paidAt: new Date('2024-01-15'),
      },
      {
        id: 'milestone-002',
        description: 'Completion payment (50%)',
        amount: 1250000,
        dueDate: new Date('2024-03-01'),
        status: 'pending',
      },
    ],
    deliverables: [],
    contentRights: 'shared_usage',
    exclusivityPeriod: 30,
    exclusivityScope: 'Gaming',

    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-03-01'),
    createdAt: new Date('2024-01-10'),
    signedAt: new Date('2024-01-14'),

    brandSigned: true,
    brandSignedAt: new Date('2024-01-13'),
    brandSignatureHash: 'sig_brand_abc123',
    creatorSigned: true,
    creatorSignedAt: new Date('2024-01-14'),
    creatorSignatureHash: 'sig_creator_xyz789',

    status: 'active',
    pdfUrl: '/contracts/contract-001.pdf',
  },
];

export function getContractStatusInfo(status: Contract['status']): {
  label: string;
  color: string;
  bgColor: string;
} {
  const statusMap: Record<Contract['status'], { label: string; color: string; bgColor: string }> = {
    draft: { label: 'Draft', color: '#737373', bgColor: '#26262620' },
    pending_brand: { label: 'Awaiting Brand', color: '#f59e0b', bgColor: '#f59e0b20' },
    pending_creator: { label: 'Awaiting You', color: '#0095f6', bgColor: '#0095f620' },
    active: { label: 'Active', color: '#10b981', bgColor: '#10b98120' },
    completed: { label: 'Completed', color: '#8b5cf6', bgColor: '#8b5cf620' },
    terminated: { label: 'Terminated', color: '#ef4444', bgColor: '#ef444420' },
  };

  return statusMap[status];
}
