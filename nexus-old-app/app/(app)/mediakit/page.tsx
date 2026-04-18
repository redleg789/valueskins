'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, MediaKitData } from '@/lib/api';

function cents(n: number) { return '$' + (n / 100).toLocaleString('en-US', { minimumFractionDigits: 2 }); }

function formatFollowers(n: number) {
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
    return n.toString();
}

type Tab = 'preview' | 'analytics' | 'settings';

export default function MediaKitPage() {
    const [activeTab, setActiveTab] = useState<Tab>('preview');
    const [showShareModal, setShowShareModal] = useState(false);
    const [data, setData] = useState<MediaKitData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        const res = await api.mediakit.getMyMediaKit();
        if (res.data) setData(res.data);
        else setError(res.error || 'Failed to load media kit');
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) return <div style={{ background: '#000', minHeight: '100vh', color: '#8e8e8e', padding: '20px' }}>Loading media kit...</div>;
    if (error || !data) return <div style={{ background: '#000', minHeight: '100vh', color: '#ef4444', padding: '20px' }}>{error}</div>;

    const accentColor = data.brand_colors.primary || '#8b5cf6';

    return (
        <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
            <div style={{
                padding: '16px',
                background: `linear-gradient(135deg, ${accentColor}20, ${data.brand_colors.secondary}10)`,
                borderBottom: '1px solid #262626',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${accentColor}, ${data.brand_colors.secondary})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, color: '#fff', fontWeight: 700,
                    }}>
                        {data.tagline.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 20, fontWeight: 700 }}>{data.tagline}</div>
                        <div style={{ fontSize: 12, color: '#8e8e8e' }}>{data.niche}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    <QuickStat label="Followers" value={formatFollowers(data.total_followers)} color={accentColor} />
                    <QuickStat label="Eng. Rate" value={`${data.avg_engagement_rate.toFixed(1)}%`} color="#10b981" />
                    <QuickStat label="Views" value={data.views.toString()} color="#f59e0b" />
                    <QuickStat label="Downloads" value={data.downloads.toString()} color="#8b5cf6" />
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <button onClick={() => setShowShareModal(true)} style={{
                        flex: 1, padding: '12px', background: accentColor, color: '#fff',
                        border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    }}>Share Media Kit</button>
                    <button style={{
                        padding: '12px 16px', background: '#1c1c1e', color: '#fff',
                        border: '1px solid #262626', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    }}>PDF</button>
                </div>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid #262626' }}>
                {(['preview', 'analytics', 'settings'] as Tab[]).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        flex: 1, padding: '12px 0', background: 'transparent', border: 'none',
                        borderBottom: activeTab === tab ? `2px solid ${accentColor}` : '2px solid transparent',
                        fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
                        color: activeTab === tab ? '#fff' : '#8e8e8e', cursor: 'pointer', textTransform: 'capitalize',
                    }}>{tab}</button>
                ))}
            </div>

            <div style={{ padding: '16px' }}>
                {activeTab === 'preview' && <PreviewTab data={data} accentColor={accentColor} />}
                {activeTab === 'analytics' && <AnalyticsTab data={data} accentColor={accentColor} />}
                {activeTab === 'settings' && <SettingsTab data={data} accentColor={accentColor} onUpdate={fetchData} />}
            </div>

            {showShareModal && <ShareModal data={data} accentColor={accentColor} onClose={() => setShowShareModal(false)} />}
        </div>
    );
}

function QuickStat({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div style={{ flex: 1, padding: '10px 8px', background: '#1c1c1e', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 9, color: '#8e8e8e', marginTop: 2 }}>{label}</div>
        </div>
    );
}

function PreviewTab({ data, accentColor }: { data: MediaKitData; accentColor: string }) {
    return (
        <div>
            <div style={{ padding: 16, background: '#1c1c1e', borderRadius: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>About</div>
                <p style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.6, marginBottom: 12 }}>{data.bio || 'No bio yet.'}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {data.specialties.map(s => (
                        <span key={s} style={{ padding: '4px 10px', background: `${accentColor}15`, color: accentColor, borderRadius: 20, fontSize: 11, fontWeight: 500 }}>{s}</span>
                    ))}
                </div>
            </div>

            {data.rates.length > 0 && data.show_rates && (
                <div style={{ padding: 16, background: '#1c1c1e', borderRadius: 12, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Rates</div>
                    {data.rates.map((rate, i) => (
                        <div key={rate.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '12px 0', borderBottom: i < data.rates.length - 1 ? '1px solid #262626' : 'none',
                        }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>{rate.type}</div>
                                <div style={{ fontSize: 11, color: '#8e8e8e' }}>{rate.platform} — {rate.description}</div>
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: accentColor }}>{cents(rate.price_cents)}</div>
                        </div>
                    ))}
                </div>
            )}

            {data.collaborations.length > 0 && (
                <div style={{ padding: 16, background: '#1c1c1e', borderRadius: 12, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Past Collaborations</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {data.collaborations.map(c => (
                            <div key={c.id} style={{ padding: '10px 14px', background: '#262626', borderRadius: 8, textAlign: 'center' }}>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.brand_name}</div>
                                <div style={{ fontSize: 10, color: '#8e8e8e' }}>{c.campaign_type}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {data.featured_content.length > 0 && (
                <div style={{ padding: 16, background: '#1c1c1e', borderRadius: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Featured Content</div>
                    {data.featured_content.map(c => (
                        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #262626' }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>{c.content_type}</div>
                                <div style={{ fontSize: 11, color: '#8e8e8e' }}>{c.platform}</div>
                            </div>
                            <div style={{ fontSize: 12, color: '#8e8e8e' }}>
                                {c.views.toLocaleString()} views
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function AnalyticsTab({ data, accentColor }: { data: MediaKitData; accentColor: string }) {
    return (
        <div>
            <div style={{ padding: 20, background: '#1c1c1e', borderRadius: 12, textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Media Kit Analytics</div>
                <p style={{ fontSize: 13, color: '#8e8e8e' }}>Track who views and downloads your media kit</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {[
                    { label: 'Total Views', value: data.views.toString(), color: accentColor },
                    { label: 'Downloads', value: data.downloads.toString(), color: '#10b981' },
                    { label: 'Engagement', value: `${data.avg_engagement_rate.toFixed(1)}%`, color: '#f59e0b' },
                    { label: 'Reach', value: formatFollowers(data.monthly_reach), color: '#8b5cf6' },
                ].map(s => (
                    <div key={s.label} style={{ padding: 14, background: '#1c1c1e', borderRadius: 10, border: '1px solid #262626' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 11, color: '#8e8e8e', marginTop: 4 }}>{s.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SettingsTab({ data, accentColor, onUpdate }: { data: MediaKitData; accentColor: string; onUpdate: () => void }) {
    const [isPublic, setIsPublic] = useState(data.is_public);
    const [showRates, setShowRates] = useState(data.show_rates);
    const [saving, setSaving] = useState(false);

    const toggleSetting = async (field: 'is_public' | 'show_rates', val: boolean) => {
        if (field === 'is_public') setIsPublic(val);
        else setShowRates(val);
        setSaving(true);
        await api.mediakit.updateMediaKit({ [field]: val });
        setSaving(false);
        onUpdate();
    };

    return (
        <div>
            <div style={{ padding: 16, background: '#1c1c1e', borderRadius: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Public URL</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#262626', borderRadius: 8 }}>
                    <span style={{ fontSize: 13, color: '#8e8e8e', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        valueskins.com{data.public_url}
                    </span>
                    <button onClick={() => navigator.clipboard.writeText(`valueskins.com${data.public_url}`)} style={{
                        padding: '6px 12px', background: accentColor, color: '#fff', border: 'none',
                        borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>Copy</button>
                </div>
            </div>

            <div style={{ padding: 16, background: '#1c1c1e', borderRadius: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Visibility</div>
                <ToggleSetting label="Public Profile" description="Anyone with the link can view your media kit"
                    enabled={isPublic} onToggle={() => toggleSetting('is_public', !isPublic)} accentColor={accentColor} />
                <ToggleSetting label="Show Rates" description="Display your rates to viewers"
                    enabled={showRates} onToggle={() => toggleSetting('show_rates', !showRates)} accentColor={accentColor} />
                {saving && <div style={{ fontSize: 12, color: '#8e8e8e', marginTop: 8 }}>Saving...</div>}
            </div>

            {data.languages.length > 0 && (
                <div style={{ padding: 16, background: '#1c1c1e', borderRadius: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Languages</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {data.languages.map(l => (
                            <span key={l} style={{ padding: '4px 10px', background: '#262626', borderRadius: 20, fontSize: 12 }}>{l}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function ToggleSetting({ label, description, enabled, onToggle, accentColor }: {
    label: string; description: string; enabled: boolean; onToggle: () => void; accentColor: string;
}) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #262626' }}>
            <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: 11, color: '#8e8e8e' }}>{description}</div>
            </div>
            <button onClick={onToggle} style={{
                width: 44, height: 24, borderRadius: 12,
                background: enabled ? accentColor : '#262626',
                border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
            }}>
                <div style={{
                    position: 'absolute', top: 2, left: enabled ? 22 : 2,
                    width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
                }} />
            </button>
        </div>
    );
}

function ShareModal({ data, accentColor, onClose }: { data: MediaKitData; accentColor: string; onClose: () => void }) {
    const [copied, setCopied] = useState(false);
    const url = `valueskins.com${data.public_url}`;

    const copyLink = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ width: '100%', maxWidth: 400, background: '#1c1c1e', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: 16, borderBottom: '1px solid #262626', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>Share Media Kit</div>
                    <button onClick={onClose} style={{ background: '#262626', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>✕</button>
                </div>
                <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: '#262626', borderRadius: 10, marginBottom: 16 }}>
                        <input type="text" value={url} readOnly style={{ flex: 1, background: 'transparent', border: 'none', fontSize: 13, color: '#8e8e8e', outline: 'none' }} />
                        <button onClick={copyLink} style={{ padding: '8px 16px', background: copied ? '#10b981' : accentColor, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
