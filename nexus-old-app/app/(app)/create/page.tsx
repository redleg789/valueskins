'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'post' | 'skin'>('post');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Post form state
    const [postContent, setPostContent] = useState('');

    // Skin form state
    const [selectedProfession, setSelectedProfession] = useState('');

    const professions = [
        { id: 1, name: 'Photographer', category: 'Content' },
        { id: 2, name: 'Videographer', category: 'Content' },
        { id: 3, name: 'Writer', category: 'Content' },
        { id: 4, name: 'Fashion Influencer', category: 'Lifestyle' },
        { id: 5, name: 'Fitness Influencer', category: 'Lifestyle' },
        { id: 6, name: 'Tech Reviewer', category: 'Tech' },
        { id: 7, name: 'Developer Advocate', category: 'Tech' },
        { id: 8, name: 'Gamer', category: 'Entertainment' },
    ];

    const handlePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!postContent.trim()) return;

        setIsSubmitting(true);
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSubmitting(false);
        setPostContent('');
        router.push('/feed');
    };

    const handleSkinMint = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProfession) return;

        setIsSubmitting(true);
        // Mock contract interaction
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        router.push('/profile/me');
    };

    return (
        <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Create</h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Share content or mint a new profession skin</p>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('post')}
                    className={activeTab === 'post' ? 'btn-primary' : 'btn-glass'}
                    style={{ flex: 1, padding: '12px' }}
                >
                    📝 New Post
                </button>
                <button
                    onClick={() => setActiveTab('skin')}
                    className={activeTab === 'skin' ? 'btn-primary' : 'btn-glass'}
                    style={{ flex: 1, padding: '12px' }}
                >
                    🎨 Mint Skin
                </button>
            </div>

            {/* Post Form */}
            {activeTab === 'post' && (
                <form onSubmit={handlePostSubmit}>
                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                        <textarea
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            placeholder="What's on your mind?"
                            style={{
                                width: '100%',
                                minHeight: '150px',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                background: 'var(--surface)',
                                color: 'white',
                                fontSize: '1rem',
                                resize: 'vertical',
                                marginBottom: '1rem',
                            }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="button" className="btn-glass" style={{ padding: '8px 12px', fontSize: '0.9rem' }}>
                                    📷 Image
                                </button>
                                <button type="button" className="btn-glass" style={{ padding: '8px 12px', fontSize: '0.9rem' }}>
                                    🎬 Video
                                </button>
                            </div>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isSubmitting || !postContent.trim()}
                                style={{ opacity: postContent.trim() ? 1 : 0.5 }}
                            >
                                {isSubmitting ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Skin Mint Form */}
            {activeTab === 'skin' && (
                <form onSubmit={handleSkinMint}>
                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Select a Profession</h3>
                        <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Choose a profession to mint as a new Skin NFT. You can level it up through verified activity.
                        </p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                        }}>
                            {professions.map(prof => (
                                <div
                                    key={prof.id}
                                    onClick={() => setSelectedProfession(prof.id.toString())}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: selectedProfession === prof.id.toString()
                                            ? '2px solid var(--primary)'
                                            : '1px solid var(--border)',
                                        background: selectedProfession === prof.id.toString()
                                            ? 'rgba(139, 92, 246, 0.1)'
                                            : 'var(--surface)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{prof.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{prof.category}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: '#888' }}>Mint Price</div>
                                <div style={{ fontWeight: 'bold' }}>0.005 ETH</div>
                            </div>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isSubmitting || !selectedProfession}
                                style={{ opacity: selectedProfession ? 1 : 0.5 }}
                            >
                                {isSubmitting ? 'Minting...' : 'Mint Skin NFT'}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}
