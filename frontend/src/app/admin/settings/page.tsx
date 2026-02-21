'use client';

import { useState } from 'react';

interface PlatformConfig {
  platformName: string;
  platformFeePercentage: number;
  minPayoutAmount: number;
  maxPayoutAmount: number;
  payoutCurrency: string;
  notificationEmailFrom: string;
  supportContactEmail: string;
  termsOfServiceUrl: string;
  privacyPolicyUrl: string;
  maxCreatorApplicationsPerDay: number;
  maxBrandOpportunitiesPerDay: number;
  gdprComplianceDays: number;
  enableKyc: boolean;
  kycProvider: 'none' | 'stripe' | 'plaid' | 'sumsub';
  enableCsuiteAdvantage: boolean;
  csuiteEnforcementType: 'level_boost' | 'price_multiplier' | 'both' | 'none';
  enableCampaignGating: boolean;
  enableCommunities: boolean;
  enableDisputeResolution: boolean;
  enableBrandVerification: boolean;
  maintenanceModeEnabled: boolean;
  maintenanceModeMessage: string;
}

const INITIAL_CONFIG: PlatformConfig = {
  platformName: 'ValueSkins',
  platformFeePercentage: 5,
  minPayoutAmount: 50,
  maxPayoutAmount: 50000,
  payoutCurrency: 'USD',
  notificationEmailFrom: 'noreply@valueskins.app',
  supportContactEmail: 'support@valueskins.app',
  termsOfServiceUrl: 'https://valueskins.app/tos',
  privacyPolicyUrl: 'https://valueskins.app/privacy',
  maxCreatorApplicationsPerDay: 50,
  maxBrandOpportunitiesPerDay: 10,
  gdprComplianceDays: 30,
  enableKyc: false,
  kycProvider: 'none',
  enableCsuiteAdvantage: true,
  csuiteEnforcementType: 'level_boost',
  enableCampaignGating: true,
  enableCommunities: true,
  enableDisputeResolution: true,
  enableBrandVerification: true,
  maintenanceModeEnabled: false,
  maintenanceModeMessage: '',
};

export default function PlatformSettingsPage() {
  const [config, setConfig] = useState<PlatformConfig>(INITIAL_CONFIG);
  const [toast, setToast] = useState('');
  const [activeSection, setActiveSection] = useState<'general' | 'financial' | 'features' | 'compliance' | 'maintenance'>('general');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleConfigChange = (key: keyof PlatformConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setUnsavedChanges(true);
  };

  const saveConfig = () => {
    // In production: POST /admin/platform/settings
    showToast('Platform settings saved successfully');
    setUnsavedChanges(false);
  };

  const resetChanges = () => {
    setConfig(INITIAL_CONFIG);
    setUnsavedChanges(false);
  };

  const toggleFeature = (feature: keyof PlatformConfig) => {
    if (typeof config[feature] === 'boolean') {
      handleConfigChange(feature, !config[feature]);
    }
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      {toast && (
        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', background: '#22c55e', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, zIndex: 9999 }}>
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Platform Settings</h1>
          <p style={{ color: '#71717a', fontSize: '0.9rem' }}>Configure ValueSkins platform behavior, features, and compliance</p>
        </div>
        {unsavedChanges && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={resetChanges} style={{ padding: '0.5rem 1rem', background: 'rgba(107,114,128,0.15)', border: '1px solid rgba(107,114,128,0.3)', borderRadius: '8px', color: '#9ca3af', cursor: 'pointer', fontWeight: 600 }}>
              Reset
            </button>
            <button onClick={saveConfig} style={{ padding: '0.5rem 1rem', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '8px', color: '#22c55e', cursor: 'pointer', fontWeight: 600 }}>
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '1.5rem', display: 'flex', gap: '0' }}>
        {(['general', 'financial', 'features', 'compliance', 'maintenance'] as const).map(section => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeSection === section ? '2px solid #EF4444' : '2px solid transparent',
              color: activeSection === section ? '#EF4444' : '#71717a',
              fontWeight: activeSection === section ? 600 : 400,
              cursor: 'pointer',
              fontSize: '0.9rem',
              textTransform: 'capitalize',
            }}
          >
            {section === 'maintenance' ? 'Maintenance' : section.charAt(0).toUpperCase() + section.slice(1)}
          </button>
        ))}
      </div>

      {/* General Section */}
      {activeSection === 'general' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Platform Identity</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Platform Name</label>
                <input
                  type="text"
                  value={config.platformName}
                  onChange={e => handleConfigChange('platformName', e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Support Email</label>
                <input
                  type="email"
                  value={config.supportContactEmail}
                  onChange={e => handleConfigChange('supportContactEmail', e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Notification Email From</label>
                <input
                  type="email"
                  value={config.notificationEmailFrom}
                  onChange={e => handleConfigChange('notificationEmailFrom', e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Legal & Compliance</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Terms of Service URL</label>
                <input
                  type="url"
                  value={config.termsOfServiceUrl}
                  onChange={e => handleConfigChange('termsOfServiceUrl', e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Privacy Policy URL</label>
                <input
                  type="url"
                  value={config.privacyPolicyUrl}
                  onChange={e => handleConfigChange('privacyPolicyUrl', e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Rate Limits</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Max Creator Applications / Day</label>
                <input
                  type="number"
                  value={config.maxCreatorApplicationsPerDay}
                  onChange={e => handleConfigChange('maxCreatorApplicationsPerDay', parseInt(e.target.value))}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Max Brand Opportunities / Day</label>
                <input
                  type="number"
                  value={config.maxBrandOpportunitiesPerDay}
                  onChange={e => handleConfigChange('maxBrandOpportunitiesPerDay', parseInt(e.target.value))}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Section */}
      {activeSection === 'financial' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Revenue & Payout Configuration</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Platform Fee (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={config.platformFeePercentage}
                  onChange={e => handleConfigChange('platformFeePercentage', parseFloat(e.target.value))}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
                <p style={{ color: '#52525b', fontSize: '0.75rem', marginTop: '0.35rem' }}>Applied to all creator payouts. Currently: {config.platformFeePercentage}%</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Min Payout ({config.payoutCurrency})</label>
                  <input
                    type="number"
                    min="0"
                    value={config.minPayoutAmount}
                    onChange={e => handleConfigChange('minPayoutAmount', parseFloat(e.target.value))}
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Max Payout ({config.payoutCurrency})</label>
                  <input
                    type="number"
                    min="0"
                    value={config.maxPayoutAmount}
                    onChange={e => handleConfigChange('maxPayoutAmount', parseFloat(e.target.value))}
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      {activeSection === 'features' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Feature Toggles</h3>
            <p style={{ color: '#71717a', fontSize: '0.85rem', marginBottom: '1rem' }}>Enable or disable platform features. Disabling a feature removes it from all users immediately.</p>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {[
                { key: 'enableBrandVerification', label: 'Brand Verification', desc: 'Verify brand identities before posting opportunities' },
                { key: 'enableDisputeResolution', label: 'Dispute Resolution', desc: 'Allow creators and brands to raise and resolve disputes' },
                { key: 'enableCampaignGating', label: 'Campaign Gating', desc: 'Brands can require specific ValueSkins to apply' },
                { key: 'enableCsuiteAdvantage', label: 'C-Suite Advantage', desc: 'Elevate leadership titles for higher reputation' },
                { key: 'enableCommunities', label: 'Communities', desc: 'Allow users to create gated communities' },
                { key: 'enableKyc', label: 'KYC (Know Your Customer)', desc: 'Require identity verification for all users' },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{label}</div>
                    <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{desc}</div>
                  </div>
                  <div
                    onClick={() => toggleFeature(key as keyof PlatformConfig)}
                    style={{
                      width: '48px', height: '26px', borderRadius: '100px',
                      background: config[key as keyof PlatformConfig] ? '#22c55e' : 'rgba(255,255,255,0.1)',
                      cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: '3px',
                      left: config[key as keyof PlatformConfig] ? '25px' : '3px',
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: 'white', transition: 'left 0.2s'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {config.enableKyc && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>KYC Configuration</h3>
              <div>
                <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: 600 }}>KYC Provider</label>
                <select
                  value={config.kycProvider}
                  onChange={e => handleConfigChange('kycProvider', e.target.value as 'none' | 'stripe' | 'plaid' | 'sumsub')}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                >
                  <option value="none">Disabled</option>
                  <option value="stripe">Stripe Identity</option>
                  <option value="plaid">Plaid</option>
                  <option value="sumsub">SumSub</option>
                </select>
                <p style={{ color: '#52525b', fontSize: '0.75rem', marginTop: '0.35rem' }}>Selected provider: {config.kycProvider === 'none' ? 'KYC Disabled' : config.kycProvider}</p>
              </div>
            </div>
          )}

          {config.enableCsuiteAdvantage && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>C-Suite Advantage Configuration</h3>
              <div>
                <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: 600 }}>Enforcement Type</label>
                <select
                  value={config.csuiteEnforcementType}
                  onChange={e => handleConfigChange('csuiteEnforcementType', e.target.value as 'level_boost' | 'price_multiplier' | 'both' | 'none')}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                >
                  <option value="level_boost">Level Boost (+1 reputation level)</option>
                  <option value="price_multiplier">Price Multiplier (1.5x rates)</option>
                  <option value="both">Both (Level boost + price multiplier)</option>
                  <option value="none">Disabled</option>
                </select>
                <p style={{ color: '#52525b', fontSize: '0.75rem', marginTop: '0.35rem' }}>How C-Suite titles (CEO, CTO, VP) are advantaged in reputation scoring and pricing</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Compliance Section */}
      {activeSection === 'compliance' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>GDPR Compliance</h3>
            <div>
              <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Data Deletion Compliance Deadline (days)</label>
              <input
                type="number"
                min="1"
                max="90"
                value={config.gdprComplianceDays}
                onChange={e => handleConfigChange('gdprComplianceDays', parseInt(e.target.value))}
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
              <p style={{ color: '#52525b', fontSize: '0.75rem', marginTop: '0.35rem' }}>GDPR Article 17 right-to-be-forgotten deadline. Currently set to {config.gdprComplianceDays} days.</p>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Section */}
      {activeSection === 'maintenance' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Maintenance Mode</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Enable Maintenance Mode</div>
                  <div style={{ fontSize: '0.8rem', color: '#71717a' }}>Take the platform offline for updates. Users will see a message.</div>
                </div>
                <div
                  onClick={() => toggleFeature('maintenanceModeEnabled')}
                  style={{
                    width: '48px', height: '26px', borderRadius: '100px',
                    background: config.maintenanceModeEnabled ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                    cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '3px',
                    left: config.maintenanceModeEnabled ? '25px' : '3px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: 'white', transition: 'left 0.2s'
                  }} />
                </div>
              </div>

              {config.maintenanceModeEnabled && (
                <div>
                  <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Maintenance Message (shown to users)</label>
                  <textarea
                    value={config.maintenanceModeMessage}
                    onChange={e => handleConfigChange('maintenanceModeMessage', e.target.value)}
                    placeholder="We're performing scheduled maintenance. We'll be back online in 2 hours."
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box', minHeight: '80px' }}
                  />
                </div>
              )}
            </div>
          </div>

          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ color: '#f59e0b', fontWeight: 600, marginBottom: '0.35rem' }}>⚠️ Maintenance Mode Active</div>
            <p style={{ color: '#fbbf24', fontSize: '0.85rem' }}>When enabled, all API requests will return 503 Service Unavailable. Only admin users can access the platform.</p>
          </div>
        </div>
      )}
    </div>
  );
}
