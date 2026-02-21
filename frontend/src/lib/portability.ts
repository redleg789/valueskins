/*
 * DATA PORTABILITY - YOUR REPUTATION GOES EVERYWHERE
 * ══════════════════════════════════════════════════════════════════════════
 * PATENT-CRITICAL: True Data Ownership & Export
 *
 * THE PROMISE:
 * Your data is YOURS. Not ours. You can take it anywhere, anytime.
 *
 * WHAT THIS MEANS:
 * 1. EXPORT EVERYTHING - Every deal, every review, every metric
 * 2. STANDARD FORMATS - JSON, PDF, Verifiable Credentials, LinkedIn
 * 3. API ACCESS - Third parties can verify your reputation
 * 4. BLOCKCHAIN PROOF - Even if Valueskins dies, your reputation lives
 *
 * WHY THIS IS REVOLUTIONARY:
 * - Instagram: Can't export your follower relationships
 * - YouTube: Can't export your subscriber trust
 * - TikTok: Can't export your engagement history
 * - Valueskins: EXPORT EVERYTHING
 *
 * THIS IS THE MOAT:
 * Creators will choose the platform that treats them like OWNERS, not USERS.
 */

import { ReputationScore, ReputationBadge, BrandEndorsement } from './reputation';
import { VerifiableCredential, CreatorCredentialWallet } from './credentials';
import { CreatorEquityAccount } from './equity';
import { CreatorInsurance } from './insurance';
import { Deal } from './deals';
import { AggregatedProfile } from './aggregation';
import { MediaKit } from './mediakit';

// ══════════════════════════════════════════════════════════════════════════
// COMPLETE DATA EXPORT
// ══════════════════════════════════════════════════════════════════════════

export interface CreatorDataExport {
  exportId: string;
  creatorId: string;
  creatorName: string;
  exportedAt: Date;
  version: string;

  // Core Identity
  identity: {
    did: string;
    walletAddresses: string[];
    linkedPlatforms: LinkedPlatformExport[];
  };

  // Reputation & Credentials
  reputation: ReputationScore;
  credentials: VerifiableCredential[];
  badges: ReputationBadge[];
  endorsements: BrandEndorsement[];

  // Financial History
  financial: {
    totalEarnings: number;
    totalDeals: number;
    dealHistory: DealExport[];
    equityTokens: number;
    dividendHistory: DividendExport[];
  };

  // Platform Metrics
  metrics: {
    aggregatedProfile: AggregatedProfile;
    historicalMetrics: HistoricalMetrics[];
  };

  // Content & Media
  content: {
    mediaKit: MediaKit;
    portfolioItems: PortfolioItem[];
  };

  // Insurance & Protection
  insurance: {
    policy: CreatorInsurance;
    claimsHistory: ClaimExport[];
  };

  // Blockchain Proofs
  blockchainAnchors: BlockchainAnchor[];

  // Digital Signature
  signature: ExportSignature;
}

export interface LinkedPlatformExport {
  platform: string;
  username: string;
  profileUrl: string;
  followers: number;
  linkedAt: Date;
  lastVerified: Date;
}

export interface DealExport {
  dealId: string;
  brandName: string;
  brandVerified: boolean;
  amount: number;
  completedAt: Date;
  rating: number;
  deliverables: string[];
  proofHash: string;
}

export interface DividendExport {
  date: Date;
  amount: number;
  tokensHeld: number;
  transactionHash: string;
}

export interface HistoricalMetrics {
  date: Date;
  totalFollowers: number;
  avgEngagementRate: number;
  monthlyEarnings: number;
  dealsCompleted: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  type: 'video' | 'image' | 'article' | 'campaign';
  url: string;
  thumbnailUrl?: string;
  platform: string;
  metrics: {
    views?: number;
    likes: number;
    comments: number;
    shares?: number;
  };
  brandPartner?: string;
  createdAt: Date;
}

export interface ClaimExport {
  claimId: string;
  type: string;
  amount: number;
  status: string;
  submittedAt: Date;
  resolvedAt?: Date;
}

export interface BlockchainAnchor {
  type: 'reputation' | 'credential' | 'deal' | 'endorsement';
  dataHash: string;
  chain: 'ethereum' | 'polygon' | 'arbitrum';
  transactionHash: string;
  blockNumber: number;
  timestamp: Date;
}

export interface ExportSignature {
  algorithm: 'ECDSA-secp256k1';
  signedBy: string; // Valueskins DID
  signedAt: Date;
  signature: string;
  publicKey: string;
}

// ══════════════════════════════════════════════════════════════════════════
// EXPORT FORMATS
// ══════════════════════════════════════════════════════════════════════════

export type ExportFormat =
  | 'json'
  | 'pdf'
  | 'verifiable_credentials'
  | 'linkedin'
  | 'csv'
  | 'ipfs';

export interface ExportOptions {
  format: ExportFormat;
  includeFinancials: boolean;
  includeDealDetails: boolean;
  includeMetricsHistory: boolean;
  includeBlockchainProofs: boolean;
  dateRange?: { start: Date; end: Date };
  password?: string; // For encrypted exports
}

// ══════════════════════════════════════════════════════════════════════════
// VERIFICATION API
// ══════════════════════════════════════════════════════════════════════════

export interface VerificationEndpoint {
  baseUrl: string;
  endpoints: {
    verifyReputation: string;
    verifyCredential: string;
    verifyDeal: string;
    verifyEndorsement: string;
    getPublicProfile: string;
  };
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  authentication: 'api_key' | 'oauth' | 'public';
}

export interface VerificationRequest {
  creatorDid: string;
  claimType: string;
  claimValue?: string;
  requesterInfo: {
    name: string;
    purpose: string;
    email: string;
  };
}

export interface VerificationResponse {
  verified: boolean;
  timestamp: Date;
  proof: {
    type: 'blockchain' | 'platform_signed' | 'third_party';
    reference: string;
    verificationUrl: string;
  };
  claimDetails?: Record<string, unknown>;
}

// ══════════════════════════════════════════════════════════════════════════
// EXPORT FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════

export function generateFullExport(
  creatorId: string,
  options: ExportOptions
): CreatorDataExport {
  // In production, this would fetch all real data
  // For now, return structure with mock data

  return {
    exportId: `export-${Date.now()}`,
    creatorId,
    creatorName: 'Alex Tech',
    exportedAt: new Date(),
    version: '1.0.0',

    identity: {
      did: `did:valueskins:${creatorId}`,
      walletAddresses: ['0x1234...5678'],
      linkedPlatforms: [
        {
          platform: 'instagram',
          username: 'alextech',
          profileUrl: 'https://instagram.com/alextech',
          followers: 125000,
          linkedAt: new Date('2024-01-01'),
          lastVerified: new Date(),
        },
        {
          platform: 'youtube',
          username: 'AlexTechYT',
          profileUrl: 'https://youtube.com/@AlexTech',
          followers: 85000,
          linkedAt: new Date('2024-01-01'),
          lastVerified: new Date(),
        },
      ],
    },

    reputation: {
      creatorId,
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
        reputationTokenId: 'vs-rep-001',
        lastAnchoredBlock: 18543921,
        merkleRoot: '0x8f3a2b1c...',
        ipfsHash: 'QmXoypizjW3...',
        verificationUrl: `https://valueskins.com/verify/${creatorId}`,
      },
      badges: [],
      endorsements: [],
      portability: {
        exportFormats: ['json', 'pdf', 'linkedin', 'verifiable_credential'],
        embedCode: `<script src="https://valueskins.com/embed/${creatorId}.js"></script>`,
        apiEndpoint: `https://api.valueskins.com/v1/reputation/${creatorId}`,
        qrCode: `https://valueskins.com/qr/${creatorId}.png`,
      },
      updatedAt: new Date(),
      anchoredAt: new Date(),
    },

    credentials: [],
    badges: [],
    endorsements: [],

    financial: {
      totalEarnings: options.includeFinancials ? 142500_00 : 0,
      totalDeals: 47,
      dealHistory: options.includeDealDetails ? [] : [],
      equityTokens: 2450,
      dividendHistory: [],
    },

    metrics: {
      aggregatedProfile: {} as AggregatedProfile,
      historicalMetrics: options.includeMetricsHistory ? [] : [],
    },

    content: {
      mediaKit: {} as MediaKit,
      portfolioItems: [],
    },

    insurance: {
      policy: {} as CreatorInsurance,
      claimsHistory: [],
    },

    blockchainAnchors: options.includeBlockchainProofs ? [
      {
        type: 'reputation',
        dataHash: '0xrep_hash_001...',
        chain: 'polygon',
        transactionHash: '0xtx_rep_001...',
        blockNumber: 52341234,
        timestamp: new Date(),
      },
    ] : [],

    signature: {
      algorithm: 'ECDSA-secp256k1',
      signedBy: 'did:valueskins:platform',
      signedAt: new Date(),
      signature: '0xsig_export_001...',
      publicKey: '0xpub_valueskins...',
    },
  };
}

export function exportAsJSON(data: CreatorDataExport): string {
  return JSON.stringify(data, null, 2);
}

export function exportAsVerifiablePresentation(data: CreatorDataExport): {
  '@context': string[];
  type: string[];
  holder: string;
  verifiableCredential: unknown[];
  proof: unknown;
} {
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://valueskins.com/portability/v1',
    ],
    type: ['VerifiablePresentation', 'CreatorPortfolioPresentation'],
    holder: data.identity.did,
    verifiableCredential: data.credentials,
    proof: {
      type: 'EcdsaSecp256k1Signature2019',
      created: data.exportedAt.toISOString(),
      verificationMethod: 'did:valueskins:platform#key-1',
      proofPurpose: 'assertionMethod',
      proofValue: data.signature.signature,
    },
  };
}

export function exportForLinkedIn(data: CreatorDataExport): {
  headline: string;
  summary: string;
  experience: { title: string; company: string; description: string; dates: string }[];
  certifications: { name: string; issuer: string; date: string; url: string }[];
  skills: string[];
} {
  const dealsCount = data.financial.totalDeals;
  const earningsRange = data.reputation.verifiedMetrics.totalEarningsRange;

  return {
    headline: `Verified Content Creator | ${dealsCount}+ Brand Partnerships | ${data.reputation.tier} Tier`,

    summary: `Professional content creator with blockchain-verified credentials and ${dealsCount} successful brand partnerships. My reputation score of ${data.reputation.score}/1000 (top ${100 - data.reputation.percentile}%) is independently verifiable at ${data.reputation.proofs.verificationUrl}

Key Stats:
• ${data.financial.totalDeals} deals completed
• ${data.reputation.verifiedMetrics.onTimeDeliveryRate}% on-time delivery rate
• ${data.reputation.verifiedMetrics.avgDealRating}/5 average brand rating
• ${data.reputation.verifiedMetrics.repeatBrandRate}% repeat brand rate

All metrics are cryptographically verified and stored on-chain.`,

    experience: [
      {
        title: 'Professional Content Creator',
        company: 'Self-Employed (Verified by Valueskins)',
        description: `Created sponsored content for ${dealsCount}+ brands. Total earnings range: ${earningsRange}. All deals verified on-chain.`,
        dates: '2023 - Present',
      },
    ],

    certifications: [
      {
        name: 'Valueskins Verified Creator',
        issuer: 'Valueskins',
        date: data.exportedAt.toISOString().split('T')[0],
        url: data.reputation.proofs.verificationUrl,
      },
      {
        name: `${data.reputation.tier} Tier Achievement`,
        issuer: 'Valueskins',
        date: data.reputation.anchoredAt.toISOString().split('T')[0],
        url: data.reputation.proofs.verificationUrl,
      },
    ],

    skills: [
      'Content Creation',
      'Brand Partnerships',
      'Influencer Marketing',
      'Video Production',
      'Social Media Marketing',
    ],
  };
}

// ══════════════════════════════════════════════════════════════════════════
// EMBEDDABLE WIDGETS
// ══════════════════════════════════════════════════════════════════════════

export interface EmbedWidget {
  type: 'badge' | 'card' | 'full';
  theme: 'light' | 'dark';
  size: 'small' | 'medium' | 'large';
  showMetrics: boolean;
  showVerification: boolean;
}

export function generateEmbedCode(
  creatorId: string,
  widget: EmbedWidget
): string {
  const params = new URLSearchParams({
    type: widget.type,
    theme: widget.theme,
    size: widget.size,
    metrics: widget.showMetrics.toString(),
    verification: widget.showVerification.toString(),
  });

  return `<!-- Valueskins Verified Creator Badge -->
<div id="valueskins-badge-${creatorId}"></div>
<script src="https://valueskins.com/embed/v1.js?${params.toString()}" data-creator="${creatorId}"></script>
<!-- Verify at: https://valueskins.com/verify/${creatorId} -->`;
}

export function generateQRCodeUrl(creatorId: string): string {
  return `https://valueskins.com/api/qr/${creatorId}?format=svg&size=256`;
}

// ══════════════════════════════════════════════════════════════════════════
// IPFS STORAGE
// ══════════════════════════════════════════════════════════════════════════

export interface IPFSExport {
  cid: string; // Content Identifier
  gateway: string;
  pinnedAt: Date;
  size: number;
  encryption: {
    encrypted: boolean;
    algorithm?: string;
    keyDerivation?: string;
  };
}

export async function exportToIPFS(
  data: CreatorDataExport,
  encrypt: boolean = false
): Promise<IPFSExport> {
  // In production, this would actually upload to IPFS
  const jsonData = JSON.stringify(data);

  return {
    cid: `Qm${generateRandomHash(44)}`,
    gateway: 'https://ipfs.valueskins.com',
    pinnedAt: new Date(),
    size: new Blob([jsonData]).size,
    encryption: {
      encrypted: encrypt,
      algorithm: encrypt ? 'AES-256-GCM' : undefined,
      keyDerivation: encrypt ? 'PBKDF2' : undefined,
    },
  };
}

function generateRandomHash(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ══════════════════════════════════════════════════════════════════════════
// DELETE / FORGET ME
// ══════════════════════════════════════════════════════════════════════════

export interface DeletionRequest {
  creatorId: string;
  requestedAt: Date;
  deleteTypes: ('personal_data' | 'metrics' | 'deals' | 'everything')[];
  keepBlockchainAnchors: boolean; // Can't delete blockchain, but can unlink
  reason?: string;
  confirmationCode: string;
}

export interface DeletionResult {
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  deletedItems: {
    type: string;
    count: number;
  }[];
  retainedItems: {
    type: string;
    reason: string;
  }[];
  completedAt?: Date;
  exportBeforeDeletion?: string; // IPFS CID of final export
}

export function requestDeletion(
  creatorId: string,
  deleteTypes: DeletionRequest['deleteTypes'],
  keepBlockchainAnchors: boolean
): DeletionRequest {
  return {
    creatorId,
    requestedAt: new Date(),
    deleteTypes,
    keepBlockchainAnchors,
    confirmationCode: generateRandomHash(32),
  };
}

// ══════════════════════════════════════════════════════════════════════════
// API ENDPOINTS REFERENCE
// ══════════════════════════════════════════════════════════════════════════

export const VERIFICATION_API: VerificationEndpoint = {
  baseUrl: 'https://api.valueskins.com/v1',
  endpoints: {
    verifyReputation: '/verify/reputation/:creatorDid',
    verifyCredential: '/verify/credential/:credentialId',
    verifyDeal: '/verify/deal/:dealId',
    verifyEndorsement: '/verify/endorsement/:endorsementId',
    getPublicProfile: '/public/:creatorDid',
  },
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerDay: 10000,
  },
  authentication: 'api_key',
};

// ══════════════════════════════════════════════════════════════════════════
// PORTABILITY STATS
// ══════════════════════════════════════════════════════════════════════════

export interface PortabilityStats {
  totalExports: number;
  exportsByFormat: Record<ExportFormat, number>;
  totalVerifications: number;
  verificationsByType: Record<string, number>;
  embedsActive: number;
  ipfsExports: number;
  deletionRequests: number;
}

export const MOCK_PORTABILITY_STATS: PortabilityStats = {
  totalExports: 15234,
  exportsByFormat: {
    json: 8945,
    pdf: 4123,
    verifiable_credentials: 1456,
    linkedin: 567,
    csv: 98,
    ipfs: 45,
  },
  totalVerifications: 89234,
  verificationsByType: {
    reputation: 45123,
    credential: 23456,
    deal: 15678,
    endorsement: 4977,
  },
  embedsActive: 3456,
  ipfsExports: 45,
  deletionRequests: 12,
};
