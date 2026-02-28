'use client';

import { useState, useEffect } from 'react';
import { api, PlatformStats } from '@/lib/api';

export default function NetworkPage() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            const result = await api.admin.getPlatformStats();
            if (result.data) {
                setStats(result.data);
            } else {
                setError(result.error || 'Failed to load network stats');
            }
            setLoading(false);
        })();
    }, []);

    const formatValue = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;

    if (loading) return <div className="p-8 max-w-7xl mx-auto"><div className="text-gray-400">Loading network stats...</div></div>;
    if (error) return <div className="p-8 max-w-7xl mx-auto"><div className="text-red-400">{error}</div></div>;
    if (!stats) return null;

    const displayStats = [
        { label: 'Total Volume', value: `$${formatValue(stats.total_volume)}` },
        { label: 'Registered Personas', value: stats.total_personas.toLocaleString() },
        { label: 'Professions Active', value: stats.total_skins.toLocaleString() },
        { label: 'Completed Deals', value: stats.total_deals.toLocaleString() },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">Transparency Dashboard</h1>
            <p className="text-gray-400 mb-12">Real-time platform metrics for the Valueskins Protocol.</p>

            {/* Top Stats */}
            <div className="grid grid-cols-4 gap-6 mb-12">
                {displayStats.map((stat, i) => (
                    <div key={i} className="glass-panel p-6">
                        <div className="text-sm text-gray-400 uppercase tracking-widest mb-2">{stat.label}</div>
                        <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Platform Info */}
            <div className="glass-panel p-8 mb-12">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    Platform Overview
                </h2>
                <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-white/5 rounded-xl">
                        <div className="text-sm text-gray-400 mb-1">Total Users</div>
                        <div className="text-2xl font-bold text-purple-300">{stats.total_users.toLocaleString()}</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl">
                        <div className="text-sm text-gray-400 mb-1">Platform Revenue</div>
                        <div className="text-2xl font-bold text-green-400">${formatValue(stats.total_revenue)}</div>
                    </div>
                </div>
                {stats.last_refreshed_at && (
                    <div className="mt-4 text-xs text-gray-500">
                        Last updated: {new Date(stats.last_refreshed_at).toLocaleString()}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="glass-panel p-8">
                    <h3 className="text-lg font-bold mb-4">Revenue Breakdown</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <span className="text-gray-400">Total GMV</span>
                            <span className="font-bold text-yellow-400">${formatValue(stats.total_volume)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <span className="text-gray-400">Platform Take</span>
                            <span className="font-bold text-green-400">${formatValue(stats.total_revenue)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <span className="text-gray-400">Avg Deal Size</span>
                            <span className="font-bold text-purple-400">{stats.total_deals > 0 ? `$${formatValue(stats.total_volume / stats.total_deals)}` : '$0'}</span>
                        </div>
                    </div>
                </div>
                <div className="glass-panel p-8">
                    <h3 className="text-lg font-bold mb-4">Activity Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <span className="text-gray-400">Active Personas</span>
                            <span className="font-bold text-cyan-400">{stats.total_personas.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <span className="text-gray-400">Total Skins</span>
                            <span className="font-bold text-purple-400">{stats.total_skins.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <span className="text-gray-400">Completed Deals</span>
                            <span className="font-bold text-green-400">{stats.total_deals.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
