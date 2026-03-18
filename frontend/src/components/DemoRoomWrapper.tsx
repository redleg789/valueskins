'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import InstagramDemoPage from '@/app/demo/instagram/page';

const C = {
  primary: '#0095F6',
  bg: '#000000',
  text: '#F5F5F5',
  textSecondary: '#A8A8A8',
  border: '#262626',
  borderLight: '#363636',
  card: '#1A1A1A',
  danger: '#ED4956',
};

export default function DemoRoomWrapper() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('room');
  const [selectedRole, setSelectedRole] = useState<'brand' | 'creator' | null>(null);
  const [userHandle, setUserHandle] = useState('');
  const [roomReady, setRoomReady] = useState(false);

  useEffect(() => {
    // If no room param, go straight to single-player mode
    if (!roomId) {
      setRoomReady(true);
      return;
    }

    // Room mode: wait for role selection
    if (selectedRole && userHandle) {
      setRoomReady(true);
    }
  }, [roomId, selectedRole, userHandle]);

  // Single-player mode (no ?room= param)
  if (!roomId) {
    return <InstagramDemoPage roomId={null} userRole={null} userHandle="" firebaseReady={true} />;
  }

  // Multiplayer mode: show role selection screen until ready
  if (!roomReady) {
    return (
      <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '500px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: C.text, marginBottom: '8px' }}>ValueSkins MVP</h1>
            <p style={{ fontSize: '14px', color: C.textSecondary }}>Room: <code style={{ fontSize: '12px', background: C.card, padding: '4px 8px', borderRadius: '4px', color: C.primary }}>{roomId}</code></p>
            <p style={{ fontSize: '14px', color: C.textSecondary, marginTop: '12px' }}>Select your role to join this session</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {/* Brand Role */}
            <div
              onClick={() => setSelectedRole('brand')}
              style={{
                padding: '24px',
                background: selectedRole === 'brand' ? 'rgba(0,149,246,0.1)' : C.card,
                border: `2px solid ${selectedRole === 'brand' ? C.primary : C.border}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { if (selectedRole !== 'brand') e.currentTarget.style.borderColor = C.borderLight; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = selectedRole === 'brand' ? C.primary : C.border; }}
            >
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>🏢</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: C.text, marginBottom: '4px' }}>Brand</div>
              <div style={{ fontSize: '12px', color: C.textSecondary, marginBottom: '12px' }}>Create campaigns, find creators</div>
              {selectedRole === 'brand' && (
                <input
                  autoFocus
                  placeholder="Your brand handle"
                  value={userHandle}
                  onChange={(e) => setUserHandle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: '6px',
                    color: C.text,
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              )}
            </div>

            {/* Creator Role */}
            <div
              onClick={() => setSelectedRole('creator')}
              style={{
                padding: '24px',
                background: selectedRole === 'creator' ? 'rgba(0,149,246,0.1)' : C.card,
                border: `2px solid ${selectedRole === 'creator' ? C.primary : C.border}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { if (selectedRole !== 'creator') e.currentTarget.style.borderColor = C.borderLight; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = selectedRole === 'creator' ? C.primary : C.border; }}
            >
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>👤</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: C.text, marginBottom: '4px' }}>Creator</div>
              <div style={{ fontSize: '12px', color: C.textSecondary, marginBottom: '12px' }}>Browse deals, collaborate</div>
              {selectedRole === 'creator' && (
                <input
                  autoFocus
                  placeholder="Your creator handle"
                  value={userHandle}
                  onChange={(e) => setUserHandle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: '6px',
                    color: C.text,
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              )}
            </div>
          </div>

          {selectedRole && userHandle && (
            <button
              onClick={() => setRoomReady(true)}
              style={{
                width: '100%',
                padding: '12px',
                background: C.primary,
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Join as {selectedRole === 'brand' ? '🏢 Brand' : '👤 Creator'}
            </button>
          )}

          <div style={{ marginTop: '24px', padding: '12px', background: C.card, borderRadius: '8px', fontSize: '12px', color: C.textSecondary, lineHeight: 1.5 }}>
            <strong>How it works:</strong><br/>
            1. Brand creates campaigns<br/>
            2. Creators see real-time notifications<br/>
            3. Both can chat, negotiate, and finalize deals<br/>
            <br/>
            Share this room URL with a friend to test multiplayer!
          </div>
        </div>
      </div>
    );
  }

  // Multiplayer mode: render with room sync enabled
  return <InstagramDemoPage roomId={roomId} userRole={selectedRole} userHandle={userHandle} firebaseReady={true} />;
}
