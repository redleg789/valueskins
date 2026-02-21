'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PlatformLayout from '@/components/PlatformLayout';

interface ProfileData {
    username: string;
    name: string;
    bio: string;
    profession: string;
    professionIcon: string;
    level: number;
    levelColor: string;
    followers: string;
    following: string;
    posts: number;
    engagement: string;
    matchRate: string;
    gradient: string;
    verified: boolean;
    stickers: Sticker[];
    recentPosts: GridPost[];
}

interface Sticker {
    name: string;
    icon: string;
    badge: string;
    level: number;
    color: string;
}

interface GridPost {
    id: string;
    gradient: string;
    likes: number;
    comments: number;
}

const LEVEL_LABELS: Record<number, string> = {
    1: 'Entry',
    2: 'Growing',
    3: 'Established',
    4: 'Influential',
    5: 'Elite',
};

const LEVEL_COLORS: Record<number, string> = {
    1: '#a8a8a8',
    2: '#58c322',
    3: '#0095f6',
    4: '#a855f7',
    5: '#f59e0b',
};

const PROFILES: Record<string, ProfileData> = {
    me: {
        username: 'saketh.v',
        name: 'Saketh Velamuri',
        bio: 'Building Valueskins. Creator economy meets blockchain.',
        profession: 'Tech Creator',
        professionIcon: '/badges/circuit-badge.svg',
        level: 4,
        levelColor: '#a855f7',
        followers: '12.4K',
        following: '890',
        posts: 47,
        engagement: '8.2%',
        matchRate: '92%',
        gradient: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
        verified: true,
        stickers: [
            { name: 'Tech Creator', icon: '/badges/circuit-badge.svg', badge: '/badges/circuit-badge.svg', level: 4, color: '#0ea5e9' },
            { name: 'Finance Creator', icon: '/badges/briefcase-badge.svg', badge: '/badges/briefcase-badge.svg', level: 2, color: '#f59e0b' },
        ],
        recentPosts: [
            { id: '1', gradient: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', likes: 342, comments: 28 },
            { id: '2', gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)', likes: 891, comments: 67 },
            { id: '3', gradient: 'linear-gradient(135deg, #ec4899, #f59e0b)', likes: 1203, comments: 89 },
            { id: '4', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', likes: 567, comments: 34 },
            { id: '5', gradient: 'linear-gradient(135deg, #0ea5e9, #10b981)', likes: 2341, comments: 156 },
            { id: '6', gradient: 'linear-gradient(135deg, #7c3aed, #0ea5e9)', likes: 445, comments: 21 },
        ],
    },
    techsavvy: {
        username: 'techsavvy',
        name: 'TechSavvy Sam',
        bio: 'Tech reviews & dev tutorials. 1M+ community of builders.',
        profession: 'Tech Creator',
        professionIcon: '/badges/circuit-badge.svg',
        level: 5,
        levelColor: '#f59e0b',
        followers: '1.2M',
        following: '340',
        posts: 312,
        engagement: '12%',
        matchRate: '98%',
        gradient: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
        verified: true,
        stickers: [
            { name: 'Tech Creator', icon: '/badges/circuit-badge.svg', badge: '/badges/circuit-badge.svg', level: 5, color: '#0ea5e9' },
        ],
        recentPosts: [
            { id: '1', gradient: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', likes: 12400, comments: 890 },
            { id: '2', gradient: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)', likes: 9800, comments: 567 },
            { id: '3', gradient: 'linear-gradient(135deg, #0ea5e9, #10b981)', likes: 15200, comments: 1023 },
        ],
    },
};

export default function ProfilePage() {
    const params = useParams();
    const id = params.id as string;
    const profile = PROFILES[id] || PROFILES.me;
    const isMe = id === 'me';
    const [activeTab, setActiveTab] = useState<'posts' | 'stickers'>('posts');
    const [isFollowing, setIsFollowing] = useState(false);

    return (
        <PlatformLayout title={profile.username}>
            {/* ── Profile Header ──────────── */}
            <div style={{ padding: '16px 16px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
                    {/* Avatar with story ring */}
                    <div style={{
                        width: 86,
                        height: 86,
                        borderRadius: '50%',
                        background: 'conic-gradient(from 0deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #8b5cf6, #0095f6, #f09433)',
                        padding: 3,
                        flexShrink: 0,
                    }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: 'var(--ig-bg)',
                            padding: 2,
                        }}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                background: profile.gradient,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                            }}>
                                <span style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
                                    L{profile.level}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 0, flex: 1, justifyContent: 'space-around' }}>
                        <StatBlock value={profile.posts.toString()} label="posts" />
                        <StatBlock value={profile.followers} label="followers" />
                        <StatBlock value={profile.following} label="following" />
                    </div>
                </div>

                {/* Name & Bio */}
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{profile.name}</span>
                        {profile.verified && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#0095f6">
                                <path d="M12 2L14.09 4.26L17 3L17.28 6L20.28 6.72L19.28 9.64L22 11.5L20 14L22 16.5L19.28 18.36L20.28 21.28L17.28 22L17 25L14.09 23.74L12 26L9.91 23.74L7 25L6.72 22L3.72 21.28L4.72 18.36L2 16.5L4 14L2 11.5L4.72 9.64L3.72 6.72L6.72 6L7 3L9.91 4.26L12 2Z" />
                                <path d="M10 14.5L7.5 12L6.5 13L10 16.5L18 8.5L17 7.5L10 14.5Z" fill="white" />
                            </svg>
                        )}
                    </div>
                    {/* Profession badge inline */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        background: 'var(--ig-card)',
                        borderRadius: 12,
                        padding: '3px 10px 3px 6px',
                        marginBottom: 6,
                    }}>
                        <img src={profile.professionIcon} alt="" width={14} height={14} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: profile.levelColor }}>
                            {LEVEL_LABELS[profile.level]} {profile.profession}
                        </span>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--ig-text-primary)', lineHeight: 1.4, marginTop: 4 }}>
                        {profile.bio}
                    </p>
                </div>

                {/* Level + Engagement Bar */}
                <div style={{
                    display: 'flex',
                    gap: 8,
                    marginBottom: 16,
                }}>
                    <MiniStat label="Level" value={profile.level.toString()} color={profile.levelColor} />
                    <MiniStat label="Engagement" value={profile.engagement} color="#0095f6" />
                    <MiniStat label="Match Rate" value={profile.matchRate} color="#58c322" />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                    {isMe ? (
                        <>
                            <Link href="/store" style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '7px 0',
                                background: 'var(--ig-card)',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 600,
                            }}>
                                Edit profile
                            </Link>
                            <Link href="/store" style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '7px 0',
                                background: 'var(--ig-card)',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 600,
                            }}>
                                Get Stickers
                            </Link>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsFollowing(!isFollowing)}
                                style={{
                                    flex: 1,
                                    padding: '7px 0',
                                    background: isFollowing ? 'var(--ig-card)' : 'var(--ig-blue)',
                                    color: isFollowing ? 'var(--ig-text-primary)' : '#fff',
                                    borderRadius: 8,
                                    fontSize: 13,
                                    fontWeight: 600,
                                }}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                            <Link href="/marketplace" style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '7px 0',
                                background: 'var(--ig-card)',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 600,
                            }}>
                                Marketplace
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* ── Tab Bar ─────────────────── */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid var(--ig-separator)',
            }}>
                <TabButton
                    active={activeTab === 'posts'}
                    onClick={() => setActiveTab('posts')}
                    icon={
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="1" y="1" width="9" height="9" rx="1" />
                            <rect x="14" y="1" width="9" height="9" rx="1" />
                            <rect x="1" y="14" width="9" height="9" rx="1" />
                            <rect x="14" y="14" width="9" height="9" rx="1" />
                        </svg>
                    }
                    label="Posts"
                />
                <TabButton
                    active={activeTab === 'stickers'}
                    onClick={() => setActiveTab('stickers')}
                    icon={
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L14.09 4.26L17 3L17.28 6L20.28 6.72L19.28 9.64L22 11.5L20 14L22 16.5L19.28 18.36L20.28 21.28L17.28 22L17 25L14.09 23.74L12 26L9.91 23.74L7 25L6.72 22L3.72 21.28L4.72 18.36L2 16.5L4 14L2 11.5L4.72 9.64L3.72 6.72L6.72 6L7 3L9.91 4.26L12 2Z" />
                        </svg>
                    }
                    label="Stickers"
                />
            </div>

            {/* ── Content ─────────────────── */}
            {activeTab === 'posts' ? (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 2,
                }}>
                    {profile.recentPosts.map((post) => (
                        <div
                            key={post.id}
                            style={{
                                aspectRatio: '1',
                                background: post.gradient,
                                position: 'relative',
                                cursor: 'pointer',
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '16px 6px 4px',
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                                display: 'flex',
                                gap: 8,
                                justifyContent: 'center',
                            }}>
                                <span style={{ fontSize: 11, color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                    {post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}K` : post.likes}
                                </span>
                                <span style={{ fontSize: 11, color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" /></svg>
                                    {post.comments}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {profile.stickers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ig-text-tertiary)' }}>
                            <p style={{ fontSize: 14, fontWeight: 600 }}>No stickers yet</p>
                            <p style={{ fontSize: 13, marginTop: 4 }}>Visit the store to get your first sticker</p>
                        </div>
                    ) : (
                        profile.stickers.map((sticker, i) => (
                            <StickerCard key={i} sticker={sticker} />
                        ))
                    )}
                    {isMe && (
                        <Link href="/store" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 14,
                            border: '1.5px dashed var(--ig-separator-light)',
                            borderRadius: 12,
                            color: 'var(--ig-text-tertiary)',
                            fontSize: 14,
                            fontWeight: 600,
                            gap: 8,
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Get More Stickers
                        </Link>
                    )}
                </div>
            )}
        </PlatformLayout>
    );
}

function StatBlock({ value, label }: { value: string; label: string }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{value}</div>
            <div style={{ fontSize: 13, color: 'var(--ig-text-secondary)' }}>{label}</div>
        </div>
    );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div style={{
            flex: 1,
            background: 'var(--ig-card)',
            borderRadius: 10,
            padding: '8px 10px',
            textAlign: 'center',
        }}>
            <div style={{ fontSize: 15, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)', marginTop: 1 }}>{label}</div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '12px 0',
                color: active ? 'var(--ig-text-primary)' : 'var(--ig-text-tertiary)',
                borderBottom: active ? '1px solid var(--ig-text-primary)' : '1px solid transparent',
                fontSize: 12,
                fontWeight: 600,
                transition: 'color 0.15s ease',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
            }}
        >
            {icon}
            {label}
        </button>
    );
}

function StickerCard({ sticker }: { sticker: Sticker }) {
    const levelColor = LEVEL_COLORS[sticker.level] || '#a8a8a8';

    return (
        <div style={{
            background: 'var(--ig-card)',
            borderRadius: 12,
            padding: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            border: '1px solid var(--ig-separator)',
        }}>
            <div style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${sticker.color}44, ${sticker.color})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}>
                <img src={sticker.badge} alt="" width={28} height={28} style={{ filter: 'brightness(0) invert(1)' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{sticker.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginTop: 2 }}>
                    Active sticker
                </div>
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 2,
            }}>
                <div style={{
                    background: `${levelColor}20`,
                    color: levelColor,
                    padding: '3px 10px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                }}>
                    Lvl {sticker.level}
                </div>
                <span style={{ fontSize: 10, color: 'var(--ig-text-tertiary)' }}>
                    {LEVEL_LABELS[sticker.level]}
                </span>
            </div>
        </div>
    );
}
