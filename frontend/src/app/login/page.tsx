'use client';

import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
    const router = useRouter();
    const { connectors, connect, isPending, error } = useConnect();
    const { isConnected, address } = useAccount();
    const { disconnect } = useDisconnect();

    // Redirect to feed when connected
    useEffect(() => {
        if (isConnected) {
            router.push('/feed');
        }
    }, [isConnected, router]);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#050505'
        }}>
            <div className="glass-panel" style={{
                padding: '3rem',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center'
            }}>
                <h2 style={{ marginBottom: '0.5rem' }}>Welcome Back</h2>
                <p style={{ color: '#888', marginBottom: '2rem' }}>Connect your wallet to continue</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {connectors.map((connector) => (
                        <button
                            key={connector.uid}
                            className="btn-primary"
                            onClick={() => connect({ connector })}
                            disabled={isPending}
                            style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {isPending ? 'Connecting...' : connector.name}
                        </button>
                    ))}
                </div>

                {error && (
                    <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#ef4444' }}>
                        {error.message}
                    </p>
                )}

                {isConnected && address && (
                    <div style={{ marginTop: '1.5rem' }}>
                        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem' }}>
                            Connected: {address.slice(0, 6)}...{address.slice(-4)}
                        </p>
                        <button
                            className="btn-glass"
                            onClick={() => disconnect()}
                            style={{ fontSize: '0.85rem' }}
                        >
                            Disconnect
                        </button>
                    </div>
                )}

                <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
                    New to Valueskins? <a href="#" style={{ color: 'var(--primary)' }}>Create an identity</a>
                </p>
            </div>
        </div>
    );
}
