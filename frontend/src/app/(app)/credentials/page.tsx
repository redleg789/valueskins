'use client';

import { useState } from 'react';
import {
  MOCK_CREDENTIAL_WALLET,
  DEFAULT_DISCLOSURE_PRESETS,
  exportCredentialsForLinkedIn,
} from '@/lib/credentials';
import { MOCK_REPUTATION, TIER_COLORS } from '@/lib/reputation';

type Tab = 'credentials' | 'sharing' | 'verify';

export default function CredentialsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('credentials');
  const wallet = MOCK_CREDENTIAL_WALLET;

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #262626',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.1))',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          Your Credentials
        </h1>
        <p style={{ color: '#8e8e8e', fontSize: '14px' }}>
          Blockchain-verified. Self-sovereign. Portable anywhere.
        </p>
      </div>

      {/* DID Badge */}
      <div style={{
        padding: '16px 20px',
        background: '#1c1c1e',
        borderBottom: '1px solid #262626',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          🆔
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Your Decentralized ID</div>
          <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>
            {wallet.did}
          </div>
        </div>
        <button style={{
          background: '#262626',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '12px',
          cursor: 'pointer',
        }}>
          Copy
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #262626',
      }}>
        {(['credentials', 'sharing', 'verify'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '14px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #fff' : '2px solid transparent',
              color: activeTab === tab ? '#fff' : '#8e8e8e',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px' }}>
        {activeTab === 'credentials' && <CredentialsTab wallet={wallet} />}
        {activeTab === 'sharing' && <SharingTab wallet={wallet} />}
        {activeTab === 'verify' && <VerifyTab />}
      </div>
    </div>
  );
}

function CredentialsTab({ wallet }: { wallet: typeof MOCK_CREDENTIAL_WALLET }) {
  return (
    <>
      {/* Reputation Score Credential */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
          marginBottom: '16px',
        }}>
          <div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>
              Verified Reputation Score
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
              {MOCK_REPUTATION.score}
            </div>
          </div>
          <div style={{
            background: TIER_COLORS[MOCK_REPUTATION.tier],
            padding: '6px 12px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#000',
          }}>
            {MOCK_REPUTATION.tier}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          fontSize: '12px',
        }}>
          <div>
            <div style={{ opacity: 0.7 }}>Deals</div>
            <div style={{ fontWeight: 'bold' }}>{MOCK_REPUTATION.verifiedMetrics.totalDealsCompleted}</div>
          </div>
          <div>
            <div style={{ opacity: 0.7 }}>On-Time</div>
            <div style={{ fontWeight: 'bold' }}>{MOCK_REPUTATION.verifiedMetrics.onTimeDeliveryRate}%</div>
          </div>
          <div>
            <div style={{ opacity: 0.7 }}>Rating</div>
            <div style={{ fontWeight: 'bold' }}>{MOCK_REPUTATION.verifiedMetrics.avgDealRating}/5</div>
          </div>
        </div>

        <div style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255,255,255,0.2)',
          fontSize: '11px',
          opacity: 0.7,
        }}>
          🔗 Anchored to Polygon block #{MOCK_REPUTATION.proofs.lastAnchoredBlock}
        </div>
      </div>

      {/* Credentials List */}
      <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>
        Your Credentials ({wallet.credentials.length})
      </div>

      {wallet.credentials.map((cred, i) => (
        <div key={i} style={{
          background: '#1c1c1e',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '12px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            marginBottom: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: cred.type.includes('Endorsement') ? '#10b981' : '#3b82f6',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}>
                {cred.type.includes('Endorsement') ? '⭐' : '📜'}
              </div>
              <div>
                <div style={{ fontWeight: 'bold' }}>
                  {cred.type.includes('Endorsement') ? 'Brand Endorsement' : 'Creator Credential'}
                </div>
                <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
                  Issued by {cred.issuer.name}
                </div>
              </div>
            </div>
            <div style={{
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: 'bold',
            }}>
              ✓ Verified
            </div>
          </div>

          <div style={{ fontSize: '13px', color: '#8e8e8e', marginBottom: '12px' }}>
            {cred.credentialSubject.claims.map((claim, j) => (
              <div key={j} style={{ marginBottom: '4px' }}>
                • {claim.claimType.replace(/_/g, ' ')}: {
                  typeof claim.value === 'boolean' ? (claim.value ? 'Yes' : 'No') : claim.value
                }
                {claim.zkProof && <span style={{ color: '#8b5cf6' }}> (ZK Proof)</span>}
              </div>
            ))}
          </div>

          <div style={{
            fontSize: '11px',
            color: '#6b7280',
            display: 'flex',
            gap: '16px',
          }}>
            <span>Issued: {cred.issuanceDate.toLocaleDateString()}</span>
            {cred.proof.blockchainAnchor && (
              <span>🔗 Block #{cred.proof.blockchainAnchor.blockNumber}</span>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

function SharingTab({ wallet }: { wallet: typeof MOCK_CREDENTIAL_WALLET }) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  return (
    <>
      {/* Export Options */}
      <div style={{
        background: '#1c1c1e',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '16px' }}>Export Your Credentials</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { icon: '📄', label: 'JSON', desc: 'Raw data' },
            { icon: '📑', label: 'PDF', desc: 'Portfolio' },
            { icon: '💼', label: 'LinkedIn', desc: 'Auto-import' },
            { icon: '🔐', label: 'VC', desc: 'W3C Standard' },
          ].map(format => (
            <button key={format.label} style={{
              background: '#262626',
              border: 'none',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              cursor: 'pointer',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{format.icon}</div>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>{format.label}</div>
              <div style={{ color: '#8e8e8e', fontSize: '11px' }}>{format.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Disclosure Presets */}
      <div style={{
        background: '#1c1c1e',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Selective Disclosure</div>
        <p style={{ fontSize: '13px', color: '#8e8e8e', marginBottom: '16px' }}>
          Choose what to share. Some data uses Zero-Knowledge Proofs to verify without revealing exact values.
        </p>

        {DEFAULT_DISCLOSURE_PRESETS.map((preset, i) => (
          <button
            key={i}
            onClick={() => setSelectedPreset(preset.name)}
            style={{
              width: '100%',
              background: selectedPreset === preset.name ? 'rgba(139, 92, 246, 0.2)' : '#262626',
              border: selectedPreset === preset.name ? '1px solid #8b5cf6' : '1px solid transparent',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '8px',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>
              {preset.name}
            </div>
            <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
              {preset.description}
            </div>
            {selectedPreset === preset.name && (
              <div style={{
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: '1px solid #333',
                fontSize: '11px',
              }}>
                <div style={{ color: '#8e8e8e', marginBottom: '4px' }}>Includes:</div>
                <div style={{ color: '#a78bfa' }}>
                  {preset.includedClaims.slice(0, 3).join(', ')}
                  {preset.includedClaims.length > 3 && ` +${preset.includedClaims.length - 3} more`}
                </div>
                {preset.zkProofClaims.length > 0 && (
                  <div style={{ color: '#10b981', marginTop: '4px' }}>
                    🔐 ZK Proof: {preset.zkProofClaims.join(', ')}
                  </div>
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Embed Widget */}
      <div style={{
        background: '#1c1c1e',
        borderRadius: '12px',
        padding: '16px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Embed on Your Website</div>
        <p style={{ fontSize: '13px', color: '#8e8e8e', marginBottom: '16px' }}>
          Add a verified badge to your portfolio, website, or media kit.
        </p>

        <div style={{
          background: '#262626',
          borderRadius: '8px',
          padding: '12px',
          fontFamily: 'monospace',
          fontSize: '11px',
          wordBreak: 'break-all',
          color: '#8e8e8e',
        }}>
          {`<script src="https://valueskins.com/embed/${wallet.creatorId}.js"></script>`}
        </div>

        <button style={{
          width: '100%',
          marginTop: '12px',
          background: '#8b5cf6',
          border: 'none',
          padding: '12px',
          borderRadius: '8px',
          color: '#fff',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}>
          Copy Embed Code
        </button>
      </div>
    </>
  );
}

function VerifyTab() {
  return (
    <>
      {/* Verification Link */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.1))',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>✓</div>
        <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>
          Anyone Can Verify You
        </div>
        <p style={{ fontSize: '13px', color: '#8e8e8e', marginBottom: '16px' }}>
          Share this link with brands, employers, or anyone who wants to verify your credentials.
        </p>

        <div style={{
          background: '#1c1c1e',
          borderRadius: '8px',
          padding: '12px',
          fontFamily: 'monospace',
          fontSize: '13px',
          marginBottom: '12px',
        }}>
          valueskins.com/verify/creator-001
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{
            flex: 1,
            background: '#fff',
            color: '#000',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}>
            Copy Link
          </button>
          <button style={{
            flex: 1,
            background: '#262626',
            color: '#fff',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}>
            Show QR
          </button>
        </div>
      </div>

      {/* Verification Log */}
      <div style={{
        background: '#1c1c1e',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '16px' }}>Who's Verified You</div>

        {MOCK_CREDENTIAL_WALLET.verificationLog.map(log => (
          <div key={log.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            background: '#262626',
            borderRadius: '8px',
            marginBottom: '8px',
          }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>{log.verifierName}</div>
              <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
                Checked: {log.claimsVerified.slice(0, 2).join(', ')}
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
              {log.timestamp.toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* API Access */}
      <div style={{
        background: '#1c1c1e',
        borderRadius: '12px',
        padding: '16px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>API Verification</div>
        <p style={{ fontSize: '13px', color: '#8e8e8e', marginBottom: '16px' }}>
          Third parties can programmatically verify your credentials via our API.
        </p>

        <div style={{
          background: '#262626',
          borderRadius: '8px',
          padding: '12px',
          fontFamily: 'monospace',
          fontSize: '11px',
        }}>
          <div style={{ color: '#8e8e8e', marginBottom: '8px' }}>GET /v1/verify/reputation/:did</div>
          <div style={{ color: '#10b981' }}>
            {`{ "verified": true, "score": 847, "tier": "Platinum" }`}
          </div>
        </div>
      </div>
    </>
  );
}
