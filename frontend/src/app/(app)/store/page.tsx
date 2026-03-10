'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PlatformLayout from '@/components/PlatformLayout';
import { getTrendingProfessions } from '@/lib/professions';
import { api } from '@/lib/api';

/*
 * PATENT-RELEVANT: Credential-Gated Marketplace System
 * ---------------------------------------------------------------------------
 * Each "sticker" is a TRIPLE-FUNCTION credential:
 *   1. IDENTITY — declares the creator's professional category
 *   2. ACCESS GATE — unlocks the MIM (Marketplace Inside Marketplace)
 *   3. AI WEIGHT — the sticker type feeds into the matching algorithm,
 *      biasing match results toward relevant brands for that profession
 *
 * This triple-function credential is the core patentable artifact.
 * A regular paywall just gates access. A regular profile just declares identity.
 * This does both AND feeds the AI — that combination is novel.
 */

interface Profession {
    id: string;
    name: string;
    subtitle: string;
    badge: string;
    price: string;
    priceNote: string;
    description: string;
    perks: string[];
    gradientFrom: string;
    gradientTo: string;
    activeBrands: number;
    avgDealSize: string;
    image_uri?: string;
}

const PROFESSIONS: Profession[] = [
    {
        id: 'general', name: 'Content Creator', subtitle: 'General / Lifestyle',
        badge: '/badges/camera-badge.svg', price: '$10', priceNote: 'one-time',
        description: 'For day-in-my-life, lifestyle, and general vlog creators.',
        perks: ['General Brand Deals', 'Lifestyle Sponsorships', 'Creator Analytics'],
        gradientFrom: '#8b5cf6', gradientTo: '#ec4899',
        activeBrands: 142, avgDealSize: '$800',
    },
    {
        id: 'art', name: 'Art Creator', subtitle: 'Art & Design',
        badge: '/badges/palette-badge.svg', price: '$10', priceNote: 'one-time',
        description: 'For artists, designers, and creative content creators.',
        perks: ['Design Collaborations', 'Art Commissions', 'Portfolio Showcase'],
        gradientFrom: '#ec4899', gradientTo: '#f43f5e',
        activeBrands: 87, avgDealSize: '$1,200',
    },
    {
        id: 'law', name: 'Law Creator', subtitle: 'Legal Education',
        badge: '/badges/scales-badge.svg', price: '$10', priceNote: 'one-time',
        description: 'For legal educators and law-focused content creators.',
        perks: ['Legal Network', 'Educational Partnerships', 'Expert Opportunities'],
        gradientFrom: '#6366f1', gradientTo: '#0ea5e9',
        activeBrands: 34, avgDealSize: '$2,500',
    },
    {
        id: 'medical', name: 'Medical Creator', subtitle: 'Health & Wellness',
        badge: '/badges/caduceus-badge.svg', price: '$10', priceNote: 'one-time',
        description: 'For medical professionals and health content creators.',
        perks: ['Healthcare Partnerships', 'Medical Network', 'Health Brand Deals'],
        gradientFrom: '#10b981', gradientTo: '#0ea5e9',
        activeBrands: 56, avgDealSize: '$3,000',
    },
    {
        id: 'gaming', name: 'Gaming Creator', subtitle: 'Gaming & Esports',
        badge: '/badges/controller-badge.svg', price: '$10', priceNote: 'one-time',
        description: 'For gamers, streamers, and esports content creators.',
        perks: ['Gaming Sponsorships', 'Tournament Access', 'Brand Partnerships'],
        gradientFrom: '#7c3aed', gradientTo: '#8b5cf6',
        activeBrands: 203, avgDealSize: '$1,500',
    },
    {
        id: 'tech', name: 'Tech Creator', subtitle: 'Technology & Dev',
        badge: '/badges/circuit-badge.svg', price: '$10', priceNote: 'one-time',
        description: 'For tech reviewers, developers, and tech content creators.',
        perks: ['Tech Brand Deals', 'Product Reviews', 'Developer Opportunities'],
        gradientFrom: '#0ea5e9', gradientTo: '#8b5cf6',
        activeBrands: 178, avgDealSize: '$2,000',
    },
    {
        id: 'finance', name: 'Finance Creator', subtitle: 'Business & Finance',
        badge: '/badges/briefcase-badge.svg', price: '$10', priceNote: 'one-time',
        description: 'For business, finance, and entrepreneurship content creators.',
        perks: ['Financial Partnerships', 'Business Network', 'Investment Opportunities'],
        gradientFrom: '#f59e0b', gradientTo: '#ef4444',
        activeBrands: 91, avgDealSize: '$2,800',
    },
    {
        id: 'fitness', name: 'Fitness Creator', subtitle: 'Fitness & Wellness',
        badge: '/badges/dumbbell-badge.svg', price: '$10', priceNote: 'one-time',
        description: 'For fitness, wellness, and nutrition content creators.',
        perks: ['Fitness Brand Deals', 'Supplement Partnerships', 'Gym Collaborations'],
        gradientFrom: '#ef4444', gradientTo: '#ec4899',
        activeBrands: 124, avgDealSize: '$1,100',
    },
];

export default function SkinStorePage() {
    const router = useRouter();
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestText, setRequestText] = useState('');
    const [requestSubmitted, setRequestSubmitted] = useState(false);
    const [professions, setProfessions] = useState<any[]>(PROFESSIONS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch professions with images from backend
        const fetchProfessions = async () => {
            try {
                const response = await api.marketplace.getProfessions();
                if (response.data?.professions && Array.isArray(response.data.professions)) {
                    // Map backend professions to frontend format, merging with hardcoded data
                    const merged = PROFESSIONS.map(prof => {
                        const backendProf = response.data!.professions.find((p: any) => p.name === prof.name);
                        return {
                            ...prof,
                            image_uri: backendProf?.image_uri || prof.badge,
                        };
                    });
                    setProfessions(merged);
                }
            } catch (error) {
                console.error('Failed to fetch professions:', error);
                // Fallback to hardcoded professions
                setProfessions(PROFESSIONS);
            } finally {
                setLoading(false);
            }
        };

        fetchProfessions();
    }, []);

    const trending = getTrendingProfessions(4);

    const handlePurchase = (id: string) => {
        setPurchasing(id);
        setTimeout(() => {
            setPurchasing(null);
            router.push(`/success?profession=${id}`);
        }, 1500);
    };

    const handleRequestSubmit = () => {
        if (requestText.trim()) {
            // Mock API call
            setRequestSubmitted(true);
            setTimeout(() => {
                setShowRequestModal(false);
                setRequestText('');
                setRequestSubmitted(false);
            }, 1500);
        }
    };

    return (
        <PlatformLayout title="Sticker Store">
            {/* Header */}
            <div style={{ padding: '20px 16px 8px' }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                    Choose Your Path
                </h1>
                <p style={{ fontSize: 14, color: 'var(--ig-text-secondary)', lineHeight: 1.4 }}>
                    Your sticker unlocks the Marketplace and tells brands who you are. $10, one-time.
                </p>
            </div>

            {/* Active marketplace stats */}
            <div style={{
                display: 'flex',
                gap: 8,
                padding: '12px 16px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
            }}>
                <QuickStat value="915+" label="Active Brands" />
                <QuickStat value="$1.8K" label="Avg Deal" />
                <QuickStat value="12K+" label="Creators" />
            </div>

            {/* PROFESSION DISCOVERY BANNER — trending/scanning UI */}
            <div style={{
                padding: '12px 16px',
                margin: '8px 0',
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    borderRadius: 12,
                    padding: 12,
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            flex: 1,
                        }}>
                            <div style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <span style={{ fontSize: 16 }}>🔍</span>
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                                    Trending This Week
                                </div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                                    AI scanning new profession requests
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trending professions carousel */}
                    <div style={{
                        display: 'flex',
                        gap: 6,
                        overflowX: 'auto',
                        scrollbarWidth: 'none',
                    }}>
                        {trending.map(prof => (
                            <div
                                key={prof.id}
                                style={{
                                    display: 'inline-flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '8px 10px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: 8,
                                    flexShrink: 0,
                                }}
                            >
                                <span style={{ fontSize: 18 }}>{prof.icon}</span>
                                <div style={{ fontSize: 10, textAlign: 'center', color: '#fff', fontWeight: 600 }}>
                                    {prof.name.split(' ')[0]}
                                </div>
                                <div style={{
                                    fontSize: 9,
                                    background: 'rgba(255,255,255,0.2)',
                                    padding: '2px 6px',
                                    borderRadius: 3,
                                    color: '#fff',
                                }}>
                                    +{prof.request_count} req
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Request button */}
                    <button
                        onClick={() => setShowRequestModal(true)}
                        style={{
                            width: '100%',
                            marginTop: 10,
                            padding: '8px 0',
                            background: 'rgba(255,255,255,0.2)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: 8,
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.3)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)';
                        }}
                    >
                        Don't see yours? Request →
                    </button>
                </div>
            </div>

            {/* Profession Cards */}
            <div style={{ padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PROFESSIONS.map((prof, i) => (
                    <ProfessionCard
                        key={prof.id}
                        profession={prof}
                        index={i}
                        expanded={selectedId === prof.id}
                        purchasing={purchasing === prof.id}
                        disabled={!!purchasing && purchasing !== prof.id}
                        onToggle={() => setSelectedId(selectedId === prof.id ? null : prof.id)}
                        onPurchase={() => handlePurchase(prof.id)}
                    />
                ))}
            </div>

            {/* Profession Request Modal */}
            {showRequestModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    zIndex: 1000,
                    animation: 'fadeIn 0.2s ease-out',
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: 480,
                        margin: '0 auto',
                        background: 'var(--ig-card)',
                        borderRadius: '12px 12px 0 0',
                        padding: '20px',
                        animation: 'slideUp 0.3s ease-out',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 16,
                        }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700 }}>
                                Request a Profession
                            </h2>
                            <button
                                onClick={() => setShowRequestModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: 24,
                                    cursor: 'pointer',
                                    color: 'var(--ig-text-tertiary)',
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <p style={{
                            fontSize: 13,
                            color: 'var(--ig-text-secondary)',
                            marginBottom: 16,
                            lineHeight: 1.5,
                        }}>
                            Tell us what profession you'd like to see. Our AI will scan requests and add trending ones within 7 days.
                        </p>

                        <textarea
                            placeholder="E.g., SDE2 at big tech, Product Manager, Content Strategist..."
                            value={requestText}
                            onChange={(e) => setRequestText(e.target.value)}
                            style={{
                                width: '100%',
                                minHeight: 100,
                                padding: 12,
                                background: 'var(--ig-elevated)',
                                border: '1px solid var(--ig-separator)',
                                borderRadius: 8,
                                fontSize: 13,
                                color: 'var(--ig-text-primary)',
                                fontFamily: 'inherit',
                                resize: 'none',
                                marginBottom: 12,
                                outline: 'none',
                            }}
                        />

                        <div style={{
                            display: 'flex',
                            gap: 8,
                        }}>
                            <button
                                onClick={() => setShowRequestModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '12px 0',
                                    background: 'var(--ig-elevated)',
                                    border: '1px solid var(--ig-separator)',
                                    borderRadius: 8,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRequestSubmit}
                                disabled={!requestText.trim() || requestSubmitted}
                                style={{
                                    flex: 1,
                                    padding: '12px 0',
                                    background: requestSubmitted ? 'var(--ig-separator)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: '#fff',
                                    cursor: requestText.trim() ? 'pointer' : 'not-allowed',
                                    opacity: requestText.trim() ? 1 : 0.5,
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {requestSubmitted ? '✓ Submitted' : 'Submit Request'}
                            </button>
                        </div>

                        <p style={{
                            fontSize: 11,
                            color: 'var(--ig-text-tertiary)',
                            marginTop: 12,
                            textAlign: 'center',
                        }}>
                            Requests are reviewed within 7 days. Top requests appear as trending.
                        </p>
                    </div>
                </div>
            )}
        </PlatformLayout>
    );
}

function QuickStat({ value, label }: { value: string; label: string }) {
    return (
        <div style={{
            background: 'var(--ig-card)',
            borderRadius: 10,
            padding: '10px 16px',
            minWidth: 110,
            textAlign: 'center',
            flexShrink: 0,
            border: '1px solid var(--ig-separator)',
        }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--vs-violet)' }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)', marginTop: 2 }}>{label}</div>
        </div>
    );
}

function ProfessionCard({
    profession: p,
    index,
    expanded,
    purchasing,
    disabled,
    onToggle,
    onPurchase,
}: {
    profession: Profession;
    index: number;
    expanded: boolean;
    purchasing: boolean;
    disabled: boolean;
    onToggle: () => void;
    onPurchase: () => void;
}) {
    return (
        <div
            style={{
                background: 'var(--ig-card)',
                borderRadius: 12,
                overflow: 'hidden',
                border: expanded ? `1px solid ${p.gradientFrom}44` : '1px solid var(--ig-separator)',
                transition: 'border-color 0.2s ease',
                animation: `fadeIn 0.25s ease-out ${index * 0.04}s both`,
            }}
        >
            {/* Card Header — tappable */}
            <button
                onClick={onToggle}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 14px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                }}
            >
                {/* Icon circle */}
                <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <img
                        src={p.image_uri || p.badge}
                        alt={p.name}
                        width={26}
                        height={26}
                        style={{ filter: 'brightness(0) invert(1)' }}
                    />
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ig-text-primary)' }}>
                        {p.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginTop: 1 }}>
                        {p.subtitle}
                    </div>
                </div>

                {/* Right side — ValueSkin sticker preview + price */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    {/* ValueSkin sticker preview */}
                    <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(255,255,255,0.2)',
                        overflow: 'hidden',
                    }}>
                        <img
                            src={p.image_uri || p.badge}
                            alt={`${p.name} sticker`}
                            width={28}
                            height={28}
                            style={{ filter: 'brightness(0) invert(1)' }}
                        />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{p.price}</div>
                </div>

                {/* Chevron */}
                <svg
                    width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="var(--ig-text-tertiary)" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{
                        flexShrink: 0,
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                    }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {/* Expanded Content */}
            {expanded && (
                <div style={{
                    padding: '0 14px 14px',
                    animation: 'fadeIn 0.2s ease-out',
                }}>
                    <div style={{
                        height: 0.5,
                        background: 'var(--ig-separator)',
                        marginBottom: 14,
                    }} />

                    <p style={{
                        fontSize: 13,
                        color: 'var(--ig-text-secondary)',
                        lineHeight: 1.5,
                        marginBottom: 12,
                    }}>
                        {p.description}
                    </p>

                    {/* Perks */}
                    <div style={{ marginBottom: 14 }}>
                        {p.perks.map((perk, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 6,
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill={p.gradientFrom}>
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                </svg>
                                <span style={{ fontSize: 13, color: 'var(--ig-text-secondary)' }}>{perk}</span>
                            </div>
                        ))}
                    </div>

                    {/* Marketplace preview stats */}
                    <div style={{
                        display: 'flex',
                        gap: 8,
                        marginBottom: 14,
                    }}>
                        <div style={{
                            flex: 1,
                            background: `${p.gradientFrom}12`,
                            borderRadius: 8,
                            padding: '8px 10px',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: p.gradientFrom }}>
                                {p.activeBrands}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)' }}>
                                Active Brands
                            </div>
                        </div>
                        <div style={{
                            flex: 1,
                            background: `${p.gradientFrom}12`,
                            borderRadius: 8,
                            padding: '8px 10px',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: p.gradientFrom }}>
                                {p.avgDealSize}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)' }}>
                                Avg Deal Size
                            </div>
                        </div>
                    </div>

                    {/* Purchase Button */}
                    <button
                        onClick={onPurchase}
                        disabled={disabled}
                        style={{
                            width: '100%',
                            padding: '12px 0',
                            background: purchasing
                                ? 'var(--ig-separator)'
                                : `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})`,
                            color: purchasing ? 'var(--ig-text-tertiary)' : '#fff',
                            borderRadius: 10,
                            fontSize: 14,
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            opacity: disabled && !purchasing ? 0.4 : 1,
                            transition: 'all 0.15s ease',
                        }}
                    >
                        {purchasing ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                Processing...
                            </span>
                        ) : (
                            `Get ${p.name} Sticker — ${p.price}`
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
