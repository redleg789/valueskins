'use client';

import { useState } from 'react';
import PlatformLayout from '@/components/PlatformLayout';
import { usePlatform } from '@/lib/context';
import { PLATFORM_CONFIGS } from '@/lib/professions';
import {
  MOCK_CONTRACTS,
  Contract,
  getContractStatusInfo,
  RIGHTS_DESCRIPTIONS,
  ContentRights,
} from '@/lib/contracts';
import { formatCurrency } from '@/lib/deals';

/*
 * PATENT-RELEVANT: Digital Contract Management with E-Signature
 * ──────────────────────────────────────────────────────────────────────────
 * Features:
 * - View all contracts (active, pending, completed)
 * - E-signature workflow
 * - Rights management visibility
 * - Payment milestone tracking
 */

type Tab = 'pending' | 'active' | 'completed';

export default function ContractsPage() {
  const { activePlatform } = usePlatform();
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const platformConfig = PLATFORM_CONFIGS[activePlatform];
  const accentColor = platformConfig.primaryColor;

  // Filter contracts by status
  const pendingContracts = MOCK_CONTRACTS.filter(c =>
    ['pending_brand', 'pending_creator'].includes(c.status)
  );
  const activeContracts = MOCK_CONTRACTS.filter(c => c.status === 'active');
  const completedContracts = MOCK_CONTRACTS.filter(c =>
    ['completed', 'terminated'].includes(c.status)
  );

  const getTabContracts = () => {
    switch (activeTab) {
      case 'pending': return pendingContracts;
      case 'active': return activeContracts;
      case 'completed': return completedContracts;
    }
  };

  return (
    <PlatformLayout title="Contracts">
      <div style={{ padding: '0' }}>
        {/* Stats Header */}
        <div style={{
          padding: '16px',
          background: `linear-gradient(135deg, ${accentColor}15, transparent)`,
          borderBottom: '1px solid var(--ig-separator)',
        }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <StatCard label="Active" value={String(activeContracts.length)} color={accentColor} />
            <StatCard label="Pending" value={String(pendingContracts.length)} color="#f59e0b" />
            <StatCard label="Completed" value={String(completedContracts.length)} color="#10b981" />
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--ig-separator)',
        }}>
          {(['pending', 'active', 'completed'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '12px 0',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? `2px solid ${accentColor}` : '2px solid transparent',
                fontSize: 13,
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? 'var(--ig-text-primary)' : 'var(--ig-text-tertiary)',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Contract List */}
        <div style={{ padding: '16px' }}>
          {getTabContracts().length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {getTabContracts().map((contract, i) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  accentColor={accentColor}
                  index={i}
                  onClick={() => setSelectedContract(contract)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Contract Detail Modal */}
        {selectedContract && (
          <ContractDetailModal
            contract={selectedContract}
            accentColor={accentColor}
            onClose={() => setSelectedContract(null)}
            onSign={() => {
              // Handle signing
              setSelectedContract(null);
            }}
          />
        )}
      </div>
    </PlatformLayout>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      flex: 1,
      background: 'var(--ig-card)',
      borderRadius: 10,
      padding: '12px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function ContractCard({
  contract,
  accentColor,
  index,
  onClick,
}: {
  contract: Contract;
  accentColor: string;
  index: number;
  onClick: () => void;
}) {
  const statusInfo = getContractStatusInfo(contract.status);
  const paidMilestones = contract.paymentSchedule.filter(m => m.status === 'paid');
  const totalPaid = paidMilestones.reduce((sum, m) => sum + m.amount, 0);

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--ig-card)',
        borderRadius: 12,
        border: '1px solid var(--ig-separator)',
        padding: 14,
        cursor: 'pointer',
        animation: `fadeIn 0.25s ease-out ${index * 0.05}s both`,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{contract.brandName}</div>
          <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginTop: 2 }}>
            {contract.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} Agreement
          </div>
        </div>
        <div style={{
          padding: '4px 8px',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 600,
          background: statusInfo.bgColor,
          color: statusInfo.color,
        }}>
          {statusInfo.label}
        </div>
      </div>

      {/* Contract Value */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 12px',
        background: 'var(--ig-elevated)',
        borderRadius: 8,
        marginBottom: 12,
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)' }}>Contract Value</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(contract.totalAmount)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)' }}>Received</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#10b981' }}>
            {formatCurrency(totalPaid)}
          </div>
        </div>
      </div>

      {/* Payment Progress */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--ig-text-tertiary)' }}>Payment Progress</span>
          <span style={{ fontSize: 11, fontWeight: 600 }}>
            {paidMilestones.length}/{contract.paymentSchedule.length} milestones
          </span>
        </div>
        <div style={{
          height: 4,
          background: 'var(--ig-separator)',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${(totalPaid / contract.totalAmount) * 100}%`,
            background: '#10b981',
            borderRadius: 2,
          }} />
        </div>
      </div>

      {/* Signature Status */}
      <div style={{ display: 'flex', gap: 8 }}>
        <SignatureIndicator
          label="Brand"
          signed={contract.brandSigned}
          date={contract.brandSignedAt}
        />
        <SignatureIndicator
          label="You"
          signed={contract.creatorSigned}
          date={contract.creatorSignedAt}
        />
      </div>

      {/* Rights Badge */}
      <div style={{
        marginTop: 10,
        padding: '6px 10px',
        background: `${accentColor}10`,
        borderRadius: 6,
        fontSize: 11,
        color: accentColor,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}>
        <span>📜</span>
        {contract.contentRights.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
      </div>
    </div>
  );
}

function SignatureIndicator({
  label,
  signed,
  date,
}: {
  label: string;
  signed: boolean;
  date?: Date;
}) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 10px',
      background: signed ? '#10b98115' : 'var(--ig-elevated)',
      borderRadius: 6,
    }}>
      <div style={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: signed ? '#10b981' : 'var(--ig-separator)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {signed ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        ) : (
          <span style={{ fontSize: 10, color: 'var(--ig-text-tertiary)' }}>?</span>
        )}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)' }}>
          {signed ? (date ? new Date(date).toLocaleDateString() : 'Signed') : 'Pending'}
        </div>
      </div>
    </div>
  );
}

function ContractDetailModal({
  contract,
  accentColor,
  onClose,
  onSign,
}: {
  contract: Contract;
  accentColor: string;
  onClose: () => void;
  onSign: () => void;
}) {
  const [signing, setSigning] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const statusInfo = getContractStatusInfo(contract.status);

  const handleSign = () => {
    setSigning(true);
    setTimeout(() => {
      onSign();
    }, 2000);
  };

  const needsSignature = contract.status === 'pending_creator' && !contract.creatorSigned;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 500,
        maxHeight: '90vh',
        background: 'var(--ig-bg)',
        borderRadius: '16px 16px 0 0',
        overflow: 'hidden',
        animation: 'slideUp 0.3s ease-out',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--ig-separator)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Contract Details</div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--ig-separator)',
              border: 'none',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Status Banner */}
          <div style={{
            padding: '12px',
            background: statusInfo.bgColor,
            borderRadius: 10,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: statusInfo.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {contract.status === 'active' ? '✓' : contract.status === 'pending_creator' ? '✍️' : '📄'}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: statusInfo.color }}>
                {statusInfo.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ig-text-secondary)' }}>
                {contract.status === 'pending_creator'
                  ? 'Your signature is required to activate this contract'
                  : contract.status === 'active'
                    ? 'This contract is active and binding'
                    : 'Contract status pending'}
              </div>
            </div>
          </div>

          {/* Parties */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Parties</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{
                flex: 1,
                padding: '12px',
                background: 'var(--ig-card)',
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)' }}>Brand</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{contract.brandName}</div>
                <div style={{ fontSize: 11, color: 'var(--ig-text-secondary)' }}>{contract.brandSignatory}</div>
              </div>
              <div style={{
                flex: 1,
                padding: '12px',
                background: 'var(--ig-card)',
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)' }}>Creator</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{contract.creatorName}</div>
                <div style={{ fontSize: 11, color: 'var(--ig-text-secondary)' }}>You</div>
              </div>
            </div>
          </div>

          {/* Financial Terms */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Financial Terms</div>
            <div style={{
              padding: '14px',
              background: 'var(--ig-card)',
              borderRadius: 10,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--ig-text-secondary)' }}>Total Contract Value</span>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{formatCurrency(contract.totalAmount)}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--ig-separator)', paddingTop: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Payment Schedule</div>
                {contract.paymentSchedule.map((milestone, i) => (
                  <div
                    key={milestone.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: i < contract.paymentSchedule.length - 1 ? '1px solid var(--ig-separator)' : 'none',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13 }}>{milestone.description}</div>
                      <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)' }}>
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(milestone.amount)}</div>
                      <div style={{
                        fontSize: 10,
                        color: milestone.status === 'paid' ? '#10b981' : '#f59e0b',
                        fontWeight: 600,
                      }}>
                        {milestone.status === 'paid' ? '✓ Paid' : 'Pending'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content Rights */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Content Rights</div>
            <div style={{
              padding: '14px',
              background: `${accentColor}10`,
              borderRadius: 10,
              border: `1px solid ${accentColor}30`,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: accentColor, marginBottom: 4 }}>
                {contract.contentRights.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ig-text-secondary)', lineHeight: 1.5 }}>
                {RIGHTS_DESCRIPTIONS[contract.contentRights as ContentRights]}
              </div>
              {contract.exclusivityPeriod && (
                <div style={{
                  marginTop: 10,
                  padding: '8px 10px',
                  background: 'var(--ig-bg)',
                  borderRadius: 6,
                  fontSize: 12,
                }}>
                  <strong>Exclusivity:</strong> {contract.exclusivityPeriod} days in {contract.exclusivityScope}
                </div>
              )}
            </div>
          </div>

          {/* Signature Section */}
          {needsSignature && (
            <div style={{
              padding: '16px',
              background: 'var(--ig-card)',
              borderRadius: 12,
              border: '1px solid var(--ig-separator)',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Sign This Contract</div>

              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                marginBottom: 16,
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ marginTop: 3 }}
                />
                <span style={{ fontSize: 12, color: 'var(--ig-text-secondary)', lineHeight: 1.5 }}>
                  I have read and agree to all terms in this contract, including the content rights,
                  payment schedule, and exclusivity clauses. I understand this is a legally binding agreement.
                </span>
              </label>

              <button
                onClick={handleSign}
                disabled={!agreed || signing}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  background: agreed && !signing ? accentColor : 'var(--ig-separator)',
                  color: agreed && !signing ? '#fff' : 'var(--ig-text-tertiary)',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: agreed && !signing ? 'pointer' : 'not-allowed',
                }}
              >
                {signing ? 'Signing Contract...' : 'Sign Contract Digitally'}
              </button>

              <p style={{
                fontSize: 11,
                color: 'var(--ig-text-tertiary)',
                textAlign: 'center',
                marginTop: 10,
              }}>
                Your digital signature is legally binding. Contact support if you have questions.
              </p>
            </div>
          )}

          {/* View PDF Button */}
          {contract.pdfUrl && (
            <button
              style={{
                width: '100%',
                padding: '12px 0',
                background: 'transparent',
                color: accentColor,
                border: `1px solid ${accentColor}`,
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: 12,
              }}
            >
              View Full Contract PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  const messages: Record<Tab, { title: string; description: string }> = {
    pending: { title: 'No pending contracts', description: 'Contracts awaiting signature will appear here' },
    active: { title: 'No active contracts', description: 'Your signed contracts will appear here' },
    completed: { title: 'No completed contracts', description: 'Finished contracts will appear here' },
  };

  return (
    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{messages[tab].title}</div>
      <div style={{ fontSize: 14, color: 'var(--ig-text-tertiary)' }}>{messages[tab].description}</div>
    </div>
  );
}
