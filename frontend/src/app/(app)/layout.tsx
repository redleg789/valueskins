'use client';

import React, { ReactNode } from 'react';

class ErrorBoundary extends React.Component<
    { children: ReactNode },
    { hasError: boolean; error?: Error }
> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('AppLayout error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    backgroundColor: 'var(--ig-bg)',
                    color: 'var(--ig-text-primary)',
                    gap: '16px',
                }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Something went wrong</h1>
                    <p style={{ fontSize: '14px', color: 'var(--ig-text-secondary)' }}>
                        We're sorry for the inconvenience. Please refresh the page or try again later.
                    </p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false });
                            window.location.href = '/';
                        }}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'var(--ig-blue)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                        }}
                    >
                        Return to home
                    </button>
                </div>
            );
        }

        return (
            <main>
                {this.props.children}
            </main>
        );
    }
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary>
            {children}
        </ErrorBoundary>
    );
}

