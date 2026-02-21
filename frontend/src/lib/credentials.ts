/*
 * BLOCKCHAIN-VERIFIED CREATOR CREDENTIALS
 * ══════════════════════════════════════════════════════════════════════════
 * PATENT-CRITICAL: Self-Sovereign Identity for Content Creators
 *
 * THE MOAT: Creators OWN their professional identity. Not us. Not platforms. THEM.
 *
 * This is the killer feature:
 * 1. Verifiable Credentials (W3C standard) stored on-chain
 * 2. Creator controls what they share with brands
 * 3. Zero-knowledge proofs for sensitive data (earnings without revealing exact amount)
 * 4. Portable to ANY future platform, job application, or acquisition
 *
 * WHY COMPANIES WILL PAY BILLIONS:
 * - This is LinkedIn verification on steroids
 * - Brands TRUST creators instantly (no more fraud)
 * - Creators can prove their worth without intermediaries
 * - First platform to give creators TRUE ownership of their professional identity
 */

export interface VerifiableCredential {
  // W3C Verifiable Credentials standard compliance
  '@context': string[];
  id: string;
  type: string[];
  issuer: CredentialIssuer;
  issuanceDate: Date;
  expirationDate?: Date;
  credentialSubject: CredentialSubject;
  proof: CredentialProof;
}

export interface CredentialIssuer {
  id: string; // DID (Decentralized Identifier)
  name: string;
  type: 'Platform' | 'Brand' | 'Creator' | 'ThirdParty';
  verificationMethod: string;
}

export interface CredentialSubject {
  id: string; // Creator's DID
  type: 'CreatorCredential';
  claims: CredentialClaim[];
}

export interface CredentialClaim {
  claimType: CredentialClaimType;
  value: string | number | boolean;
  evidence?: ClaimEvidence[];
  zkProof?: ZeroKnowledgeProof; // For sensitive claims
}

export type CredentialClaimType =
  // Identity Claims
  | 'identity_verified'
  | 'platform_account_ownership'
  | 'real_name_verified'
  | 'age_verified'
  | 'location_verified'

  // Performance Claims
  | 'follower_count_range'
  | 'engagement_rate_range'
  | 'total_deals_completed'
  | 'earnings_range'
  | 'on_time_delivery_rate'

  // Skill Claims
  | 'content_category_expertise'
  | 'platform_expertise'
  | 'years_of_experience'

  // Trust Claims
  | 'brand_endorsement'
  | 'platform_verification'
  | 'community_vouching'
  | 'dispute_free_record';

export interface ClaimEvidence {
  type: 'TransactionHash' | 'PlatformAPI' | 'DocumentHash' | 'WitnessSignature';
  source: string;
  hash: string;
  timestamp: Date;
}

export interface ZeroKnowledgeProof {
  // Prove something without revealing the actual value
  // e.g., "I earned more than $100K" without revealing exact amount
  proofType: 'range' | 'membership' | 'comparison';
  publicInputs: string[];
  proof: string;
  verificationKey: string;
}

export interface CredentialProof {
  type: 'EcdsaSecp256k1Signature2019' | 'Ed25519Signature2020';
  created: Date;
  verificationMethod: string;
  proofPurpose: 'assertionMethod';
  proofValue: string; // Cryptographic signature
  blockchainAnchor?: {
    chain: 'ethereum' | 'polygon' | 'arbitrum';
    transactionHash: string;
    blockNumber: number;
  };
}

// ══════════════════════════════════════════════════════════════════════════
// CREDENTIAL WALLET - Creator's Self-Sovereign Identity
// ══════════════════════════════════════════════════════════════════════════

export interface CreatorCredentialWallet {
  did: string; // Decentralized Identifier
  creatorId: string;

  // All credentials the creator owns
  credentials: VerifiableCredential[];

  // Selective disclosure - what to share with whom
  disclosurePresets: DisclosurePreset[];

  // Access log - who verified what
  verificationLog: VerificationLogEntry[];

  // Recovery
  recoveryMethods: RecoveryMethod[];

  createdAt: Date;
  updatedAt: Date;
}

export interface DisclosurePreset {
  id: string;
  name: string;
  description: string;

  // Which claims to reveal
  includedClaims: CredentialClaimType[];

  // Use ZK proofs for sensitive data
  zkProofClaims: CredentialClaimType[];

  // Preset examples: "Brand Pitch", "Job Application", "Public Profile"
  useCase: 'brand_pitch' | 'job_application' | 'public_profile' | 'custom';
}

export interface VerificationLogEntry {
  id: string;
  verifierId: string;
  verifierName: string;
  verifierType: 'Brand' | 'Platform' | 'Employer' | 'Other';
  claimsVerified: CredentialClaimType[];
  timestamp: Date;
  ipAddress?: string;
}

export interface RecoveryMethod {
  type: 'social_recovery' | 'hardware_key' | 'seed_phrase' | 'email_otp';
  isActive: boolean;
  lastVerified?: Date;
}

// ══════════════════════════════════════════════════════════════════════════
// CREDENTIAL TYPES - Specific credentials creators can earn
// ══════════════════════════════════════════════════════════════════════════

export interface DealCompletionCredential extends VerifiableCredential {
  credentialSubject: {
    id: string;
    type: 'CreatorCredential';
    claims: [
      { claimType: 'total_deals_completed'; value: number },
      { claimType: 'earnings_range'; value: string; zkProof: ZeroKnowledgeProof },
      { claimType: 'on_time_delivery_rate'; value: number },
    ];
  };
}

export interface BrandEndorsementCredential extends VerifiableCredential {
  credentialSubject: {
    id: string;
    type: 'CreatorCredential';
    claims: [
      {
        claimType: 'brand_endorsement';
        value: string; // Endorsement text
        evidence: [
          {
            type: 'WitnessSignature';
            source: string; // Brand DID
            hash: string;
            timestamp: Date;
          }
        ];
      }
    ];
  };
}

export interface PlatformVerificationCredential extends VerifiableCredential {
  credentialSubject: {
    id: string;
    type: 'CreatorCredential';
    claims: [
      { claimType: 'platform_account_ownership'; value: string },
      { claimType: 'follower_count_range'; value: string },
      { claimType: 'engagement_rate_range'; value: string },
    ];
  };
}

// ══════════════════════════════════════════════════════════════════════════
// CREDENTIAL ISSUANCE
// ══════════════════════════════════════════════════════════════════════════

export function issueCredential(
  issuer: CredentialIssuer,
  subjectDid: string,
  claims: CredentialClaim[],
  expirationDays?: number
): VerifiableCredential {
  const now = new Date();

  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://valueskins.com/credentials/v1',
    ],
    id: `urn:uuid:${generateUUID()}`,
    type: ['VerifiableCredential', 'ValueskinsCreatorCredential'],
    issuer,
    issuanceDate: now,
    expirationDate: expirationDays
      ? new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000)
      : undefined,
    credentialSubject: {
      id: subjectDid,
      type: 'CreatorCredential',
      claims,
    },
    proof: {
      type: 'EcdsaSecp256k1Signature2019',
      created: now,
      verificationMethod: issuer.verificationMethod,
      proofPurpose: 'assertionMethod',
      proofValue: '', // Would be signed by issuer's private key
    },
  };
}

export function generateEarningsRangeProof(exactEarnings: number): ZeroKnowledgeProof {
  // In production, this would use actual ZK-SNARK libraries
  // For now, we create the structure

  const range = getEarningsRange(exactEarnings);

  return {
    proofType: 'range',
    publicInputs: [range], // The range is public, exact value is hidden
    proof: `zk_proof_${Date.now()}`, // Would be actual ZK proof
    verificationKey: `vk_earnings_range_${range}`,
  };
}

function getEarningsRange(amount: number): string {
  if (amount < 1000) return 'Under $1K';
  if (amount < 10000) return '$1K-$10K';
  if (amount < 50000) return '$10K-$50K';
  if (amount < 100000) return '$50K-$100K';
  if (amount < 500000) return '$100K-$500K';
  if (amount < 1000000) return '$500K-$1M';
  return '$1M+';
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ══════════════════════════════════════════════════════════════════════════
// VERIFICATION
// ══════════════════════════════════════════════════════════════════════════

export interface VerificationRequest {
  requesterId: string;
  requesterName: string;
  requesterType: 'Brand' | 'Platform' | 'Employer';
  requestedClaims: CredentialClaimType[];
  purpose: string;
  expiresAt: Date;
}

export interface VerificationResponse {
  requestId: string;
  approved: boolean;
  sharedCredentials: VerifiableCredential[];
  zkProofs: ZeroKnowledgeProof[];
  timestamp: Date;
  signature: string;
}

export async function verifyCredential(
  credential: VerifiableCredential
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Check expiration
  if (credential.expirationDate && new Date() > credential.expirationDate) {
    errors.push('Credential has expired');
  }

  // Verify issuer (in production, check against trusted issuer registry)
  if (!credential.issuer.id.startsWith('did:')) {
    errors.push('Invalid issuer DID');
  }

  // Verify proof signature (in production, use actual crypto verification)
  if (!credential.proof.proofValue) {
    errors.push('Missing proof signature');
  }

  // Check blockchain anchor if present
  if (credential.proof.blockchainAnchor) {
    // In production, verify the transaction exists on-chain
    const { transactionHash, blockNumber } = credential.proof.blockchainAnchor;
    if (!transactionHash || !blockNumber) {
      errors.push('Invalid blockchain anchor');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ══════════════════════════════════════════════════════════════════════════
// DISCLOSURE PRESETS
// ══════════════════════════════════════════════════════════════════════════

export const DEFAULT_DISCLOSURE_PRESETS: Omit<DisclosurePreset, 'id'>[] = [
  {
    name: 'Brand Pitch',
    description: 'Share key metrics with brands for sponsorship opportunities',
    includedClaims: [
      'identity_verified',
      'platform_account_ownership',
      'content_category_expertise',
      'total_deals_completed',
      'on_time_delivery_rate',
    ],
    zkProofClaims: [
      'follower_count_range',
      'engagement_rate_range',
      'earnings_range',
    ],
    useCase: 'brand_pitch',
  },
  {
    name: 'Job Application',
    description: 'Full professional history for employment opportunities',
    includedClaims: [
      'identity_verified',
      'real_name_verified',
      'platform_account_ownership',
      'content_category_expertise',
      'years_of_experience',
      'total_deals_completed',
      'brand_endorsement',
    ],
    zkProofClaims: [
      'earnings_range',
    ],
    useCase: 'job_application',
  },
  {
    name: 'Public Profile',
    description: 'Minimal info for public display',
    includedClaims: [
      'platform_verification',
      'content_category_expertise',
    ],
    zkProofClaims: [
      'follower_count_range',
    ],
    useCase: 'public_profile',
  },
];

// ══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ══════════════════════════════════════════════════════════════════════════

export const MOCK_CREDENTIAL_WALLET: CreatorCredentialWallet = {
  did: 'did:valueskins:creator-001',
  creatorId: 'creator-001',

  credentials: [
    {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://valueskins.com/credentials/v1',
      ],
      id: 'urn:uuid:cred-001',
      type: ['VerifiableCredential', 'ValueskinsCreatorCredential'],
      issuer: {
        id: 'did:valueskins:platform',
        name: 'Valueskins',
        type: 'Platform',
        verificationMethod: 'did:valueskins:platform#key-1',
      },
      issuanceDate: new Date('2024-01-15'),
      credentialSubject: {
        id: 'did:valueskins:creator-001',
        type: 'CreatorCredential',
        claims: [
          { claimType: 'identity_verified', value: true },
          { claimType: 'total_deals_completed', value: 47 },
          {
            claimType: 'earnings_range',
            value: '$100K-$500K',
            zkProof: {
              proofType: 'range',
              publicInputs: ['$100K-$500K'],
              proof: 'zk_proof_earnings_001',
              verificationKey: 'vk_earnings_range_100k_500k',
            },
          },
          { claimType: 'on_time_delivery_rate', value: 98 },
        ],
      },
      proof: {
        type: 'EcdsaSecp256k1Signature2019',
        created: new Date('2024-01-15'),
        verificationMethod: 'did:valueskins:platform#key-1',
        proofPurpose: 'assertionMethod',
        proofValue: '0xsig_platform_001...',
        blockchainAnchor: {
          chain: 'polygon',
          transactionHash: '0xtx_cred_001...',
          blockNumber: 52341234,
        },
      },
    },
    {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://valueskins.com/credentials/v1',
      ],
      id: 'urn:uuid:cred-002',
      type: ['VerifiableCredential', 'BrandEndorsementCredential'],
      issuer: {
        id: 'did:valueskins:brand-techflow',
        name: 'TechFlow Labs',
        type: 'Brand',
        verificationMethod: 'did:valueskins:brand-techflow#key-1',
      },
      issuanceDate: new Date('2024-01-20'),
      credentialSubject: {
        id: 'did:valueskins:creator-001',
        type: 'CreatorCredential',
        claims: [
          {
            claimType: 'brand_endorsement',
            value: 'Alex delivered exceptional work that exceeded our campaign goals by 340%. Highly recommended.',
            evidence: [
              {
                type: 'WitnessSignature',
                source: 'did:valueskins:brand-techflow',
                hash: '0xhash_endorsement_001',
                timestamp: new Date('2024-01-20'),
              },
            ],
          },
        ],
      },
      proof: {
        type: 'EcdsaSecp256k1Signature2019',
        created: new Date('2024-01-20'),
        verificationMethod: 'did:valueskins:brand-techflow#key-1',
        proofPurpose: 'assertionMethod',
        proofValue: '0xsig_techflow_001...',
        blockchainAnchor: {
          chain: 'polygon',
          transactionHash: '0xtx_cred_002...',
          blockNumber: 52345678,
        },
      },
    },
  ],

  disclosurePresets: [
    {
      id: 'preset-001',
      name: 'Brand Pitch',
      description: 'Share key metrics with brands for sponsorship opportunities',
      includedClaims: [
        'identity_verified',
        'platform_account_ownership',
        'total_deals_completed',
        'on_time_delivery_rate',
      ],
      zkProofClaims: ['earnings_range'],
      useCase: 'brand_pitch',
    },
  ],

  verificationLog: [
    {
      id: 'log-001',
      verifierId: 'brand-gamezone',
      verifierName: 'GameZone Studios',
      verifierType: 'Brand',
      claimsVerified: ['identity_verified', 'total_deals_completed', 'earnings_range'],
      timestamp: new Date('2024-01-25'),
    },
  ],

  recoveryMethods: [
    { type: 'email_otp', isActive: true, lastVerified: new Date('2024-01-01') },
    { type: 'social_recovery', isActive: true },
  ],

  createdAt: new Date('2024-01-01'),
  updatedAt: new Date(),
};

// ══════════════════════════════════════════════════════════════════════════
// EXPORT FORMATS
// ══════════════════════════════════════════════════════════════════════════

export function exportCredentialsAsJSON(wallet: CreatorCredentialWallet): string {
  return JSON.stringify({
    '@context': 'https://www.w3.org/2018/credentials/v1',
    type: 'VerifiablePresentation',
    holder: wallet.did,
    verifiableCredential: wallet.credentials,
    exportedAt: new Date().toISOString(),
    exportedBy: 'Valueskins',
  }, null, 2);
}

export function exportCredentialsForLinkedIn(wallet: CreatorCredentialWallet): {
  headline: string;
  summary: string;
  certifications: { name: string; issuer: string; date: string }[];
} {
  const dealCred = wallet.credentials.find(c =>
    c.credentialSubject.claims.some(claim => claim.claimType === 'total_deals_completed')
  );

  const endorsements = wallet.credentials.filter(c =>
    c.credentialSubject.claims.some(claim => claim.claimType === 'brand_endorsement')
  );

  const dealsCompleted = dealCred?.credentialSubject.claims.find(
    c => c.claimType === 'total_deals_completed'
  )?.value || 0;

  return {
    headline: `Verified Content Creator | ${dealsCompleted}+ Brand Partnerships | Valueskins Certified`,
    summary: `Professional content creator with blockchain-verified credentials. ${endorsements.length} brand endorsements. All metrics independently verifiable at valueskins.com/verify/${wallet.did}`,
    certifications: wallet.credentials.map(cred => ({
      name: cred.type.includes('BrandEndorsementCredential')
        ? `Brand Endorsement - ${cred.issuer.name}`
        : 'Valueskins Creator Credential',
      issuer: cred.issuer.name,
      date: cred.issuanceDate.toISOString().split('T')[0],
    })),
  };
}
