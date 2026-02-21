'use client';

import { useState } from 'react';

const MOCK_STATS = [
    { label: 'Total Value Locked', value: '$844,291' },
    { label: 'Registered Personas', value: '12,402' },
    { label: 'Professions Active', value: '14' },
    { label: 'Career Skins Minted', value: '8,921' },
];

export default function NetworkPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">Transparency Dashboard</h1>
            <p className="text-gray-400 mb-12">Real-time on-chain metrics for the Valueskins Protocol.</p>

            {/* Top Stats */}
            <div className="grid grid-cols-4 gap-6 mb-12">
                {MOCK_STATS.map((stat, i) => (
                    <div key={i} className="glass-panel p-6">
                        <div className="text-sm text-gray-400 uppercase tracking-widest mb-2">{stat.label}</div>
                        <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Contract Addresses */}
            <div className="glass-panel p-8 mb-12">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <span className="text-2xl">📜</span> Smart Contract Registry (Sepolia)
                </h2>

                <div className="space-y-4">
                    <ContractRow
                        name="PersonaRegistry"
                        address="0x71C...93a1"
                        description="Core identity management and ownership."
                    />
                    <ContractRow
                        name="ProfessionRegistry"
                        address="0xA2d...b892"
                        description="Governance-managed list of verifiable professions."
                    />
                    <ContractRow
                        name="SkinNFT"
                        address="0x4B3...c7d2"
                        description="ERC-721 token representing career progression and levels."
                    />
                    <ContractRow
                        name="LevelOracle"
                        address="0x8f2...100a"
                        description="Trustless oracle for validating off-chain achievements."
                    />
                    <ContractRow
                        name="PaymentSplitter"
                        address="0x11c...33e4"
                        description="Revenue sharing for protocol treasury and creators."
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="glass-panel p-8">
                    <h3 className="text-lg font-bold mb-4">Protocol Revenue</h3>
                    <div className="h-64 flex items-center justify-center border border-dashed border-gray-700 rounded-lg">
                        <span className="text-gray-500">Chart Component (Revenue)</span>
                    </div>
                </div>
                <div className="glass-panel p-8">
                    <h3 className="text-lg font-bold mb-4">Minting Activity</h3>
                    <div className="h-64 flex items-center justify-center border border-dashed border-gray-700 rounded-lg">
                        <span className="text-gray-500">Chart Component (Mints)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ContractRow({ name, address, description }: { name: string, address: string, description: string }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-purple-500/30 transition-colors">
            <div>
                <div className="font-bold text-lg text-purple-300">{name}</div>
                <div className="text-sm text-gray-400">{description}</div>
            </div>
            <div className="flex items-center gap-4">
                <code className="bg-black/50 px-3 py-1 rounded text-gray-300 font-mono text-sm">{address}</code>
                <button className="text-sm text-purple-400 hover:text-purple-300 font-semibold">
                    View on Etherscan ↗
                </button>
            </div>
        </div>
    );
}
