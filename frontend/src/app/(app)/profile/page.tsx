'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PlatformLayout from '@/components/PlatformLayout';

interface Highlight {
    id: string;
    name: string;
    icon: string;
    color: string;
}

export default function MyProfilePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'tagged'>('posts');

    // Mock user data
    const profile = {
        username: 'yourprofile',
        name: 'Your Name',
        bio: 'Creator on Valueskins\nJoin the future of creator economy',
        profession: 'Creator',
        professionIcon: '🎨',
        level: 3,
        followers: '5.2K',
        following: '342',
        posts: 24,
        verified: false,
        highlights: [
            { id: '1', name: 'Valueskins', icon: '🎨', color: '#8b5cf6' },
            { id: '2', name: 'collabs', icon: '🤝', color: '#ec4899' },
            { id: '3', name: 'moments', icon: '✨', color: '#06b6d4' },
        ] as Highlight[],
        recentPosts: [
            { id: '1', gradient: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', likes: 124, comments: 12 },
            { id: '2', gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)', likes: 89, comments: 8 },
            { id: '3', gradient: 'linear-gradient(135deg, #ec4899, #f59e0b)', likes: 201, comments: 23 },
            { id: '4', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', likes: 156, comments: 14 },
            { id: '5', gradient: 'linear-gradient(135deg, #0ea5e9, #10b981)', likes: 234, comments: 28 },
            { id: '6', gradient: 'linear-gradient(135deg, #7c3aed, #0ea5e9)', likes: 92, comments: 9 },
        ],
    };

    return (
        <PlatformLayout title={profile.username}>
            {/* ── Profile Header ──────────────── */}
            <div style={{ padding: '16px' }}>
                {/* Username & Menu */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{profile.username}</span>
                    <button style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: 18,
                        cursor: 'pointer',
                        padding: 0,
                    }}>
                        ⋯
                    </button>
                </div>

                {/* Avatar + Stats */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                    {/* Avatar with story ring */}
                    <div style={{
                        width: 88,
                        height: 88,
                        borderRadius: '50%',
                        background: 'conic-gradient(from 0deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #8b5cf6, #0095f6, #f09433)',
                        padding: 2,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: '#0a0a0f',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 36,
                            fontWeight: 700,
                        }}>
                            {profile.name.charAt(0)}
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{
                        display: 'flex',
                        gap: 24,
                        flex: 1,
                        justifyContent: 'space-around',
                    }}>
                        <StatBlock value={profile.posts} label="posts" />
                        <StatBlock value={profile.followers} label="followers" />
                        <StatBlock value={profile.following} label="following" />
                    </div>
                </div>

                {/* Name, Profession Badge & Bio */}
                <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 15, fontWeight: 600 }}>{profile.name}</span>
                        {profile.verified && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#0095f6">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </div>

                    {/* Profession badge */}
                    <div style={{
                        display: 'inline-block',
                        background: 'rgba(139, 92, 246, 0.15)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: 6,
                        padding: '2px 8px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#a855f7',
                        marginBottom: 8,
                    }}>
                        {profile.professionIcon} {profile.profession}
                    </div>

                    {/* Bio */}
                    <p style={{
                        fontSize: 14,
                        color: '#fff',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-line',
                    }}>
                        {profile.bio}
                    </p>
                </div>

                {/* Action Buttons - Owner view */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <button style={{
                        flex: 1,
                        padding: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}>
                        Edit profile
                    </button>
                    <button style={{
                        flex: 1,
                        padding: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}>
                        Share profile
                    </button>
                    <button style={{
                        width: 40,
                        height: 40,
                        padding: 0,
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: 18,
                        cursor: 'pointer',
                    }}>
                        ⋯
                    </button>
                </div>

                {/* Story Highlights */}
                <div style={{
                    display: 'flex',
                    gap: 12,
                    overflowX: 'auto',
                    paddingBottom: 8,
                    marginBottom: 16,
                    scrollBehavior: 'smooth',
                    scrollbarWidth: 'none',
                }}>
                    {profile.highlights.map((highlight) => (
                        <div
                            key={highlight.id}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 4,
                                flexShrink: 0,
                                cursor: 'pointer',
                            }}
                        >
                            <div style={{
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                background: `conic-gradient(${highlight.color}, #333)`,
                                padding: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    background: '#0a0a0f',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 24,
                                }}>
                                    {highlight.icon}
                                </div>
                            </div>
                            <span style={{
                                fontSize: 12,
                                color: '#fff',
                                textAlign: 'center',
                                maxWidth: 60,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {highlight.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Tab Bar ─────────────────── */}
            <div style={{
                display: 'flex',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
                <TabButton
                    active={activeTab === 'posts'}
                    onClick={() => setActiveTab('posts')}
                    icon="⊞"
                    label="Posts"
                />
                <TabButton
                    active={activeTab === 'reels'}
                    onClick={() => setActiveTab('reels')}
                    icon="▶"
                    label="Reels"
                />
                <TabButton
                    active={activeTab === 'tagged'}
                    onClick={() => setActiveTab('tagged')}
                    icon="👤"
                    label="Tagged"
                />
            </div>

            {/* ── Content Grid ─────────────────── */}
            {activeTab === 'posts' ? (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 1,
                }}>
                    {profile.recentPosts.map((post) => (
                        <div
                            key={post.id}
                            style={{
                                aspectRatio: '1 / 1',
                                background: post.gradient,
                                position: 'relative',
                                cursor: 'pointer',
                                overflow: 'hidden',
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '12px 8px',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                                display: 'flex',
                                gap: 12,
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '0';
                            }}
                            >
                                <span style={{ fontSize: 12, color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    ❤️ {post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}K` : post.likes}
                                </span>
                                <span style={{ fontSize: 12, color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    💬 {post.comments}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : activeTab === 'reels' ? (
                <div style={{
                    padding: 16,
                    textAlign: 'center',
                    color: 'var(--ig-text-tertiary)',
                }}>
                    <p style={{ fontSize: 14 }}>No reels yet</p>
                </div>
            ) : (
                <div style={{
                    padding: 16,
                    textAlign: 'center',
                    color: 'var(--ig-text-tertiary)',
                }}>
                    <p style={{ fontSize: 14 }}>No tagged posts</p>
                </div>
            )}
        </PlatformLayout>
    );
}

function StatBlock({ value, label }: { value: string | number; label: string }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{value}</div>
            <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>{label}</div>
        </div>
    );
}

function TabButton({
    active,
    onClick,
    icon,
    label,
}: {
    active: boolean;
    onClick: () => void;
    icon: string;
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
                color: active ? '#fff' : '#a1a1aa',
                borderBottom: active ? '1px solid #fff' : '1px solid transparent',
                fontSize: 12,
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.15s ease',
                letterSpacing: '0.5px',
            }}
        >
            <span>{icon}</span>
            {label}
        </button>
    );
}
