'use client';

import { useState } from 'react';
import Link from 'next/link';
import PlatformLayout from '@/components/PlatformLayout';

interface Story {
    id: string;
    username: string;
    profession: string;
    level: number;
    hasNew: boolean;
    color: string;
}

interface Post {
    id: string;
    author: string;
    username: string;
    profession: string;
    level: number;
    levelColor: string;
    content: string;
    imageGradient: string;
    likes: number;
    comments: number;
    time: string;
    verified: boolean;
}

const STORIES: Story[] = [
    { id: 'you', username: 'Your story', profession: '', level: 0, hasNew: false, color: '#8b5cf6' },
    { id: '1', username: 'techsavvy', profession: 'Tech', level: 5, hasNew: true, color: '#0ea5e9' },
    { id: '2', username: 'artbyemma', profession: 'Art', level: 4, hasNew: true, color: '#ec4899' },
    { id: '3', username: 'fitcoach_m', profession: 'Fitness', level: 3, hasNew: true, color: '#ef4444' },
    { id: '4', username: 'gamerpro', profession: 'Gaming', level: 5, hasNew: true, color: '#7c3aed' },
    { id: '5', username: 'lawwithlee', profession: 'Law', level: 2, hasNew: true, color: '#6366f1' },
    { id: '6', username: 'medtok', profession: 'Medical', level: 4, hasNew: false, color: '#10b981' },
    { id: '7', username: 'financeguy', profession: 'Finance', level: 3, hasNew: false, color: '#f59e0b' },
];

const POSTS: Post[] = [
    {
        id: '1',
        author: 'TechSavvy Sam',
        username: 'techsavvy',
        profession: 'Tech Creator',
        level: 5,
        levelColor: '#f59e0b',
        content: 'Just got upgraded to Level 5! Brands are now reaching out with 10x rate offers. The Valueskins marketplace is actually changing how creators get paid.',
        imageGradient: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 50%, #ec4899 100%)',
        likes: 1284,
        comments: 89,
        time: '2h',
        verified: true,
    },
    {
        id: '2',
        author: 'Art by Emma',
        username: 'artbyemma',
        profession: 'Art Creator',
        level: 4,
        levelColor: '#a855f7',
        content: 'New commission drop this weekend. My Level 4 badge has brought in 3 brand deals this month alone. If you\'re a creator not using Valueskins yet, you\'re leaving money on the table.',
        imageGradient: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 50%, #ef4444 100%)',
        likes: 842,
        comments: 56,
        time: '4h',
        verified: true,
    },
    {
        id: '3',
        author: 'FitCoach Mike',
        username: 'fitcoach_m',
        profession: 'Fitness Creator',
        level: 3,
        levelColor: '#0095f6',
        content: 'Just matched with a supplement brand on the marketplace paying $2,500 for a single campaign. Level 3 with 80K followers and they found ME. No more cold DMs.',
        imageGradient: 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)',
        likes: 2103,
        comments: 134,
        time: '6h',
        verified: false,
    },
    {
        id: '4',
        author: 'GamerPro Alex',
        username: 'gamerpro',
        profession: 'Gaming Creator',
        level: 5,
        levelColor: '#f59e0b',
        content: 'Tournament season is here and my Level 5 Gaming sticker just got me a $15K esports sponsorship. The AI matching actually understands what brands want.',
        imageGradient: 'linear-gradient(135deg, #7c3aed 0%, #0ea5e9 100%)',
        likes: 3891,
        comments: 201,
        time: '8h',
        verified: true,
    },
];

export default function FeedPage() {
    return (
        <PlatformLayout
            title="Valueskins"
            headerRight={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
                </svg>
            }
        >
            {/* ── Stories Row ───────────────── */}
            <div style={{
                borderBottom: '0.5px solid var(--ig-separator)',
                padding: '12px 0 12px 12px',
            }}>
                <div style={{
                    display: 'flex',
                    gap: 12,
                    overflowX: 'auto',
                    paddingRight: 12,
                    scrollbarWidth: 'none',
                }}>
                    {STORIES.map((story) => (
                        <StoryItem key={story.id} story={story} />
                    ))}
                </div>
            </div>

            {/* ── Posts ────────────────────── */}
            <div>
                {POSTS.map((post, i) => (
                    <PostCard key={post.id} post={post} index={i} />
                ))}
            </div>
        </PlatformLayout>
    );
}

function StoryItem({ story }: { story: Story }) {
    const isYou = story.id === 'you';

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            minWidth: 64,
        }}>
            <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                padding: story.hasNew ? 2.5 : 0,
                background: story.hasNew
                    ? 'conic-gradient(from 0deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #8b5cf6, #0095f6, #f09433)'
                    : 'none',
                border: !story.hasNew && !isYou ? '2px solid var(--ig-separator-light)' : 'none',
                position: 'relative',
            }}>
                <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    padding: story.hasNew ? 2 : 0,
                    background: story.hasNew ? 'var(--ig-bg)' : 'none',
                }}>
                    <div style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${story.color}66, ${story.color})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {isYou ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        ) : (
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
                                L{story.level}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <span style={{
                fontSize: 11,
                color: isYou ? 'var(--ig-text-secondary)' : 'var(--ig-text-primary)',
                maxWidth: 64,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'center',
            }}>
                {story.username}
            </span>
        </div>
    );
}

function PostCard({ post, index }: { post: Post; index: number }) {
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const likeCount = liked ? post.likes + 1 : post.likes;

    return (
        <article style={{
            borderBottom: '0.5px solid var(--ig-separator)',
            animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
        }}>
            {/* ── Post Header ─────── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 12px',
                gap: 10,
            }}>
                <Link href={`/profile/${post.username}`}>
                    <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${post.levelColor}88, ${post.levelColor})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>
                            L{post.level}
                        </span>
                    </div>
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Link href={`/profile/${post.username}`}>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{post.username}</span>
                        </Link>
                        {post.verified && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#0095f6">
                                <path d="M12 2L14.09 4.26L17 3L17.28 6L20.28 6.72L19.28 9.64L22 11.5L20 14L22 16.5L19.28 18.36L20.28 21.28L17.28 22L17 25L14.09 23.74L12 26L9.91 23.74L7 25L6.72 22L3.72 21.28L4.72 18.36L2 16.5L4 14L2 11.5L4.72 9.64L3.72 6.72L6.72 6L7 3L9.91 4.26L12 2Z" />
                                <path d="M10 14.5L7.5 12L6.5 13L10 16.5L18 8.5L17 7.5L10 14.5Z" fill="white" />
                            </svg>
                        )}
                    </div>
                    <span style={{
                        fontSize: 11,
                        color: 'var(--ig-text-tertiary)',
                        fontWeight: 500,
                    }}>
                        {post.profession}
                    </span>
                </div>
                <button style={{ padding: 8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                    </svg>
                </button>
            </div>

            {/* ── Post Image ──────── */}
            <div style={{
                width: '100%',
                aspectRatio: '4/5',
                background: post.imageGradient,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {/* Level badge overlay */}
                <div style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(10px)',
                    padding: '6px 12px',
                    borderRadius: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                }}>
                    <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: post.levelColor,
                    }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>
                        Level {post.level}
                    </span>
                </div>

                {/* Content text overlay */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '60px 20px 20px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                }}>
                    <p style={{
                        fontSize: 15,
                        lineHeight: 1.5,
                        color: '#fff',
                        fontWeight: 400,
                    }}>
                        {post.content}
                    </p>
                </div>
            </div>

            {/* ── Post Actions ─────── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 12px',
                gap: 14,
            }}>
                <button onClick={() => setLiked(!liked)} style={{ padding: 0 }}>
                    {liked ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#ed4956" style={{ animation: 'heartBeat 0.4s ease' }}>
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    )}
                </button>
                <button style={{ padding: 0 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
                    </svg>
                </button>
                <button style={{ padding: 0 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
                <div style={{ flex: 1 }} />
                <button onClick={() => setSaved(!saved)} style={{ padding: 0 }}>
                    {saved ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M5 2h14a1 1 0 0 1 1 1v19.143a.5.5 0 0 1-.766.424L12 18.03l-7.234 4.536A.5.5 0 0 1 4 22.143V3a1 1 0 0 1 1-1Z" />
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round">
                            <path d="M5 2h14a1 1 0 0 1 1 1v19.143a.5.5 0 0 1-.766.424L12 18.03l-7.234 4.536A.5.5 0 0 1 4 22.143V3a1 1 0 0 1 1-1Z" />
                        </svg>
                    )}
                </button>
            </div>

            {/* ── Like Count ──────── */}
            <div style={{ padding: '0 12px 4px' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {likeCount.toLocaleString()} likes
                </span>
            </div>

            {/* ── Caption ─────────── */}
            <div style={{ padding: '0 12px 4px' }}>
                <span style={{ fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>{post.username}</span>{' '}
                    <span style={{ color: 'var(--ig-text-secondary)' }}>
                        {post.content.substring(0, 80)}...
                    </span>
                </span>
            </div>

            {/* ── Comments Link ───── */}
            <div style={{ padding: '0 12px' }}>
                <span style={{ fontSize: 13, color: 'var(--ig-text-tertiary)' }}>
                    View all {post.comments} comments
                </span>
            </div>

            {/* ── Timestamp ──────── */}
            <div style={{ padding: '4px 12px 12px' }}>
                <span style={{
                    fontSize: 10,
                    color: 'var(--ig-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                }}>
                    {post.time} ago
                </span>
            </div>
        </article>
    );
}
