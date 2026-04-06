'use client';

import { ReactNode } from 'react';
import { usePlatform } from '@/lib/context';
import InstagramLayout from './InstagramLayout';
import LinkedInLayout from './LinkedInLayout';
import YouTubeLayout from './YouTubeLayout';

/*
 * UNIFIED PLATFORM LAYOUT
 * ─────────────────────────────────────────────────────────────────────────
 * This component automatically switches between platform-specific layouts
 * based on the user's selected platform (stored in context/localStorage).
 *
 * - Meta/Instagram: Dark mode, Instagram-style bottom nav
 * - LinkedIn: Light mode, professional minimalist design
 * - YouTube: Dark mode with red accents, video-first design
 * - Across: Uses Instagram layout with multi-platform badge
 *
 * PATENT ANGLE: The same Valueskins marketplace adapts its entire visual
 * identity to match the platform it's being sold to. A single codebase
 * can demo to Meta, LinkedIn, or YouTube by changing one context value.
 */

interface PlatformLayoutProps {
    children: ReactNode;
    title?: string;
    headerRight?: ReactNode;
    hideHeader?: boolean;
}

export default function PlatformLayout({
    children,
    title,
    headerRight,
    hideHeader,
}: PlatformLayoutProps) {
    const { activePlatform } = usePlatform();

    switch (activePlatform) {
        case 'linkedin':
            return (
                <LinkedInLayout
                    title={title}
                    headerRight={headerRight}
                    hideHeader={hideHeader}
                >
                    {children}
                </LinkedInLayout>
            );

        case 'youtube':
        case 'twitch':
            return (
                <YouTubeLayout
                    title={title}
                    headerRight={headerRight}
                    hideHeader={hideHeader}
                >
                    {children}
                </YouTubeLayout>
            );

        case 'meta':
        case 'across':
        default:
            return (
                <InstagramLayout
                    title={title}
                    headerRight={headerRight}
                    hideHeader={hideHeader}
                >
                    {children}
                </InstagramLayout>
            );
    }
}
