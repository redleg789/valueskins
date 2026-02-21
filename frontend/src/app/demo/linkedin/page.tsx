'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLevelConfig, useReputationConfig } from '@/lib/useConfigStorage';

// ── Profession Data ─────────────────────────────────────────────────
const PROFESSIONS = {
  'Technology': {
    name: 'Technology',
    subProfessions: ['Software Engineer','Data Scientist','Product Manager','DevOps Engineer','UX/UI Designer','Tech Entrepreneur','Security Researcher','AI/ML Specialist']
  },
  'Entertainment': {
    name: 'Entertainment',
    subProfessions: ['Actor','Comedian','Musician','Producer','Director','Screenwriter','Animator','Voice Actor']
  },
  'Sports': {
    name: 'Sports',
    subProfessions: ['Professional Athlete','Fitness Coach','Yoga Instructor','Nutritionist','Sports Analyst','Personal Trainer','Physical Therapist','Sports Manager']
  },
  'Aviation': {
    name: 'Aviation',
    subProfessions: ['Commercial Pilot','Flight Attendant','Aviation Student','Ground Staff','Air Traffic Controller','Aircraft Engineer','Aviation Safety Officer','Cabin Crew Manager']
  },
  'Healthcare': {
    name: 'Healthcare',
    subProfessions: ['Doctor','Nurse','Surgeon','Dentist','Therapist','Pharmacist','Medical Student','Health Coach']
  },
  'Finance': {
    name: 'Finance',
    subProfessions: ['Investment Banker','Financial Advisor','Accountant','Trader','Crypto Analyst','Tax Specialist','Portfolio Manager','Finance Student']
  },
  'Law': {
    name: 'Law',
    subProfessions: ['Attorney','Judge','Paralegal','Legal Analyst','Contract Specialist','Intellectual Property Lawyer','Corporate Lawyer','Law Student']
  },
  'Education': {
    name: 'Education',
    subProfessions: ['Professor','Teacher','Tutor','EdTech Creator','Curriculum Designer','Teaching Assistant','Academic Coach','Education Researcher']
  },
  'Art & Design': {
    name: 'Art & Design',
    subProfessions: ['Graphic Designer','Illustrator','Digital Artist','3D Modeler','Fashion Designer','Interior Designer','Art Director','Concept Artist']
  },
  'Business': {
    name: 'Business',
    subProfessions: ['CEO','Entrepreneur','Consultant','Sales Manager','HR Manager','Operations Manager','Marketing Manager','Business Analyst']
  },
  'Real Estate': {
    name: 'Real Estate',
    subProfessions: ['Real Estate Agent','Property Manager','Real Estate Developer','Real Estate Appraiser','Mortgage Broker','Real Estate Investor','Real Estate Photographer','Urban Planner']
  },
  'Food & Beverage': {
    name: 'Food & Beverage',
    subProfessions: ['Chef','Food Critic','Nutritionist','Pastry Chef','Restaurant Owner','Sommelier','Food Photographer','Culinary Student']
  },
};

const PROFESSION_BADGES: Record<string, { color: string; abbreviation: string }> = {
  'Software Engineer': { color: '#0a66c2', abbreviation: 'SWE' },
  'Data Scientist': { color: '#1e88e5', abbreviation: 'DS' },
  'Product Manager': { color: '#6a1b9a', abbreviation: 'PM' },
  'DevOps Engineer': { color: '#00796b', abbreviation: 'DEV' },
  'AI/ML Specialist': { color: '#e65100', abbreviation: 'AI' },
  'Doctor': { color: '#c62828', abbreviation: 'MD' },
  'Surgeon': { color: '#ad1457', abbreviation: 'SRG' },
  'Attorney': { color: '#37474f', abbreviation: 'ESQ' },
  'CEO': { color: '#1a1a1a', abbreviation: 'CEO' },
  'Entrepreneur': { color: '#4a148c', abbreviation: 'ENT' },
  'Investment Banker': { color: '#004d40', abbreviation: 'IB' },
  'Professor': { color: '#1b5e20', abbreviation: 'PRF' },
  'Consultant': { color: '#0d47a1', abbreviation: 'CON' },
};

// ── Slot System (3-slot: Hobby / Passion / Profession) ──────────────
type SlotKey = 'hobby' | 'passion' | 'profession';
const SLOTS: SlotKey[] = ['hobby', 'passion', 'profession'];
const SLOT_LABELS: Record<SlotKey, string> = { hobby: 'Hobby', passion: 'Passion', profession: 'Profession' };
const SLOT_COLORS: Record<SlotKey, string> = { hobby: '#10b981', passion: '#f59e0b', profession: '#0a66c2' };

// ── Mock Data ───────────────────────────────────────────────────────
const MOCK_CONNECTIONS = [
  { id: 1, name: 'Alex Rivera', handle: 'alex_codes', profession: 'Software Engineer', headline: 'Staff Engineer at Google', sharedSkins: ['Software Engineer'], status: 'connected' as const, avatar: 'Alex' },
  { id: 2, name: 'Dr. Priya Mehta', handle: 'drpriya', profession: 'Doctor', headline: 'Cardiologist at Mayo Clinic', sharedSkins: [], status: 'connected' as const, avatar: 'Priya' },
  { id: 3, name: 'Marcus Tran', handle: 'ml_marcus', profession: 'AI/ML Specialist', headline: 'ML Lead at OpenAI', sharedSkins: ['AI/ML Specialist'], status: 'connected' as const, avatar: 'Marcus' },
  { id: 4, name: 'Sarah Kim', handle: 'sarahk_pm', profession: 'Product Manager', headline: 'VP Product at Stripe', sharedSkins: [], status: 'pending' as const, avatar: 'Sarah' },
  { id: 5, name: 'James Chen', handle: 'jchen_ceo', profession: 'CEO', headline: 'CEO at TechCorp', sharedSkins: [], status: 'pending' as const, avatar: 'James' },
];

const MOCK_RECOMMENDATIONS = [
  { id: 1, recommenderName: 'Alex Rivera', recommenderProfession: 'Software Engineer', profession: 'Software Engineer', rating: 4.8, testimonial: 'Exceptional engineer with deep system design knowledge. Delivers consistently.', verified: true, avatar: 'Alex' },
  { id: 2, recommenderName: 'Lin M.', recommenderProfession: 'Entrepreneur', profession: 'Tech Entrepreneur', rating: 4.5, testimonial: 'Great technical co-founder material. Understands both code and business.', verified: true, avatar: 'Lin' },
  { id: 3, recommenderName: 'Dr. Priya Mehta', recommenderProfession: 'Doctor', profession: 'Software Engineer', rating: 5.0, testimonial: 'Built our entire telemedicine platform. Reliable and innovative.', verified: false, avatar: 'Priya' },
];

const MOCK_COMMUNITIES = [
  {
    id: 0, name: 'SWE Underground', avatarColor: '#0a66c2', avatarAbbr: 'SWE',
    description: 'Private space for software engineers to share side projects, job referrals, and raw opinions.',
    visibility: 'public' as const, gateType: 'specific' as const, requiredTier: 'community' as const,
    allowedProfessions: ['Software Engineer', 'DevOps Engineer', 'AI/ML Specialist'],
    memberCount: 2847, postCount: 1203,
    posts: [
      { id: 0, author: 'Alex R.', profession: 'Software Engineer', content: 'Hot take: Rust > Go for anything that matters. Fight me.', likes: 312, time: '2h', announcement: false },
      { id: 1, author: 'Priya S.', profession: 'DevOps Engineer', content: 'Monthly hiring board is live — drop your referral links below.', likes: 89, time: '1d', announcement: true },
    ],
    members: [
      { name: 'Alex Rivera', profession: 'Software Engineer', role: 'admin' as const },
      { name: 'Priya Singh', profession: 'DevOps Engineer', role: 'member' as const },
    ],
  },
  {
    id: 1, name: 'MD Lounge', avatarColor: '#00897B', avatarAbbr: 'MD',
    description: 'Verified doctors and surgeons only. Clinical discussions and career advice.',
    visibility: 'private' as const, gateType: 'specific' as const, requiredTier: 'marketplace' as const,
    allowedProfessions: ['Doctor', 'Surgeon', 'Nurse'],
    memberCount: 612, postCount: 389,
    posts: [
      { id: 2, author: 'Dr. Chen', profession: 'Surgeon', content: 'Interesting presentation today — 34F with atypical chest pain.', likes: 56, time: '3h', announcement: false },
    ],
    members: [
      { name: 'Dr. Chen', profession: 'Surgeon', role: 'admin' as const },
    ],
  },
  {
    id: 2, name: 'Founders Corner', avatarColor: '#37474F', avatarAbbr: 'FC',
    description: 'Any ValueSkin gets you in. About grit, not credentials.',
    visibility: 'public' as const, gateType: 'any_valueskin' as const, requiredTier: 'community' as const,
    allowedProfessions: [] as string[],
    memberCount: 5241, postCount: 4102,
    posts: [
      { id: 3, author: 'Sam K.', profession: 'CEO', content: 'Lesson from year 3: hire for mindset, train for skill. Churn dropped 40%.', likes: 901, time: '5h', announcement: false },
    ],
    members: [
      { name: 'Sam K.', profession: 'CEO', role: 'owner' as const },
    ],
  },
];

const MOCK_INVITATIONS = [
  { id: 1, senderName: 'Alex Rivera', communityName: 'SWE Underground', reason: 'Your ValueSkin matches our community requirements', createdAt: '2 days ago' },
];

const MOCK_REPUTATION = {
  score: 78, onTimeRate: 0.85, avgRating: 4.2, responseScore: 0.90,
  revisionEfficiency: 0.75, repeatBrandRate: 0.60, riskTier: 'B' as const, maxDealSize: 2000,
};

// ── Level Config ────────────────────────────────────────────────────
const LEVEL_FACTORS = {
  1: { name: 'Newcomer', minFollowers: 0, minEngagement: 0, minDealValue: 0, requirements: ['Brand new to professional content', 'Building initial following', 'Starting to establish thought leadership'] },
  2: { name: 'Rising Professional', minFollowers: 10000, minEngagement: 2, minDealValue: 500, requirements: ['10K+ followers', '2%+ engagement rate', 'Completed 5+ partnerships'] },
  3: { name: 'Established Professional', minFollowers: 50000, minEngagement: 3.5, minDealValue: 5000, requirements: ['50K+ followers', '3.5%+ engagement rate', '20+ partnerships', '$5K+ avg value'] },
  4: { name: 'Top Tier Professional', minFollowers: 250000, minEngagement: 5, minDealValue: 25000, requirements: ['250K+ followers', '5%+ engagement', '50+ partnerships', 'Recognized thought leader'] },
  5: { name: 'Elite Industry Leader', minFollowers: 1000000, minEngagement: 7, minDealValue: 100000, requirements: ['1M+ followers', '7%+ engagement', '100+ partnerships', 'Top 1% in industry'] },
};

const REPUTATION_SCORE_FACTORS = {
  max: 1000,
  factors: [
    { name: 'Partnership Completion Rate', weight: 25, description: 'Percentage of accepted deals completed', maxPoints: 250 },
    { name: 'On-Time Delivery', weight: 20, description: 'Percentage of deliverables on time', maxPoints: 200 },
    { name: 'Partner Ratings', weight: 20, description: 'Average rating from partners', maxPoints: 200 },
    { name: 'Engagement Quality', weight: 15, description: 'Quality of post engagement', maxPoints: 150 },
    { name: 'Professional Level', weight: 10, description: 'Current Valueskins Level', maxPoints: 100 },
    { name: 'Community Contribution', weight: 10, description: 'Professional participation', maxPoints: 100 },
  ]
};

// ── Colors ───────────────────────────────────────────────────────────
const C = {
  primary: '#0a66c2', primaryLight: '#e8f1ff', bg: '#f4f2ee', surface: '#fff',
  text: '#000', textSecondary: '#666', textMuted: '#999',
  border: '#d0d0d0', borderLight: '#e8e8e8', card: '#fff',
};

// ── Main Component ──────────────────────────────────────────────────
export default function LinkedInDemoPage() {
  // Navigation
  const [activeView, setActiveView] = useState<'profile' | 'network' | 'jobs' | 'communities' | 'store' | 'settings'>('profile');

  // Config
  const { levels, isLoaded: levelsLoaded } = useLevelConfig();
  const { factors, isLoaded: factorsLoaded } = useReputationConfig();

  // Profile state
  const [isFollowing, setIsFollowing] = useState(false);
  const [metrics, setMetrics] = useState({ followers: 580000, engagement: 5.2, dealsCompleted: 32, avgDealValue: 35000, onTimeRate: 98, brandRating: 4.75 });
  const currentLevel = levelsLoaded ? calculateLevel(metrics, levels) : 1;

  // ValueSkin state (3-slot system)
  const [valueSkins, setValueSkins] = useState<Record<SlotKey, { profession: string } | null>>({
    hobby: null, passion: null, profession: null,
  });
  const [assigningSlot, setAssigningSlot] = useState<SlotKey | null>(null);
  const [storeCategory, setStoreCategory] = useState<string | null>(null);
  const hasValueSkin = Object.values(valueSkins).some(Boolean);
  const userProfessions = Object.values(valueSkins).filter(Boolean).map(s => s!.profession);

  // LinkedIn profile state
  const [linkedInLinked, setLinkedInLinked] = useState(false);
  const [linkedInPublic, setLinkedInPublic] = useState(true);
  const [linkedInUrl, setLinkedInUrl] = useState('');

  // Network state
  const [networkTab, setNetworkTab] = useState<'connections' | 'shared' | 'pending'>('connections');
  const [connections, setConnections] = useState(MOCK_CONNECTIONS);

  // Recommendations state
  const [profileTab, setProfileTab] = useState<'about' | 'recommendations' | 'insights'>('about');

  // Communities state
  const [communitiesTab, setCommunitiesTab] = useState<'discover' | 'mine'>('discover');
  const [activeCommunity, setActiveCommunity] = useState<number | null>(null);
  const [communityInnerTab, setCommunityInnerTab] = useState<'feed' | 'members'>('feed');
  const [joinedCommunities, setJoinedCommunities] = useState<number[]>([0]);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  // Store state
  const [storeTab, setStoreTab] = useState<'creators' | 'brands'>('creators');
  const [brandValueSkin, setBrandValueSkin] = useState<string | null>(null);

  // Invitation state
  const [pendingInvitations, setPendingInvitations] = useState(MOCK_INVITATIONS);

  // Settings state
  const [willingToBarter, setWillingToBarter] = useState(false);
  const [creatorEnergy, setCreatorEnergy] = useState<'available' | 'limited' | 'burnout' | 'pause'>('available');
  const [creatorPriceBand, setCreatorPriceBand] = useState<'experimental' | 'mid-tier' | 'premium' | 'exclusive'>('mid-tier');

  // Modal state
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [showReputationModal, setShowReputationModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showRecommendModal, setShowRecommendModal] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // Recommend form
  const [recProfession, setRecProfession] = useState('');
  const [recRating, setRecRating] = useState('4.5');
  const [recTestimonial, setRecTestimonial] = useState('');

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setMetrics(prev => ({ ...prev, followers: prev.followers + (isFollowing ? -1 : 1) }));
  };

  const updateMetric = (key: string, value: string) => {
    setMetrics(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const canJoinCommunity = (comm: typeof MOCK_COMMUNITIES[0]) => {
    if (!hasValueSkin) return false;
    if (comm.gateType === 'any_valueskin') return true;
    return comm.allowedProfessions.some(p => userProfessions.includes(p));
  };

  const getBadge = (profession: string) => PROFESSION_BADGES[profession] || { color: C.primary, abbreviation: profession.slice(0, 3).toUpperCase() };

  return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      {/* ── LEFT SIDEBAR ──────────────────────────────────────────── */}
      <div style={{ width: '240px', borderRight: `1px solid ${C.border}`, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', height: '100vh', overflowY: 'auto', position: 'sticky', top: 0, background: C.surface }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: C.primary, marginBottom: '16px', cursor: 'pointer' }}>LinkedIn</div>
        </Link>

        <NavItem label="Me" active={activeView === 'profile'} onClick={() => setActiveView('profile')} />
        <NavItem label="My Network" active={activeView === 'network'} onClick={() => setActiveView('network')} />
        <NavItem label="Jobs & Partnerships" active={activeView === 'jobs'} onClick={() => setActiveView('jobs')} />
        <div style={{ height: '1px', background: C.border, margin: '4px 0' }} />
        <NavItem label="Communities" active={activeView === 'communities'} onClick={() => { setActiveView('communities'); setActiveCommunity(null); }} />
        <NavItem label="ValueSkin Store" active={activeView === 'store'} onClick={() => setActiveView('store')} />
        <NavItem label="Settings" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />

        {/* ValueSkin Stickers */}
        {hasValueSkin && (
          <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: `1px solid ${C.borderLight}` }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '8px' }}>Your ValueSkins</div>
            {SLOTS.map(slot => {
              const skin = valueSkins[slot];
              if (!skin) return null;
              const badge = getBadge(skin.profession);
              return (
                <div key={slot} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: badge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '9px', fontWeight: 700 }}>{badge.abbreviation}</div>
                  <div style={{ fontSize: '12px', color: C.text, fontWeight: 500 }}>{skin.profession}</div>
                  <div style={{ fontSize: '9px', color: SLOT_COLORS[slot], fontWeight: 700 }}>{SLOT_LABELS[slot].toUpperCase()}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>

          {/* ── PROFILE VIEW ────────────────────────────────────── */}
          {activeView === 'profile' && (
            <>
              {/* Profile Card */}
              <div style={{ background: C.card, borderRadius: '8px', border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ height: '180px', background: 'linear-gradient(135deg, #0a66c2 0%, #005a96 100%)' }} />
                <div style={{ padding: '16px 24px 24px' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #0a66c2, #0052cc)', border: '4px solid #fff', marginTop: '-60px', marginBottom: '16px', overflow: 'hidden' }}>
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Saketh" alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: C.text }}>Saketh Velamuri</h2>
                      <button onClick={() => setShowLevelModal(true)} style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', color: 'white', fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        LVL {currentLevel}
                      </button>
                      {/* ValueSkin badges on profile */}
                      {SLOTS.map(slot => {
                        const skin = valueSkins[slot];
                        if (!skin) return null;
                        const badge = getBadge(skin.profession);
                        return (
                          <div key={slot} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: `${badge.color}15`, border: `1px solid ${badge.color}40`, borderRadius: '12px', padding: '2px 8px' }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: badge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '7px', fontWeight: 700 }}>{badge.abbreviation}</div>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: badge.color }}>{skin.profession}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ color: C.textSecondary, fontSize: '15px', marginBottom: '4px' }}>Full Stack Engineer at Valueskins</div>
                    <div style={{ color: C.textMuted, fontSize: '13px' }}>San Francisco Bay Area</div>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: '20px', padding: '12px 0', borderTop: `1px solid ${C.borderLight}`, borderBottom: `1px solid ${C.borderLight}`, marginBottom: '16px', fontSize: '13px' }}>
                    <button onClick={() => setShowMetricsModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                      <div style={{ color: C.text, fontWeight: 600 }}>{(metrics.followers / 1000).toFixed(0)}K</div>
                      <div style={{ color: C.textSecondary }}>followers</div>
                    </button>
                    <div style={{ borderRight: `1px solid ${C.borderLight}` }} />
                    <div><div style={{ color: C.text, fontWeight: 600 }}>{connections.filter(c => c.status === 'connected').length}</div><div style={{ color: C.textSecondary }}>connections</div></div>
                    <div style={{ borderRight: `1px solid ${C.borderLight}` }} />
                    <div><div style={{ color: C.text, fontWeight: 600 }}>{MOCK_RECOMMENDATIONS.length}</div><div style={{ color: C.textSecondary }}>recommendations</div></div>
                  </div>

                  {/* LinkedIn Link Status */}
                  <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '8px', border: `1px solid ${linkedInLinked ? '#10b98140' : C.borderLight}`, background: linkedInLinked ? 'rgba(16,185,129,0.05)' : C.bg }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700 }}>in</div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{linkedInLinked ? 'LinkedIn Connected' : 'Link LinkedIn Profile'}</div>
                          <div style={{ fontSize: '11px', color: C.textMuted }}>{linkedInLinked ? (linkedInPublic ? 'Public' : 'Private') : 'Verify your professional identity'}</div>
                        </div>
                      </div>
                      <button onClick={() => linkedInLinked ? setLinkedInLinked(false) : setShowLinkModal(true)} style={{ fontSize: '12px', fontWeight: 600, color: linkedInLinked ? '#ef4444' : C.primary, background: 'none', border: 'none', cursor: 'pointer' }}>
                        {linkedInLinked ? 'Unlink' : 'Link'}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleFollow} style={{ flex: 1, background: isFollowing ? '#f0f0f0' : C.primary, color: isFollowing ? C.primary : '#fff', border: isFollowing ? `1px solid ${C.primary}` : 'none', borderRadius: '20px', padding: '10px 16px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button style={{ flex: 1, background: '#f0f0f0', color: C.text, border: 'none', borderRadius: '20px', padding: '10px 16px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Message</button>
                  </div>
                </div>
              </div>

              {/* Profile Tabs: About / Recommendations / Insights */}
              <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, background: C.card, borderRadius: '8px 8px 0 0', marginBottom: 0 }}>
                {(['about', 'recommendations', 'insights'] as const).map(tab => (
                  <div key={tab} onClick={() => setProfileTab(tab)} style={{ flex: 1, textAlign: 'center', padding: '14px 0', fontSize: '13px', fontWeight: profileTab === tab ? 700 : 500, color: profileTab === tab ? C.primary : C.textMuted, borderBottom: profileTab === tab ? `2px solid ${C.primary}` : '2px solid transparent', cursor: 'pointer', textTransform: 'capitalize' }}>
                    {tab}
                  </div>
                ))}
              </div>

              {/* About Tab */}
              {profileTab === 'about' && (
                <div style={{ background: C.card, borderRadius: '0 0 8px 8px', border: `1px solid ${C.border}`, borderTop: 'none', padding: '16px 24px', marginBottom: '16px' }}>
                  <p style={{ color: C.textSecondary, fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                    Building the decentralized reputation layer for the creator economy. Full Stack Engineer passionate about Web3, open finance, and creator empowerment.
                  </p>
                </div>
              )}

              {/* Recommendations Tab */}
              {profileTab === 'recommendations' && (
                <div style={{ background: C.card, borderRadius: '0 0 8px 8px', border: `1px solid ${C.border}`, borderTop: 'none', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>Professional Recommendations</div>
                    <button onClick={() => setShowRecommendModal(true)} style={{ fontSize: '12px', fontWeight: 600, color: C.primary, background: 'none', border: `1px solid ${C.primary}`, borderRadius: '16px', padding: '6px 12px', cursor: 'pointer' }}>+ Give</button>
                  </div>
                  {MOCK_RECOMMENDATIONS.map(rec => {
                    const badge = getBadge(rec.profession);
                    return (
                      <div key={rec.id} style={{ padding: '14px', border: `1px solid ${C.borderLight}`, borderRadius: '8px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden' }}>
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${rec.avatar}`} alt="" style={{ width: '100%', height: '100%' }} />
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{rec.recommenderName}</div>
                              <div style={{ fontSize: '11px', color: C.textMuted }}>{rec.recommenderProfession}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: badge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '8px', fontWeight: 700 }}>{badge.abbreviation}</div>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#f59e0b' }}>{rec.rating.toFixed(1)}</span>
                            {rec.verified && <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>Verified</span>}
                          </div>
                        </div>
                        <div style={{ fontSize: '13px', color: C.textSecondary, lineHeight: 1.5, fontStyle: 'italic' }}>"{rec.testimonial}"</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Insights Tab (Reputation Score) */}
              {profileTab === 'insights' && (
                <div style={{ background: C.card, borderRadius: '0 0 8px 8px', border: `1px solid ${C.border}`, borderTop: 'none', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: MOCK_REPUTATION.score >= 80 ? '#10b981' : MOCK_REPUTATION.score >= 50 ? '#f59e0b' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', fontWeight: 700 }}>{MOCK_REPUTATION.score}</div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: C.text }}>Creator Score</div>
                      <div style={{ fontSize: '12px', color: C.textMuted }}>Based on 5 performance dimensions</div>
                    </div>
                    <div style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: '6px', background: ({'A': '#10b981', 'B': C.primary, 'C': '#f59e0b', 'D': '#ef4444'} as Record<string, string>)[MOCK_REPUTATION.riskTier] ?? '#f59e0b', color: '#fff', fontSize: '12px', fontWeight: 700 }}>
                      Tier {MOCK_REPUTATION.riskTier} | Max ${MOCK_REPUTATION.maxDealSize}
                    </div>
                  </div>
                  {[
                    { label: 'On-Time Rate', value: MOCK_REPUTATION.onTimeRate },
                    { label: 'Avg Rating', value: MOCK_REPUTATION.avgRating / 5 },
                    { label: 'Response Score', value: MOCK_REPUTATION.responseScore },
                    { label: 'Revision Efficiency', value: MOCK_REPUTATION.revisionEfficiency },
                    { label: 'Repeat Brand Rate', value: MOCK_REPUTATION.repeatBrandRate },
                  ].map(dim => (
                    <div key={dim.label} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span style={{ color: C.textSecondary }}>{dim.label}</span>
                        <span style={{ fontWeight: 600, color: C.text }}>{(dim.value * 100).toFixed(0)}%</span>
                      </div>
                      <div style={{ height: '6px', background: C.borderLight, borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${dim.value * 100}%`, background: dim.value >= 0.8 ? '#10b981' : dim.value >= 0.5 ? '#f59e0b' : '#ef4444', borderRadius: '3px', transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  ))}

                  <button onClick={() => setShowReputationModal(true)} style={{ width: '100%', marginTop: '12px', padding: '10px', background: 'rgba(10,102,194,0.08)', border: `1px solid ${C.primary}40`, borderRadius: '8px', color: C.primary, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    View Full Reputation Breakdown
                  </button>
                </div>
              )}

              {/* Valueskins Verified Card */}
              <div style={{ background: C.card, borderRadius: '8px', border: `1px solid ${C.border}`, padding: '16px 24px', marginBottom: '16px' }}>
                <button onClick={() => setShowReputationModal(true)} style={{ width: '100%', padding: '12px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #333', fontSize: '16px', fontWeight: 'bold', color: '#c4b5fd' }}>VS</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#7c3aed' }}>Valueskins Verified</div>
                    <div style={{ fontSize: '12px', color: C.textMuted }}>847 / 1000 Score</div>
                  </div>
                </button>
              </div>
            </>
          )}

          {/* ── NETWORK VIEW ────────────────────────────────────── */}
          {activeView === 'network' && (
            <>
              <div style={{ background: C.card, borderRadius: '8px', border: `1px solid ${C.border}`, padding: '16px 24px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, marginBottom: '8px', color: C.text }}>My Network</h2>
                <p style={{ color: C.textSecondary, fontSize: '14px', margin: 0 }}>
                  Connections with shared ValueSkins are highlighted.
                </p>
              </div>

              {/* Pending Invitations */}
              {pendingInvitations.length > 0 && (
                <div style={{ background: 'rgba(10,102,194,0.05)', border: `1px solid ${C.primary}30`, borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: C.primary, marginBottom: '10px' }}>Community Invitations</div>
                  {pendingInvitations.map(inv => (
                    <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: C.card, borderRadius: '6px', marginBottom: '6px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{inv.senderName} invited you to {inv.communityName}</div>
                        <div style={{ fontSize: '11px', color: C.textMuted }}>{inv.reason}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => { setPendingInvitations(p => p.filter(i => i.id !== inv.id)); showToast('Invitation accepted'); }} style={{ fontSize: '11px', fontWeight: 600, background: C.primary, color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer' }}>Accept</button>
                        <button onClick={() => { setPendingInvitations(p => p.filter(i => i.id !== inv.id)); showToast('Invitation declined'); }} style={{ fontSize: '11px', fontWeight: 600, background: '#f0f0f0', color: C.textSecondary, border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer' }}>Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Network Tabs */}
              <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, background: C.card, borderRadius: '8px 8px 0 0' }}>
                {(['connections', 'shared', 'pending'] as const).map(tab => (
                  <div key={tab} onClick={() => setNetworkTab(tab)} style={{ flex: 1, textAlign: 'center', padding: '12px 0', fontSize: '13px', fontWeight: networkTab === tab ? 700 : 500, color: networkTab === tab ? C.primary : C.textMuted, borderBottom: networkTab === tab ? `2px solid ${C.primary}` : '2px solid transparent', cursor: 'pointer', textTransform: 'capitalize' }}>
                    {tab === 'shared' ? 'Shared Skins' : tab}
                  </div>
                ))}
              </div>

              <div style={{ background: C.card, borderRadius: '0 0 8px 8px', border: `1px solid ${C.border}`, borderTop: 'none', padding: '16px' }}>
                {connections
                  .filter(c => {
                    if (networkTab === 'connections') return c.status === 'connected';
                    if (networkTab === 'shared') return c.status === 'connected' && c.sharedSkins.length > 0;
                    return c.status === 'pending';
                  })
                  .map(conn => (
                    <div key={conn.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: `1px solid ${conn.sharedSkins.length > 0 ? `${C.primary}30` : C.borderLight}`, borderRadius: '8px', marginBottom: '8px', background: conn.sharedSkins.length > 0 ? 'rgba(10,102,194,0.03)' : 'transparent' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conn.avatar}`} alt="" style={{ width: '100%', height: '100%' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>{conn.name}</span>
                          {(() => { const badge = getBadge(conn.profession); return (
                            <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: badge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '7px', fontWeight: 700 }}>{badge.abbreviation}</div>
                          ); })()}
                        </div>
                        <div style={{ fontSize: '12px', color: C.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conn.headline}</div>
                        {conn.sharedSkins.length > 0 && (
                          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                            {conn.sharedSkins.map(s => (
                              <span key={s} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: `${C.primary}15`, color: C.primary, fontWeight: 600 }}>Shared: {s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      {conn.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                          <button onClick={() => { setConnections(prev => prev.map(c => c.id === conn.id ? { ...c, status: 'connected' as const } : c)); showToast('Connection accepted'); }} style={{ fontSize: '11px', fontWeight: 600, background: C.primary, color: '#fff', border: 'none', borderRadius: '16px', padding: '6px 12px', cursor: 'pointer' }}>Accept</button>
                          <button onClick={() => { setConnections(prev => prev.filter(c => c.id !== conn.id)); }} style={{ fontSize: '11px', fontWeight: 600, background: '#f0f0f0', color: C.textMuted, border: 'none', borderRadius: '16px', padding: '6px 12px', cursor: 'pointer' }}>Ignore</button>
                        </div>
                      )}
                    </div>
                  ))}
                {networkTab === 'shared' && connections.filter(c => c.status === 'connected' && c.sharedSkins.length > 0).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px', color: C.textMuted, fontSize: '13px' }}>No connections with shared ValueSkins yet.</div>
                )}
                {networkTab === 'pending' && connections.filter(c => c.status === 'pending').length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px', color: C.textMuted, fontSize: '13px' }}>No pending connection requests.</div>
                )}
              </div>
            </>
          )}

          {/* ── JOBS & PARTNERSHIPS VIEW ─────────────────────────── */}
          {activeView === 'jobs' && (
            <>
              <div style={{ background: C.card, borderRadius: '8px', border: `1px solid ${C.border}`, padding: '16px 24px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, marginBottom: '8px', color: C.text }}>Jobs & Partnerships</h2>
                <p style={{ color: C.textSecondary, fontSize: '14px', margin: 0 }}>AI-matched opportunities based on your ValueSkins and profile.</p>
              </div>

              {hasValueSkin && (
                <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>ValuSkin Matching Active — showing opportunities matched to: {userProfessions.join(', ')}</span>
                </div>
              )}

              {[
                { company: 'Stripe', role: 'Technical Advisor', match: '96%', type: 'Advisory Board', matchedSkin: 'Software Engineer' },
                { company: 'Sequoia Capital', role: 'Creator Economy Expert', match: '89%', type: 'Consulting', matchedSkin: 'Tech Entrepreneur' },
                { company: 'OpenAI', role: 'Partner Integration', match: '84%', type: 'Partnership', matchedSkin: 'AI/ML Specialist' },
                { company: 'McKinsey', role: 'Digital Transformation Lead', match: '78%', type: 'Consulting', matchedSkin: 'Consultant' },
              ].map((opp, i) => {
                const matched = userProfessions.includes(opp.matchedSkin);
                return (
                  <div key={i} style={{ background: C.card, borderRadius: '8px', border: `1px solid ${matched ? `${C.primary}40` : C.border}`, padding: '16px 24px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>{opp.company}</div>
                        <div style={{ color: C.textSecondary, fontSize: '14px', marginBottom: '4px' }}>{opp.role}</div>
                        <div style={{ color: C.textMuted, fontSize: '13px' }}>{opp.type}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ background: 'rgba(10,102,194,0.1)', color: C.primary, padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 600 }}>{opp.match} Match</div>
                        {matched && (
                          <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>Matched via {opp.matchedSkin}</div>
                        )}
                      </div>
                    </div>
                    <button style={{ width: '100%', background: C.primary, color: '#fff', border: 'none', borderRadius: '20px', padding: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>View Details</button>
                  </div>
                );
              })}
            </>
          )}

          {/* ── COMMUNITIES VIEW ─────────────────────────────────── */}
          {activeView === 'communities' && activeCommunity === null && (
            <>
              <div style={{ background: C.card, borderRadius: '8px', border: `1px solid ${C.border}`, padding: '16px 24px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, marginBottom: '8px', color: C.text }}>Communities</h2>
                <p style={{ color: C.textSecondary, fontSize: '14px', margin: 0 }}>ValueSkin-gated professional groups.</p>
              </div>

              <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, background: C.card, borderRadius: '8px 8px 0 0' }}>
                {(['discover', 'mine'] as const).map(tab => (
                  <div key={tab} onClick={() => setCommunitiesTab(tab)} style={{ flex: 1, textAlign: 'center', padding: '12px 0', fontSize: '13px', fontWeight: communitiesTab === tab ? 700 : 500, color: communitiesTab === tab ? C.primary : C.textMuted, borderBottom: communitiesTab === tab ? `2px solid ${C.primary}` : '2px solid transparent', cursor: 'pointer', textTransform: 'capitalize' }}>
                    {tab === 'mine' ? 'My Communities' : tab}
                  </div>
                ))}
              </div>

              <div style={{ background: C.card, borderRadius: '0 0 8px 8px', border: `1px solid ${C.border}`, borderTop: 'none', padding: '16px' }}>
                {MOCK_COMMUNITIES
                  .filter(c => communitiesTab === 'mine' ? joinedCommunities.includes(c.id) : true)
                  .map(comm => {
                    const joined = joinedCommunities.includes(comm.id);
                    const eligible = canJoinCommunity(comm);
                    return (
                      <div key={comm.id} style={{ padding: '14px', border: `1px solid ${C.borderLight}`, borderRadius: '8px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: comm.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>{comm.avatarAbbr}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>{comm.name}</span>
                              <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: comm.visibility === 'private' ? '#f59e0b20' : '#10b98120', color: comm.visibility === 'private' ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                                {comm.visibility === 'private' ? 'Private' : 'Public'}
                              </span>
                            </div>
                            <div style={{ fontSize: '12px', color: C.textSecondary, marginBottom: '6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{comm.description}</div>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                              {comm.gateType === 'any_valueskin' ? (
                                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: '#f0f0f0', color: C.textMuted }}>Any ValueSkin</span>
                              ) : comm.allowedProfessions.map(p => {
                                const badge = getBadge(p);
                                return <span key={p} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: `${badge.color}15`, color: badge.color, fontWeight: 600 }}>{badge.abbreviation}</span>;
                              })}
                              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: comm.requiredTier === 'marketplace' ? '#e6510020' : '#f0f0f0', color: comm.requiredTier === 'marketplace' ? '#e65100' : C.textMuted }}>{comm.requiredTier} tier</span>
                            </div>
                            <div style={{ fontSize: '11px', color: C.textMuted }}>{comm.memberCount} members · {comm.postCount} posts</div>
                          </div>
                        </div>
                        <div>
                          {joined ? (
                            <button onClick={() => { setActiveCommunity(comm.id); setCommunityInnerTab('feed'); }} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.primary}`, background: 'transparent', color: C.primary, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Open</button>
                          ) : eligible ? (
                            <button onClick={() => { setJoinedCommunities(prev => [...prev, comm.id]); showToast(`Joined ${comm.name}!`); }} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none', background: '#10b981', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Join</button>
                          ) : (
                            <button disabled style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.borderLight}`, background: '#f5f5f5', color: C.textMuted, fontSize: '12px', fontWeight: 500, cursor: 'not-allowed' }}>
                              {!hasValueSkin ? 'Get a ValueSkin to join' : 'Requires matching ValueSkin'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          )}

          {/* ── COMMUNITY DETAIL VIEW ────────────────────────────── */}
          {activeView === 'communities' && activeCommunity !== null && (() => {
            const comm = MOCK_COMMUNITIES.find(c => c.id === activeCommunity)!;
            return (
              <>
                <div style={{ background: C.card, borderRadius: '8px', border: `1px solid ${C.border}`, padding: '16px 24px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => setActiveCommunity(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: C.textSecondary, padding: 0 }}>←</button>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: comm.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700 }}>{comm.avatarAbbr}</div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: C.text }}>{comm.name}</div>
                      <div style={{ fontSize: '12px', color: C.textMuted }}>{comm.memberCount} members · {comm.postCount} posts</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, background: C.card, borderRadius: '8px 8px 0 0' }}>
                  {(['feed', 'members'] as const).map(tab => (
                    <div key={tab} onClick={() => setCommunityInnerTab(tab)} style={{ flex: 1, textAlign: 'center', padding: '12px 0', fontSize: '13px', fontWeight: communityInnerTab === tab ? 700 : 500, color: communityInnerTab === tab ? C.primary : C.textMuted, borderBottom: communityInnerTab === tab ? `2px solid ${C.primary}` : '2px solid transparent', cursor: 'pointer', textTransform: 'capitalize' }}>{tab}</div>
                  ))}
                </div>

                <div style={{ background: C.card, borderRadius: '0 0 8px 8px', border: `1px solid ${C.border}`, borderTop: 'none', padding: '16px' }}>
                  {communityInnerTab === 'feed' && comm.posts.map(post => (
                    <div key={post.id} style={{ padding: '14px', border: `1px solid ${post.announcement ? `${C.primary}30` : C.borderLight}`, borderRadius: '8px', marginBottom: '10px', background: post.announcement ? 'rgba(10,102,194,0.03)' : 'transparent' }}>
                      {post.announcement && <div style={{ fontSize: '10px', color: C.primary, fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Announcement</div>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{post.author}</span>
                        {(() => { const badge = getBadge(post.profession); return <div style={{ width: '16px', height: '16px', borderRadius: '3px', background: badge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '7px', fontWeight: 700 }}>{badge.abbreviation}</div>; })()}
                        <span style={{ fontSize: '11px', color: C.textMuted }}>{post.time}</span>
                      </div>
                      <div style={{ fontSize: '14px', color: C.text, lineHeight: 1.5, marginBottom: '10px' }}>{post.content}</div>
                      <button
                        onClick={() => setLikedPosts(prev => prev.includes(post.id) ? prev.filter(id => id !== post.id) : [...prev, post.id])}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: likedPosts.includes(post.id) ? '#ef4444' : C.textMuted, display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                      >
                        {likedPosts.includes(post.id) ? '❤' : '♡'} {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
                      </button>
                    </div>
                  ))}

                  {communityInnerTab === 'members' && comm.members.map((member, i) => {
                    const badge = getBadge(member.profession);
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: `1px solid ${C.borderLight}`, borderRadius: '8px', marginBottom: '8px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden' }}>
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} alt="" style={{ width: '100%', height: '100%' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{member.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '3px', background: badge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '7px', fontWeight: 700 }}>{badge.abbreviation}</div>
                            <span style={{ fontSize: '11px', color: C.textMuted }}>{member.profession}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: member.role === 'owner' ? '#e6510020' : member.role === 'admin' ? `${C.primary}15` : '#f0f0f0', color: member.role === 'owner' ? '#e65100' : member.role === 'admin' ? C.primary : C.textMuted, textTransform: 'capitalize' }}>{member.role}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}

          {/* ── STORE VIEW ───────────────────────────────────────── */}
          {activeView === 'store' && (
            <>
              <div style={{ background: C.card, borderRadius: '8px', border: `1px solid ${C.border}`, padding: '16px 24px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, marginBottom: '8px', color: C.text }}>ValueSkin Store</h2>
                <p style={{ color: C.textSecondary, fontSize: '14px', margin: 0 }}>Get your professional badge for $10</p>
              </div>

              <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, background: C.card, borderRadius: '8px 8px 0 0' }}>
                {(['creators', 'brands'] as const).map(tab => (
                  <div key={tab} onClick={() => setStoreTab(tab)} style={{ flex: 1, textAlign: 'center', padding: '12px 0', fontSize: '13px', fontWeight: storeTab === tab ? 700 : 500, color: storeTab === tab ? C.primary : C.textMuted, borderBottom: storeTab === tab ? `2px solid ${C.primary}` : '2px solid transparent', cursor: 'pointer' }}>
                    {tab === 'creators' ? 'For Professionals' : 'For Brands'}
                  </div>
                ))}
              </div>

              <div style={{ background: C.card, borderRadius: '0 0 8px 8px', border: `1px solid ${C.border}`, borderTop: 'none', padding: '16px' }}>
                {storeTab === 'creators' && (
                  <>
                    {/* Slot selector */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '10px' }}>Assign to slot</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {SLOTS.map(slot => {
                          const current = valueSkins[slot];
                          const active = assigningSlot === slot;
                          return (
                            <button key={slot} onClick={() => setAssigningSlot(active ? null : slot)} style={{ flex: 1, padding: '10px 8px', background: active ? `${SLOT_COLORS[slot]}20` : C.card, border: `2px solid ${active ? SLOT_COLORS[slot] : C.border}`, borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s' }}>
                              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: SLOT_COLORS[slot], marginBottom: '4px' }}>{SLOT_LABELS[slot]}</div>
                              <div style={{ fontSize: '12px', color: current ? C.text : C.textMuted, fontWeight: current ? 600 : 400 }}>{current ? (PROFESSION_BADGES[current.profession]?.abbreviation ?? current.profession.slice(0, 3)) : 'Empty'}</div>
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ fontSize: '12px', color: assigningSlot ? SLOT_COLORS[assigningSlot] : C.textMuted, marginTop: '8px', fontWeight: assigningSlot ? 600 : 400 }}>
                        {assigningSlot ? `Selecting for ${SLOT_LABELS[assigningSlot]} slot — tap category below ($10)` : 'Select a slot above, then choose a profession.'}
                      </div>
                    </div>

                    {/* Profession categories */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {Object.values(PROFESSIONS).map(prof => (
                        <button key={prof.name} onClick={() => { if (assigningSlot) { setStoreCategory(prof.name); setShowStoreModal(true); } }} style={{ padding: '14px', background: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, cursor: assigningSlot ? 'pointer' : 'default', fontWeight: 600, fontSize: '14px', textAlign: 'left', opacity: assigningSlot ? 1 : 0.6, transition: 'all 0.15s' }}>
                          <div style={{ marginBottom: '4px' }}>{prof.name}</div>
                          <div style={{ fontSize: '12px', color: assigningSlot ? C.primary : C.textMuted, fontWeight: 700 }}>{assigningSlot ? '$10' : '—'}</div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {storeTab === 'brands' && (
                  <>
                    <p style={{ fontSize: '13px', color: C.textSecondary, lineHeight: 1.6, marginBottom: '16px', marginTop: 0 }}>
                      Establish your brand identity. Your ValueSkin tells professionals what kind of brand you are.
                    </p>
                    {brandValueSkin && (
                      <div style={{ background: 'rgba(230,81,0,0.08)', border: '1px solid rgba(230,81,0,0.25)', borderRadius: '10px', padding: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#E65100', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 700 }}>{brandValueSkin.slice(0, 3).toUpperCase()}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>{brandValueSkin}</div>
                          <div style={{ fontSize: '11px', color: C.textMuted }}>Your active brand identity</div>
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {Object.values(PROFESSIONS).map(prof => (
                        <button key={prof.name} onClick={() => { setBrandValueSkin(prof.subProfessions[0]); showToast(`Brand identity set to ${prof.subProfessions[0]}`); }} style={{ padding: '14px', background: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, cursor: 'pointer', fontWeight: 600, fontSize: '14px', textAlign: 'left' }}>
                          <div style={{ marginBottom: '4px' }}>{prof.name}</div>
                          <div style={{ fontSize: '12px', color: '#e65100', fontWeight: 700 }}>${10}</div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* ── SETTINGS VIEW ────────────────────────────────────── */}
          {activeView === 'settings' && (
            <>
              <div style={{ background: C.card, borderRadius: '8px', border: `1px solid ${C.border}`, padding: '16px 24px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, marginBottom: '8px', color: C.text }}>Settings</h2>
                <p style={{ color: C.textSecondary, fontSize: '14px', margin: 0 }}>ValuSkins preferences</p>
              </div>

              <div style={{ background: C.card, borderRadius: '8px', border: `1px solid ${C.border}`, padding: '20px' }}>
                {/* LinkedIn Visibility */}
                {linkedInLinked && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '12px' }}>LinkedIn Profile</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderRadius: '8px', border: `1px solid ${C.borderLight}` }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>Profile Visibility</div>
                        <div style={{ fontSize: '12px', color: C.textMuted }}>{linkedInPublic ? 'Your LinkedIn profile is publicly visible' : 'Your LinkedIn profile is private'}</div>
                      </div>
                      <button onClick={() => { setLinkedInPublic(!linkedInPublic); showToast(linkedInPublic ? 'Profile set to private' : 'Profile set to public'); }} style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', background: linkedInPublic ? '#10b981' : '#d0d0d0', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: linkedInPublic ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Barter Toggle */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '12px' }}>Collaboration Preferences</div>
                  <div style={{ borderRadius: '8px', border: `1px solid ${willingToBarter ? '#10b98140' : C.borderLight}`, padding: '14px', background: willingToBarter ? 'rgba(16,185,129,0.04)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>Open to Free / Exposure / Barter</div>
                      <div style={{ fontSize: '12px', color: C.textMuted }}>Visible on your profile and marketplace.</div>
                    </div>
                    <button onClick={() => setWillingToBarter(!willingToBarter)} style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', background: willingToBarter ? '#10b981' : '#d0d0d0', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: willingToBarter ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                    </button>
                  </div>
                </div>

                {/* Energy State */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '12px' }}>Availability</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {([
                      { key: 'available' as const, label: 'Available', color: '#10b981' },
                      { key: 'limited' as const, label: 'Limited', color: '#f59e0b' },
                      { key: 'burnout' as const, label: 'Burnout', color: '#ef4444' },
                      { key: 'pause' as const, label: 'Paused', color: '#6b7280' },
                    ]).map(({ key, label, color }) => (
                      <button key={key} onClick={() => setCreatorEnergy(key)} style={{ flex: 1, padding: '10px 8px', borderRadius: '8px', border: `1px solid ${creatorEnergy === key ? color : C.border}`, background: creatorEnergy === key ? `${color}15` : C.card, color: creatorEnergy === key ? color : C.textMuted, fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>{label}</button>
                    ))}
                  </div>
                </div>

                {/* Price Band */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '12px' }}>Price Band</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {([
                      { key: 'experimental' as const, label: 'Experimental' },
                      { key: 'mid-tier' as const, label: 'Mid-Tier' },
                      { key: 'premium' as const, label: 'Premium' },
                      { key: 'exclusive' as const, label: 'Exclusive' },
                    ]).map(({ key, label }) => (
                      <button key={key} onClick={() => setCreatorPriceBand(key)} style={{ flex: 1, padding: '10px 8px', borderRadius: '8px', border: `1px solid ${creatorPriceBand === key ? C.primary : C.border}`, background: creatorPriceBand === key ? `${C.primary}15` : C.card, color: creatorPriceBand === key ? C.primary : C.textMuted, fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>{label}</button>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '14px', background: 'rgba(10,102,194,0.06)', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: C.textMuted, lineHeight: 1.5 }}>Settings are synced to your profile and marketplace. Changes take effect immediately.</div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── MODALS ────────────────────────────────────────────────── */}

      {/* Link LinkedIn Modal */}
      {showLinkModal && (
        <Modal onClose={() => setShowLinkModal(false)}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: C.text }}>Link LinkedIn Profile</h2>
          <p style={{ color: C.textSecondary, fontSize: '14px', marginBottom: '16px' }}>Enter your LinkedIn profile URL to verify your professional identity.</p>
          <input type="text" placeholder="https://linkedin.com/in/your-profile" value={linkedInUrl} onChange={e => setLinkedInUrl(e.target.value)} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box', background: '#f9f9f9', color: C.text }} />
          <button onClick={() => { setLinkedInLinked(true); setShowLinkModal(false); showToast('LinkedIn profile linked successfully'); }} style={{ width: '100%', padding: '12px', background: C.primary, color: '#fff', border: 'none', borderRadius: '20px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Link Profile</button>
        </Modal>
      )}

      {/* Give Recommendation Modal */}
      {showRecommendModal && (
        <Modal onClose={() => setShowRecommendModal(false)}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: C.text }}>Give Recommendation</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: C.text, display: 'block', marginBottom: '4px' }}>Profession</label>
              <input type="text" placeholder="e.g. Software Engineer" value={recProfession} onChange={e => setRecProfession(e.target.value)} style={{ width: '100%', padding: '10px', border: `1px solid ${C.border}`, borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', background: '#f9f9f9' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: C.text, display: 'block', marginBottom: '4px' }}>Rating (1-5)</label>
              <input type="text" value={recRating} onChange={e => setRecRating(e.target.value)} style={{ width: '100%', padding: '10px', border: `1px solid ${C.border}`, borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', background: '#f9f9f9' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: C.text, display: 'block', marginBottom: '4px' }}>Testimonial</label>
              <textarea placeholder="Write your recommendation..." value={recTestimonial} onChange={e => setRecTestimonial(e.target.value)} rows={3} style={{ width: '100%', padding: '10px', border: `1px solid ${C.border}`, borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical', background: '#f9f9f9', fontFamily: 'inherit' }} />
            </div>
          </div>
          <button onClick={() => { setShowRecommendModal(false); showToast('Recommendation submitted!'); setRecProfession(''); setRecRating('4.5'); setRecTestimonial(''); }} style={{ width: '100%', padding: '12px', background: C.primary, color: '#fff', border: 'none', borderRadius: '20px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', marginTop: '16px' }}>Submit Recommendation</button>
        </Modal>
      )}

      {/* Level Modal */}
      {showLevelModal && (
        <Modal onClose={() => setShowLevelModal(false)}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: C.text }}>What Determines Your Level?</h2>
          {Object.entries(levels).map(([level, data]) => (
            <div key={level} style={{ background: '#f5f5f5', padding: '14px', borderRadius: '8px', marginBottom: '10px', borderLeft: parseInt(level) === currentLevel ? `4px solid ${C.primary}` : '4px solid transparent' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '14px', color: C.text }}>Level {level}: {data.name}</div>
              <div style={{ fontSize: '12px', color: C.primary }}>Followers: {data.followers.toLocaleString()} | Engagement: {data.engagement}% | Value: ${data.dealValue.toLocaleString()}</div>
            </div>
          ))}
        </Modal>
      )}

      {/* Metrics Modal */}
      {showMetricsModal && (
        <Modal onClose={() => setShowMetricsModal(false)}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: C.text }}>Edit Your Metrics</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <MetricInput label="Followers" value={metrics.followers} onChange={v => updateMetric('followers', v)} />
            <MetricInput label="Post Engagement Rate (%)" value={metrics.engagement} onChange={v => updateMetric('engagement', v)} />
            <MetricInput label="Partnerships Completed" value={metrics.dealsCompleted} onChange={v => updateMetric('dealsCompleted', v)} />
            <MetricInput label="Avg Partnership Value ($)" value={metrics.avgDealValue} onChange={v => updateMetric('avgDealValue', v)} />
          </div>
          <div style={{ background: `linear-gradient(135deg, ${C.primary}, #0052cc)`, borderRadius: '8px', padding: '16px', marginTop: '16px', textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Current Level</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>LEVEL {currentLevel}</div>
          </div>
        </Modal>
      )}

      {/* Reputation Modal */}
      {showReputationModal && (
        <Modal onClose={() => setShowReputationModal(false)}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: C.text }}>Reputation Score: 847 / {factors.reduce((sum: number, f: { maxPoints: number }) => sum + f.maxPoints, 0)}</h2>
          {factors.map((factor: { name: string; weight: number; maxPoints: number }) => (
            <div key={factor.name} style={{ background: '#f5f5f5', padding: '14px', borderRadius: '8px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 'bold', color: C.text, fontSize: '13px' }}>{factor.name}</span>
                <span style={{ fontWeight: 'bold', color: C.text, fontSize: '12px' }}>{factor.weight}% <span style={{ color: C.primary }}>max {factor.maxPoints}</span></span>
              </div>
              <div style={{ height: '4px', background: '#e0e0e0', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${factor.weight}%`, background: C.primary }} />
              </div>
            </div>
          ))}
        </Modal>
      )}

      {/* Store Modal */}
      {showStoreModal && storeCategory && (
        <Modal onClose={() => setShowStoreModal(false)}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: C.text }}>Choose Profession — {storeCategory}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
            {(PROFESSIONS[storeCategory as keyof typeof PROFESSIONS]?.subProfessions ?? []).map(sub => (
              <button key={sub} onClick={() => {
                if (assigningSlot) {
                  setValueSkins(prev => ({ ...prev, [assigningSlot]: { profession: sub } }));
                  setShowStoreModal(false);
                  setAssigningSlot(null);
                  showToast(`${sub} assigned to ${SLOT_LABELS[assigningSlot]} slot!`);
                }
              }} style={{ padding: '10px', background: '#f5f5f5', border: `1px solid ${C.border}`, borderRadius: '6px', color: C.text, fontSize: '12px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s' }}>
                {sub}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: '#1a1a1a', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, zIndex: 2000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Utility Components ──────────────────────────────────────────────
function NavItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ background: active ? '#e8f1ff' : 'transparent', border: 'none', borderRadius: '6px', padding: '10px 12px', color: active ? '#0a66c2' : '#666', fontWeight: active ? 600 : 500, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', width: '100%', justifyContent: 'flex-start' }}>
      <span>{label}</span>
    </button>
  );
}

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto', position: 'relative', border: '1px solid #d0d0d0' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#999', fontSize: '24px', cursor: 'pointer' }}>×</button>
        {children}
      </div>
    </div>
  );
}

function MetricInput({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '13px', fontWeight: 600, color: '#000' }}>{label}</label>
      <input type="text" value={value.toLocaleString()} onChange={e => onChange(e.target.value.replace(/,/g, ''))} style={{ background: '#f5f5f5', border: '1px solid #d0d0d0', borderRadius: '6px', color: '#000', padding: '10px 12px', fontSize: '14px', fontFamily: 'inherit' }} />
    </div>
  );
}

function calculateLevel(metrics: { followers: number; engagement: number; avgDealValue: number }, levels: Record<number, { followers: number; engagement: number; dealValue: number }>): number {
  for (let level = 5; level >= 1; level--) {
    const threshold = levels[level];
    if (metrics.followers >= threshold.followers && metrics.engagement >= threshold.engagement && metrics.avgDealValue >= threshold.dealValue) return level;
  }
  return 1;
}
