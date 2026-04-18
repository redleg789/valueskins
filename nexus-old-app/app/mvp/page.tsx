'use client';

import Link from 'next/link';

const PLATFORMS = [
  { name: 'Instagram', href: '/demo/instagram', accent: '#e1306c', desc: 'Meta-style creator workflow' },
  { name: 'YouTube', href: '/demo/youtube', accent: '#ff0000', desc: 'Long-form creator marketplace' },
  { name: 'TikTok', href: '/demo/tiktok', accent: '#25f4ee', desc: 'Short-form deal flow' },
  { name: 'LinkedIn', href: '/demo/linkedin', accent: '#0a66c2', desc: 'Professional creator commerce' },
];

export default function MvpPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0b0b0f', color: '#f4f4f5', padding: '28px 20px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>ValueSkins MVP</h1>
        <p style={{ marginTop: 8, color: '#a1a1aa', fontSize: 15 }}>Choose a platform demo.</p>
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {PLATFORMS.map((platform) => (
            <Link key={platform.name} href={platform.href} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#16161d', border: `1px solid ${platform.accent}55`, borderRadius: 14, padding: 14 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{platform.name}</div>
                <div style={{ marginTop: 6, fontSize: 13, color: '#b4b4bd' }}>{platform.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
