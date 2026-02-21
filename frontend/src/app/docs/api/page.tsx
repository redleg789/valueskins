'use client';

import { useState } from 'react';

/**
 * API Documentation Page
 * 
 * Comprehensive docs for brand integrations
 */

const API_ENDPOINTS = [
    {
        method: 'GET',
        path: '/v1/creators/{id}/verify',
        description: 'Verify a creator\'s level and score',
        auth: 'API Key',
        params: [{ name: 'id', type: 'string', desc: 'Persona ID or wallet address' }],
        response: `{
  "verified": true,
  "level": 4,
  "level_name": "Expert",
  "score": 7234,
  "profession": "Digital Artist",
  "connected_platforms": ["twitter", "instagram"],
  "badge_url": "https://valueskins.io/badge/abc123.svg"
}`
    },
    {
        method: 'GET',
        path: '/v1/creators/search',
        description: 'Search for verified creators by criteria',
        auth: 'API Key',
        params: [
            { name: 'profession', type: 'string', desc: 'Filter by profession' },
            { name: 'min_level', type: 'int', desc: 'Minimum level required' },
            { name: 'limit', type: 'int', desc: 'Max results (default 20)' },
        ],
        response: `{
  "results": [...],
  "total": 127,
  "page": 1
}`
    },
    {
        method: 'POST',
        path: '/v1/opportunities',
        description: 'Create a new opportunity',
        auth: 'API Key (Brand)',
        params: [
            { name: 'title', type: 'string', desc: 'Opportunity title' },
            { name: 'description', type: 'string', desc: 'Full description' },
            { name: 'min_level', type: 'int', desc: 'Required level' },
            { name: 'reward_usd', type: 'int', desc: 'Reward in cents' },
        ],
        response: `{
  "id": "opp_abc123",
  "status": "active",
  "applications_url": "..."
}`
    },
    {
        method: 'POST',
        path: '/v1/webhooks',
        description: 'Register a webhook endpoint',
        auth: 'API Key (Brand)',
        params: [
            { name: 'url', type: 'string', desc: 'Your webhook URL' },
            { name: 'events', type: 'array', desc: 'Events to subscribe to' },
        ],
        response: `{
  "id": "wh_abc123",
  "secret": "whsec_...",
  "events": ["application.received", "deal.completed"]
}`
    },
];

const WEBHOOK_EVENTS = [
    { event: 'application.received', desc: 'New application submitted' },
    { event: 'application.accepted', desc: 'Application accepted by brand' },
    { event: 'deal.completed', desc: 'Deal marked as complete' },
    { event: 'creator.level_up', desc: 'Creator reached a new level' },
    { event: 'score.updated', desc: 'Creator score changed' },
];

export default function APIDocsPage() {
    const [activeEndpoint, setActiveEndpoint] = useState(0);

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>📚 API Documentation</h1>
                <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>Integrate Valueskins verification into your platform</p>

                {/* Quick Start */}
                <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.1))', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>⚡ Quick Start</h2>
                    <p style={{ color: '#a1a1aa', marginBottom: '1rem' }}>Base URL: <code style={{ color: '#8b5cf6' }}>https://api.valueskins.io</code></p>
                    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                        <span style={{ color: '#22c55e' }}>curl</span> -X GET "https://api.valueskins.io/v1/creators/0x.../verify" \<br />
                        &nbsp;&nbsp;-H "Authorization: Bearer vs_live_your_api_key"
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                    {/* Sidebar */}
                    <div>
                        <h3 style={{ fontWeight: 600, marginBottom: '1rem', color: '#71717a' }}>Endpoints</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {API_ENDPOINTS.map((ep, i) => (
                                <button key={i} onClick={() => setActiveEndpoint(i)} style={{
                                    padding: '0.75rem',
                                    background: activeEndpoint === i ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${activeEndpoint === i ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.05)'}`,
                                    borderRadius: '8px',
                                    color: 'white',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        padding: '0.25rem 0.5rem',
                                        background: ep.method === 'GET' ? 'rgba(34,197,94,0.2)' : 'rgba(59,130,246,0.2)',
                                        color: ep.method === 'GET' ? '#22c55e' : '#3b82f6',
                                        borderRadius: '4px',
                                        fontWeight: 600
                                    }}>{ep.method}</span>
                                    <span style={{ fontSize: '0.85rem' }}>{ep.path.split('/').pop()}</span>
                                </button>
                            ))}
                        </div>

                        <h3 style={{ fontWeight: 600, margin: '2rem 0 1rem', color: '#71717a' }}>Webhook Events</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {WEBHOOK_EVENTS.map((e, i) => (
                                <div key={i} style={{ padding: '0.5rem', fontSize: '0.85rem', color: '#a1a1aa' }}>
                                    <code style={{ color: '#f59e0b' }}>{e.event}</code>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                background: API_ENDPOINTS[activeEndpoint].method === 'GET' ? 'rgba(34,197,94,0.2)' : 'rgba(59,130,246,0.2)',
                                color: API_ENDPOINTS[activeEndpoint].method === 'GET' ? '#22c55e' : '#3b82f6',
                                borderRadius: '6px',
                                fontWeight: 600
                            }}>{API_ENDPOINTS[activeEndpoint].method}</span>
                            <code style={{ fontSize: '1.1rem' }}>{API_ENDPOINTS[activeEndpoint].path}</code>
                        </div>
                        <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>{API_ENDPOINTS[activeEndpoint].description}</p>

                        <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Parameters</h4>
                        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden', marginBottom: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '120px 80px 1fr', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#71717a', fontSize: '0.85rem' }}>
                                <span>Name</span><span>Type</span><span>Description</span>
                            </div>
                            {API_ENDPOINTS[activeEndpoint].params.map((p, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 80px 1fr', padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <code style={{ color: '#8b5cf6' }}>{p.name}</code>
                                    <span style={{ color: '#f59e0b' }}>{p.type}</span>
                                    <span style={{ color: '#a1a1aa' }}>{p.desc}</span>
                                </div>
                            ))}
                        </div>

                        <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Response</h4>
                        <pre style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '1rem', fontSize: '0.85rem', overflow: 'auto', color: '#a1a1aa' }}>
                            {API_ENDPOINTS[activeEndpoint].response}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
