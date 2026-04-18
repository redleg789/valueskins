'use client';

import { useState } from 'react';
import Link from 'next/link';
import PlatformLayout from '@/components/PlatformLayout';

interface Creator {
    id: string;
    username: string;
    name: string;
    profession: string;
    professionIcon: string;
    level: number;
    levelColor: string;
    followers: string;
    engagement: string;
    gradient: string;
    verified: boolean;
}

const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'tech', label: 'Tech' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'art', label: 'Art' },
    { id: 'fitness', label: 'Fitness' },
    { id: 'finance', label: 'Finance' },
    { id: 'medical', label: 'Medical' },
    { id: 'law', label: 'Law' },
];

const CREATORS: Creator[] = [
    {
        id: '1', username: 'techsavvy', name: 'TechSavvy Sam',
        profession: 'Tech Creator', professionIcon: '/badges/circuit-badge.svg',
        level: 5, levelColor: '#f59e0b', followers: '1.2M', engagement: '12%',
        gradient: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', verified: true,
    },
    {
        id: '2', username: 'artbyemma', name: 'Art by Emma',
        profession: 'Art Creator', professionIcon: '/badges/palette-badge.svg',
        level: 4, levelColor: '#a855f7', followers: '340K', engagement: '9.2%',
        gradient: 'linear-gradient(135deg, #ec4899, #f59e0b)', verified: true,
    },
    {
        id: '3', username: 'gamerpro', name: 'GamerPro Alex',
        profession: 'Gaming Creator', professionIcon: '/badges/controller-badge.svg',
        level: 5, levelColor: '#f59e0b', followers: '2.1M', engagement: '14%',
        gradient: 'linear-gradient(135deg, #7c3aed, #0ea5e9)', verified: true,
    },
    {
        id: '4', username: 'fitcoach_m', name: 'FitCoach Mike',
        profession: 'Fitness Creator', professionIcon: '/badges/dumbbell-badge.svg',
        level: 3, levelColor: '#0095f6', followers: '80K', engagement: '6.8%',
        gradient: 'linear-gradient(135deg, #ef4444, #f59e0b)', verified: false,
    },
    {
        id: '5', username: 'lawwithlee', name: 'Law With Lee',
        profession: 'Law Creator', professionIcon: '/badges/scales-badge.svg',
        level: 2, levelColor: '#58c322', followers: '45K', engagement: '4.5%',
        gradient: 'linear-gradient(135deg, #6366f1, #0ea5e9)', verified: false,
    },
    {
        id: '6', username: 'financeking', name: 'Finance King',
        profession: 'Finance Creator', professionIcon: '/badges/briefcase-badge.svg',
        level: 4, levelColor: '#a855f7', followers: '560K', engagement: '8.1%',
        gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', verified: true,
    },
    {
        id: '7', username: 'medtok', name: 'Dr. MedTok',
        profession: 'Medical Creator', professionIcon: '/badges/caduceus-badge.svg',
        level: 3, levelColor: '#0095f6', followers: '120K', engagement: '7.2%',
        gradient: 'linear-gradient(135deg, #10b981, #0ea5e9)', verified: true,
    },
    {
        id: '8', username: 'dailyvlogs', name: 'DailyVlogs',
        profession: 'Content Creator', professionIcon: '/badges/camera-badge.svg',
        level: 2, levelColor: '#58c322', followers: '28K', engagement: '3.5%',
        gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)', verified: false,
    },
    {
        id: '9', username: 'sketchqueen', name: 'SketchQueen',
        profession: 'Art Creator', professionIcon: '/badges/palette-badge.svg',
        level: 3, levelColor: '#0095f6', followers: '95K', engagement: '8.8%',
        gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)', verified: false,
    },
];

export default function ExplorePage() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const filtered = CREATORS.filter(c => {
        const matchesSearch = search === '' ||
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.username.toLowerCase().includes(search.toLowerCase()) ||
            c.profession.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === 'all' ||
            c.profession.toLowerCase().includes(activeCategory);
        return matchesSearch && matchesCategory;
    });

    return (
        <PlatformLayout title="Explore" hideHeader>
            {/* ── Search Bar ──────────────── */}
            <div style={{ padding: '8px 12px', position: 'sticky', top: 0, background: 'var(--ig-bg)', zIndex: 40 }}>
                <div style={{ position: 'relative' }}>
                    <svg
                        width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="var(--ig-text-tertiary)" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"
                        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                    >
                        <circle cx="11" cy="11" r="7" />
                        <line x1="16.65" y1="16.65" x2="21" y2="21" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search creators"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-search"
                        style={{ height: 36 }}
                    />
                </div>
            </div>

            {/* ── Category Chips ───────────── */}
            <div style={{
                padding: '4px 12px 12px',
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                scrollbarWidth: 'none',
            }}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`chip ${activeCategory === cat.id ? 'chip-active' : 'chip-inactive'}`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* ── Grid (Instagram Explore style) ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 2,
                padding: '0 1px',
            }}>
                {filtered.map((creator, i) => (
                    <ExploreGridItem key={creator.id} creator={creator} index={i} />
                ))}
            </div>

            {filtered.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: 'var(--ig-text-tertiary)',
                }}>
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--ig-separator-light)" strokeWidth="1.5" style={{ margin: '0 auto 12px' }}>
                        <circle cx="11" cy="11" r="7" />
                        <line x1="16.65" y1="16.65" x2="21" y2="21" />
                    </svg>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>No creators found</p>
                    <p style={{ fontSize: 13, marginTop: 4 }}>Try a different search or category</p>
                </div>
            )}
        </PlatformLayout>
    );
}

function ExploreGridItem({ creator, index }: { creator: Creator; index: number }) {
    const isLarge = index % 9 === 0 || index % 9 === 4;

    return (
        <Link
            href={`/profile/${creator.username}`}
            style={{
                gridColumn: isLarge ? 'span 2' : 'span 1',
                gridRow: isLarge ? 'span 2' : 'span 1',
                aspectRatio: '1',
                position: 'relative',
                overflow: 'hidden',
                background: creator.gradient,
                animation: `fadeIn 0.2s ease-out ${index * 0.03}s both`,
            }}
        >
            {/* Creator Info Overlay */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: isLarge ? '40px 12px 10px' : '30px 8px 6px',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{
                        fontSize: isLarge ? 13 : 11,
                        fontWeight: 600,
                        color: '#fff',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                        {creator.username}
                    </span>
                    {creator.verified && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#0095f6">
                            <path d="M12 2L14.09 4.26L17 3L17.28 6L20.28 6.72L19.28 9.64L22 11.5L20 14L22 16.5L19.28 18.36L20.28 21.28L17.28 22L17 25L14.09 23.74L12 26L9.91 23.74L7 25L6.72 22L3.72 21.28L4.72 18.36L2 16.5L4 14L2 11.5L4.72 9.64L3.72 6.72L6.72 6L7 3L9.91 4.26L12 2Z" />
                            <path d="M10 14.5L7.5 12L6.5 13L10 16.5L18 8.5L17 7.5L10 14.5Z" fill="white" />
                        </svg>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: creator.levelColor,
                        flexShrink: 0,
                    }} />
                    <span style={{
                        fontSize: isLarge ? 11 : 9,
                        color: 'rgba(255,255,255,0.75)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                        L{creator.level} {creator.profession.replace(' Creator', '')}
                    </span>
                </div>
            </div>

            {/* Top-right badge */}
            <div style={{
                position: 'absolute',
                top: isLarge ? 10 : 6,
                right: isLarge ? 10 : 6,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(8px)',
                borderRadius: 12,
                padding: '3px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
            }}>
                <span style={{ fontSize: isLarge ? 11 : 9, color: '#fff', fontWeight: 600 }}>
                    {creator.followers}
                </span>
            </div>
        </Link>
    );
}
