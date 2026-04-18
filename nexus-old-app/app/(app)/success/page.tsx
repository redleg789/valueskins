'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PlatformLayout from '@/components/PlatformLayout';

/*
 * PATENT-RELEVANT: Blockchain Abstraction via Custodial Credential Minting
 * ---------------------------------------------------------------------------
 * What the user sees: "You got your sticker! Go to Marketplace."
 * What actually happens in production:
 *   1. Stripe webhook confirms payment
 *   2. Database row inserted INSTANTLY (user_stickers table)
 *   3. Marketplace access granted INSTANTLY (no blockchain wait)
 *   4. Background job mints ERC-721 NFT on user's custodial wallet
 *   5. NFT token ID stored back in user_stickers when confirmed
 *   6. User can later "export" NFT to personal wallet if they want
 *
 * The user NEVER sees steps 4-6. They think they bought a sticker.
 * The blockchain provides immutable ownership proof, but the UX is web2.
 *
 * PATENT CLAIM: A method for granting instant access to a gated platform
 * upon payment confirmation via a first data store, while asynchronously
 * minting a blockchain-based credential on a custodial wallet, wherein
 * said credential can be subsequently exported to a user-controlled wallet.
 */

interface StickerData {
    id: string;
    name: string;
    subtitle: string;
    badge: string;
    gradientFrom: string;
    gradientTo: string;
}

const PROFESSION_DATA: Record<string, StickerData> = {
    general: { id: 'general', name: 'Content Creator', subtitle: 'General / Lifestyle', badge: '/badges/camera-badge.svg', gradientFrom: '#8b5cf6', gradientTo: '#ec4899' },
    art: { id: 'art', name: 'Art Creator', subtitle: 'Art & Design', badge: '/badges/palette-badge.svg', gradientFrom: '#ec4899', gradientTo: '#f43f5e' },
    law: { id: 'law', name: 'Law Creator', subtitle: 'Legal Education', badge: '/badges/scales-badge.svg', gradientFrom: '#6366f1', gradientTo: '#0ea5e9' },
    medical: { id: 'medical', name: 'Medical Creator', subtitle: 'Health & Wellness', badge: '/badges/caduceus-badge.svg', gradientFrom: '#10b981', gradientTo: '#0ea5e9' },
    gaming: { id: 'gaming', name: 'Gaming Creator', subtitle: 'Gaming & Esports', badge: '/badges/controller-badge.svg', gradientFrom: '#7c3aed', gradientTo: '#8b5cf6' },
    tech: { id: 'tech', name: 'Tech Creator', subtitle: 'Technology & Dev', badge: '/badges/circuit-badge.svg', gradientFrom: '#0ea5e9', gradientTo: '#8b5cf6' },
    finance: { id: 'finance', name: 'Finance Creator', subtitle: 'Business & Finance', badge: '/badges/briefcase-badge.svg', gradientFrom: '#f59e0b', gradientTo: '#ef4444' },
    fitness: { id: 'fitness', name: 'Fitness Creator', subtitle: 'Fitness & Wellness', badge: '/badges/dumbbell-badge.svg', gradientFrom: '#ef4444', gradientTo: '#ec4899' },
};

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const professionId = searchParams.get('profession') || 'general';
    const [sticker, setSticker] = useState<StickerData | null>(null);
    const [step, setStep] = useState(0); // 0=loading, 1=reveal, 2=ready

    useEffect(() => {
        const s = PROFESSION_DATA[professionId] || PROFESSION_DATA.general;
        // Staged reveal animation
        setTimeout(() => { setSticker(s); setStep(1); }, 400);
        setTimeout(() => setStep(2), 1200);
    }, [professionId]);

    if (step === 0) {
        return (
            <PlatformLayout title="Processing">
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 'calc(100vh - 100px)',
                    gap: 16,
                }}>
                    <div className="spinner" style={{ width: 32, height: 32 }} />
                    <span style={{ fontSize: 14, color: 'var(--ig-text-tertiary)' }}>
                        Preparing your sticker...
                    </span>
                </div>
            </PlatformLayout>
        );
    }

    return (
        <PlatformLayout title="Welcome">
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                {/* Sticker Reveal */}
                {sticker && (
                    <div style={{
                        animation: 'fadeInScale 0.5s ease-out both',
                        marginBottom: 24,
                    }}>
                        <div style={{
                            width: 120,
                            height: 120,
                            margin: '0 auto',
                            borderRadius: 28,
                            background: `linear-gradient(135deg, ${sticker.gradientFrom}, ${sticker.gradientTo})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 12px 40px ${sticker.gradientFrom}40`,
                            position: 'relative',
                        }}>
                            <img
                                src={sticker.badge}
                                alt=""
                                width={56}
                                height={56}
                                style={{ filter: 'brightness(0) invert(1)' }}
                            />
                            {/* Verified checkmark overlay */}
                            <div style={{
                                position: 'absolute',
                                bottom: -6,
                                right: -6,
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                background: 'var(--ig-green)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '3px solid var(--ig-bg)',
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* Title */}
                <h1 style={{
                    fontSize: 24,
                    fontWeight: 700,
                    marginBottom: 6,
                    animation: step >= 1 ? 'fadeIn 0.3s ease-out 0.2s both' : 'none',
                }}>
                    You&apos;re in.
                </h1>
                <p style={{
                    fontSize: 15,
                    color: 'var(--ig-text-secondary)',
                    marginBottom: 28,
                    animation: step >= 1 ? 'fadeIn 0.3s ease-out 0.3s both' : 'none',
                }}>
                    Your <span style={{ fontWeight: 600, color: 'var(--ig-text-primary)' }}>{sticker?.name}</span> sticker is active
                </p>

                {/* What's unlocked */}
                {step >= 2 && (
                    <div style={{
                        background: 'var(--ig-card)',
                        borderRadius: 14,
                        padding: '18px 16px',
                        marginBottom: 20,
                        textAlign: 'left',
                        animation: 'slideUp 0.4s ease-out both',
                        border: '1px solid var(--ig-separator)',
                    }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: 'var(--ig-text-primary)' }}>
                            What&apos;s unlocked
                        </div>
                        <UnlockItem
                            label="Marketplace Access"
                            detail="Browse and apply to brand deals"
                            color="var(--ig-green)"
                        />
                        <UnlockItem
                            label="AI Matching"
                            detail="Brands find you automatically"
                            color="var(--ig-blue)"
                        />
                        <UnlockItem
                            label="Level System"
                            detail="Grow your level, earn more per deal"
                            color="var(--vs-violet)"
                        />
                        <UnlockItem
                            label="Creator Profile"
                            detail="Verified badge on your profile"
                            color="#f59e0b"
                            isLast
                        />
                    </div>
                )}

                {/* Level explanation — patent-relevant auto-tier migration */}
                {step >= 2 && (
                    <div style={{
                        background: 'var(--ig-card)',
                        borderRadius: 14,
                        padding: '18px 16px',
                        marginBottom: 24,
                        textAlign: 'left',
                        animation: 'slideUp 0.4s ease-out 0.15s both',
                        border: '1px solid var(--ig-separator)',
                    }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--ig-text-primary)' }}>
                            How levels work
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--ig-text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                            Your level is calculated automatically based on your followers, engagement rate, and content authenticity. Higher levels unlock better-paying brand deals.
                        </p>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {[1, 2, 3, 4, 5].map(level => {
                                const colors = ['#a8a8a8', '#58c322', '#0095f6', '#a855f7', '#f59e0b'];
                                const labels = ['1x', '1.5x', '2.5x', '5x', '10x'];
                                return (
                                    <div key={level} style={{
                                        flex: 1,
                                        textAlign: 'center',
                                        padding: '8px 0',
                                        borderRadius: 8,
                                        background: level === 1 ? `${colors[level - 1]}20` : 'var(--ig-elevated)',
                                    }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: colors[level - 1] }}>
                                            {level}
                                        </div>
                                        <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)', marginTop: 2 }}>
                                            {labels[level - 1]}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--ig-text-tertiary)', marginTop: 8, textAlign: 'center' }}>
                            You start at Level 1. Your level updates automatically.
                        </p>
                    </div>
                )}

                {/* CTAs */}
                {step >= 2 && (
                    <div style={{ animation: 'slideUp 0.4s ease-out 0.3s both' }}>
                        <button
                            onClick={() => router.push('/marketplace')}
                            style={{
                                width: '100%',
                                padding: '13px 0',
                                background: 'var(--ig-blue)',
                                color: '#fff',
                                borderRadius: 10,
                                fontSize: 15,
                                fontWeight: 600,
                                marginBottom: 10,
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            Go to Marketplace
                        </button>
                        <button
                            onClick={() => router.push('/feed')}
                            style={{
                                width: '100%',
                                padding: '13px 0',
                                background: 'transparent',
                                color: 'var(--ig-text-secondary)',
                                border: '1px solid var(--ig-separator)',
                                borderRadius: 10,
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Back to Feed
                        </button>
                    </div>
                )}
            </div>
        </PlatformLayout>
    );
}

function LoadingFallback() {
    return (
        <PlatformLayout title="Processing">
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'calc(100vh - 100px)',
                gap: 16,
            }}>
                <div className="spinner" style={{ width: 32, height: 32 }} />
                <span style={{ fontSize: 14, color: 'var(--ig-text-tertiary)' }}>
                    Loading...
                </span>
            </div>
        </PlatformLayout>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <SuccessContent />
        </Suspense>
    );
}

function UnlockItem({ label, detail, color, isLast }: {
    label: string; detail: string; color: string; isLast?: boolean;
}) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            paddingBottom: isLast ? 0 : 12,
            marginBottom: isLast ? 0 : 12,
            borderBottom: isLast ? 'none' : '0.5px solid var(--ig-separator)',
        }}>
            <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: `${color}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={color}>
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
            </div>
            <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)' }}>{detail}</div>
            </div>
        </div>
    );
}
