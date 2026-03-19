'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [showBuyModal, setShowBuyModal] = useState(false);

  const platforms = [
    {
      name: 'Instagram',
      description: 'Photo & Video Social Network',
      color: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%)',
      path: '/demo/instagram',
    },
    {
      name: 'LinkedIn',
      description: 'Professional Network',
      color: 'linear-gradient(135deg, #0077b5 0%, #00a0df 100%)',
      path: '/demo/linkedin',
    },
    {
      name: 'YouTube',
      description: 'Video Streaming Platform',
      color: 'linear-gradient(135deg, #ff0000 0%, #ff6b00 100%)',
      path: '/demo/youtube',
    },
    {
      name: 'TikTok',
      description: 'Short-Form Video Platform',
      color: 'linear-gradient(135deg, #000000 0%, #25f4ee 50%, #fe2c55 100%)',
      path: '/demo/tiktok',
    },
  ];

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>
            Valueskins MVP
          </h1>
          <p style={{ fontSize: '18px', color: '#8e8e8e', marginBottom: '24px' }}>
            See how Instagram, LinkedIn & YouTube could integrate Valueskins
          </p>
        </div>

        {/* Platform Cards */}
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>
          Companies That Could Use Valueskins
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '60px',
        }}>
          {platforms.map(platform => (
            <Link key={platform.name} href={platform.path} style={{ textDecoration: 'none' }}>
              <div style={{
                background: platform.color,
                borderRadius: '16px',
                padding: '32px',
                cursor: 'pointer',
                height: '280px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
              >
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {platform.name}
                  </h3>
                  <p style={{ fontSize: '14px', opacity: 0.8 }}>
                    {platform.description}
                  </p>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  Explore →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Features */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          marginBottom: '40px',
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
            Inside Each Platform
          </h2>
          <p style={{ fontSize: '16px', color: '#8e8e8e', marginBottom: '32px' }}>
            Each platform clone has 3 integrated features:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            <div style={{
              background: '#262626',
              padding: '20px',
              borderRadius: '12px',
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Profile</div>
              <div style={{ fontSize: '13px', color: '#8e8e8e' }}>Creator profile with Valueskins level badge</div>
            </div>
            <div style={{
              background: '#262626',
              padding: '20px',
              borderRadius: '12px',
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Marketplace</div>
              <div style={{ fontSize: '13px', color: '#8e8e8e' }}>AI matching brands to creators</div>
            </div>
            <div style={{
              background: '#262626',
              padding: '20px',
              borderRadius: '12px',
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Store</div>
              <div style={{ fontSize: '13px', color: '#8e8e8e' }}>Buy Valueskins badge ($10) with profession</div>
            </div>
          </div>
        </div>

        {/* Admin Config Panel */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            Configuration Panel
          </h2>
          <p style={{ fontSize: '16px', color: '#8e8e8e', marginBottom: '24px' }}>
            Customize level thresholds and reputation factors
          </p>
          <Link href="/admin/level-config" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #7c3aed, #db2777)',
              color: '#fff',
              padding: '12px 32px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              border: 'none',
            }}>
              Open Admin Panel
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
