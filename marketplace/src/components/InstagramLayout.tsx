'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePlatform } from '@/lib/context';

interface InstagramLayoutProps {
    children: ReactNode;
    title?: string;
    headerRight?: ReactNode;
    hideHeader?: boolean;
}

export default function InstagramLayout({ children, title, headerRight, hideHeader }: InstagramLayoutProps) {
    const pathname = usePathname();
    const { activePlatform } = usePlatform();

    return (
        <div style={{
            background: 'var(--ig-bg)',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '470px',
                background: 'var(--ig-bg)',
                position: 'relative',
                minHeight: '100vh',
            }}>
                {/* ── Header ──────────────────── */}
                {!hideHeader && (
                    <header style={{
                        height: 44,
                        borderBottom: '0.5px solid var(--ig-separator)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'sticky',
                        top: 0,
                        background: 'rgba(0, 0, 0, 0.85)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        zIndex: 50,
                        padding: '0 16px',
                    }}>
                        <span style={{
                            fontWeight: 600,
                            fontSize: 16,
                            letterSpacing: '-0.2px',
                            color: 'var(--ig-text-primary)',
                        }}>
                            {title || 'Valueskins'}
                        </span>
                        {headerRight && (
                            <div style={{ position: 'absolute', right: 16, display: 'flex', gap: 16 }}>
                                {headerRight}
                            </div>
                        )}
                    </header>
                )}

                {/* ── Content ─────────────────── */}
                <main style={{
                    paddingBottom: 56,
                    minHeight: hideHeader ? '100vh' : 'calc(100vh - 44px)',
                }}>
                    {children}
                </main>

                {/* ── Bottom Navigation ────────── */}
                <nav style={{
                    position: 'fixed',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    maxWidth: 470,
                    height: 48,
                    background: 'rgba(0, 0, 0, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderTop: '0.5px solid var(--ig-separator)',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    zIndex: 50,
                    padding: '0 4px',
                }}>
                    <NavItem href="/feed" active={pathname === '/feed'} label="Home">
                        <HomeIcon filled={pathname === '/feed'} />
                    </NavItem>
                    <NavItem href="/explore" active={pathname === '/explore'} label="Explore">
                        <SearchIcon filled={pathname === '/explore'} />
                    </NavItem>
                    <NavItem href="/store" active={pathname === '/store'} label="Store">
                        <StoreIcon filled={pathname === '/store'} />
                    </NavItem>
                    <NavItem href="/marketplace" active={pathname === '/marketplace'} label="Deals" badge={activePlatform === 'across' ? '🌐' : undefined}>
                        <MarketplaceIcon filled={pathname === '/marketplace'} />
                    </NavItem>
                    <NavItem href="/profile/me" active={pathname.startsWith('/profile')} label="Profile">
                        <ProfileIcon filled={pathname.startsWith('/profile')} />
                    </NavItem>
                </nav>
            </div>
        </div>
    );
}

function NavItem({ href, active, label, children, badge }: {
    href: string;
    active: boolean;
    label: string;
    children: ReactNode;
    badge?: string;
}) {
    return (
        <Link
            href={href}
            aria-label={label}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                opacity: active ? 1 : 0.6,
                transition: 'opacity 0.15s ease',
                position: 'relative',
            }}
        >
            {children}
            {badge && (
                <div style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    fontSize: 12,
                    background: '#8b5cf6',
                    borderRadius: '50%',
                    width: 18,
                    height: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {badge}
                </div>
            )}
        </Link>
    );
}

/* ── SVG Nav Icons (Instagram-style) ──────── */

function HomeIcon({ filled }: { filled: boolean }) {
    if (filled) {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997A2.997 2.997 0 0 1 15 16.545V22H8.995V16.545h.01ZM22 10.5V22h-4.995v-5.455A5.005 5.005 0 0 0 12.002 11.5a4.997 4.997 0 0 0-4.995 4.995V22H2V10.5l10-8.5 10 8.5Z" />
            </svg>
        );
    }
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997A2.997 2.997 0 0 1 15 16.545V22H8.995V16.545h.01ZM22 10.5V22h-4.995v-5.455A5.005 5.005 0 0 0 12.002 11.5a4.997 4.997 0 0 0-4.995 4.995V22H2V10.5l10-8.5 10 8.5Z" />
        </svg>
    );
}

function SearchIcon({ filled }: { filled: boolean }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={filled ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.65" y1="16.65" x2="21" y2="21" />
        </svg>
    );
}

function StoreIcon({ filled }: { filled: boolean }) {
    if (filled) {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M18.5 1h-13A2.5 2.5 0 0 0 3 3.5v17A2.5 2.5 0 0 0 5.5 23h13a2.5 2.5 0 0 0 2.5-2.5v-17A2.5 2.5 0 0 0 18.5 1ZM12 16.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Zm3-11h-6a1 1 0 1 1 0-2h6a1 1 0 1 1 0 2Z" />
            </svg>
        );
    }
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="1" width="18" height="22" rx="2.5" />
            <circle cx="12" cy="12" r="4.5" />
            <line x1="9" y1="4.5" x2="15" y2="4.5" />
        </svg>
    );
}

function MarketplaceIcon({ filled }: { filled: boolean }) {
    if (filled) {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M20 6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Zm-8 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM6 9.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm13.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM4 4h16v1H4V4Zm2-2h12v1H6V2Z" />
            </svg>
        );
    }
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="12" cy="12" r="3" />
            <line x1="4" y1="4" x2="20" y2="4" />
            <line x1="6" y1="2" x2="18" y2="2" />
        </svg>
    );
}

function ProfileIcon({ filled }: { filled: boolean }) {
    if (filled) {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <circle cx="12" cy="7" r="4.5" />
                <path d="M3.5 21.5a8.5 8.5 0 0 1 17 0" />
            </svg>
        );
    }
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="7" r="4" />
            <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
        </svg>
    );
}
