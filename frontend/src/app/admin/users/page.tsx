'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, AdminUser } from '@/lib/api';

export default function UserManagementPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const limit = 50;

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        const result = await api.admin.listUsers(limit, page * limit);
        if (result.data) {
            setUsers(result.data.users);
            setTotal(result.data.total);
        } else {
            setError(result.error || 'Failed to load users');
        }
        setLoading(false);
    }, [page]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleDeactivate = async (id: number) => {
        if (!confirm('Are you sure you want to deactivate this user?')) return;
        const result = await api.admin.deactivateUser(id);
        if (result.data?.deactivated) {
            fetchUsers();
        }
    };

    const filtered = users.filter(u => {
        const matchesSearch = !search || u.username.toLowerCase().includes(search.toLowerCase()) ||
            (u.display_name || '').toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || (filter === 'active' && u.is_active) || (filter === 'inactive' && !u.is_active);
        return matchesSearch && matchesFilter;
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>User Management</h1>
                <span style={{ color: '#71717a' }}>{total} total users</span>
            </div>

            {error && (
                <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
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
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#71717a' }}>Loading users...</div>
                ) : (
                    <>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ color: '#71717a', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <tr>
                                    <th style={{ padding: '1rem' }}>User</th>
                                    <th style={{ padding: '1rem' }}>Role</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                    <th style={{ padding: '1rem' }}>Joined</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600 }}>{user.display_name || user.username}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#71717a' }}>@{user.username}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(139,92,246,0.2)', color: '#8b5cf6', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize' }}>{user.role}</span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '100px',
                                                fontSize: '0.75rem',
                                                background: user.is_active ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                                                color: user.is_active ? '#22c55e' : '#EF4444',
                                            }}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#a1a1aa' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {user.is_active && (
                                                <button
                                                    onClick={() => handleDeactivate(user.id)}
                                                    style={{ color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                                >
                                                    Deactivate
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: page === 0 ? '#4a4a4a' : 'white', cursor: page === 0 ? 'default' : 'pointer' }}
                            >
                                Previous
                            </button>
                            <span style={{ color: '#71717a', fontSize: '0.85rem' }}>
                                Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total}
                            </span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={(page + 1) * limit >= total}
                                style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: (page + 1) * limit >= total ? '#4a4a4a' : 'white', cursor: (page + 1) * limit >= total ? 'default' : 'pointer' }}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
