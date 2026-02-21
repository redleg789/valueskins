'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const navItems = [
        { href: '/admin/analytics', label: 'Analytics' },
        { href: '/admin/users', label: 'User Management' },
        { href: '/admin/brands', label: 'Brand Verification' },
        { href: '/admin/payouts', label: 'Payout Ledger' },
        { href: '/admin/disputes', label: 'Dispute Resolution' },
        { href: '/admin/gdpr', label: 'GDPR Deletions' },
        { href: '/admin/interest', label: 'Creator Interest' },
        { href: '/admin/level-config', label: 'Level Config' },
        { href: '/admin/csuite-settings', label: 'C-Suite Settings' },
        { href: '/admin/rate-limits', label: 'Rate Limits' },
        { href: '/admin/settings', label: 'Platform Settings' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', display: 'flex' }}>
            {/* Sidebar */}
            <div style={{ width: '220px', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem 1rem', flexShrink: 0 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', background: 'linear-gradient(135deg, #8b5cf6, #EF4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    VS Admin
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {navItems.map(item => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    padding: '0.6rem 0.75rem',
                                    borderRadius: '6px',
                                    background: isActive ? 'rgba(239, 68, 68, 0.12)' : 'transparent',
                                    color: isActive ? '#EF4444' : '#a1a1aa',
                                    textDecoration: 'none',
                                    fontSize: '0.85rem',
                                    fontWeight: isActive ? 600 : 400,
                                    transition: 'all 0.2s',
                                    borderLeft: isActive ? '2px solid #EF4444' : '2px solid transparent',
                                }}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                {children}
            </div>
        </div>
    );
}
