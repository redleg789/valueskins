'use client';

import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const scoreData = [
    { date: 'Jan', score: 2400 },
    { date: 'Feb', score: 3200 },
    { date: 'Mar', score: 4100 },
    { date: 'Apr', score: 3800 },
    { date: 'May', score: 5200 },
    { date: 'Jun', score: 6800 },
    { date: 'Jul', score: 8942 },
];

const followerData = [
    { date: 'Jan', followers: 120, following: 80 },
    { date: 'Feb', followers: 250, following: 95 },
    { date: 'Mar', followers: 420, following: 150 },
    { date: 'Apr', followers: 580, following: 220 },
    { date: 'May', followers: 890, following: 350 },
    { date: 'Jun', followers: 1050, following: 420 },
    { date: 'Jul', followers: 1200, following: 450 },
];

const engagementData = [
    { name: 'Likes', value: 2840 },
    { name: 'Comments', value: 1230 },
    { name: 'Shares', value: 890 },
    { name: 'Saves', value: 560 },
];

const tooltipStyle = { background: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' };

export function AnalyticsCharts() {
    return (
        <>
            {/* Score Chart */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Score Progression</h3>
                <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={scoreData}>
                            <defs>
                                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#fff' }} />
                            <Area type="monotone" dataKey="score" stroke="#8b5cf6" fill="url(#scoreGradient)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Follower Growth</h3>
                    <div style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={followerData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Line type="monotone" dataKey="followers" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="following" stroke="#ec4899" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Engagement Breakdown</h3>
                    <div style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={engagementData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis type="number" stroke="#666" />
                                <YAxis dataKey="name" type="category" stroke="#666" width={80} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </>
    );
}
