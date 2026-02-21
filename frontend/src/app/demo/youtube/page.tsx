'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLevelConfig, useReputationConfig } from '@/lib/useConfigStorage';

const PROFESSIONS = {
  'Technology': {
    name: 'Technology',
    subProfessions: [
      'Software Engineer',
      'Data Scientist',
      'Product Manager',
      'DevOps Engineer',
      'UX/UI Designer',
      'Tech Entrepreneur',
      'Security Researcher',
      'AI/ML Specialist',
    ]
  },
  'Entertainment': {
    name: 'Entertainment',
    subProfessions: [
      'Actor',
      'Comedian',
      'Musician',
      'Producer',
      'Director',
      'Screenwriter',
      'Animator',
      'Voice Actor',
    ]
  },
  'Sports': {
    name: 'Sports',
    subProfessions: [
      'Professional Athlete',
      'Fitness Coach',
      'Yoga Instructor',
      'Nutritionist',
      'Sports Analyst',
      'Personal Trainer',
      'Physical Therapist',
      'Sports Manager',
    ]
  },
  'Aviation': {
    name: 'Aviation',
    subProfessions: [
      'Commercial Pilot',
      'Flight Attendant',
      'Aviation Student',
      'Ground Staff',
      'Air Traffic Controller',
      'Aircraft Engineer',
      'Aviation Safety Officer',
      'Cabin Crew Manager',
    ]
  },
  'Healthcare': {
    name: 'Healthcare',
    subProfessions: [
      'Doctor',
      'Nurse',
      'Surgeon',
      'Dentist',
      'Therapist',
      'Pharmacist',
      'Medical Student',
      'Health Coach',
    ]
  },
  'Finance': {
    name: 'Finance',
    subProfessions: [
      'Investment Banker',
      'Financial Advisor',
      'Accountant',
      'Trader',
      'Crypto Analyst',
      'Tax Specialist',
      'Portfolio Manager',
      'Finance Student',
    ]
  },
  'Law': {
    name: 'Law',
    subProfessions: [
      'Attorney',
      'Judge',
      'Paralegal',
      'Legal Analyst',
      'Contract Specialist',
      'Intellectual Property Lawyer',
      'Corporate Lawyer',
      'Law Student',
    ]
  },
  'Education': {
    name: 'Education',
    subProfessions: [
      'Professor',
      'Teacher',
      'Tutor',
      'EdTech Creator',
      'Curriculum Designer',
      'Teaching Assistant',
      'Academic Coach',
      'Education Researcher',
    ]
  },
  'Art & Design': {
    name: 'Art & Design',
    subProfessions: [
      'Graphic Designer',
      'Illustrator',
      'Digital Artist',
      '3D Modeler',
      'Fashion Designer',
      'Interior Designer',
      'Art Director',
      'Concept Artist',
    ]
  },
  'Business': {
    name: 'Business',
    subProfessions: [
      'CEO',
      'Entrepreneur',
      'Consultant',
      'Sales Manager',
      'HR Manager',
      'Operations Manager',
      'Marketing Manager',
      'Business Analyst',
    ]
  },
  'Real Estate': {
    name: 'Real Estate',
    subProfessions: [
      'Real Estate Agent',
      'Property Manager',
      'Real Estate Developer',
      'Real Estate Appraiser',
      'Mortgage Broker',
      'Real Estate Investor',
      'Real Estate Photographer',
      'Urban Planner',
    ]
  },
  'Food & Beverage': {
    name: 'Food & Beverage',
    subProfessions: [
      'Chef',
      'Food Critic',
      'Nutritionist',
      'Pastry Chef',
      'Restaurant Owner',
      'Sommelier',
      'Food Photographer',
      'Culinary Student',
    ]
  },
};

const LEVEL_FACTORS = {
  1: {
    name: 'Newcomer',
    minSubscribers: 0,
    minEngagement: 0,
    minDealValue: 0,
    requirements: [
      'Brand new to content creation',
      'Building initial subscriber base',
      'Starting to establish viewership',
    ]
  },
  2: {
    name: 'Rising Creator',
    minSubscribers: 50000,
    minEngagement: 2,
    minDealValue: 500,
    requirements: [
      '50K+ subscribers',
      '2%+ average engagement rate',
      'Completed 5+ brand deals',
      'Consistent upload schedule',
    ]
  },
  3: {
    name: 'Established Creator',
    minSubscribers: 250000,
    minEngagement: 3.5,
    minDealValue: 5000,
    requirements: [
      '250K+ subscribers',
      '3.5%+ average engagement rate',
      'Completed 20+ brand deals',
      '95%+ on-time delivery rate',
      '$5K+ average deal value',
    ]
  },
  4: {
    name: 'Top Tier Creator',
    minSubscribers: 1000000,
    minEngagement: 5,
    minDealValue: 25000,
    requirements: [
      '1M+ subscribers',
      '5%+ average engagement rate',
      'Completed 50+ brand deals',
      '98%+ on-time delivery rate',
      '$25K+ average deal value',
      'Multiple sponsorship deals',
    ]
  },
  5: {
    name: 'Elite Creator (Verified)',
    minSubscribers: 5000000,
    minEngagement: 7,
    minDealValue: 100000,
    requirements: [
      '5M+ subscribers',
      '7%+ average engagement rate',
      'Completed 100+ brand deals',
      '99%+ on-time delivery rate',
      '$100K+ average deal value',
      'Top 0.1% on YouTube',
      'Major brand endorsements',
      'Industry influence',
    ]
  },
};

const REPUTATION_SCORE_FACTORS = {
  max: 1000,
  factors: [
    {
      name: 'Sponsorship Completion',
      weight: 25,
      description: 'Percentage of brand deals you complete',
      maxPoints: 250,
    },
    {
      name: 'On-Time Delivery',
      weight: 20,
      description: 'Percentage of videos delivered on schedule',
      maxPoints: 200,
    },
    {
      name: 'Brand Ratings',
      weight: 20,
      description: 'Average rating given by brands (out of 5)',
      maxPoints: 200,
    },
    {
      name: 'Audience Quality',
      weight: 15,
      description: 'Audience authenticity (no bot activity)',
      maxPoints: 150,
    },
    {
      name: 'Creator Level',
      weight: 10,
      description: 'Current Valueskins Level (1-5)',
      maxPoints: 100,
    },
    {
      name: 'Community Management',
      weight: 10,
      description: 'Community engagement and moderation',
      maxPoints: 100,
    },
  ]
};

export default function YouTubeDemoPage() {
    const [activeView, setActiveView] = useState<'profile' | 'mim' | 'store'>('profile');
    const [isSubscribed, setIsSubscribed] = useState(false);

    // Load config from storage
    const { levels, isLoaded: levelsLoaded } = useLevelConfig();
    const { factors, isLoaded: factorsLoaded } = useReputationConfig();

    // Modal states
    const [showLevelModal, setShowLevelModal] = useState(false);
    const [showMetricsModal, setShowMetricsModal] = useState(false);
    const [showReputationModal, setShowReputationModal] = useState(false);
    const [showStoreModal, setShowStoreModal] = useState(false);

    // Editable metrics - YouTube uses subscribers
    const [metrics, setMetrics] = useState({
      subscribers: 2150000,
      engagement: 5.8,
      dealsCompleted: 45,
      avgDealValue: 45000,
      onTimeRate: 97,
      brandRating: 4.8,
    });

    const currentLevel = levelsLoaded ? calculateLevel(metrics, levels) : 1;

    const handleSubscribe = () => {
        setIsSubscribed(!isSubscribed);
        setMetrics(prev => ({
          ...prev,
          subscribers: prev.subscribers + (isSubscribed ? -1 : 1)
        }));
    };

    const updateMetric = (key: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setMetrics(prev => ({
          ...prev,
          [key]: numValue
        }));
    };

    return (
        <div style={{
            background: '#000',
            minHeight: '100vh',
            color: '#fff',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
            {/* Top Navigation */}
            <div style={{
                background: '#000',
                borderBottom: '1px solid #262626',
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <div style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#f00',
                        cursor: 'pointer',
                    }}>
                        YouTube
                    </div>
                </Link>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: '18px',
                        cursor: 'pointer',
                    }}>
                        Search
                    </button>
                    <button style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: '18px',
                        cursor: 'pointer',
                    }}>
                        Menu
                    </button>
                </div>
            </div>

            {/* Sidebar & Main Content */}
            <div style={{ display: 'flex' }}>
                {/* Left Sidebar */}
                <div style={{
                    width: '240px',
                    borderRight: '1px solid #262626',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    height: 'calc(100vh - 56px)',
                    overflowY: 'auto',
                    position: 'sticky',
                    top: '56px',
                }}>
                    <NavItem label="Home" active={false} onClick={() => {}} />
                    <NavItem label="Explore" active={false} onClick={() => {}} />
                    <NavItem label="Subscriptions" active={false} onClick={() => {}} />
                    <NavItem label="Library" active={false} onClick={() => {}} />
                    <NavItem label="History" active={false} onClick={() => {}} />

                    {/* Divider */}
                    <div style={{ height: '1px', background: '#262626', margin: '8px 0' }} />

                    <NavItem label="Channel" active={activeView === 'profile'} onClick={() => setActiveView('profile')} />
                    <NavItem label="Sponsorships" active={activeView === 'mim'} onClick={() => setActiveView('mim')} />
                    <NavItem label="Store" active={activeView === 'store'} onClick={() => setActiveView('store')} />
                </div>

                {/* Main Content */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '20px',
                }}>
                    <div style={{ width: '100%', maxWidth: '850px' }}>

                        {/* PROFILE VIEW */}
                        {activeView === 'profile' && (
                            <>
                                {/* Channel Banner */}
                                <div style={{
                                    height: '300px',
                                    background: 'linear-gradient(135deg, #f00 0%, #cc0000 100%)',
                                    borderRadius: '12px',
                                    marginBottom: '20px',
                                }} />

                                {/* Channel Header */}
                                <div style={{
                                    background: '#1c1c1e',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    marginBottom: '20px',
                                }}>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'start' }}>
                                        {/* Avatar */}
                                        <div style={{
                                            width: '160px',
                                            height: '160px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #f00, #cc0000)',
                                            flexShrink: 0,
                                            overflow: 'hidden',
                                            marginTop: '-40px',
                                        }}>
                                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Saketh" alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>

                                        {/* Channel Info */}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#fff' }}>
                                                    Saketh Velamuri
                                                </h1>
                                                <button
                                                    onClick={() => setShowLevelModal(true)}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #7c3aed, #db2777)',
                                                        color: 'white',
                                                        fontSize: '11px',
                                                        fontWeight: '800',
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        whiteSpace: 'nowrap',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    LVL {currentLevel}
                                                </button>
                                            </div>

                                            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '14px', color: '#aaa' }}>
                                                <button
                                                    onClick={() => setShowMetricsModal(true)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: '#aaa',
                                                        padding: 0,
                                                    }}
                                                >
                                                    <span style={{ fontWeight: '600', color: '#fff' }}>
                                                        {(metrics.subscribers / 1000000).toFixed(1)}M
                                                    </span> subscribers
                                                </button>
                                                <div>
                                                    <span style={{ fontWeight: '600', color: '#fff' }}>500+</span> videos
                                                </div>
                                            </div>

                                            <div style={{ color: '#aaa', fontSize: '14px', marginBottom: '16px', maxWidth: '500px' }}>
                                                Building the decentralized reputation layer for the creator economy.
                                                Web3 engineer passionate about creator empowerment and blockchain technology.
                                            </div>

                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <button
                                                    onClick={handleSubscribe}
                                                    style={{
                                                        background: isSubscribed ? '#ffffff10' : '#f00',
                                                        color: isSubscribed ? '#fff' : '#fff',
                                                        border: isSubscribed ? '1px solid #666' : 'none',
                                                        borderRadius: '20px',
                                                        padding: '8px 24px',
                                                        fontWeight: '600',
                                                        fontSize: '14px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                                                </button>
                                                <button style={{
                                                    background: '#ffffff10',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '20px',
                                                    padding: '8px 20px',
                                                    fontWeight: '600',
                                                    fontSize: '14px',
                                                    cursor: 'pointer',
                                                }}>
                                                    Join
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div style={{
                                    borderBottom: '1px solid #262626',
                                    display: 'flex',
                                    gap: '24px',
                                    marginBottom: '20px',
                                    paddingBottom: '16px',
                                }}>
                                    {['Videos', 'Community', 'About'].map((tab) => (
                                        <div key={tab} style={{
                                            cursor: 'pointer',
                                            color: tab === 'Videos' ? '#fff' : '#aaa',
                                            fontWeight: tab === 'Videos' ? '600' : '500',
                                            fontSize: '16px',
                                            borderBottom: tab === 'Videos' ? '3px solid #f00' : 'none',
                                            paddingBottom: '8px',
                                        }}>
                                            {tab}
                                        </div>
                                    ))}
                                </div>

                                {/* Valueskins Score */}
                                <div style={{
                                    background: '#1c1c1e',
                                    borderRadius: '12px',
                                    padding: '16px 24px',
                                    marginBottom: '20px',
                                }}>
                                    <button
                                        onClick={() => setShowReputationModal(true)}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'rgba(139, 92, 246, 0.1)',
                                            border: '1px solid rgba(139, 92, 246, 0.3)',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: '#1a1a1a',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid #333',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            color: '#c4b5fd',
                                        }}>
                                            VS
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#c4b5fd' }}>
                                                Valueskins Verified
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#a78bfa' }}>
                                                847 / 1000 Score
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                {/* Videos Grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                    gap: '16px',
                                }}>
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} style={{
                                            background: '#1c1c1e',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                        }}>
                                            <div style={{
                                                aspectRatio: '16/9',
                                                background: `linear-gradient(${45 + (i * 30)}deg, #333, #111)`,
                                                overflow: 'hidden',
                                            }}>
                                                <img
                                                    src={`https://picsum.photos/320/180?random=${i}`}
                                                    alt="Video"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                                                />
                                            </div>
                                            <div style={{ padding: '12px' }}>
                                                <div style={{ fontWeight: '600', marginBottom: '4px', color: '#fff', fontSize: '14px' }}>
                                                    Video Title #{i}
                                                </div>
                                                <div style={{ color: '#aaa', fontSize: '12px' }}>
                                                    {Math.floor(Math.random() * 500) + 100}K views • {Math.floor(Math.random() * 30) + 1}d ago
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* SPONSORSHIPS VIEW (MIM) */}
                        {activeView === 'mim' && (
                            <>
                                <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#fff' }}>
                                    Sponsorship Opportunities
                                </h2>

                                {[
                                    { brand: 'DXP Energy Drink', type: 'Product Placement', match: '94%', value: '$25,000' },
                                    { brand: 'Audible', type: 'Audio Content', match: '91%', value: '$18,000' },
                                    { brand: 'Skillshare', type: 'Education Collab', match: '87%', value: '$12,000' },
                                ].map((opp, i) => (
                                    <div key={i} style={{
                                        background: '#1c1c1e',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        marginBottom: '16px',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                            <div>
                                                <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                                                    {opp.brand}
                                                </div>
                                                <div style={{ color: '#aaa', fontSize: '14px' }}>
                                                    {opp.type}
                                                </div>
                                            </div>
                                            <div style={{
                                                background: 'rgba(255, 0, 0, 0.1)',
                                                color: '#f00',
                                                padding: '6px 12px',
                                                borderRadius: '16px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                            }}>
                                                {opp.match} Match
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>
                                                {opp.value}
                                            </div>
                                            <button style={{
                                                background: '#f00',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '20px',
                                                padding: '8px 24px',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                            }}>
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        {/* STORE VIEW */}
                        {activeView === 'store' && (
                            <>
                                <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#fff' }}>
                                    Valueskins Store
                                </h2>
                                <p style={{ color: '#aaa', marginBottom: '20px' }}>
                                    Get your creator badge for $10
                                </p>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '12px',
                                }}>
                                    {Object.values(PROFESSIONS).map((prof) => (
                                        <button
                                            key={prof.name}
                                            onClick={() => setShowStoreModal(true)}
                                            style={{
                                                padding: '16px',
                                                background: '#f00',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                            }}
                                        >
                                            <div style={{ marginBottom: '4px' }}>{prof.name}</div>
                                            <div style={{ fontSize: '12px', opacity: 0.8 }}>$10</div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* MODALS */}

            {/* Level Modal */}
            {showLevelModal && <Modal onClose={() => setShowLevelModal(false)}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                    What Determines Your Level?
                </h2>
                <p style={{ color: '#aaa', marginBottom: '20px' }}>
                    Your Valueskins Level is based on your channel metrics. Here's what you need for each level:
                </p>

                {Object.entries(levels).map(([level, data]) => (
                    <div key={level} style={{
                        background: '#1c1c1e',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        borderLeft: parseInt(level) === currentLevel ? '4px solid #f00' : '4px solid transparent',
                    }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>
                            Level {level}: {data.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888' }}>
                            Followers: {data.followers.toLocaleString()} | Engagement: {data.engagement}% | Sponsor Value: ${data.dealValue.toLocaleString()}
                        </div>
                    </div>
                ))}

                <div style={{
                    background: 'rgba(255, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 0, 0, 0.3)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginTop: '20px',
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Why Level 5 is Elite</div>
                    <div style={{ fontSize: '13px', color: '#aaa', lineHeight: '1.6' }}>
                        Level 5 creators are the cream of the crop on YouTube. With millions of subscribers,
                        exceptional engagement, and completed 100+ sponsorships, they're industry icons.
                        This represents the absolute peak of YouTube success.
                    </div>
                </div>
            </Modal>}

            {/* Metrics Modal */}
            {showMetricsModal && <Modal onClose={() => setShowMetricsModal(false)}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                    Edit Your Metrics
                </h2>
                <p style={{ color: '#aaa', marginBottom: '20px' }}>
                    Adjust your metrics to see how your level changes:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <MetricInput
                        label="Subscribers"
                        value={metrics.subscribers}
                        onChange={(v) => updateMetric('subscribers', v)}
                    />
                    <MetricInput
                        label="Engagement Rate (%)"
                        value={metrics.engagement}
                        onChange={(v) => updateMetric('engagement', v)}
                    />
                    <MetricInput
                        label="Sponsorships Completed"
                        value={metrics.dealsCompleted}
                        onChange={(v) => updateMetric('dealsCompleted', v)}
                    />
                    <MetricInput
                        label="Average Sponsorship Value ($)"
                        value={metrics.avgDealValue}
                        onChange={(v) => updateMetric('avgDealValue', v)}
                    />
                    <MetricInput
                        label="On-Time Delivery Rate (%)"
                        value={metrics.onTimeRate}
                        onChange={(v) => updateMetric('onTimeRate', v)}
                    />
                    <MetricInput
                        label="Brand Rating"
                        value={metrics.brandRating}
                        onChange={(v) => updateMetric('brandRating', v)}
                    />
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #f00, #cc0000)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginTop: '20px',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Current Level</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>LEVEL {currentLevel}</div>
                </div>
            </Modal>}

            {/* Reputation Modal */}
            {showReputationModal && <Modal onClose={() => setShowReputationModal(false)}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                    Reputation Score: 847 / {factors.reduce((sum: number, f: any) => sum + f.maxPoints, 0)}
                </h2>
                <p style={{ color: '#aaa', marginBottom: '20px' }}>
                    Your reputation score is calculated from multiple factors. Here's the breakdown:
                </p>

                {factors.map((factor) => {
                    const percentage = (factor.weight / 100);
                    return (
                        <div key={factor.name} style={{
                            background: '#1c1c1e',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '12px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{factor.name}</div>
                                </div>
                                <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                    {factor.weight}%<br />
                                    <span style={{ fontSize: '12px', color: '#888' }}>max {factor.maxPoints}</span>
                                </div>
                            </div>
                            <div style={{
                                height: '4px',
                                background: '#262626',
                                borderRadius: '2px',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${percentage * 100}%`,
                                    background: '#f00',
                                }} />
                            </div>
                        </div>
                    );
                })}

                <div style={{
                    background: 'rgba(255, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 0, 0, 0.3)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginTop: '20px',
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Maximum Score: 1000</div>
                    <div style={{ fontSize: '13px', color: '#aaa', lineHeight: '1.6' }}>
                        A perfect score of 1000 means you're a top-tier creator: 100% sponsorship completion,
                        perfect on-time delivery, 5-star ratings, 100% authentic audience, Level 5 status,
                        and excellent community management. This is creator excellence.
                    </div>
                </div>
            </Modal>}

            {/* Store Modal */}
            {showStoreModal && <Modal onClose={() => setShowStoreModal(false)}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                    Choose Your Profession
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                    {Object.values(PROFESSIONS).map((prof) => (
                        <div key={prof.name} style={{
                            background: '#1c1c1e',
                            borderRadius: '8px',
                            padding: '16px',
                        }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
                                {prof.name}
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '8px',
                            }}>
                                {prof.subProfessions.map((sub) => (
                                    <button
                                        key={sub}
                                        style={{
                                            background: '#262626',
                                            border: '1px solid #404040',
                                            borderRadius: '6px',
                                            color: '#fff',
                                            padding: '8px 12px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLElement).style.background = '#f00';
                                            (e.currentTarget as HTMLElement).style.borderColor = '#f00';
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLElement).style.background = '#262626';
                                            (e.currentTarget as HTMLElement).style.borderColor = '#404040';
                                        }}
                                    >
                                        {sub}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <button style={{
                    width: '100%',
                    padding: '12px',
                    background: '#f00',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    cursor: 'pointer',
                    marginTop: '16px',
                }}>
                    Purchase Badge - $10
                </button>
            </Modal>}
        </div>
    );
}

function NavItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: active ? '#ffffff10' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 12px',
                color: active ? '#fff' : '#aaa',
                fontWeight: active ? '600' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s',
                width: '100%',
                justifyContent: 'flex-start',
            }}
            onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.color = '#aaa';
            }}
        >
            <span>{label}</span>
        </button>
    );
}

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }}>
            <div style={{
                background: '#1c1c1e',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto',
                position: 'relative',
                border: '1px solid #262626',
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        fontSize: '24px',
                        cursor: 'pointer',
                    }}
                >
                    ×
                </button>
                {children}
            </div>
        </div>
    );
}

function MetricInput({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600' }}>
                {label}
            </label>
            <input
                type="text"
                value={value.toLocaleString()}
                onChange={(e) => onChange(e.target.value.replace(/,/g, ''))}
                style={{
                    background: '#262626',
                    border: '1px solid #404040',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '10px 12px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                }}
            />
        </div>
    );
}

function calculateLevel(metrics: any, levels: any): number {
    for (let level = 5; level >= 1; level--) {
        const threshold = levels[level];
        if (
            metrics.subscribers >= threshold.followers &&
            metrics.engagement >= threshold.engagement &&
            metrics.avgDealValue >= threshold.dealValue
        ) {
            return level;
        }
    }
    return 1;
}
