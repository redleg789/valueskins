'use client';

import { useState } from 'react';

const MOCK_USERS = [
    { id: 1, name: 'Alex Rivera', email: 'alex@example.com', level: 4, score: 7234, status: 'active', joined: '2025-12-10' },
    { id: 2, name: 'Sarah Chen', email: 'sarah@example.com', level: 5, score: 9847, status: 'active', joined: '2025-11-05' },
    { id: 3, name: 'Mike Ross', email: 'mike@example.com', level: 1, score: 120, status: 'flagged', joined: '2026-02-01' },
    { id: 4, name: 'Jenny Kim', email: 'jenny@example.com', level: 2, score: 3400, status: 'active', joined: '2026-01-15' },
];

export default function UserManagementPage() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>User Management</h1>
                <button style={{ padding: '0.75rem 1.5rem', background: '#EF4444', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600 }}>Export Data</button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
                {/* Search & Filter */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ flex: 1, padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                    />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="flagged">Flagged</option>
                        <option value="banned">Banned</option>
                    </select>
                </div>

                {/* Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ color: '#71717a', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>User</th>
                            <th style={{ padding: '1rem' }}>Level</th>
                            <th style={{ padding: '1rem' }}>Score</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Joined</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_USERS.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#71717a' }}>{user.email}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(139,92,246,0.2)', color: '#8b5cf6', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>L{user.level}</span>
                                </td>
                                <td style={{ padding: '1rem' }}>{user.score}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '100px',
                                        fontSize: '0.75rem',
                                        background: user.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                                        color: user.status === 'active' ? '#22c55e' : '#EF4444',
                                        textTransform: 'capitalize'
                                    }}>
                                        {user.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: '#a1a1aa' }}>{user.joined}</td>
                                <td style={{ padding: '1rem' }}>
                                    <button style={{ color: '#a1a1aa', background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }}>Edit</button>
                                    <button style={{ color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer' }}>Ban</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
