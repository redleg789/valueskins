'use client';

import { useEffect, useState } from 'react';
import { api, MarketplaceOpportunity } from '@/lib/api';

export default function MarketplacePage() {
    const [opportunities, setOpportunities] = useState<MarketplaceOpportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchOpportunities() {
            try {
                const res = await api.marketplace.getOpportunities();
                if (res.data) {
                    setOpportunities(res.data.opportunities);
                } else if (res.error) {
                    setError(res.error);
                }
            } catch {
                setError('Failed to load opportunities. Please try again.');
            } finally {
                setLoading(false);
            }
        }
        fetchOpportunities();
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                        Marketplace
                    </h1>
                    <p className="text-gray-400">
                        Opportunities matched to your ValueSkins.
                    </p>
                </div>
            </div>

            {error ? (
                <div className="flex flex-col items-center py-20 gap-3">
                    <p className="text-red-400 font-medium">{error}</p>
                    <button
                        onClick={() => { setError(null); setLoading(true); }}
                        className="text-sm text-purple-400 underline"
                    >
                        Retry
                    </button>
                </div>
            ) : loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
            ) : opportunities.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    No opportunities available yet. Check back soon!
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {opportunities.map((opp) => (
                        <div
                            key={opp.id}
                            className={`glass-panel p-6 relative overflow-hidden transition-all duration-300 ${opp.can_apply ? 'hover:border-purple-500/50' : 'opacity-75'}`}
                        >
                            <div className="absolute top-0 right-0 p-3 px-6 rounded-bl-2xl text-xs font-bold uppercase tracking-wider bg-purple-900/50 text-purple-200">
                                {opp.category}
                            </div>

                            <div className="flex items-start gap-6">
                                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl ${opp.can_apply ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gray-800'}`}>
                                    {(opp.brand_name || 'B').charAt(0)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-xl font-bold text-white">{opp.title}</h3>
                                        {opp.brand_name && (
                                            <span className="text-sm text-gray-400">by {opp.brand_name}</span>
                                        )}
                                        {opp.brand_verified && (
                                            <span className="text-blue-400 text-xs">Verified</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
                                        <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
                                            ${opp.reward_amount} {opp.reward_currency}
                                        </span>
                                        <span className="flex items-center gap-1.5 px-2 py-1 rounded border border-gray-600 text-gray-300">
                                            Req: {opp.required_profession_name} Lvl {opp.required_level}
                                        </span>
                                        <span className="text-gray-500">
                                            {opp.application_count} applicant{opp.application_count !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    <p className="text-gray-400 mb-4">{opp.description}</p>

                                    <div className="flex gap-3 mt-2">
                                        <button
                                            disabled={!opp.can_apply}
                                            className={`px-6 py-2 rounded-lg font-semibold transition-all ${opp.can_apply
                                                ? 'bg-white text-black hover:bg-gray-200'
                                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            {opp.can_apply ? 'Apply Now' : 'Not Eligible'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
