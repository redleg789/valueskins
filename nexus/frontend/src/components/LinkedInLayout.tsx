'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/*
 * LINKEDIN-SPECIFIC LAYOUT
 * Professional, minimalist, light-mode interface
 * Matches LinkedIn's design language for B2B creator marketplace
 */

interface LinkedInLayoutProps {
    children: ReactNode;
    title?: string;
    headerRight?: ReactNode;
    hideHeader?: boolean;
}

export default function LinkedInLayout({ children, title, headerRight, hideHeader }: LinkedInLayoutProps) {
    const pathname = usePathname();

    return (
        <div style={{
            background: '#f3f2ef',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '576px',
                background: '#ffffff',
                position: 'relative',
                minHeight: '100vh',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
            }}>
                {/* ── Header ──────────────────── */}
                {!hideHeader && (
                    <header style={{
                        height: 52,
                        borderBottom: '1px solid #e5e5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        position: 'sticky',
                        top: 0,
                        background: '#ffffff',
                        zIndex: 50,
                        padding: '0 16px',
                    }}>
                        {/* LinkedIn Logo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                width: 34,
                                height: 34,
                                borderRadius: 4,
                                background: '#0a66c2',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>in</span>
                            </div>
                            <span style={{
                                fontWeight: 600,
                                fontSize: 16,
                                color: '#000000',
                            }}>
                                {title || 'Valueskins'}
                            </span>
                        </div>
                        {headerRight && (
                            <div style={{ display: 'flex', gap: 12 }}>
                                {headerRight}
                            </div>
                        )}
                    </header>
                )}

                {/* ── Content ─────────────────── */}
                <main style={{
                    paddingBottom: 60,
                    minHeight: hideHeader ? '100vh' : 'calc(100vh - 52px)',
                    background: '#ffffff',
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
                    maxWidth: 576,
                    height: 56,
                    background: '#ffffff',
                    borderTop: '1px solid #e5e5e1',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    zIndex: 50,
                }}>
                    <NavItem href="/feed" active={pathname === '/feed'} label="Home">
                        <HomeIcon filled={pathname === '/feed'} />
                    </NavItem>
                    <NavItem href="/explore" active={pathname === '/explore'} label="Network">
                        <NetworkIcon filled={pathname === '/explore'} />
                    </NavItem>
                    <NavItem href="/store" active={pathname === '/store'} label="Stickers">
                        <BriefcaseIcon filled={pathname === '/store'} />
                    </NavItem>
                    <NavItem href="/marketplace" active={pathname === '/marketplace'} label="Deals">
                        <DealsIcon filled={pathname === '/marketplace'} />
                    </NavItem>
                    <NavItem href="/profile/me" active={pathname.startsWith('/profile')} label="Me">
                        <ProfileIcon filled={pathname.startsWith('/profile')} />
                    </NavItem>
                </nav>
            </div>
        </div>
    );
}

function NavItem({ href, active, label, children }: {
    href: string;
    active: boolean;
    label: string;
    children: ReactNode;
}) {
    return (
        <Link
            href={href}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 16px',
                textDecoration: 'none',
            }}
        >
            <div style={{ color: active ? '#000000' : '#666666' }}>
                {children}
            </div>
            <span style={{
                fontSize: 10,
                marginTop: 2,
                color: active ? '#000000' : '#666666',
                fontWeight: active ? 600 : 400,
            }}>
                {label}
            </span>
        </Link>
    );
}

/* ── SVG Nav Icons (LinkedIn-style) ──────── */

function HomeIcon({ filled }: { filled: boolean }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.5}>
            <path d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z" />
        </svg>
    );
}

function NetworkIcon({ filled }: { filled: boolean }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.5}>
            <circle cx="12" cy="7" r="3" />
            <circle cx="5" cy="17" r="2.5" />
            <circle cx="19" cy="17" r="2.5" />
            <path d="M12 10V12M12 12L5 14.5M12 12L19 14.5" />
        </svg>
    );
}

function BriefcaseIcon({ filled }: { filled: boolean }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.5}>
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7" />
            <line x1="12" y1="11" x2="12" y2="14" />
        </svg>
    );
}

function DealsIcon({ filled }: { filled: boolean }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.5}>
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <circle cx="12" cy="12" r="3" />
            <circle cx="6" cy="9" r="0.5" fill="currentColor" />
            <circle cx="18" cy="9" r="0.5" fill="currentColor" />
        </svg>
    );
}

function ProfileIcon({ filled }: { filled: boolean }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.5}>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" />
        </svg>
    );
}
