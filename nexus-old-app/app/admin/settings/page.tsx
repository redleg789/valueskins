'use client';

import { useState, useEffect, useCallback } from 'react';

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

// Backend returns snake_case — map to camelCase for the form
function fromApi(raw: Record<string, unknown>): PlatformConfig {
  return {
    platformName:                  raw.platform_name as string,
    platformFeePercentage:         Number(raw.platform_fee_percentage),
    minPayoutAmount:               Number(raw.min_payout_amount),
    maxPayoutAmount:               Number(raw.max_payout_amount),
    payoutCurrency:                raw.payout_currency as string,
    notificationEmailFrom:         raw.notification_email_from as string,
    supportContactEmail:           raw.support_contact_email as string,
    termsOfServiceUrl:             raw.terms_of_service_url as string,
    privacyPolicyUrl:              raw.privacy_policy_url as string,
    maxCreatorApplicationsPerDay:  Number(raw.max_creator_applications_per_day),
    maxBrandOpportunitiesPerDay:   Number(raw.max_brand_opportunities_per_day),
    gdprComplianceDays:            Number(raw.gdpr_compliance_days),
    enableKyc:                     Boolean(raw.enable_kyc),
    kycProvider:                   raw.kyc_provider as PlatformConfig['kycProvider'],
    enableCsuiteAdvantage:         Boolean(raw.enable_csuite_advantage),
    csuiteEnforcementType:         raw.csuite_enforcement_type as PlatformConfig['csuiteEnforcementType'],
    enableCampaignGating:          Boolean(raw.enable_campaign_gating),
    enableCommunities:             Boolean(raw.enable_communities),
    enableDisputeResolution:       Boolean(raw.enable_dispute_resolution),
    enableBrandVerification:       Boolean(raw.enable_brand_verification),
    maintenanceModeEnabled:        Boolean(raw.maintenance_mode_enabled),
    maintenanceModeMessage:        (raw.maintenance_mode_message as string) ?? '',
  };
}

// Map camelCase form back to snake_case for the API
function toApi(cfg: PlatformConfig): Record<string, unknown> {
  return {
    platform_name:                   cfg.platformName,
    platform_fee_percentage:         cfg.platformFeePercentage,
    min_payout_amount:               cfg.minPayoutAmount,
    max_payout_amount:               cfg.maxPayoutAmount,
    payout_currency:                 cfg.payoutCurrency,
    notification_email_from:         cfg.notificationEmailFrom,
    support_contact_email:           cfg.supportContactEmail,
    terms_of_service_url:            cfg.termsOfServiceUrl,
    privacy_policy_url:              cfg.privacyPolicyUrl,
    max_creator_applications_per_day: cfg.maxCreatorApplicationsPerDay,
    max_brand_opportunities_per_day:  cfg.maxBrandOpportunitiesPerDay,
    gdpr_compliance_days:            cfg.gdprComplianceDays,
    enable_kyc:                      cfg.enableKyc,
    kyc_provider:                    cfg.kycProvider,
    enable_csuite_advantage:         cfg.enableCsuiteAdvantage,
    csuite_enforcement_type:         cfg.csuiteEnforcementType,
    enable_campaign_gating:          cfg.enableCampaignGating,
    enable_communities:              cfg.enableCommunities,
    enable_dispute_resolution:       cfg.enableDisputeResolution,
    enable_brand_verification:       cfg.enableBrandVerification,
    maintenance_mode_enabled:        cfg.maintenanceModeEnabled,
    maintenance_mode_message:        cfg.maintenanceModeMessage,
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export default function PlatformSettingsPage() {
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [originalConfig, setOriginalConfig] = useState<PlatformConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [activeSection, setActiveSection] = useState<'general' | 'financial' | 'features' | 'compliance' | 'maintenance'>('general');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/v1/admin/config`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Failed to load config: ${res.status}`);
      const data = await res.json();
      const parsed = fromApi(data.config ?? data);
      setConfig(parsed);
      setOriginalConfig(parsed);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load platform config', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  const handleConfigChange = <K extends keyof PlatformConfig>(key: K, value: PlatformConfig[K]) => {
    setConfig(prev => prev ? { ...prev, [key]: value } : prev);
    setUnsavedChanges(true);
  };

  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/v1/admin/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(toApi(config)),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Save failed: ${res.status}`);
      }
      setOriginalConfig(config);
      setUnsavedChanges(false);
      showToast('Platform settings saved successfully');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    if (originalConfig) {
      setConfig(originalConfig);
      setUnsavedChanges(false);
    }
  };

  const toggleFeature = (feature: keyof PlatformConfig) => {
    if (config && typeof config[feature] === 'boolean') {
      handleConfigChange(feature, !config[feature] as PlatformConfig[typeof feature]);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#71717a' }}>
        Loading platform config…
      </div>
    );
  }

  if (!config) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '1rem' }}>
        <p style={{ color: '#ef4444' }}>Failed to load platform config.</p>
        <button onClick={loadConfig} style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px' }}>
      {toast && (
        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', background: toast.type === 'success' ? '#22c55e' : '#ef4444', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, zIndex: 9999 }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Platform Settings</h1>
          <p style={{ color: '#71717a', fontSize: '0.9rem' }}>Configure ValueSkins platform behavior, features, and compliance</p>
        </div>
        {unsavedChanges && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={resetChanges} disabled={saving} style={{ padding: '0.5rem 1rem', background: 'rgba(107,114,128,0.15)', border: '1px solid rgba(107,114,128,0.3)', borderRadius: '8px', color: '#9ca3af', cursor: 'pointer', fontWeight: 600 }}>
              Reset
            </button>
            <button onClick={saveConfig} disabled={saving} style={{ padding: '0.5rem 1rem', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '8px', color: '#22c55e', cursor: 'pointer', fontWeight: 600 }}>
              {saving ? 'Saving…' : 'Save Changes'}
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
                <input type="text" value={config.platformName} onChange={e => handleConfigChange('platformName', e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Support Email</label>
                <input type="email" value={config.supportContactEmail} onChange={e => handleConfigChange('supportContactEmail', e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Notification Email From</label>
                <input type="email" value={config.notificationEmailFrom} onChange={e => handleConfigChange('notificationEmailFrom', e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Legal & Compliance</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Terms of Service URL</label>
                <input type="url" value={config.termsOfServiceUrl} onChange={e => handleConfigChange('termsOfServiceUrl', e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Privacy Policy URL</label>
                <input type="url" value={config.privacyPolicyUrl} onChange={e => handleConfigChange('privacyPolicyUrl', e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Rate Limits</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Max Creator Applications / Day</label>
                <input type="number" value={config.maxCreatorApplicationsPerDay} onChange={e => handleConfigChange('maxCreatorApplicationsPerDay', parseInt(e.target.value))} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Max Brand Opportunities / Day</label>
                <input type="number" value={config.maxBrandOpportunitiesPerDay} onChange={e => handleConfigChange('maxBrandOpportunitiesPerDay', parseInt(e.target.value))} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }} />
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
                <input type="number" min="0" max="100" step="0.1" value={config.platformFeePercentage} onChange={e => handleConfigChange('platformFeePercentage', parseFloat(e.target.value))} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                <p style={{ color: '#52525b', fontSize: '0.75rem', marginTop: '0.35rem' }}>Applied to all creator payouts. Currently: {config.platformFeePercentage}%</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Min Payout ({config.payoutCurrency})</label>
                  <input type="number" min="0" value={config.minPayoutAmount} onChange={e => handleConfigChange('minPayoutAmount', parseFloat(e.target.value))} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Max Payout ({config.payoutCurrency})</label>
                  <input type="number" min="0" value={config.maxPayoutAmount} onChange={e => handleConfigChange('maxPayoutAmount', parseFloat(e.target.value))} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }} />
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
                { key: 'enableBrandVerification',  label: 'Brand Verification',          desc: 'Verify brand identities before posting opportunities' },
                { key: 'enableDisputeResolution',  label: 'Dispute Resolution',           desc: 'Allow creators and brands to raise and resolve disputes' },
                { key: 'enableCampaignGating',     label: 'Campaign Gating',              desc: 'Brands can require specific ValueSkins to apply' },
                { key: 'enableCsuiteAdvantage',    label: 'C-Suite Advantage',            desc: 'Elevate leadership titles for higher reputation' },
                { key: 'enableCommunities',        label: 'Communities',                  desc: 'Allow users to create gated communities' },
                { key: 'enableKyc',                label: 'KYC (Know Your Customer)',     desc: 'Require identity verification for all users' },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{label}</div>
                    <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{desc}</div>
                  </div>
                  <div onClick={() => toggleFeature(key as keyof PlatformConfig)} style={{ width: '48px', height: '26px', borderRadius: '100px', background: config[key as keyof PlatformConfig] ? '#22c55e' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: '3px', left: config[key as keyof PlatformConfig] ? '25px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {config.enableKyc && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>KYC Configuration</h3>
              <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: 600 }}>KYC Provider</label>
              <select value={config.kycProvider} onChange={e => handleConfigChange('kycProvider', e.target.value as PlatformConfig['kycProvider'])} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}>
                <option value="none">Disabled</option>
                <option value="stripe">Stripe Identity</option>
                <option value="plaid">Plaid</option>
                <option value="sumsub">SumSub</option>
              </select>
            </div>
          )}

          {config.enableCsuiteAdvantage && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>C-Suite Advantage Configuration</h3>
              <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: 600 }}>Enforcement Type</label>
              <select value={config.csuiteEnforcementType} onChange={e => handleConfigChange('csuiteEnforcementType', e.target.value as PlatformConfig['csuiteEnforcementType'])} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}>
                <option value="level_boost">Level Boost (+1 reputation level)</option>
                <option value="price_multiplier">Price Multiplier (1.5x rates)</option>
                <option value="both">Both (Level boost + price multiplier)</option>
                <option value="none">Disabled</option>
              </select>
              <p style={{ color: '#52525b', fontSize: '0.75rem', marginTop: '0.35rem' }}>How C-Suite titles (CEO, CTO, VP) are advantaged in reputation scoring and pricing</p>
            </div>
          )}
        </div>
      )}

      {/* Compliance Section */}
      {activeSection === 'compliance' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>GDPR Compliance</h3>
            <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Data Deletion Compliance Deadline (days)</label>
            <input type="number" min="1" max="90" value={config.gdprComplianceDays} onChange={e => handleConfigChange('gdprComplianceDays', parseInt(e.target.value))} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            <p style={{ color: '#52525b', fontSize: '0.75rem', marginTop: '0.35rem' }}>GDPR Article 17 right-to-be-forgotten deadline. Currently set to {config.gdprComplianceDays} days.</p>
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
                <div onClick={() => toggleFeature('maintenanceModeEnabled')} style={{ width: '48px', height: '26px', borderRadius: '100px', background: config.maintenanceModeEnabled ? '#f59e0b' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: '3px', left: config.maintenanceModeEnabled ? '25px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                </div>
              </div>

              {config.maintenanceModeEnabled && (
                <div>
                  <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>Maintenance Message (shown to users)</label>
                  <textarea value={config.maintenanceModeMessage} onChange={e => handleConfigChange('maintenanceModeMessage', e.target.value)} placeholder="We're performing scheduled maintenance. We'll be back online in 2 hours." style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box', minHeight: '80px' }} />
                </div>
              )}
            </div>
          </div>

          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ color: '#f59e0b', fontWeight: 600, marginBottom: '0.35rem' }}>Warning: Maintenance Mode Active</div>
            <p style={{ color: '#fbbf24', fontSize: '0.85rem' }}>When enabled, all API requests will return 503 Service Unavailable. Only admin users can access the platform.</p>
          </div>
        </div>
      )}
    </div>
  );
}
