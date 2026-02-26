'use client';

import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

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
                <h2 style={{ marginBottom: '0.5rem' }}>Welcome to Valueskins</h2>
                <p style={{ color: '#888', marginBottom: '2rem' }}>Professional identity for creators</p>

                <button
                    className="btn-primary"
                    onClick={() => router.push('/demo/instagram')}
                    style={{ width: '100%' }}
                >
                    Enter Demo
                </button>

                <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
                    New to Valueskins? <a href="/demo/instagram" style={{ color: 'var(--primary)' }}>Create an identity</a>
                </p>
            </div>
        </div>
    );
}
