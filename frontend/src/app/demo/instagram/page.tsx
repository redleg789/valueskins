'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLevelConfig, useReputationConfig } from '@/lib/useConfigStorage';
import {
  type ValueSkinMap,
  type ValueSkinSlot,
  SLOT_LABELS,
  SLOT_COLORS,
  ValueSkinStickers,
  ValueskinAvatarToggle,
  ProfilePhotoWithLongPress,
  PROFESSION_BADGES,
  defaultAboutMe,
} from '@/components/AvatarOptions';

const C = {
  primary: '#0066CC',
  bg: '#0A0A0A',
  surface: '#141414',
  surfaceAlt: '#1A1A1A',
  card: '#1C1C1E',
  text: '#E0E0E0',
  textSecondary: '#888',
  textMuted: '#555',
  border: '#262626',
  borderLight: '#333',
};

const PROFESSIONS = {
  'Technology':     { name: 'Technology',     subProfessions: ['Software Engineer','Data Scientist','Product Manager','DevOps Engineer','UX/UI Designer','Tech Entrepreneur','Security Researcher','AI/ML Specialist'] },
  'Entertainment':  { name: 'Entertainment',  subProfessions: ['Actor','Comedian','Musician','Producer','Director','Screenwriter','Animator','Voice Actor'] },
  'Sports':         { name: 'Sports',         subProfessions: ['Professional Athlete','Fitness Coach','Yoga Instructor','Nutritionist','Sports Analyst','Personal Trainer','Physical Therapist','Sports Manager'] },
  'Aviation':       { name: 'Aviation',       subProfessions: ['Commercial Pilot','Flight Attendant','Aviation Student','Ground Staff','Air Traffic Controller','Aircraft Engineer','Aviation Safety Officer','Cabin Crew Manager'] },
  'Healthcare':     { name: 'Healthcare',     subProfessions: ['Doctor','Nurse','Surgeon','Dentist','Therapist','Pharmacist','Medical Student','Health Coach'] },
  'Finance':        { name: 'Finance',        subProfessions: ['Investment Banker','Financial Advisor','Accountant','Trader','Crypto Analyst','Tax Specialist','Portfolio Manager','Finance Student'] },
  'Law':            { name: 'Law',            subProfessions: ['Attorney','Judge','Paralegal','Legal Analyst','Contract Specialist','Intellectual Property Lawyer','Corporate Lawyer','Law Student'] },
  'Education':      { name: 'Education',      subProfessions: ['Professor','Teacher','Tutor','EdTech Creator','Curriculum Designer','Teaching Assistant','Academic Coach','Education Researcher'] },
  'Art & Design':   { name: 'Art & Design',   subProfessions: ['Graphic Designer','Illustrator','Digital Artist','3D Modeler','Fashion Designer','Interior Designer','Art Director','Concept Artist'] },
  'Business':       { name: 'Business',       subProfessions: ['CEO','Entrepreneur','Consultant','Sales Manager','HR Manager','Operations Manager','Marketing Manager','Business Analyst'] },
  'Real Estate':    { name: 'Real Estate',    subProfessions: ['Real Estate Agent','Property Manager','Real Estate Developer','Real Estate Appraiser','Mortgage Broker','Real Estate Investor','Real Estate Photographer','Urban Planner'] },
  'Food & Beverage':{ name: 'Food & Beverage',subProfessions: ['Chef','Food Critic','Nutritionist','Pastry Chef','Restaurant Owner','Sommelier','Food Photographer','Culinary Student'] },
};

const BRAND_MARKETPLACE_CREATORS = [
  {
    name: 'Alex Rivera', handle: '@alex_codes', valueSkin: 'Software Engineer',
    followers: '890K', engagement: '7.2%', rate: '$4,500', matchScore: '96%',
    featured: true, willingToBarter: true,
    timezone: 'UTC-5 (EST)', responseTimeHrs: 4, minDealUsd: 2000,
    audienceAgeRange: '25-34', audienceLocation: 'USA', audienceLang: 'English',
    dealTypes: ['Paid', 'Equity', 'Barter'], openToDeals: true,
    ndaOk: true, usageRightsOk: true,
  },
  {
    name: 'Priya Sharma', handle: '@priya_designs', valueSkin: 'UX/UI Designer',
    followers: '1.2M', engagement: '5.8%', rate: '$6,000', matchScore: '91%',
    featured: false, willingToBarter: false,
    timezone: 'UTC+5:30 (IST)', responseTimeHrs: 12, minDealUsd: 4000,
    audienceAgeRange: '18-24', audienceLocation: 'India', audienceLang: 'English',
    dealTypes: ['Paid', 'Revenue Share'], openToDeals: true,
    ndaOk: true, usageRightsOk: false,
  },
  {
    name: 'Marcus Chen', handle: '@marcus_fitness', valueSkin: 'Fitness Coach',
    followers: '650K', engagement: '8.1%', rate: '$3,200', matchScore: '84%',
    featured: false, willingToBarter: true,
    timezone: 'UTC-8 (PST)', responseTimeHrs: 24, minDealUsd: 500,
    audienceAgeRange: '18-24', audienceLocation: 'USA', audienceLang: 'English',
    dealTypes: ['Paid', 'Gifted Product', 'Barter', 'Ambassador'], openToDeals: true,
    ndaOk: false, usageRightsOk: true,
  },
];

const BRAND_CATEGORIES: Record<string, { name: string; subCategories: string[] }> = {
  'Industry':      { name: 'Industry',      subCategories: ['SaaS', 'E-Commerce', 'FinTech', 'HealthTech', 'EdTech', 'Gaming', 'Fashion', 'Food & Beverage'] },
  'Company Size':  { name: 'Company Size',  subCategories: ['Startup', 'SMB', 'Mid-Market', 'Enterprise', 'Agency', 'Solo Brand', 'Non-Profit', 'Government'] },
  'Campaign Type': { name: 'Campaign Type', subCategories: ['Product Review', 'Brand Ambassador', 'Sponsored Content', 'Event Coverage', 'Affiliate', 'Whitelabel', 'UGC', 'Podcast'] },
  'Budget Tier':   { name: 'Budget Tier',   subCategories: ['Micro ($500-2K)', 'Standard ($2K-10K)', 'Premium ($10K-50K)', 'Enterprise ($50K+)'] },
};

const CAMPAIGN_TYPES = ['Product Review', 'Brand Ambassador', 'Sponsored Content', 'Event Coverage', 'Affiliate', 'Whitelabel', 'UGC', 'Podcast'];

// Opportunities vary by profession — different brands want different skills
const OPPORTUNITIES_BY_PROFESSION: Record<string, { brand: string; type: string; match: string; featured: boolean; willingToBarter: boolean }[]> = {
  'Software Engineer': [
    { brand: 'TechFlow Labs', type: 'Tech review video', match: '94%', featured: true, willingToBarter: false },
    { brand: 'CloudBase', type: 'Product integration', match: '89%', featured: false, willingToBarter: true },
    { brand: 'DevTools Pro', type: 'Developer tool demo', match: '78%', featured: false, willingToBarter: false },
  ],
  'Data Scientist': [
    { brand: 'DataStack AI', type: 'ML tool walkthrough', match: '96%', featured: true, willingToBarter: false },
    { brand: 'Kaggle Partners', type: 'Competition sponsorship', match: '85%', featured: false, willingToBarter: true },
    { brand: 'Snowflake', type: 'Data pipeline tutorial', match: '81%', featured: false, willingToBarter: false },
  ],
  'UX/UI Designer': [
    { brand: 'Figma', type: 'Design system showcase', match: '97%', featured: true, willingToBarter: false },
    { brand: 'Framer', type: 'Landing page build', match: '91%', featured: false, willingToBarter: true },
    { brand: 'Webflow', type: 'No-code design review', match: '84%', featured: false, willingToBarter: false },
  ],
  'Fitness Coach': [
    { brand: 'Nike Training', type: 'Workout series', match: '93%', featured: true, willingToBarter: false },
    { brand: 'MyProtein', type: 'Supplement review', match: '87%', featured: false, willingToBarter: true },
    { brand: 'Peloton', type: 'At-home fitness collab', match: '79%', featured: false, willingToBarter: false },
  ],
  'Chef': [
    { brand: 'HelloFresh', type: 'Recipe creation', match: '95%', featured: true, willingToBarter: false },
    { brand: 'KitchenAid', type: 'Appliance showcase', match: '88%', featured: false, willingToBarter: true },
    { brand: 'MasterClass', type: 'Cooking class promo', match: '82%', featured: false, willingToBarter: false },
  ],
};

// Fallback opportunities for professions not explicitly listed
const DEFAULT_OPPORTUNITIES = [
  { brand: 'BrandConnect', type: 'Sponsored content', match: '85%', featured: true, willingToBarter: false },
  { brand: 'CreatorFund', type: 'Brand partnership', match: '79%', featured: false, willingToBarter: true },
  { brand: 'InfluencerHub', type: 'Campaign collaboration', match: '72%', featured: false, willingToBarter: false },
];

const SLOTS: ValueSkinSlot[] = ['profession', 'passion', 'hobby'];

const MOCK_COMMUNITIES = [
  {
    id: 0, name: 'SWE Underground', avatarColor: '#0066CC', avatarAbbr: 'SWE',
    description: 'A private space for software engineers to share side projects, job referrals, and raw opinions without the LinkedIn polish.',
    visibility: 'public' as const, gateType: 'specific' as const, requiredTier: 'community' as const,
    allowedProfessions: ['Software Engineer', 'DevOps Engineer', 'AI/ML Specialist'],
    memberCount: 2847, postCount: 1203,
    posts: [
      { id: 0, author: 'Alex R.', handle: '@alex_codes', profession: 'Software Engineer', content: 'Hot take: Rust > Go for anything that matters. Fight me.', likes: 312, pinned: false, announcement: false, time: '2h' },
      { id: 1, author: 'Priya S.', handle: '@priya_builds', profession: 'DevOps Engineer', content: '📢 Monthly hiring board is live — drop your referral links below.', likes: 89, pinned: true, announcement: true, time: '1d' },
      { id: 2, author: 'Marcus T.', handle: '@ml_marcus', profession: 'AI/ML Specialist', content: 'Just shipped a RAG pipeline that cut hallucination rate by 60%. Happy to share the architecture.', likes: 441, pinned: false, announcement: false, time: '4h' },
    ],
    members: [
      { name: 'Alex Rivera', handle: '@alex_codes', profession: 'Software Engineer', role: 'admin', reputationTier: 'senior' },
      { name: 'Priya Singh', handle: '@priya_builds', profession: 'DevOps Engineer', role: 'member', reputationTier: 'member' },
      { name: 'Marcus Tran', handle: '@ml_marcus', profession: 'AI/ML Specialist', role: 'member', reputationTier: 'member' },
    ],
  },
  {
    id: 1, name: 'MD Lounge', avatarColor: '#00897B', avatarAbbr: 'MD',
    description: 'Verified doctors and surgeons only. Clinical discussions, career advice, and the cases that keep you up at night.',
    visibility: 'private' as const, gateType: 'specific' as const, requiredTier: 'marketplace' as const,
    allowedProfessions: ['Doctor', 'Surgeon', 'Nurse'],
    memberCount: 612, postCount: 389,
    posts: [
      { id: 3, author: 'Dr. Chen', handle: '@drchen', profession: 'Surgeon', content: 'Interesting presentation today — 34F with atypical chest pain. What would your differential be?', likes: 56, pinned: false, announcement: false, time: '3h' },
      { id: 4, author: 'Admin', handle: '@md_lounge', profession: 'Doctor', content: '📢 CME webinar this Friday at 6PM EST. Register in the link below.', likes: 128, pinned: true, announcement: true, time: '2d' },
    ],
    members: [
      { name: 'Dr. Chen', handle: '@drchen', profession: 'Surgeon', role: 'admin', reputationTier: 'senior' },
      { name: 'Dr. Williams', handle: '@drwilliams', profession: 'Doctor', role: 'member', reputationTier: 'member' },
    ],
  },
  {
    id: 2, name: 'Founders Corner', avatarColor: '#37474F', avatarAbbr: 'FC',
    description: 'Any ValueSkin gets you in. This one is about grit, not credentials.',
    visibility: 'public' as const, gateType: 'any_valueskin' as const, requiredTier: 'community' as const,
    allowedProfessions: [],
    memberCount: 5241, postCount: 4102,
    posts: [
      { id: 5, author: 'Sam K.', handle: '@samk_ceo', profession: 'CEO', content: 'Lesson from year 3: hire for mindset, train for skill. Churn dropped 40%.', likes: 901, pinned: false, announcement: false, time: '5h' },
      { id: 6, author: 'Lin M.', handle: '@lin_builds', profession: 'Entrepreneur', content: 'We just crossed $1M ARR. Sharing the full breakdown next week. AMA.', likes: 2304, pinned: false, announcement: false, time: '1h' },
    ],
    members: [
      { name: 'Sam K.', handle: '@samk_ceo', profession: 'CEO', role: 'owner', reputationTier: 'senior' },
      { name: 'Lin M.', handle: '@lin_builds', profession: 'Entrepreneur', role: 'member', reputationTier: 'member' },
    ],
  },
];

const MOCK_REPUTATION = {
  score: 78,
  onTimeRate: 0.85,
  avgRating: 4.2,
  responseScore: 0.90,
  revisionEfficiency: 0.75,
  repeatBrandRate: 0.60,
  riskTier: 'B',
  maxDealSize: 2000,
};

export default function InstagramDemoPage() {
  const [activeView, setActiveView] = useState<'profile' | 'mim' | 'store' | 'admin' | 'communities' | 'settings'>('profile');
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  // 3-slot ValueSkin state — starts empty so marketplace gate is demonstrated
  const [valueSkins, setValueSkins] = useState<ValueSkinMap>({});

  // Which slot is being assigned in the Store modal
  const [assigningSlot, setAssigningSlot] = useState<ValueSkinSlot | null>(null);

  const [valueskinAvatarEnabled, setValueskinAvatarEnabled] = useState(false);
  const [showAvatarSettings, setShowAvatarSettings] = useState(false);
  const [purchaseToast, setPurchaseToast] = useState<string | null>(null);

  // ValueSkin hide/delete management
  const [hiddenSkins, setHiddenSkins] = useState<Set<ValueSkinSlot>>(new Set());
  const [showSkinManageModal, setShowSkinManageModal] = useState<ValueSkinSlot | null>(null);

  const { levels, isLoaded: levelsLoaded } = useLevelConfig();
  const { factors } = useReputationConfig();

  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [showReputationModal, setShowReputationModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [storeCategory, setStoreCategory] = useState<string | null>(null);

  // Marketplace role & gate
  const [marketplaceRole, setMarketplaceRole] = useState<'none' | 'creator' | 'brand'>('none');
  const [storeTab, setStoreTab] = useState<'creators' | 'brands'>('creators');
  const [brandValueSkin, setBrandValueSkin] = useState<string | null>(null);
  const [showBrandStoreModal, setShowBrandStoreModal] = useState(false);
  const [brandStoreCategory, setBrandStoreCategory] = useState<string | null>(null);

  // Which ValueSkin the creator is viewing the marketplace for
  const [selectedMarketplaceSkin, setSelectedMarketplaceSkin] = useState<string | null>(null);

  // Negotiation state — tracks which opportunity/creator has opened negotiation
  const [negotiatingOpp, setNegotiatingOpp] = useState<number | null>(null);
  const [negotiatingCreator, setNegotiatingCreator] = useState<number | null>(null);

  // Deal room state for active negotiations
  type DealRoomPhase = 'brief' | 'offer' | 'counter' | 'checklist' | 'accepted' | 'softhold';
  const [dealRoomPhase, setDealRoomPhase] = useState<DealRoomPhase>('brief');
  const [dealIntent, setDealIntent] = useState<'explore' | 'campaign' | 'long-term'>('campaign');
  const [dealBriefFilled, setDealBriefFilled] = useState(false);
  const [dealBriefTitle, setDealBriefTitle] = useState('');
  const [dealOfferAmount, setDealOfferAmount] = useState('');
  const [dealCounterAmount, setDealCounterAmount] = useState('');
  // Simulated offer expiry: 23h 47m remaining
  const [offerExpiresLabel] = useState('23h 47m');
  // Energy state (creator)
  const [creatorEnergy, setCreatorEnergy] = useState<'available' | 'limited' | 'burnout' | 'pause'>('available');
  // Price band (creator public signal)
  const [creatorPriceBand, setCreatorPriceBand] = useState<'experimental' | 'mid-tier' | 'premium' | 'exclusive'>('mid-tier');
  const [creatorSettingsOpen, setCreatorSettingsOpen] = useState<'location' | 'identity' | 'audience' | 'deals' | null>(null);
  // Soft hold active
  const [softHoldActive, setSoftHoldActive] = useState(false);

  // Creator pricing (editable in marketplace)
  const [creatorRate, setCreatorRate] = useState('5000');

  // Brand offer details (editable in marketplace)
  const [brandBudget, setBrandBudget] = useState('4000');
  const [brandCampaignDesc, setBrandCampaignDesc] = useState('Looking for authentic content creators to showcase our product');
  const [brandCampaignType, setBrandCampaignType] = useState('Product Review');

  // Brand-side deal room state
  type BrandDealPhase = 'brief' | 'offer' | 'pending' | 'counter' | 'accepted' | 'softhold';
  const [brandDealPhase, setBrandDealPhase] = useState<BrandDealPhase>('brief');
  const [brandDealIntent, setBrandDealIntent] = useState<'explore' | 'campaign' | 'long-term'>('campaign');
  const [brandBriefTitle, setBrandBriefTitle] = useState('');
  const [brandBriefDeliverables, setBrandBriefDeliverables] = useState('');
  const [brandCounterAmount, setBrandCounterAmount] = useState('');
  const [brandSoftHoldHours, setBrandSoftHoldHours] = useState<24 | 48 | 72>(48);
  // Simulated: creator countered at this amount after brand sent offer
  const [simulatedCounterAmount] = useState('4800');

  // Communities state
  const [communitiesTab, setCommunitiesTab] = useState<'discover' | 'mine' | 'create'>('discover');
  const [activeCommunity, setActiveCommunity] = useState<number | null>(null);
  const [communityInnerTab, setCommunityInnerTab] = useState<'feed' | 'members' | 'announcements'>('feed');
  const [joinedCommunities, setJoinedCommunities] = useState<number[]>([]);
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newCommVisibility, setNewCommVisibility] = useState<'public' | 'private'>('public');
  const [newCommGateType, setNewCommGateType] = useState<'any_valueskin' | 'specific'>('any_valueskin');
  const [newCommProfessions, setNewCommProfessions] = useState<string[]>([]);
  const [newCommTier, setNewCommTier] = useState<'community' | 'marketplace'>('community');
  const [likedCommunityPosts, setLikedCommunityPosts] = useState<number[]>([]);
  // Admin pricing
  const [communityTierCredits, setCommunityTierCredits] = useState(0);
  const [marketplaceTierCredits, setMarketplaceTierCredits] = useState(100);

  // Admin-configurable insight visibility
  const [visibleInsights, setVisibleInsights] = useState<Record<string, boolean>>({
    score: true,
    engagement: true,
    onTime: true,
    deals: true,
    rating: true,
    trustLevel: true,
    breakdown: true,
  });

  // Creator reputation & verification
  const [showCredentialForm, setShowCredentialForm] = useState(false);
  const [credentials, setCredentials] = useState([{ platform: 'github', handle: '@alex' }]);
  const [identityProofs, setIdentityProofs] = useState<Array<{platform: string; handle: string; verified: boolean}>>([]);
  const [resolvedFraudSignals, setResolvedFraudSignals] = useState<number[]>([]);
  // Safety system — Meta admin controls
  const [safetyDmRateLimit, setSafetyDmRateLimit] = useState(10);
  const [safetyMinBrandTrust, setSafetyMinBrandTrust] = useState(3);
  const [safetyRequireVerifiedBrand, setSafetyRequireVerifiedBrand] = useState(true);
  const [safetyRequireBrief, setSafetyRequireBrief] = useState(true);
  const [safetyReportThreshold, setSafetyReportThreshold] = useState(3);
  const [safetyRecontactCooldown, setSafetyRecontactCooldown] = useState(30);
  const [safetyProposalFormOnly, setSafetyProposalFormOnly] = useState(true);
  const [safetyOffPlatformBlock, setSafetyOffPlatformBlock] = useState(true);
  const [safetyNewBrandWarmIntro, setSafetyNewBrandWarmIntro] = useState(true);
  const [safetyNewBrandDealCount, setSafetyNewBrandDealCount] = useState(0);
  const [savedSafetyToast, setSavedSafetyToast] = useState(false);
  // Creator-side safety controls
  const [creatorDealOnlyMode, setCreatorDealOnlyMode] = useState(true);
  const [creatorAllowedNiches, setCreatorAllowedNiches] = useState<string[]>([]);
  const [creatorBlockedBrands, setCreatorBlockedBrands] = useState<string[]>([]);
  const [creatorShowSafetySettings, setCreatorShowSafetySettings] = useState(false);
  const [activeDisputeStage, setActiveDisputeStage] = useState<number | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeEvidenceUrls, setDisputeEvidenceUrls] = useState<string[]>(['']);

  // Barter/exposure toggle — managed in Settings, stored server-side
  const [willingToBarter, setWillingToBarter] = useState(false);
  const [filterBarterOnly, setFilterBarterOnly] = useState(false);

  // Brand field filter — which ValuSkin profession the brand wants to target
  const [brandFieldFilter, setBrandFieldFilter] = useState<string | null>(null);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [brandSearchMode, setBrandSearchMode] = useState<'profession' | 'name' | 'general'>('profession');
  const [filterAudienceAge, setFilterAudienceAge] = useState<string | null>(null);
  const [filterAudienceLang, setFilterAudienceLang] = useState<string | null>(null);
  const [filterAudienceLoc, setFilterAudienceLoc] = useState('');
  const [filterMinDeal, setFilterMinDeal] = useState('');
  const [filterDealType, setFilterDealType] = useState<string | null>(null);
  const [filterResponseMax, setFilterResponseMax] = useState<number | null>(null);
  const [showAudienceFilters, setShowAudienceFilters] = useState(false);

  const [metrics, setMetrics] = useState({
    followers: 1243000, engagement: 6.8, dealsCompleted: 47,
    avgDealValue: 85000, onTimeRate: 99, brandRating: 4.87,
  });

  const currentLevel = levelsLoaded ? calculateLevel(metrics, levels) : 1;

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setMetrics(prev => ({ ...prev, followers: prev.followers + (isFollowing ? -1 : 1) }));
  };

  const toggleLike = (i: number) => {
    setLikedPosts(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const updateMetric = (key: string, value: string) => {
    setMetrics(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  // Opens the Store modal with the target slot pre-selected
  const openStoreForSlot = (slot: ValueSkinSlot) => {
    setAssigningSlot(slot);
    setShowStoreModal(true);
  };

  // Simulate purchase: assign profession to the chosen slot, show toast
  const purchaseProfession = (profession: string) => {
    if (!assigningSlot) return;
    const badge = PROFESSION_BADGES[profession];
    const label = badge?.abbreviation ?? profession.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 3);
    const slotLabel = SLOT_LABELS[assigningSlot];

    setValueSkins(prev => ({
      ...prev,
      [assigningSlot]: { profession, aboutMe: defaultAboutMe(profession) },
    }));
    setShowStoreModal(false);
    setAssigningSlot(null);
    setActiveView('profile');
    setPurchaseToast(`${label} applied as your ${slotLabel}`);
    setTimeout(() => setPurchaseToast(null), 3000);
  };

  // Which professions are already assigned (to show status in store)
  const assignedProfessions = new Set(
    Object.values(valueSkins).map(e => e?.profession).filter(Boolean) as string[]
  );

  const hasValueSkin = Object.values(valueSkins).some(entry => entry?.profession);

  // List of owned skins for the marketplace skin selector
  const ownedSkins = Object.entries(valueSkins)
    .filter(([, entry]) => entry?.profession)
    .map(([slot, entry]) => ({ slot: slot as ValueSkinSlot, profession: entry!.profession }));

  // Opportunities for the currently selected skin
  const activeOpportunities = selectedMarketplaceSkin
    ? (OPPORTUNITIES_BY_PROFESSION[selectedMarketplaceSkin] ?? DEFAULT_OPPORTUNITIES)
    : [];

  return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', color: C.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>

      {/* Toast */}
      {purchaseToast && (
        <div style={{
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          background: C.primary, color: '#fff', padding: '12px 20px', borderRadius: '10px',
          fontSize: '14px', fontWeight: 600, zIndex: 99999,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {purchaseToast}
        </div>
      )}

      {/* Left Sidebar */}
      <div style={{ width: '280px', borderRight: `1px solid ${C.border}`, padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100vh', overflowY: 'auto', position: 'sticky', top: 0, background: C.surface }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: C.text, marginBottom: '20px', cursor: 'pointer' }}>Instagram</div>
        </Link>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavItem label="Home" active={false} onClick={() => {}} />
          <NavItem label="Explore" active={false} onClick={() => {}} />
          <NavItem label="Messages" active={false} onClick={() => {}} />
          <NavItem label="Notifications" active={false} onClick={() => {}} />
          <NavItem label="Create" active={false} onClick={() => {}} />
          <NavItem label="Profile" active={activeView === 'profile'} onClick={() => setActiveView('profile')} />
          <div style={{ height: '1px', background: C.border, margin: '12px 0' }} />
          <NavItem label="Marketplace" active={activeView === 'mim'} onClick={() => { setMarketplaceRole('none'); setActiveView('mim'); }} />
          <NavItem label="Communities" active={activeView === 'communities'} onClick={() => { setActiveCommunity(null); setActiveView('communities'); }} />
          <NavItem label="Store" active={activeView === 'store'} onClick={() => setActiveView('store')} />
          <NavItem label="Settings" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
          <div style={{ height: '1px', background: C.border, margin: '12px 0' }} />
          <NavItem label="Admin Panel" active={activeView === 'admin'} onClick={() => setActiveView('admin')} />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '600px', borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, background: C.bg }}>

          {/* ── PROFILE VIEW ──────────────────────────────────── */}
          {activeView === 'profile' && (
            <>
              {/* Header */}
              <div style={{
                height: '60px', borderBottom: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontWeight: 'bold', fontSize: '16px', position: 'sticky', top: 0,
                background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                zIndex: 10, padding: '0 20px',
              }}>
                <span>saketh_eth</span>
                <button
                  onClick={() => setShowAvatarSettings(!showAvatarSettings)}
                  style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: C.primary, cursor: 'pointer' }}
                >
                  Avatar Style
                </button>
              </div>

              {/* Avatar Settings */}
              {showAvatarSettings && (
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, background: C.surface }}>
                  <ValueskinAvatarToggle
                    enabled={valueskinAvatarEnabled}
                    onChange={(v) => { setValueskinAvatarEnabled(v); setShowAvatarSettings(false); }}
                  />
                </div>
              )}

              {/* Profile Info */}
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '24px' }}>
                  {/* Profile photo */}
                  <div style={{ marginRight: '40px', flexShrink: 0 }}>
                    <ProfilePhotoWithLongPress
                      showValueskinAvatar={valueskinAvatarEnabled}
                      level={currentLevel}
                      valueSkins={valueSkins}
                      avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=Saketh"
                      displayName="Saketh Velamuri"
                      size={86}
                      onValueSkinsChange={setValueSkins}
                    />
                  </div>

                  {/* Stats */}
                  <div style={{ flex: 1 }}>
                    {/* Name + up to 3 stickers (each clickable → About Me) */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: C.text }}>
                        Saketh Velamuri
                      </h2>
                      {/* ValueSkin stickers with context menu (right-click) */}
                      <div
                        onContextMenu={(e) => {
                          e.preventDefault();
                          // Find which slot was clicked by checking if the click is within a sticker
                          const slots: ValueSkinSlot[] = ['profession', 'passion', 'hobby'];
                          for (const slot of slots) {
                            if (valueSkins[slot]) {
                              setShowSkinManageModal(slot);
                              break; // Just open the first available for demo
                            }
                          }
                        }}
                        style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}
                      >
                        <ValueSkinStickers valueSkins={valueSkins} onValueSkinsChange={setValueSkins} size="default" level={currentLevel} />
                        {Object.keys(valueSkins).length > 0 && (
                          <span style={{ fontSize: '11px', color: C.textMuted, marginLeft: '4px' }} title="Right-click a sticker to hide/delete">
                            ⋮
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '14px' }}>
                      <button onClick={() => setShowMetricsModal(true)} style={{ background: 'none', border: 'none', color: C.text, padding: 0, cursor: 'pointer', textAlign: 'center' }}>
                        <strong>{(metrics.followers / 1000).toFixed(0)}k</strong>
                        <div style={{ fontSize: '12px', color: C.textSecondary }}>followers</div>
                      </button>
                      <div style={{ textAlign: 'center' }}><strong>47</strong><div style={{ fontSize: '12px', color: C.textSecondary }}>posts</div></div>
                      <div style={{ textAlign: 'center' }}><strong>450</strong><div style={{ fontSize: '12px', color: C.textSecondary }}>following</div></div>
                    </div>

                    <button
                      onClick={handleFollow}
                      style={{ background: isFollowing ? C.surfaceAlt : C.primary, border: `1px solid ${isFollowing ? C.borderLight : C.primary}`, borderRadius: '8px', color: '#fff', padding: '8px 24px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </div>

                {/* Bio */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px', color: C.text }}>Saketh Velamuri</div>
                  <div style={{ color: C.textSecondary, fontSize: '14px', lineHeight: '1.5' }}>
                    Building the decentralized reputation layer{'\n'}Full Stack Engineer @ Valueskins{'\n'}Minting my career on-chain
                  </div>
                </div>

                {/* Barter signal badge — read-only on profile, editable in Settings */}
                {hasValueSkin && willingToBarter && (
                  <div style={{
                    borderRadius: '8px',
                    border: '1px solid #10b981',
                    padding: '8px 12px',
                    marginTop: '16px',
                    backgroundColor: 'rgba(16,185,129,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: '#10b981',
                    fontWeight: 600,
                  }}>
                    <span>Open to Free / Exposure / Barter</span>
                    <button
                      onClick={() => setActiveView('settings')}
                      style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: '11px', cursor: 'pointer', marginLeft: 'auto' }}
                    >
                      Edit in Settings
                    </button>
                  </div>
                )}

                {/* Credentials & Identity Section */}
                {/* Compact Verified Credentials — inline chip row */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '16px', alignItems: 'center' }}>
                  {credentials.map((cred, i) => (
                    <div key={i} style={{
                      padding: '4px 8px',
                      backgroundColor: cred.platform === 'github' ? '#000' : cred.platform === 'linkedin' ? '#0077b5' : cred.platform === 'leetcode' ? '#ffa723' : '#666',
                      color: 'white', borderRadius: '5px', fontSize: '11px', fontWeight: 600,
                    }}>
                      {cred.platform.toUpperCase()}
                    </div>
                  ))}
                  {['twitter', 'github', 'linkedin', 'tiktok'].map((platform) => {
                    const proof = identityProofs.find(p => p.platform === platform);
                    if (!proof?.verified) return null;
                    return (
                      <div key={platform} style={{
                        padding: '4px 8px', backgroundColor: '#10b981',
                        borderRadius: '5px', fontSize: '11px', color: 'white', fontWeight: 600,
                      }}>
                        {platform.toUpperCase()} ✓
                      </div>
                    );
                  })}
                  <button
                    onClick={() => setShowCredentialForm(!showCredentialForm)}
                    style={{
                      padding: '4px 8px', backgroundColor: 'transparent',
                      border: `1px dashed ${C.primary}`, borderRadius: '5px',
                      fontSize: '11px', cursor: 'pointer', color: C.primary,
                    }}
                  >
                    + Add
                  </button>
                </div>

              </div>

              {/* Tabs */}
              <div style={{ borderTop: `1px solid ${C.border}`, display: 'flex' }}>
                {['posts', 'reels', 'tagged', 'insights'].map((tab) => (
                  <div key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '44px', borderTop: activeTab === tab ? `2px solid ${tab === 'insights' ? C.primary : C.text}` : '2px solid transparent', color: activeTab === tab ? (tab === 'insights' ? C.primary : C.text) : C.textMuted, cursor: 'pointer', fontWeight: activeTab === tab ? '600' : 'normal', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {tab}
                  </div>
                ))}
              </div>

              {/* Post Grid — shown for posts/reels/tagged */}
              {activeTab !== 'insights' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: C.border }}>
                  {[...Array(9)].map((_, i) => (
                    <div key={i} onClick={() => toggleLike(i)} style={{ aspectRatio: '1/1', background: C.surface, position: 'relative', cursor: 'pointer', overflow: 'hidden' }}>
                      <img src={`https://picsum.photos/400/400?random=${i}`} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                      {likedPosts.includes(i) && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Insights Tab Content */}
              {activeTab === 'insights' && (
                <div style={{ padding: '20px' }}>
                  <div
                    onClick={() => setShowReputationModal(true)}
                    style={{
                      background: C.surface, border: `1px solid ${C.border}`,
                      borderRadius: '14px', padding: '16px', marginBottom: '20px',
                      cursor: 'pointer', transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; }}
                  >
                    {/* Top row — score (tick icon removed) */}
                    {visibleInsights.score && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>Valueskins Insights</div>
                            <div style={{ fontSize: '11px', color: C.textSecondary }}>Tap for full breakdown</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '20px', fontWeight: 800, color: C.primary, lineHeight: 1 }}>847</div>
                            <div style={{ fontSize: '10px', color: C.textMuted, fontWeight: 600 }}>/ 1000</div>
                          </div>
                        </div>
                        <div style={{ height: '4px', background: C.border, borderRadius: '2px', overflow: 'hidden', marginBottom: '14px' }}>
                          <div style={{ height: '100%', width: '84.7%', background: C.primary, borderRadius: '2px' }} />
                        </div>
                      </>
                    )}

                    {/* Metric cards row */}
                    {(visibleInsights.engagement || visibleInsights.onTime || visibleInsights.deals || visibleInsights.rating) && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        {[
                          visibleInsights.engagement && { label: 'Engagement', value: `${metrics.engagement}%`, color: metrics.engagement >= 5 ? '#2E7D32' : C.textSecondary },
                          visibleInsights.onTime && { label: 'On-Time', value: `${metrics.onTimeRate}%`, color: metrics.onTimeRate >= 95 ? '#2E7D32' : C.textSecondary },
                          visibleInsights.deals && { label: 'Deals', value: `${metrics.dealsCompleted}`, color: C.text },
                          visibleInsights.rating && { label: 'Rating', value: `${metrics.brandRating}`, color: metrics.brandRating >= 4.5 ? '#2E7D32' : C.textSecondary },
                        ].filter(Boolean).map((m: any) => (
                          <div key={m.label} style={{ textAlign: 'center', padding: '8px 4px', background: C.surfaceAlt, borderRadius: '8px' }}>
                            <div style={{ fontSize: '15px', fontWeight: 700, color: m.color, lineHeight: 1, marginBottom: '4px' }}>{m.value}</div>
                            <div style={{ fontSize: '9px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Trust level row */}
                    {visibleInsights.trustLevel && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', padding: '8px 10px', background: 'rgba(0,102,204,0.06)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>Trust Level</span>
                        </div>
                        <div style={{ display: 'flex', gap: '3px' }}>
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} style={{
                              width: '18px', height: '6px', borderRadius: '3px',
                              background: i <= currentLevel ? C.primary : C.border,
                            }} />
                          ))}
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: C.primary }}>Level {currentLevel}</span>
                      </div>
                    )}
                  </div>

                  {/* Factor breakdown — shown below the main card */}
                  {visibleInsights.breakdown && (
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>Score Breakdown</div>
                      {factors.map((factor) => {
                        const factorScores: Record<string, number> = {
                          'Content Consistency': 82, 'Audience Engagement': 91,
                          'Brand Partnerships': 78, 'On-time Delivery': 99,
                          'Community Trust': 85, 'Profile Completeness': 95,
                        };
                        const earned = factorScores[factor.name] ?? Math.round(factor.maxPoints * 0.8);
                        const fillPct = Math.round((earned / factor.maxPoints) * 100);
                        return (
                          <div key={factor.name} style={{ background: C.surfaceAlt, padding: '14px', borderRadius: '10px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '13px', color: C.text }}>{factor.name}</div>
                              </div>
                              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                                <span style={{ fontSize: '15px', fontWeight: 800, color: fillPct >= 90 ? '#2E7D32' : fillPct >= 70 ? C.primary : '#E65100' }}>{earned}</span>
                                <span style={{ fontSize: '11px', color: C.textMuted }}>/{factor.maxPoints}</span>
                              </div>
                            </div>
                            <div style={{ height: '4px', background: C.border, borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${fillPct}%`, background: fillPct >= 90 ? '#2E7D32' : fillPct >= 70 ? C.primary : '#E65100', borderRadius: '2px', transition: 'width 0.3s' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Creator Score Card */}
                  <div style={{
                    borderRadius: '12px',
                    border: `1px solid ${C.borderLight}`,
                    padding: '20px',
                    marginTop: '20px',
                    backgroundColor: C.bg,
                  }}>
                    <h3 style={{ marginTop: 0, marginBottom: '16px', color: C.text }}>Creator Score</h3>

                    {/* Overall Score */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '20px',
                      padding: '16px',
                      backgroundColor: 'rgba(0,102,204,0.06)',
                      borderRadius: '8px',
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', color: C.textSecondary }}>Overall Score</div>
                        <div style={{
                          fontSize: '32px',
                          fontWeight: 'bold',
                          color: MOCK_REPUTATION.score >= 80 ? '#10b981' : MOCK_REPUTATION.score >= 50 ? '#f59e0b' : '#ef4444',
                        }}>
                          {MOCK_REPUTATION.score}
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '8px',
                      }}>
                        <div style={{
                          padding: '6px 12px',
                          backgroundColor: MOCK_REPUTATION.riskTier === 'A' ? '#10b981' : MOCK_REPUTATION.riskTier === 'B' ? '#3b82f6' : MOCK_REPUTATION.riskTier === 'C' ? '#f59e0b' : '#ef4444',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}>
                          Tier {MOCK_REPUTATION.riskTier}
                        </div>
                        <div style={{ fontSize: '12px', color: C.textSecondary }}>
                          Max deal: ${MOCK_REPUTATION.maxDealSize.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Dimension Bars */}
                    {[
                      { label: 'On-Time Rate', value: MOCK_REPUTATION.onTimeRate },
                      { label: 'Avg Rating', value: MOCK_REPUTATION.avgRating / 5 },
                      { label: 'Response Score', value: MOCK_REPUTATION.responseScore },
                      { label: 'Revision Efficiency', value: MOCK_REPUTATION.revisionEfficiency },
                      { label: 'Repeat Brand Rate', value: MOCK_REPUTATION.repeatBrandRate },
                    ].map((dim, i) => (
                      <div key={i} style={{ marginBottom: '12px' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '4px',
                          fontSize: '12px',
                        }}>
                          <span style={{ color: C.textSecondary }}>{dim.label}</span>
                          <span style={{ color: C.text, fontWeight: 500 }}>{Math.round(dim.value * 100)}%</span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '6px',
                          backgroundColor: 'rgba(0,0,0,0.06)',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${dim.value * 100}%`,
                            height: '100%',
                            backgroundColor: C.primary,
                            transition: 'width 0.3s ease',
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── MARKETPLACE VIEW ──────────────────────────────── */}
          {activeView === 'mim' && (
            <>
              {/* Layer 1: Gate — no ValueSkin */}
              {!hasValueSkin && (
                <>
                  <div style={{ height: '60px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', paddingLeft: '20px', fontWeight: 'bold', fontSize: '16px', background: C.surface }}>Marketplace</div>
                  <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: C.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: C.text, marginBottom: '8px' }}>ValueSkin Required</h2>
                    <p style={{ fontSize: '14px', color: C.textSecondary, marginBottom: '24px', lineHeight: 1.6, maxWidth: '340px', margin: '0 auto 24px' }}>
                      You need at least one ValueSkin to access the Marketplace. Visit the Store to get your first badge.
                    </p>
                    <button
                      onClick={() => setActiveView('store')}
                      style={{ background: C.primary, border: 'none', borderRadius: '10px', color: '#fff', padding: '12px 32px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                    >
                      Go to Store
                    </button>
                  </div>
                </>
              )}

              {/* Layer 2: Role selection */}
              {hasValueSkin && marketplaceRole === 'none' && (
                <>
                  <div style={{ height: '60px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', paddingLeft: '20px', fontWeight: 'bold', fontSize: '16px', background: C.surface }}>Marketplace</div>
                  <div style={{ padding: '40px 20px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                      <h2 style={{ fontSize: '20px', fontWeight: 700, color: C.text, marginBottom: '6px' }}>How do you want to enter?</h2>
                      <p style={{ fontSize: '13px', color: C.textSecondary }}>Choose your role to see relevant opportunities</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      {([
                        { role: 'creator' as const, title: 'Login as Creator', desc: 'Find brand deals matched to your ValueSkins', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' },
                        { role: 'brand' as const, title: 'Login as Brand', desc: 'Find creators for your campaigns', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
                      ]).map(({ role, title, desc, icon }) => (
                        <button
                          key={role}
                          onClick={() => setMarketplaceRole(role)}
                          style={{
                            flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px',
                            padding: '32px 20px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.background = C.surfaceAlt; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}
                        >
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d={icon} />
                              {role === 'creator' && <circle cx="12" cy="7" r="4" />}
                            </svg>
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '8px' }}>{title}</div>
                          <div style={{ fontSize: '13px', color: C.textSecondary, lineHeight: 1.5, marginBottom: '20px' }}>{desc}</div>
                          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                            </svg>
                            <span style={{ fontSize: '13px', color: C.textSecondary, fontWeight: 500 }}>Continue with Instagram</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Layer 3a: Creator Marketplace */}
              {hasValueSkin && marketplaceRole === 'creator' && (
                <>
                  <div style={{ height: '60px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '20px', paddingRight: '20px', fontWeight: 'bold', fontSize: '16px', background: C.surface }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Marketplace
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#2E7D32', background: 'rgba(46,125,50,0.1)', padding: '3px 8px', borderRadius: '6px' }}>Creator</span>
                    </div>
                    <button onClick={() => { setMarketplaceRole('none'); setSelectedMarketplaceSkin(null); setNegotiatingOpp(null); }} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: '6px', padding: '4px 10px', fontSize: '11px', color: C.textSecondary, cursor: 'pointer' }}>Switch Role</button>
                  </div>
                  <div style={{ padding: '20px' }}>
                    {/* ValueSkin selector */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>Browse as</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {ownedSkins.map(({ slot, profession }) => {
                          const badge = PROFESSION_BADGES[profession];
                          const abbr = badge?.abbreviation ?? profession.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 3);
                          const badgeColor = badge?.color ?? SLOT_COLORS[slot];
                          const isActive = selectedMarketplaceSkin === profession;
                          return (
                            <button
                              key={slot}
                              onClick={() => { setSelectedMarketplaceSkin(profession); setNegotiatingOpp(null); }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '8px 14px', borderRadius: '10px', cursor: 'pointer',
                                background: isActive ? `${badgeColor}20` : C.card,
                                border: `2px solid ${isActive ? badgeColor : C.border}`,
                                transition: 'all 0.15s',
                              }}
                            >
                              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '5px', background: badgeColor, color: '#fff', fontSize: '8px', fontWeight: 700, flexShrink: 0 }}>{abbr}</span>
                              <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: isActive ? C.text : C.textSecondary }}>{profession}</div>
                                <div style={{ fontSize: '10px', color: C.textMuted, textTransform: 'uppercase' }}>{SLOT_LABELS[slot]}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Matching Rule Banner */}
                    <div style={{ background: 'rgba(46,125,50,0.06)', border: `1px solid rgba(46,125,50,0.15)`, borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>ValuSkin Matching Active</div>
                        <div style={{ fontSize: '11px', color: C.textSecondary }}>You only see opportunities from brands that require your exact ValuSkin. Matching is deterministic and server-enforced.</div>
                      </div>
                    </div>

                    {/* No skin selected prompt */}
                    {!selectedMarketplaceSkin && (
                      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{ fontSize: '14px', color: C.textSecondary, lineHeight: 1.6 }}>
                          Select one of your ValueSkins above to see opportunities matched to that profession.
                        </div>
                      </div>
                    )}

                    {/* Opportunities for selected skin */}
                    {selectedMarketplaceSkin && (
                      <>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>
                          Opportunities for {selectedMarketplaceSkin}
                        </div>
                        {activeOpportunities.map((opp, i) => {
                          const isNegotiating = negotiatingOpp === i;
                          return (
                            <div key={i} style={{ background: C.card, borderRadius: '12px', padding: '16px', marginBottom: '12px', border: `1px solid ${opp.featured ? 'rgba(0,102,204,0.3)' : C.border}` }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ fontWeight: 'bold' }}>{opp.brand}</div>
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                  {opp.willingToBarter && <span style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px' }}>OPEN TO BARTER</span>}
                                  {opp.featured && <span style={{ fontSize: '10px', fontWeight: 700, color: C.primary, background: `${C.primary}15`, padding: '2px 6px', borderRadius: '4px' }}>TOP MATCH</span>}
                                </div>
                              </div>
                              <div style={{ fontSize: '13px', color: C.textSecondary, marginBottom: '6px' }}>{opp.type} | Match: {opp.match}</div>
                              <div style={{ fontSize: '10px', color: '#2E7D32', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="#2E7D32" stroke="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                Matched via {selectedMarketplaceSkin} ValuSkin
                              </div>

                              {/* Deal Room — hidden until opened */}
                              {!isNegotiating ? (
                                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                  {opp.willingToBarter && !willingToBarter && (
                                    <div style={{ fontSize: '11px', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '6px 10px', borderRadius: '6px', textAlign: 'center' }}>
                                      Enable &quot;Open to Barter&quot; in your profile to apply
                                    </div>
                                  )}
                                  <button
                                    onClick={() => {
                                      if (opp.willingToBarter && !willingToBarter) return;
                                      setNegotiatingOpp(i); setDealRoomPhase('offer'); setDealOfferAmount(''); setDealCounterAmount('');
                                    }}
                                    style={{
                                      flex: 1,
                                      background: opp.willingToBarter && !willingToBarter ? C.surfaceAlt : (opp.featured ? C.primary : C.surfaceAlt),
                                      border: opp.featured ? 'none' : `1px solid ${C.border}`,
                                      padding: '10px 16px', borderRadius: '8px', color: '#fff', fontWeight: '600',
                                      cursor: opp.willingToBarter && !willingToBarter ? 'not-allowed' : 'pointer',
                                      fontSize: '14px',
                                      opacity: opp.willingToBarter && !willingToBarter ? 0.5 : 1,
                                    }}
                                  >
                                    Enter Deal Room
                                  </button>
                                </div>
                              ) : (
                                <div style={{ background: C.surfaceAlt, borderRadius: '10px', padding: '14px', border: `1px solid rgba(0,102,204,0.3)` }}>
                                  {/* Deal Room header */}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                      </svg>
                                      Deal Room · {opp.brand}
                                    </div>
                                    {/* Offer expiry countdown — both sides see this */}
                                    {dealRoomPhase === 'offer' && (
                                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#E65100', background: 'rgba(230,81,0,0.1)', padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                        Expires in {offerExpiresLabel}
                                      </div>
                                    )}
                                    {dealRoomPhase === 'accepted' && (
                                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#2E7D32', background: 'rgba(46,125,50,0.1)', padding: '3px 8px', borderRadius: '6px' }}>Deal Accepted</div>
                                    )}
                                  </div>

                                  {/* Brand's intent (declared before room opened) */}
                                  <div style={{ fontSize: '11px', color: C.textMuted, marginBottom: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ background: C.bg, padding: '2px 8px', borderRadius: '4px', border: `1px solid ${C.border}` }}>Intent: <strong style={{ color: C.text }}>Campaign</strong></span>
                                    <span style={{ background: C.bg, padding: '2px 8px', borderRadius: '4px', border: `1px solid ${C.border}` }}>Type: <strong style={{ color: C.text }}>{brandCampaignType}</strong></span>
                                  </div>

                                  {dealRoomPhase === 'offer' && (
                                    <>
                                      <div style={{ fontSize: '12px', color: C.textSecondary, marginBottom: '8px', lineHeight: 1.5 }}>
                                        Brand offer has arrived. Set your ask and respond — prices are only visible inside this room.
                                      </div>
                                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '13px', color: C.textMuted }}>Your ask ($):</span>
                                        <input
                                          type="text"
                                          value={dealOfferAmount}
                                          onChange={(e) => setDealOfferAmount(e.target.value.replace(/[^0-9]/g, ''))}
                                          placeholder={creatorRate}
                                          style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, padding: '6px 10px', fontSize: '15px', fontWeight: 700, fontFamily: 'inherit', outline: 'none', width: '100px' }}
                                          onFocus={(e) => { e.currentTarget.style.borderColor = C.primary; }}
                                          onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }}
                                        />
                                      </div>
                                      <div style={{ fontSize: '10px', color: C.textMuted, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                        Only visible to you and {opp.brand} · Auto-expires in {offerExpiresLabel}
                                      </div>
                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        <button onClick={() => setDealRoomPhase('accepted')} style={{ flex: 1, background: '#2E7D32', border: 'none', padding: '8px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>Accept</button>
                                        <button onClick={() => setDealRoomPhase('counter')} style={{ flex: 1, background: C.primary, border: 'none', padding: '8px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>Counter</button>
                                        <button onClick={() => setNegotiatingOpp(null)} style={{ flex: 1, background: 'none', border: `1px solid ${C.border}`, padding: '8px', borderRadius: '8px', color: C.textSecondary, fontWeight: 500, cursor: 'pointer', fontSize: '12px' }}>Decline</button>
                                      </div>
                                    </>
                                  )}

                                  {dealRoomPhase === 'counter' && (
                                    <>
                                      <div style={{ fontSize: '12px', color: C.textSecondary, marginBottom: '8px' }}>Send a counter-offer. Brand has 24h to respond or it auto-expires.</div>
                                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '13px', color: C.textMuted }}>Counter ($):</span>
                                        <input
                                          type="text"
                                          value={dealCounterAmount}
                                          onChange={(e) => setDealCounterAmount(e.target.value.replace(/[^0-9]/g, ''))}
                                          placeholder="6500"
                                          style={{ background: C.bg, border: `1px solid ${C.primary}`, borderRadius: '8px', color: C.text, padding: '6px 10px', fontSize: '15px', fontWeight: 700, fontFamily: 'inherit', outline: 'none', width: '100px' }}
                                        />
                                      </div>
                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        <button onClick={() => setDealRoomPhase('offer')} style={{ flex: 1, background: C.primary, border: 'none', padding: '8px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>Send Counter</button>
                                        <button onClick={() => setDealRoomPhase('offer')} style={{ background: 'none', border: `1px solid ${C.border}`, padding: '8px 12px', borderRadius: '8px', color: C.textSecondary, cursor: 'pointer', fontSize: '12px' }}>Back</button>
                                      </div>
                                    </>
                                  )}

                                  {dealRoomPhase === 'accepted' && (
                                    <>
                                      <div style={{ padding: '12px', background: 'rgba(46,125,50,0.08)', borderRadius: '8px', marginBottom: '10px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#2E7D32', marginBottom: '4px' }}>Deal accepted!</div>
                                        <div style={{ fontSize: '12px', color: C.textSecondary }}>Both sides must confirm the expectation checklist before the deal is finalised.</div>
                                      </div>
                                      <button onClick={() => setDealRoomPhase('checklist')} style={{ width: '100%', background: C.primary, border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                                        Review Checklist
                                      </button>
                                    </>
                                  )}

                                  {dealRoomPhase === 'checklist' && (
                                    <>
                                      <div style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>Expectation Checklist</div>
                                      {[
                                        { key: 'Content format (posts / reels / stories)', req: true },
                                        { key: 'Maximum revision rounds', req: true },
                                        { key: 'Usage rights & exclusivity', req: true },
                                        { key: 'Payment schedule confirmed', req: true },
                                        { key: 'Final deliverable deadline', req: true },
                                        { key: 'Approval process defined', req: false },
                                        { key: 'Metrics reporting agreed', req: false },
                                      ].map((item, ci) => (
                                        <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                                          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                          </div>
                                          <span style={{ fontSize: '12px', color: C.text, flex: 1 }}>{item.key}</span>
                                          {item.req && <span style={{ fontSize: '9px', color: C.primary, fontWeight: 700, textTransform: 'uppercase' }}>Required</span>}
                                        </div>
                                      ))}
                                      <button onClick={() => { setNegotiatingOpp(null); setPurchaseToast('Deal finalised — proof-of-work upload unlocked'); setTimeout(() => setPurchaseToast(null), 3000); }} style={{ width: '100%', background: C.primary, border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px', marginTop: '12px' }}>
                                        Confirm &amp; Finalise Deal
                                      </button>
                                    </>
                                  )}

                                  {!['offer','counter','accepted','checklist'].includes(dealRoomPhase) && (
                                    <button onClick={() => setNegotiatingOpp(null)} style={{ width: '100%', background: 'none', border: `1px solid ${C.border}`, padding: '8px', borderRadius: '8px', color: C.textSecondary, cursor: 'pointer', fontSize: '12px' }}>Close</button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </>
              )}

              {/* Layer 3b: Brand Marketplace */}
              {hasValueSkin && marketplaceRole === 'brand' && (
                <>
                  <div style={{ height: '60px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '20px', paddingRight: '20px', fontWeight: 'bold', fontSize: '16px', background: C.surface }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Marketplace
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#E65100', background: 'rgba(230,81,0,0.1)', padding: '3px 8px', borderRadius: '6px' }}>Brand</span>
                    </div>
                    <button onClick={() => { setMarketplaceRole('none'); setNegotiatingCreator(null); }} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: '6px', padding: '4px 10px', fontSize: '11px', color: C.textSecondary, cursor: 'pointer' }}>Switch Role</button>
                  </div>
                  <div style={{ padding: '20px' }}>
                    {/* Matching Rule Banner */}
                    <div style={{ background: 'rgba(0,102,204,0.06)', border: `1px solid rgba(0,102,204,0.15)`, borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>ValuSkin Matching Active</div>
                        <div style={{ fontSize: '11px', color: C.textSecondary }}>Only creators holding the ValuSkin you select below will appear. Matching is deterministic and server-enforced.</div>
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                        {(['profession', 'name', 'general'] as const).map(mode => (
                          <button key={mode} onClick={() => { setBrandSearchMode(mode); setBrandSearchQuery(''); }}
                            style={{ flex: 1, padding: '6px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize',
                              background: brandSearchMode === mode ? C.primary : C.card,
                              color: brandSearchMode === mode ? '#fff' : C.textSecondary,
                              border: `1px solid ${brandSearchMode === mode ? C.primary : C.border}`,
                            }}>{mode}</button>
                        ))}
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input
                          value={brandSearchQuery}
                          onChange={e => setBrandSearchQuery(e.target.value)}
                          placeholder={
                            brandSearchMode === 'profession' ? 'Search by profession (e.g. Piano Player, Fitness Coach...)' :
                            brandSearchMode === 'name' ? 'Search by creator name or handle...' :
                            'Search creators, professions, or handles...'
                          }
                          style={{ width: '100%', padding: '10px 36px 10px 12px', background: C.card, border: `1px solid ${brandSearchQuery ? C.primary : C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', boxSizing: 'border-box' as const, outline: 'none' }}
                        />
                        {brandSearchQuery && (
                          <button onClick={() => setBrandSearchQuery('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: '16px' }}>×</button>
                        )}
                      </div>
                      {brandSearchQuery && brandSearchMode === 'profession' && (
                        <div style={{ marginTop: '6px', padding: '8px 10px', background: 'rgba(0,102,204,0.06)', borderRadius: '8px', fontSize: '11px', color: C.textSecondary }}>
                          Showing exact <strong style={{ color: C.text }}>{brandSearchQuery}</strong> matches first, then related professions
                        </div>
                      )}
                    </div>

                    {/* Which Field — profession filter */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>Which Field (Required ValuSkin)</div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setBrandFieldFilter(null)}
                          style={{
                            fontSize: '11px', fontWeight: 600, padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                            background: brandFieldFilter === null ? C.primary : C.card,
                            color: brandFieldFilter === null ? '#fff' : C.textSecondary,
                            border: `1px solid ${brandFieldFilter === null ? C.primary : C.border}`,
                          }}
                        >All Fields</button>
                        {Array.from(new Set(BRAND_MARKETPLACE_CREATORS.map(c => c.valueSkin))).map(vs => {
                          const badge = PROFESSION_BADGES[vs];
                          const isActive = brandFieldFilter === vs;
                          return (
                            <button
                              key={vs}
                              onClick={() => setBrandFieldFilter(vs)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                fontSize: '11px', fontWeight: 600, padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                                background: isActive ? `${badge?.color ?? C.primary}20` : C.card,
                                color: isActive ? (badge?.color ?? C.primary) : C.textSecondary,
                                border: `1px solid ${isActive ? (badge?.color ?? C.primary) : C.border}`,
                              }}
                            >
                              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '3px', background: badge?.color ?? C.primary, color: '#fff', fontSize: '6px', fontWeight: 700 }}>
                                {badge?.abbreviation ?? vs.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 3)}
                              </span>
                              {vs}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Advanced Audience & Deal Filters */}
                    <div style={{ marginBottom: '14px' }}>
                      <button onClick={() => setShowAudienceFilters(p => !p)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: showAudienceFilters ? '10px 10px 0 0' : '10px', padding: '9px 14px', cursor: 'pointer', color: C.textSecondary, fontSize: '11px', fontWeight: 700 }}>
                        <span style={{ textTransform: 'uppercase', letterSpacing: '0.6px' }}>Audience & Deal Filters</span>
                        <span>{showAudienceFilters ? '▲' : '▼'}</span>
                      </button>
                      {showAudienceFilters && (
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '12px' }}>
                          {/* Audience Age Range */}
                          <div style={{ marginBottom: '10px' }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '6px', textTransform: 'uppercase' }}>Audience Age Range</div>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                              {[null, '13-17', '18-24', '25-34', '35-44', '45-54', '55+'].map(a => (
                                <button key={a ?? 'all'} onClick={() => setFilterAudienceAge(a)}
                                  style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                                    background: filterAudienceAge === a ? `${C.primary}25` : C.bg,
                                    color: filterAudienceAge === a ? C.primary : C.textSecondary,
                                    border: `1px solid ${filterAudienceAge === a ? C.primary : C.border}`,
                                  }}>{a ?? 'Any'}</button>
                              ))}
                            </div>
                          </div>
                          {/* Audience Language */}
                          <div style={{ marginBottom: '10px' }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '6px', textTransform: 'uppercase' }}>Audience Language</div>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                              {[null, 'English', 'Spanish', 'Hindi', 'Portuguese', 'Arabic', 'Mandarin'].map(l => (
                                <button key={l ?? 'all'} onClick={() => setFilterAudienceLang(l)}
                                  style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                                    background: filterAudienceLang === l ? `${C.primary}25` : C.bg,
                                    color: filterAudienceLang === l ? C.primary : C.textSecondary,
                                    border: `1px solid ${filterAudienceLang === l ? C.primary : C.border}`,
                                  }}>{l ?? 'Any'}</button>
                              ))}
                            </div>
                          </div>
                          {/* Audience Location + Min Deal side by side */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <div>
                              <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>Audience Location</div>
                              <input value={filterAudienceLoc} onChange={e => setFilterAudienceLoc(e.target.value)} placeholder="e.g. USA" style={{ width: '100%', padding: '7px 9px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '7px', color: C.text, fontSize: '12px', boxSizing: 'border-box' as const, outline: 'none' }} />
                            </div>
                            <div>
                              <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>Min Deal Size (USD)</div>
                              <input value={filterMinDeal} onChange={e => setFilterMinDeal(e.target.value)} type="number" placeholder="e.g. 1000" style={{ width: '100%', padding: '7px 9px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '7px', color: C.text, fontSize: '12px', boxSizing: 'border-box' as const, outline: 'none' }} />
                            </div>
                          </div>
                          {/* Deal Type */}
                          <div style={{ marginBottom: '10px' }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '6px', textTransform: 'uppercase' }}>Deal Type</div>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                              {[null, 'Paid', 'Gifted Product', 'Equity', 'Barter', 'Revenue Share', 'Ambassador'].map(d => (
                                <button key={d ?? 'all'} onClick={() => setFilterDealType(d)}
                                  style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                                    background: filterDealType === d ? `${C.primary}25` : C.bg,
                                    color: filterDealType === d ? C.primary : C.textSecondary,
                                    border: `1px solid ${filterDealType === d ? C.primary : C.border}`,
                                  }}>{d ?? 'Any'}</button>
                              ))}
                            </div>
                          </div>
                          {/* Response Time Max */}
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '6px', textTransform: 'uppercase' }}>Max Response Time</div>
                            <div style={{ display: 'flex', gap: '5px' }}>
                              {[null, 4, 12, 24, 48].map(h => (
                                <button key={h ?? 'any'} onClick={() => setFilterResponseMax(h)}
                                  style={{ flex: 1, padding: '5px 4px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                                    background: filterResponseMax === h ? `${C.primary}25` : C.bg,
                                    color: filterResponseMax === h ? C.primary : C.textSecondary,
                                    border: `1px solid ${filterResponseMax === h ? C.primary : C.border}`,
                                  }}>{h ? `≤${h}h` : 'Any'}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                        {brandFieldFilter ? `Creators with ${brandFieldFilter} ValuSkin` : 'All Creators'}
                      </div>
                      <button
                        onClick={() => setFilterBarterOnly(prev => !prev)}
                        style={{
                          fontSize: '11px', fontWeight: 600,
                          color: filterBarterOnly ? '#10b981' : C.textSecondary,
                          background: filterBarterOnly ? 'rgba(16,185,129,0.1)' : 'transparent',
                          border: `1px solid ${filterBarterOnly ? '#10b981' : C.border}`,
                          padding: '4px 10px', borderRadius: '6px', cursor: 'pointer',
                        }}
                      >
                        {filterBarterOnly ? 'Barter Only' : 'Show All'}
                      </button>
                    </div>
                    {(() => {
                      const q = brandSearchQuery.trim().toLowerCase();
                      let results = BRAND_MARKETPLACE_CREATORS.filter(c =>
                        (!filterBarterOnly || c.willingToBarter) &&
                        (!brandFieldFilter || c.valueSkin === brandFieldFilter) &&
                        (!filterAudienceAge || c.audienceAgeRange === filterAudienceAge) &&
                        (!filterAudienceLang || c.audienceLang === filterAudienceLang) &&
                        (!filterAudienceLoc.trim() || c.audienceLocation.toLowerCase().includes(filterAudienceLoc.trim().toLowerCase())) &&
                        (!filterMinDeal || c.minDealUsd >= Number(filterMinDeal)) &&
                        (!filterDealType || c.dealTypes.includes(filterDealType)) &&
                        (!filterResponseMax || c.responseTimeHrs <= filterResponseMax)
                      );
                      if (q) {
                        if (brandSearchMode === 'profession') {
                          // Exact matches first, then partial, then related (same category words)
                          const exact = results.filter(c => c.valueSkin.toLowerCase() === q);
                          const partial = results.filter(c => c.valueSkin.toLowerCase().includes(q) && c.valueSkin.toLowerCase() !== q);
                          const related = results.filter(c => !c.valueSkin.toLowerCase().includes(q) && q.split(' ').some(word => c.valueSkin.toLowerCase().includes(word)));
                          results = [...exact, ...partial, ...related];
                        } else if (brandSearchMode === 'name') {
                          results = results.filter(c => c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q));
                        } else {
                          // General: name, handle, profession — exact skin match first
                          const exact = results.filter(c => c.valueSkin.toLowerCase() === q);
                          const rest = results.filter(c => c.valueSkin.toLowerCase() !== q && (
                            c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q) || c.valueSkin.toLowerCase().includes(q)
                          ));
                          results = [...exact, ...rest];
                        }
                      }
                      return (
                        <>
                          {results.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '30px 20px', color: C.textMuted }}>
                              <div style={{ fontSize: '14px', marginBottom: '4px' }}>No creators found</div>
                              <div style={{ fontSize: '11px' }}>Try a different search term or clear filters.</div>
                            </div>
                          )}
                          {results.map((creator, i) => {
                      const badge = PROFESSION_BADGES[creator.valueSkin];
                      const abbr = badge?.abbreviation ?? creator.valueSkin.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 3);
                      const badgeColor = badge?.color ?? C.primary;
                      const isNegotiating = negotiatingCreator === i;
                      return (
                        <div key={i} style={{ background: C.card, borderRadius: '12px', padding: '16px', marginBottom: '12px', border: `1px solid ${isNegotiating ? 'rgba(230,81,0,0.4)' : creator.featured ? 'rgba(0,102,204,0.3)' : C.border}` }}>
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.name.replace(/\s/g, '')}`}
                              alt={creator.name}
                              style={{ width: '44px', height: '44px', borderRadius: '50%', background: C.surfaceAlt }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: 700, fontSize: '14px' }}>{creator.name}</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '4px', background: badgeColor, color: '#fff', fontSize: '7px', fontWeight: 700 }}>{abbr}</span>
                                {creator.featured && <span style={{ fontSize: '10px', fontWeight: 700, color: C.primary, background: `${C.primary}15`, padding: '2px 6px', borderRadius: '4px' }}>TOP MATCH</span>}
                                {creator.willingToBarter && <span style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px' }}>OPEN TO BARTER</span>}
                              </div>
                              <div style={{ fontSize: '12px', color: C.textSecondary }}>{creator.handle}</div>
                              <div style={{ fontSize: '10px', color: C.primary, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill={C.primary} stroke="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                Matched by ValuSkin: {creator.valueSkin}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '16px', fontWeight: 800, color: C.primary }}>{creator.matchScore}</div>
                              <div style={{ fontSize: '10px', color: C.textMuted }}>match</div>
                            </div>
                          </div>
                          {/* Public stats */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '5px', marginBottom: '10px' }}>
                            {[
                              { label: 'Followers', value: creator.followers },
                              { label: 'Engagement', value: creator.engagement },
                              { label: 'Responds', value: `≤${creator.responseTimeHrs}h` },
                              { label: 'Min Deal', value: `$${(creator.minDealUsd / 1000).toFixed(creator.minDealUsd < 1000 ? 0 : 1)}K` },
                            ].map(stat => (
                              <div key={stat.label} style={{ textAlign: 'center', padding: '5px 3px', background: C.surfaceAlt, borderRadius: '6px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>{stat.value}</div>
                                <div style={{ fontSize: '8px', color: C.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>{stat.label}</div>
                              </div>
                            ))}
                          </div>
                          {/* Audience & Deal meta row */}
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: 'rgba(0,102,204,0.08)', color: C.primary, border: `1px solid rgba(0,102,204,0.2)` }}>
                              🌍 {creator.audienceLocation}
                            </span>
                            <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: 'rgba(0,102,204,0.08)', color: C.primary, border: `1px solid rgba(0,102,204,0.2)` }}>
                              👥 {creator.audienceAgeRange}
                            </span>
                            <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: 'rgba(0,102,204,0.08)', color: C.primary, border: `1px solid rgba(0,102,204,0.2)` }}>
                              💬 {creator.audienceLang}
                            </span>
                            <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: 'rgba(100,100,100,0.1)', color: C.textSecondary, border: `1px solid ${C.border}` }}>
                              🕐 {creator.timezone}
                            </span>
                          </div>
                          {/* Deal types + NDA/rights row */}
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
                            {creator.dealTypes.map(dt => (
                              <span key={dt} style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', textTransform: 'uppercase' }}>{dt}</span>
                            ))}
                            {creator.ndaOk && <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '8px', background: 'rgba(139,92,246,0.08)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)', textTransform: 'uppercase' }}>NDA ✓</span>}
                            {creator.usageRightsOk && <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '8px', background: 'rgba(139,92,246,0.08)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)', textTransform: 'uppercase' }}>Usage Rights ✓</span>}
                          </div>

                          {/* Platform safety status bar */}
                          <div style={{ display: 'flex', gap: '5px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            {safetyRequireVerifiedBrand && (
                              <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>✓ VERIFIED BRAND</span>
                            )}
                            {safetyRequireBrief && (
                              <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px', background: 'rgba(0,102,204,0.08)', color: C.primary, border: `1px solid rgba(0,102,204,0.2)` }}>BRIEF REQUIRED</span>
                            )}
                            <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                              MAX {safetyDmRateLimit}/DAY
                            </span>
                          </div>

                          {!isNegotiating ? (
                            <button
                              onClick={() => { setNegotiatingCreator(i); setBrandDealPhase('brief'); setBrandBriefTitle(''); setBrandBriefDeliverables(''); setBrandBudget('4000'); setBrandDealIntent('campaign'); }}
                              style={{ background: creator.featured ? C.primary : C.surfaceAlt, border: creator.featured ? 'none' : `1px solid ${C.border}`, padding: '10px 16px', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer', width: '100%', fontSize: '14px' }}
                            >
                              Send Proposal
                            </button>
                          ) : (
                            <div style={{ background: C.surfaceAlt, borderRadius: '10px', padding: '14px', border: `1px solid rgba(230,81,0,0.3)` }}>
                              {/* Deal Room Header */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#E65100', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                  </svg>
                                  Deal Room
                                </div>
                                {brandDealPhase === 'pending' && (
                                  <div style={{ fontSize: '10px', color: '#E65100', background: 'rgba(230,81,0,0.1)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                                    Expires in 23h 47m
                                  </div>
                                )}
                                {brandDealPhase === 'counter' && (
                                  <div style={{ fontSize: '10px', color: '#E65100', background: 'rgba(230,81,0,0.1)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                                    Respond within 23h 12m
                                  </div>
                                )}
                              </div>

                              {/* Phase 1: Mandatory Brief */}
                              {brandDealPhase === 'brief' && (
                                <>
                                  <div style={{ fontSize: '12px', color: C.textSecondary, marginBottom: '12px', lineHeight: 1.5 }}>
                                    Fill in your campaign brief before contacting {creator.name}. Brands without briefs cannot initiate contact.
                                  </div>

                                  {/* Intent selector */}
                                  <div style={{ marginBottom: '10px' }}>
                                    <div style={{ fontSize: '11px', color: C.textMuted, marginBottom: '6px', fontWeight: 600 }}>Intent</div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      {(['explore', 'campaign', 'long-term'] as const).map(intent => (
                                        <button
                                          key={intent}
                                          onClick={() => setBrandDealIntent(intent)}
                                          style={{ flex: 1, padding: '6px 4px', borderRadius: '6px', border: `1px solid ${brandDealIntent === intent ? '#E65100' : C.border}`, background: brandDealIntent === intent ? 'rgba(230,81,0,0.1)' : C.bg, color: brandDealIntent === intent ? '#E65100' : C.textSecondary, fontSize: '10px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}
                                        >{intent}</button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Brief title */}
                                  <div style={{ marginBottom: '10px' }}>
                                    <div style={{ fontSize: '11px', color: C.textMuted, marginBottom: '4px', fontWeight: 600 }}>Campaign title <span style={{ color: '#E65100' }}>*</span></div>
                                    <input
                                      type="text"
                                      placeholder="e.g. Q2 Product Launch Series"
                                      value={brandBriefTitle}
                                      onChange={(e) => setBrandBriefTitle(e.target.value)}
                                      style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, padding: '7px 10px', fontSize: '12px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                  </div>

                                  {/* Campaign type */}
                                  <div style={{ marginBottom: '10px' }}>
                                    <div style={{ fontSize: '11px', color: C.textMuted, marginBottom: '4px', fontWeight: 600 }}>Campaign type <span style={{ color: '#E65100' }}>*</span></div>
                                    <select
                                      value={brandCampaignType}
                                      onChange={(e) => setBrandCampaignType(e.target.value)}
                                      style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, padding: '7px 10px', fontSize: '12px', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}
                                    >
                                      {CAMPAIGN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                  </div>

                                  {/* Deliverables */}
                                  <div style={{ marginBottom: '14px' }}>
                                    <div style={{ fontSize: '11px', color: C.textMuted, marginBottom: '4px', fontWeight: 600 }}>Deliverables <span style={{ color: '#E65100' }}>*</span></div>
                                    <textarea
                                      placeholder="e.g. 2 × Instagram Reels, 3 × Stories, 1 × static post"
                                      value={brandBriefDeliverables}
                                      onChange={(e) => setBrandBriefDeliverables(e.target.value)}
                                      rows={2}
                                      style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, padding: '7px 10px', fontSize: '12px', fontFamily: 'inherit', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                                    />
                                  </div>

                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                      onClick={() => { if (brandBriefTitle.trim() && brandBriefDeliverables.trim()) setBrandDealPhase('offer'); }}
                                      style={{ flex: 1, background: brandBriefTitle.trim() && brandBriefDeliverables.trim() ? '#E65100' : C.border, border: 'none', padding: '9px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: brandBriefTitle.trim() && brandBriefDeliverables.trim() ? 'pointer' : 'not-allowed', fontSize: '13px' }}
                                    >
                                      Continue to Offer
                                    </button>
                                    <button onClick={() => setNegotiatingCreator(null)} style={{ background: 'none', border: `1px solid ${C.border}`, padding: '9px 12px', borderRadius: '8px', color: C.textSecondary, cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                                  </div>
                                </>
                              )}

                              {/* Phase 2: Make offer */}
                              {brandDealPhase === 'offer' && (
                                <>
                                  {/* Brief summary */}
                                  <div style={{ background: C.bg, borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', border: `1px solid ${C.border}` }}>
                                    <div style={{ fontSize: '10px', color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Brief</div>
                                    <div style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{brandBriefTitle}</div>
                                    <div style={{ fontSize: '11px', color: C.textSecondary, marginTop: '2px' }}>{brandCampaignType} · {brandDealIntent}</div>
                                    <div style={{ fontSize: '11px', color: C.textMuted, marginTop: '4px', lineHeight: 1.4 }}>{brandBriefDeliverables}</div>
                                  </div>

                                  {/* Creator price band (public signal — no exact number) */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                                    <div style={{ fontSize: '12px', color: C.textSecondary }}>Creator price band:</div>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#E65100', background: 'rgba(230,81,0,0.1)', padding: '2px 8px', borderRadius: '4px' }}>mid-tier</span>
                                    <div style={{ fontSize: '11px', color: C.textMuted }}>(exact rate hidden)</div>
                                  </div>

                                  <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '11px', color: C.textMuted, marginBottom: '4px', fontWeight: 600 }}>Your offer per post</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ fontSize: '18px', fontWeight: 800, color: C.text }}>$</span>
                                      <input
                                        type="text"
                                        value={brandBudget}
                                        onChange={(e) => setBrandBudget(e.target.value.replace(/[^0-9]/g, ''))}
                                        style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, padding: '7px 10px', fontSize: '16px', fontWeight: 700, fontFamily: 'inherit', outline: 'none', width: '110px' }}
                                        onFocus={(e) => { e.currentTarget.style.borderColor = '#E65100'; }}
                                        onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }}
                                      />
                                      <span style={{ fontSize: '12px', color: C.textMuted }}>/post</span>
                                    </div>
                                  </div>

                                  {/* Privacy note */}
                                  <div style={{ fontSize: '10px', color: C.textMuted, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                    </svg>
                                    Only visible to you and {creator.name} · Auto-expires in 24h
                                  </div>

                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                      onClick={() => setBrandDealPhase('pending')}
                                      style={{ flex: 1, background: '#E65100', border: 'none', padding: '9px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                                    >
                                      Send Offer
                                    </button>
                                    <button onClick={() => setBrandDealPhase('brief')} style={{ background: 'none', border: `1px solid ${C.border}`, padding: '9px 12px', borderRadius: '8px', color: C.textSecondary, cursor: 'pointer', fontSize: '12px' }}>Back</button>
                                  </div>
                                </>
                              )}

                              {/* Phase 3: Pending — waiting for creator response */}
                              {brandDealPhase === 'pending' && (
                                <>
                                  <div style={{ textAlign: 'center', padding: '10px 0 14px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(230,81,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                      </svg>
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>Offer Sent</div>
                                    <div style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.5, marginBottom: '14px' }}>
                                      ${brandBudget}/post · {brandCampaignType}<br />
                                      Waiting for {creator.name} to respond
                                    </div>
                                  </div>

                                  {/* Soft hold option */}
                                  <div style={{ background: C.bg, borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', border: `1px solid ${C.border}` }}>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: C.text, marginBottom: '6px' }}>Reserve this creator's slot?</div>
                                    <div style={{ fontSize: '11px', color: C.textMuted, marginBottom: '8px', lineHeight: 1.4 }}>
                                      A soft hold prevents {creator.name} from accepting other deals while you wait. No payment required.
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                                      {([24, 48, 72] as const).map(h => (
                                        <button
                                          key={h}
                                          onClick={() => setBrandSoftHoldHours(h)}
                                          style={{ flex: 1, padding: '6px 4px', borderRadius: '6px', border: `1px solid ${brandSoftHoldHours === h ? '#E65100' : C.border}`, background: brandSoftHoldHours === h ? 'rgba(230,81,0,0.1)' : C.bg, color: brandSoftHoldHours === h ? '#E65100' : C.textSecondary, fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                                        >{h}h</button>
                                      ))}
                                    </div>
                                    <button
                                      onClick={() => setBrandDealPhase('softhold')}
                                      style={{ width: '100%', background: 'none', border: `1px solid #E65100`, padding: '7px', borderRadius: '8px', color: '#E65100', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}
                                    >
                                      Activate Soft Hold ({brandSoftHoldHours}h)
                                    </button>
                                  </div>

                                  {/* Simulate creator counter-offer */}
                                  <button
                                    onClick={() => setBrandDealPhase('counter')}
                                    style={{ width: '100%', background: 'none', border: `1px solid ${C.border}`, padding: '8px', borderRadius: '8px', color: C.textMuted, fontSize: '11px', cursor: 'pointer' }}
                                  >
                                    Simulate: Creator countered → See counter-offer
                                  </button>
                                </>
                              )}

                              {/* Phase 3a: Soft hold active */}
                              {brandDealPhase === 'softhold' && (
                                <>
                                  <div style={{ textAlign: 'center', padding: '10px 0 14px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,150,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00897B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                      </svg>
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>Slot Reserved</div>
                                    <div style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.5, marginBottom: '4px' }}>
                                      {creator.name}'s calendar is on hold for {brandSoftHoldHours}h
                                    </div>
                                    <div style={{ fontSize: '11px', color: C.textMuted }}>
                                      No payment required · Expires automatically
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setBrandDealPhase('counter')}
                                    style={{ width: '100%', background: 'none', border: `1px solid ${C.border}`, padding: '8px', borderRadius: '8px', color: C.textMuted, fontSize: '11px', cursor: 'pointer', marginTop: '8px' }}
                                  >
                                    Simulate: Creator countered → See counter-offer
                                  </button>
                                </>
                              )}

                              {/* Phase 4: Creator counter-offer received */}
                              {brandDealPhase === 'counter' && (
                                <>
                                  <div style={{ background: 'rgba(230,81,0,0.06)', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', border: `1px solid rgba(230,81,0,0.2)` }}>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#E65100', marginBottom: '6px' }}>Counter-Offer Received</div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                                      <span style={{ fontSize: '22px', fontWeight: 800, color: C.text }}>${simulatedCounterAmount}</span>
                                      <span style={{ fontSize: '12px', color: C.textMuted }}>/post</span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: C.textSecondary }}>
                                      Your offer was ${brandBudget} · difference: ${(parseInt(simulatedCounterAmount) - parseInt(brandBudget)).toLocaleString()}
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                    <button
                                      onClick={() => { setBrandDealPhase('accepted'); setPurchaseToast('Deal accepted — escrow stages unlocked'); setTimeout(() => setPurchaseToast(null), 3000); }}
                                      style={{ flex: 1, background: '#2E7D32', border: 'none', padding: '9px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                                    >
                                      Accept ${simulatedCounterAmount}
                                    </button>
                                    <button
                                      onClick={() => setBrandCounterAmount(brandBudget)}
                                      style={{ flex: 1, background: C.primary, border: 'none', padding: '9px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                                    >
                                      Counter Again
                                    </button>
                                  </div>

                                  {brandCounterAmount !== '' && (
                                    <div style={{ marginBottom: '10px' }}>
                                      <div style={{ fontSize: '11px', color: C.textMuted, marginBottom: '4px', fontWeight: 600 }}>Your counter</div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '16px', fontWeight: 800, color: C.text }}>$</span>
                                        <input
                                          type="text"
                                          value={brandCounterAmount}
                                          onChange={(e) => setBrandCounterAmount(e.target.value.replace(/[^0-9]/g, ''))}
                                          style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, padding: '6px 10px', fontSize: '15px', fontWeight: 700, fontFamily: 'inherit', outline: 'none', width: '100px' }}
                                          onFocus={(e) => { e.currentTarget.style.borderColor = C.primary; }}
                                          onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }}
                                        />
                                        <button
                                          onClick={() => { setBrandBudget(brandCounterAmount); setBrandCounterAmount(''); setBrandDealPhase('pending'); }}
                                          style={{ background: C.primary, border: 'none', padding: '7px 12px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}
                                        >
                                          Send
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  <button
                                    onClick={() => { setNegotiatingCreator(null); setBrandDealPhase('brief'); }}
                                    style={{ width: '100%', background: 'none', border: `1px solid ${C.border}`, padding: '7px', borderRadius: '8px', color: C.textSecondary, cursor: 'pointer', fontSize: '12px' }}
                                  >
                                    Decline & Close
                                  </button>
                                </>
                              )}

                              {/* Phase 5: Accepted */}
                              {brandDealPhase === 'accepted' && (
                                <>
                                  <div style={{ textAlign: 'center', padding: '8px 0 12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(46,125,50,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>Deal Accepted!</div>
                                    <div style={{ fontSize: '12px', color: C.textSecondary, marginBottom: '16px' }}>
                                      ${simulatedCounterAmount}/post · {brandCampaignType}
                                    </div>
                                  </div>

                                  {/* Escrow stages */}
                                  <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Escrow Stages</div>
                                    {[
                                      { stage: 'Advance', pct: '30%', status: 'Pending payment' },
                                      { stage: 'Milestone', pct: '40%', status: 'On content delivery' },
                                      { stage: 'Completion', pct: '30%', status: 'On approval' },
                                    ].map((s, si) => (
                                      <div key={si} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: C.bg, borderRadius: '6px', marginBottom: '4px', border: `1px solid ${C.border}` }}>
                                        <div>
                                          <div style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{s.stage} ({s.pct})</div>
                                          <div style={{ fontSize: '10px', color: C.textMuted }}>{s.status}</div>
                                        </div>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>
                                          ${Math.round(parseInt(simulatedCounterAmount) * parseFloat(s.pct) / 100).toLocaleString()}
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <button
                                    onClick={() => { setNegotiatingCreator(null); setBrandDealPhase('brief'); }}
                                    style={{ width: '100%', background: '#2E7D32', border: 'none', padding: '9px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                                  >
                                    Proceed to Escrow
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                        </>
                      );
                    })()}
                  </div>
                </>
              )}
            </>
          )}

          {/* ── ADMIN PANEL VIEW ────────────────────────────── */}
          {/* ── COMMUNITIES VIEW ──────────────────────────────────── */}
          {activeView === 'communities' && (
            <>
              {activeCommunity === null ? (
                <>
                  {/* Communities List View */}
                  <div style={{ height: '60px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', paddingLeft: '20px', fontWeight: 'bold', fontSize: '16px', background: C.surface }}>
                    Communities
                  </div>

                  {/* Tabs: Discover | My Communities | Create */}
                  <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}` }}>
                    {(['discover', 'mine', 'create'] as const).map(tab => (
                      <div
                        key={tab}
                        onClick={() => setCommunitiesTab(tab)}
                        style={{
                          flex: 1, textAlign: 'center', padding: '14px 0', fontSize: '14px',
                          fontWeight: communitiesTab === tab ? '700' : '500',
                          color: communitiesTab === tab ? C.primary : C.textMuted,
                          borderBottom: communitiesTab === tab ? `2px solid ${C.primary}` : '2px solid transparent',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        {tab === 'discover' ? 'Discover' : tab === 'mine' ? 'My Communities' : 'Create'}
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '16px' }}>
                    {/* DISCOVER TAB */}
                    {communitiesTab === 'discover' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {MOCK_COMMUNITIES.map((comm) => {
                          const userProfessions = Object.values(valueSkins).filter(Boolean).map(s => s!.profession);
                          const canJoin = hasValueSkin && (
                            comm.gateType === 'any_valueskin' ||
                            comm.allowedProfessions.some(p => userProfessions.includes(p))
                          );
                          const alreadyJoined = joinedCommunities.includes(comm.id);

                          return (
                            <div
                              key={comm.id}
                              style={{
                                padding: '14px', background: C.card, borderRadius: '10px',
                                border: `1px solid ${C.border}`, display: 'flex', gap: '12px',
                                cursor: 'pointer', transition: 'all 0.15s',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = C.surfaceAlt;
                                e.currentTarget.style.borderColor = C.borderLight;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = C.card;
                                e.currentTarget.style.borderColor = C.border;
                              }}
                            >
                              {/* Avatar */}
                              <div
                                style={{
                                  width: '44px', height: '44px', minWidth: '44px',
                                  borderRadius: '8px', background: comm.avatarColor,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: '#fff', fontWeight: 700, fontSize: '12px',
                                }}
                              >
                                {comm.avatarAbbr}
                              </div>

                              {/* Info */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <div style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>{comm.name}</div>
                                  <span style={{
                                    fontSize: '9px', fontWeight: 600, color: C.textMuted,
                                    background: C.surface, padding: '2px 6px', borderRadius: '4px',
                                  }}>
                                    {comm.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
                                  </span>
                                </div>
                                <div style={{ fontSize: '11px', color: C.textSecondary, marginBottom: '6px', lineHeight: 1.3 }}>
                                  {comm.description.substring(0, 80)}...
                                </div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                                  {comm.gateType === 'any_valueskin' ? (
                                    <span style={{ fontSize: '10px', background: 'rgba(128,128,128,0.1)', color: C.textSecondary, padding: '2px 6px', borderRadius: '4px' }}>
                                      Any ValueSkin
                                    </span>
                                  ) : (
                                    comm.allowedProfessions.slice(0, 2).map((p, i) => (
                                      <span key={i} style={{ fontSize: '10px', background: `${comm.avatarColor}20`, color: C.primary, padding: '2px 6px', borderRadius: '4px' }}>
                                        {p.substring(0, 12)}
                                      </span>
                                    ))
                                  )}
                                </div>
                                <div style={{ fontSize: '11px', color: C.textMuted }}>
                                  {comm.memberCount.toLocaleString()} members · {comm.postCount.toLocaleString()} posts
                                </div>
                              </div>

                              {/* Action button */}
                              <div style={{ flexShrink: 0 }}>
                                {alreadyJoined ? (
                                  <button
                                    onClick={() => setActiveCommunity(comm.id)}
                                    style={{
                                      padding: '8px 14px', borderRadius: '6px', border: 'none',
                                      background: C.primary, color: '#fff', fontSize: '12px', fontWeight: 600,
                                      cursor: 'pointer', whiteSpace: 'nowrap',
                                    }}
                                  >
                                    Open →
                                  </button>
                                ) : canJoin ? (
                                  <button
                                    onClick={() => { setJoinedCommunities([...joinedCommunities, comm.id]); }}
                                    style={{
                                      padding: '8px 14px', borderRadius: '6px', border: 'none',
                                      background: '#2ecc71', color: '#fff', fontSize: '12px', fontWeight: 600,
                                      cursor: 'pointer', whiteSpace: 'nowrap',
                                    }}
                                  >
                                    Join
                                  </button>
                                ) : !hasValueSkin ? (
                                  <button
                                    onClick={() => setActiveView('store')}
                                    style={{
                                      padding: '8px 14px', borderRadius: '6px', border: 'none',
                                      background: C.textMuted, color: '#fff', fontSize: '11px', fontWeight: 600,
                                      cursor: 'pointer', whiteSpace: 'nowrap', opacity: 0.6,
                                    }}
                                  >
                                    Get Skin
                                  </button>
                                ) : (
                                  <div style={{ fontSize: '10px', color: C.textMuted, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                    Requires {comm.allowedProfessions[0]}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* MY COMMUNITIES TAB */}
                    {communitiesTab === 'mine' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {joinedCommunities.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '40px 20px', color: C.textMuted }}>
                            <div style={{ fontSize: '14px', marginBottom: '8px' }}>No communities yet</div>
                            <div style={{ fontSize: '12px' }}>Join one from Discover to get started</div>
                          </div>
                        ) : (
                          MOCK_COMMUNITIES.filter(c => joinedCommunities.includes(c.id)).map((comm) => (
                            <div
                              key={comm.id}
                              onClick={() => setActiveCommunity(comm.id)}
                              style={{
                                padding: '14px', background: C.card, borderRadius: '10px',
                                border: `1px solid ${C.border}`, cursor: 'pointer', transition: 'all 0.15s',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = C.surfaceAlt;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = C.card;
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div
                                  style={{
                                    width: '44px', height: '44px', minWidth: '44px',
                                    borderRadius: '8px', background: comm.avatarColor,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontWeight: 700, fontSize: '12px',
                                  }}
                                >
                                  {comm.avatarAbbr}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: 600, color: C.text, marginBottom: '4px' }}>{comm.name}</div>
                                  <div style={{ fontSize: '11px', color: C.textMuted }}>
                                    {comm.memberCount.toLocaleString()} members
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* CREATE TAB */}
                    {communitiesTab === 'create' && (
                      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                        {!hasValueSkin ? (
                          <div style={{ textAlign: 'center', padding: '40px 20px', color: C.textMuted }}>
                            <div style={{ fontSize: '14px', marginBottom: '16px' }}>You need a ValueSkin to create a community</div>
                            <button
                              onClick={() => setActiveView('store')}
                              style={{
                                padding: '10px 20px', borderRadius: '6px', border: 'none',
                                background: C.primary, color: '#fff', fontSize: '13px', fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              → Get a ValueSkin
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, marginBottom: '8px' }}>Community Name</div>
                              <input
                                type="text"
                                value={newCommName}
                                onChange={(e) => setNewCommName(e.target.value)}
                                placeholder="e.g. SWE Underground"
                                style={{
                                  width: '100%', padding: '10px 12px', borderRadius: '6px',
                                  border: `1px solid ${C.border}`, background: C.surface, color: C.text,
                                  fontSize: '13px', boxSizing: 'border-box',
                                }}
                              />
                            </div>

                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, marginBottom: '8px' }}>Description</div>
                              <textarea
                                value={newCommDesc}
                                onChange={(e) => setNewCommDesc(e.target.value)}
                                placeholder="What's this community about?"
                                rows={3}
                                style={{
                                  width: '100%', padding: '10px 12px', borderRadius: '6px',
                                  border: `1px solid ${C.border}`, background: C.surface, color: C.text,
                                  fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit',
                                  resize: 'none',
                                }}
                              />
                            </div>

                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, marginBottom: '8px' }}>Visibility</div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {(['public', 'private'] as const).map(v => (
                                  <button
                                    key={v}
                                    onClick={() => setNewCommVisibility(v)}
                                    style={{
                                      flex: 1, padding: '10px 14px', borderRadius: '6px',
                                      border: `1px solid ${newCommVisibility === v ? C.primary : C.border}`,
                                      background: newCommVisibility === v ? `${C.primary}10` : C.surface,
                                      color: newCommVisibility === v ? C.primary : C.text,
                                      fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                    }}
                                  >
                                    {v === 'public' ? '🌐 Public' : '🔒 Private'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, marginBottom: '8px' }}>Gate Type</div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {(['any_valueskin', 'specific'] as const).map(gt => (
                                  <button
                                    key={gt}
                                    onClick={() => setNewCommGateType(gt)}
                                    style={{
                                      flex: 1, padding: '10px 14px', borderRadius: '6px',
                                      border: `1px solid ${newCommGateType === gt ? C.primary : C.border}`,
                                      background: newCommGateType === gt ? `${C.primary}10` : C.surface,
                                      color: newCommGateType === gt ? C.primary : C.text,
                                      fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                                    }}
                                  >
                                    {gt === 'any_valueskin' ? 'Any' : 'Specific'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, marginBottom: '8px' }}>Required Tier</div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {(['community', 'marketplace'] as const).map(tier => (
                                  <button
                                    key={tier}
                                    onClick={() => setNewCommTier(tier)}
                                    style={{
                                      flex: 1, padding: '10px 14px', borderRadius: '6px',
                                      border: `1px solid ${newCommTier === tier ? C.primary : C.border}`,
                                      background: newCommTier === tier ? `${C.primary}10` : C.surface,
                                      color: newCommTier === tier ? C.primary : C.text,
                                      fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                                    }}
                                  >
                                    {tier === 'community' ? 'Free' : 'Premium'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                if (newCommName.trim()) {
                                  const newCommunity = MOCK_COMMUNITIES.length;
                                  setJoinedCommunities([...joinedCommunities, newCommunity]);
                                  setNewCommName('');
                                  setNewCommDesc('');
                                  setCommunitiesTab('mine');
                                  setPurchaseToast('✨ Community created!');
                                  setTimeout(() => setPurchaseToast(null), 3000);
                                }
                              }}
                              style={{
                                padding: '12px 16px', borderRadius: '6px', border: 'none',
                                background: C.primary, color: '#fff', fontSize: '14px', fontWeight: 600,
                                cursor: 'pointer', width: '100%', marginTop: '8px',
                              }}
                            >
                              Create Community
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Community Detail View */}
                  {(() => {
                    const community = MOCK_COMMUNITIES.find(c => c.id === activeCommunity);
                    if (!community) return null;

                    return (
                      <>
                        <div style={{ height: '60px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between', background: C.surface }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                              onClick={() => setActiveCommunity(null)}
                              style={{ background: 'none', border: 'none', color: C.primary, fontSize: '16px', cursor: 'pointer' }}
                            >
                              ← Back
                            </button>
                            <div
                              style={{
                                width: '36px', height: '36px', minWidth: '36px',
                                borderRadius: '6px', background: community.avatarColor,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: 700, fontSize: '11px',
                              }}
                            >
                              {community.avatarAbbr}
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 600 }}>{community.name}</div>
                              <div style={{ fontSize: '11px', color: C.textSecondary }}>{community.memberCount.toLocaleString()} members</div>
                            </div>
                          </div>
                        </div>

                        {/* Inner tabs */}
                        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}` }}>
                          {(['feed', 'members', 'announcements'] as const).map(tab => (
                            <div
                              key={tab}
                              onClick={() => setCommunityInnerTab(tab)}
                              style={{
                                flex: 1, textAlign: 'center', padding: '12px 0', fontSize: '13px',
                                fontWeight: communityInnerTab === tab ? '700' : '500',
                                color: communityInnerTab === tab ? C.primary : C.textMuted,
                                borderBottom: communityInnerTab === tab ? `2px solid ${C.primary}` : '2px solid transparent',
                                cursor: 'pointer', transition: 'all 0.15s',
                              }}
                            >
                              {tab === 'feed' ? 'Feed' : tab === 'members' ? 'Members' : 'Announcements'}
                            </div>
                          ))}
                        </div>

                        <div style={{ padding: '16px' }}>
                          {communityInnerTab === 'feed' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {community.posts.filter(p => !p.announcement).map(post => (
                                <div key={post.id} style={{ padding: '12px', background: C.card, borderRadius: '8px', border: `1px solid ${C.border}` }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <div>
                                      <div style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{post.author}</div>
                                      <div style={{ fontSize: '11px', color: C.textMuted }}>{post.handle} · {post.time}</div>
                                    </div>
                                    <div style={{ fontSize: '10px', background: C.primary + '20', color: C.primary, padding: '2px 6px', borderRadius: '4px', height: 'fit-content' }}>
                                      {post.profession}
                                    </div>
                                  </div>
                                  <div style={{ fontSize: '13px', color: C.text, marginBottom: '8px', lineHeight: 1.4 }}>{post.content}</div>
                                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: C.textSecondary }}>
                                    <button
                                      onClick={() => {
                                        if (likedCommunityPosts.includes(post.id)) {
                                          setLikedCommunityPosts(likedCommunityPosts.filter(p => p !== post.id));
                                        } else {
                                          setLikedCommunityPosts([...likedCommunityPosts, post.id]);
                                        }
                                      }}
                                      style={{
                                        background: 'none', border: 'none', color: likedCommunityPosts.includes(post.id) ? '#e74c3c' : C.textSecondary,
                                        cursor: 'pointer', fontSize: '12px', padding: 0,
                                      }}
                                    >
                                      ❤️ {post.likes + (likedCommunityPosts.includes(post.id) ? 1 : 0)}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {communityInnerTab === 'members' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {community.members.map((member, i) => (
                                <div key={i} style={{ padding: '12px', background: C.card, borderRadius: '8px', border: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{member.name}</div>
                                    <div style={{ fontSize: '11px', color: C.textMuted }}>{member.handle} · {member.profession}</div>
                                  </div>
                                  {/* Reputation Tier Badge */}
                                  <div style={{
                                    marginLeft: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                  }}>
                                    <div style={{
                                      padding: '6px 10px',
                                      borderRadius: '20px',
                                      fontSize: '12px',
                                      fontWeight: 500,
                                      backgroundColor: member.reputationTier === 'senior' ? '#fbbf24' : member.reputationTier === 'member' ? '#3b82f6' : '#9ca3af',
                                      color: 'white',
                                    }}>
                                      {member.reputationTier === 'senior' ? '⭐ Senior' : member.reputationTier === 'member' ? 'Member' : 'Apprentice'}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {communityInnerTab === 'announcements' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {community.posts.filter(p => p.announcement).map(post => (
                                <div key={post.id} style={{ padding: '12px', background: 'rgba(0,102,204,0.06)', borderRadius: '8px', border: `1px solid ${C.primary}30` }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '14px' }}>📢</span>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{post.author}</div>
                                    <div style={{ fontSize: '11px', color: C.textMuted, marginLeft: 'auto' }}>{post.time}</div>
                                  </div>
                                  <div style={{ fontSize: '13px', color: C.text, lineHeight: 1.4 }}>{post.content}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </>
              )}
            </>
          )}

          {activeView === 'admin' && (
            <>
              <div style={{ height: '60px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', paddingLeft: '20px', fontWeight: 'bold', fontSize: '16px', background: C.surface }}>
                Admin Panel
                <span style={{ fontSize: '11px', fontWeight: 600, color: C.primary, background: `rgba(0,102,204,0.1)`, padding: '3px 8px', borderRadius: '6px', marginLeft: '10px' }}>Meta</span>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Insights Tab — Visible Metrics
                  </div>
                  <p style={{ fontSize: '13px', color: C.textSecondary, marginBottom: '16px', lineHeight: 1.5 }}>
                    Configure which metrics appear in the public Insights tab on creator profiles. Toggle metrics on or off to customize the experience.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {([
                      { key: 'score', label: 'Reputation Score', description: 'Overall verified score out of 1000 with progress bar' },
                      { key: 'engagement', label: 'Engagement Rate', description: 'Audience engagement percentage metric' },
                      { key: 'onTime', label: 'On-Time Delivery', description: 'Reliability metric for brand partnerships' },
                      { key: 'deals', label: 'Deals Completed', description: 'Total number of completed brand deals' },
                      { key: 'rating', label: 'Brand Rating', description: 'Average rating from brand partnerships' },
                      { key: 'trustLevel', label: 'Trust Level', description: 'Visual trust level indicator (1-5)' },
                      { key: 'breakdown', label: 'Score Breakdown', description: 'Detailed factor-by-factor score analysis' },
                    ] as const).map(({ key, label, description }) => (
                      <div
                        key={key}
                        onClick={() => setVisibleInsights(prev => ({ ...prev, [key]: !prev[key] }))}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '14px 16px', background: C.card, borderRadius: '10px',
                          border: `1px solid ${visibleInsights[key] ? C.primary : C.border}`,
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: C.text, marginBottom: '2px' }}>{label}</div>
                          <div style={{ fontSize: '11px', color: C.textMuted }}>{description}</div>
                        </div>
                        <div style={{
                          width: '44px', height: '24px', borderRadius: '12px',
                          background: visibleInsights[key] ? C.primary : C.border,
                          position: 'relative', transition: 'background 0.2s', flexShrink: 0, marginLeft: '12px',
                        }}>
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                            position: 'absolute', top: '2px',
                            left: visibleInsights[key] ? '22px' : '2px',
                            transition: 'left 0.2s',
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '14px', background: 'rgba(0,102,204,0.06)', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: C.textSecondary, lineHeight: 1.5 }}>
                    Changes are applied instantly to the Insights tab on all creator profiles. Visit Profile → Insights tab to preview.
                  </div>
                </div>

                {/* ValueSkin Pricing Control */}
                <div style={{ marginTop: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>
                    ValueSkin Pricing
                  </div>
                  <p style={{ fontSize: '13px', color: C.textSecondary, marginBottom: '16px', lineHeight: 1.5 }}>
                    Set the credit cost per tier. All professions use global defaults unless overridden.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { tier: 'community', label: 'Community tier', desc: 'Join communities only' },
                      { tier: 'marketplace', label: 'Marketplace tier', desc: 'Communities + brand deals' },
                    ].map(({ tier, label, desc }) => (
                      <div
                        key={tier}
                        style={{
                          padding: '14px 16px', background: C.card, borderRadius: '10px',
                          border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '12px',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: C.text, marginBottom: '2px' }}>{label}</div>
                          <div style={{ fontSize: '11px', color: C.textMuted }}>{desc}</div>
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={tier === 'community' ? communityTierCredits : marketplaceTierCredits}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            if (tier === 'community') setCommunityTierCredits(val);
                            else setMarketplaceTierCredits(val);
                          }}
                          style={{
                            width: '60px', padding: '8px', borderRadius: '6px',
                            border: `1px solid ${C.border}`, background: C.surface, color: C.text,
                            textAlign: 'center', fontSize: '13px', fontWeight: 600,
                          }}
                        />
                        <span style={{ fontSize: '12px', color: C.textSecondary, minWidth: '80px' }}>
                          ${(tier === 'community' ? communityTierCredits : marketplaceTierCredits) * 0.1}.00 USD
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setPurchaseToast('✅ Pricing updated — takes effect immediately');
                      setTimeout(() => setPurchaseToast(null), 3000);
                    }}
                    style={{
                      width: '100%', marginTop: '16px', padding: '12px 16px', borderRadius: '6px',
                      border: 'none', background: C.primary, color: '#fff', fontSize: '13px', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    Save Pricing
                  </button>
                </div>

                {/* Fraud Detection Dashboard */}
                <div style={{
                  borderRadius: '12px',
                  border: `1px solid ${C.borderLight}`,
                  padding: '16px',
                  marginTop: '20px',
                  backgroundColor: C.bg,
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '12px', color: C.text }}>Fraud Detection Dashboard</h3>

                  {[
                    { id: 1, type: 'self_dealing', creator: '@alex_codes', severity: 'medium', time: '2 days ago' },
                    { id: 2, type: 'velocity_spike', creator: '@ml_marcus', severity: 'high', time: '5 hours ago' },
                    { id: 3, type: 'rating_collusion', creator: '@priya_builds', severity: 'low', time: '1 week ago' },
                  ].filter(s => !resolvedFraudSignals.includes(s.id)).map((signal) => (
                    <div key={signal.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: 'rgba(239,68,68,0.06)',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      fontSize: '13px',
                    }}>
                      <div>
                        <span style={{ fontWeight: 500, color: C.text }}>{signal.type}</span>
                        {' | '}
                        <span style={{ color: C.textSecondary }}>{signal.creator}</span>
                        {' | '}
                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: signal.severity === 'high' ? '#ef4444' : signal.severity === 'medium' ? '#f59e0b' : '#10b981',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                        }}>
                          {signal.severity.toUpperCase()}
                        </span>
                        {' | '}
                        <span style={{ color: C.textSecondary, fontSize: '12px' }}>{signal.time}</span>
                      </div>
                      <button
                        onClick={() => setResolvedFraudSignals([...resolvedFraudSignals, signal.id])}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: C.primary,
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        Resolve
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => alert('Scan queued — results in ~2 minutes')}
                    style={{
                      width: '100%',
                      marginTop: '12px',
                      padding: '10px',
                      backgroundColor: C.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    Run Full Scan
                  </button>
                </div>
              </div>

              {/* ── CREATOR SAFETY CONTROLS ─────────────────────── */}
              <div style={{ padding: '20px', borderTop: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>Creator Safety Controls</div>
                </div>
                <div style={{ fontSize: '11px', color: C.textSecondary, marginBottom: '18px', lineHeight: 1.5 }}>
                  Platform-level rules enforced on all outreach. Creators cannot override these — they set the floor. Brands that violate are throttled or suspended.
                </div>

                {/* DM / Proposal Rate Limit */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px 16px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>Brand Outreach Rate Limit</div>
                      <div style={{ fontSize: '11px', color: C.textSecondary, marginTop: '2px' }}>Max proposals a brand can send per day across all creators</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button onClick={() => setSafetyDmRateLimit(Math.max(1, safetyDmRateLimit - 1))} style={{ width: '24px', height: '24px', borderRadius: '4px', border: `1px solid ${C.border}`, background: C.bg, color: C.text, cursor: 'pointer', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: C.primary, minWidth: '28px', textAlign: 'center' }}>{safetyDmRateLimit}</span>
                      <button onClick={() => setSafetyDmRateLimit(Math.min(100, safetyDmRateLimit + 1))} style={{ width: '24px', height: '24px', borderRadius: '4px', border: `1px solid ${C.border}`, background: C.bg, color: C.text, cursor: 'pointer', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                  </div>
                  <input type="range" min={1} max={50} value={safetyDmRateLimit} onChange={e => setSafetyDmRateLimit(Number(e.target.value))} style={{ width: '100%', accentColor: C.primary }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: C.textMuted, marginTop: '2px' }}>
                    <span>1 (strict)</span><span>25 (standard)</span><span>50 (open)</span>
                  </div>
                </div>

                {/* Re-contact cooldown */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px 16px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>Re-contact Cooldown</div>
                      <div style={{ fontSize: '11px', color: C.textSecondary, marginTop: '2px' }}>Days a brand is blocked from re-contacting a creator after decline</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {[7, 14, 30, 60, 90].map(d => (
                        <button key={d} onClick={() => setSafetyRecontactCooldown(d)}
                          style={{ padding: '4px 7px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                            background: safetyRecontactCooldown === d ? `${C.primary}20` : C.bg,
                            color: safetyRecontactCooldown === d ? C.primary : C.textMuted,
                            border: `1px solid ${safetyRecontactCooldown === d ? C.primary : C.border}`,
                          }}>{d}d</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Report-to-throttle threshold */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px 16px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>Auto-Throttle Threshold</div>
                      <div style={{ fontSize: '11px', color: C.textSecondary, marginTop: '2px' }}>Reports needed from creators before brand outreach is auto-suspended</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {[1, 2, 3, 5, 10].map(n => (
                        <button key={n} onClick={() => setSafetyReportThreshold(n)}
                          style={{ padding: '4px 7px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                            background: safetyReportThreshold === n ? 'rgba(239,68,68,0.15)' : C.bg,
                            color: safetyReportThreshold === n ? '#ef4444' : C.textMuted,
                            border: `1px solid ${safetyReportThreshold === n ? '#ef4444' : C.border}`,
                          }}>{n}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Min brand trust score to contact */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px 16px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>Minimum Brand Trust Score to Contact</div>
                  <div style={{ fontSize: '11px', color: C.textSecondary, marginBottom: '10px' }}>Brands below this score see creator profiles but cannot initiate contact</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setSafetyMinBrandTrust(n)}
                        style={{ flex: 1, padding: '8px 4px', borderRadius: '7px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                          background: safetyMinBrandTrust === n ? `${C.primary}20` : C.bg,
                          color: safetyMinBrandTrust === n ? C.primary : C.textMuted,
                          border: `1px solid ${safetyMinBrandTrust === n ? C.primary : C.border}`,
                        }}>{'★'.repeat(n)}</button>
                    ))}
                  </div>
                  <div style={{ fontSize: '10px', color: C.textMuted, marginTop: '6px', textAlign: 'center' }}>
                    Current: min {safetyMinBrandTrust}★ — brands below are read-only
                  </div>
                </div>

                {/* New brand warm intro threshold */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px 16px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>New Brand Warm Intro Gate</div>
                      <div style={{ fontSize: '11px', color: C.textSecondary, marginTop: '2px' }}>Brands with fewer than N completed deals must be vouched before cold outreach</div>
                    </div>
                    <button onClick={() => setSafetyNewBrandWarmIntro(p => !p)}
                      style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', backgroundColor: safetyNewBrandWarmIntro ? C.primary : 'rgba(255,255,255,0.15)', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background-color 0.2s' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: '2px', left: safetyNewBrandWarmIntro ? '22px' : '2px', transition: 'left 0.2s' }} />
                    </button>
                  </div>
                  {safetyNewBrandWarmIntro && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: C.textSecondary }}>Gate brands with fewer than</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[0, 1, 3, 5, 10].map(n => (
                          <button key={n} onClick={() => setSafetyNewBrandDealCount(n)}
                            style={{ padding: '3px 7px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                              background: safetyNewBrandDealCount === n ? `${C.primary}20` : C.bg,
                              color: safetyNewBrandDealCount === n ? C.primary : C.textMuted,
                              border: `1px solid ${safetyNewBrandDealCount === n ? C.primary : C.border}`,
                            }}>{n}</button>
                        ))}
                      </div>
                      <span style={{ fontSize: '11px', color: C.textSecondary }}>completed deals</span>
                    </div>
                  )}
                </div>

                {/* Toggle switches row */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px 16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>Platform-Wide Enforcement</div>
                  {([
                    { label: 'Require verified Brand ValuSkin to contact', desc: 'Unverified brands cannot initiate any outreach', value: safetyRequireVerifiedBrand, set: setSafetyRequireVerifiedBrand },
                    { label: 'Proposal form required (no free-text cold DMs)', desc: 'All contact must be a structured brief — not a message', value: safetyRequireBrief, set: setSafetyRequireBrief },
                    { label: 'Block off-platform contact requests', desc: 'Auto-flag messages asking for phone/email/WhatsApp', value: safetyOffPlatformBlock, set: setSafetyOffPlatformBlock },
                  ] as const).map(({ label, desc, value, set }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderTop: `1px solid ${C.border}` }}>
                      <div style={{ flex: 1, paddingRight: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{label}</div>
                        <div style={{ fontSize: '10px', color: C.textSecondary, marginTop: '1px' }}>{desc}</div>
                      </div>
                      <button onClick={() => set((p: boolean) => !p)}
                        style={{ width: '40px', height: '22px', borderRadius: '11px', border: 'none', backgroundColor: value ? C.primary : 'rgba(255,255,255,0.12)', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background-color 0.2s' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: '2px', left: value ? '20px' : '2px', transition: 'left 0.2s' }} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Save button */}
                <button
                  onClick={() => { setSavedSafetyToast(true); setTimeout(() => setSavedSafetyToast(false), 3000); }}
                  style={{ width: '100%', padding: '12px', background: C.primary, border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  {savedSafetyToast ? '✅ Safety settings saved' : 'Save Safety Settings'}
                </button>

                {/* Live policy summary */}
                <div style={{ marginTop: '12px', padding: '12px 14px', background: 'rgba(0,102,204,0.05)', border: `1px solid rgba(0,102,204,0.15)`, borderRadius: '8px', fontSize: '11px', color: C.textSecondary, lineHeight: 1.7 }}>
                  <strong style={{ color: C.text, display: 'block', marginBottom: '4px' }}>Current Policy Summary</strong>
                  • Brands can send max <strong style={{ color: C.text }}>{safetyDmRateLimit}</strong> proposals/day<br/>
                  • Declined brand locked out for <strong style={{ color: C.text }}>{safetyRecontactCooldown} days</strong><br/>
                  • Auto-suspended after <strong style={{ color: C.text }}>{safetyReportThreshold}</strong> creator report{safetyReportThreshold !== 1 ? 's' : ''}<br/>
                  • Minimum brand trust to contact: <strong style={{ color: C.text }}>{'★'.repeat(safetyMinBrandTrust)}</strong><br/>
                  {safetyNewBrandWarmIntro && <>• Brands with &lt;{safetyNewBrandDealCount} deals need warm intro<br/></>}
                  {safetyRequireVerifiedBrand && <>• Verified Brand ValuSkin required<br/></>}
                  {safetyRequireBrief && <>• Proposal form mandatory — no cold DMs<br/></>}
                  {safetyOffPlatformBlock && <>• Off-platform contact requests auto-flagged<br/></>}
                </div>
              </div>
            </>
          )}

          {/* ── STORE VIEW ────────────────────────────────────── */}
          {activeView === 'store' && (
            <>
              <div style={{ height: '60px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', paddingLeft: '20px', fontWeight: 'bold', fontSize: '16px', background: C.surface }}>Valueskins Store</div>

              {/* Store tabs */}
              <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}` }}>
                {(['creators', 'brands'] as const).map(tab => (
                  <div
                    key={tab}
                    onClick={() => setStoreTab(tab)}
                    style={{
                      flex: 1, textAlign: 'center', padding: '14px 0', fontSize: '14px',
                      fontWeight: storeTab === tab ? '700' : '500',
                      color: storeTab === tab ? C.primary : C.textMuted,
                      borderBottom: storeTab === tab ? `2px solid ${C.primary}` : '2px solid transparent',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {tab === 'creators' ? 'For Creators' : 'For Brands'}
                  </div>
                ))}
              </div>

              {/* FOR CREATORS tab — existing store */}
              {storeTab === 'creators' && (
                <div style={{ padding: '20px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '10px' }}>
                      Assign to slot
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {SLOTS.map((slot) => {
                        const current = valueSkins[slot];
                        const active = assigningSlot === slot;
                        return (
                          <button
                            key={slot}
                            onClick={() => setAssigningSlot(active ? null : slot)}
                            style={{
                              flex: 1, padding: '10px 8px',
                              background: active ? `${SLOT_COLORS[slot]}20` : C.card,
                              border: `2px solid ${active ? SLOT_COLORS[slot] : C.border}`,
                              borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
                            }}
                          >
                            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: SLOT_COLORS[slot], marginBottom: '4px' }}>
                              {SLOT_LABELS[slot]}
                            </div>
                            <div style={{ fontSize: '12px', color: current ? C.text : C.textMuted, fontWeight: current ? 600 : 400 }}>
                              {current ? (PROFESSION_BADGES[current.profession]?.abbreviation ?? current.profession) : 'Empty'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {assigningSlot && (
                      <div style={{ fontSize: '12px', color: SLOT_COLORS[assigningSlot], marginTop: '8px', fontWeight: 600 }}>
                        Selecting for {SLOT_LABELS[assigningSlot]} slot — tap any badge below to apply ($10)
                      </div>
                    )}
                    {!assigningSlot && (
                      <div style={{ fontSize: '12px', color: C.textMuted, marginTop: '8px' }}>
                        Select a slot above, then choose a profession badge.
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {Object.values(PROFESSIONS).map((prof) => {
                      const isCurrentSlotActive = assigningSlot && prof.subProfessions.includes(valueSkins[assigningSlot]?.profession ?? '');
                      return (
                        <button
                          key={prof.name}
                          onClick={() => { if (assigningSlot) { setStoreCategory(prof.name); setShowStoreModal(true); } }}
                          style={{
                            padding: '14px', background: isCurrentSlotActive ? `rgba(0,102,204,0.1)` : C.card,
                            border: `1px solid ${isCurrentSlotActive ? C.primary : C.border}`,
                            borderRadius: '10px', color: C.text, cursor: assigningSlot ? 'pointer' : 'default',
                            fontWeight: '600', fontSize: '14px', textAlign: 'left', transition: 'all 0.15s',
                            opacity: assigningSlot ? 1 : 0.6,
                          }}
                          onMouseEnter={(e) => { if (assigningSlot) e.currentTarget.style.borderColor = C.primary; }}
                          onMouseLeave={(e) => { if (!isCurrentSlotActive) e.currentTarget.style.borderColor = C.border; }}
                        >
                          <div style={{ marginBottom: '4px' }}>{prof.name}</div>
                          <div style={{ fontSize: '12px', color: isCurrentSlotActive ? C.primary : C.textSecondary, fontWeight: 700 }}>
                            {isCurrentSlotActive ? 'Active' : assigningSlot ? '$10' : '—'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FOR BRANDS tab */}
              {storeTab === 'brands' && (
                <div style={{ padding: '20px' }}>
                  <p style={{ fontSize: '13px', color: C.textSecondary, lineHeight: 1.6, marginBottom: '20px' }}>
                    Establish your brand identity on the creator marketplace. Your ValueSkin tells creators what kind of brand you are and unlocks marketplace access.
                  </p>

                  {/* Current brand badge */}
                  {brandValueSkin && (
                    <div style={{ background: `rgba(230,81,0,0.08)`, border: `1px solid rgba(230,81,0,0.25)`, borderRadius: '10px', padding: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#E65100', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 700 }}>
                        {brandValueSkin.slice(0, 3).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>{brandValueSkin}</div>
                        <div style={{ fontSize: '11px', color: C.textMuted }}>Your active brand identity</div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                  )}

                  <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Choose your brand category
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {Object.values(BRAND_CATEGORIES).map((cat) => {
                      const isActive = brandValueSkin && cat.subCategories.includes(brandValueSkin);
                      return (
                        <button
                          key={cat.name}
                          onClick={() => { setBrandStoreCategory(cat.name); setShowBrandStoreModal(true); }}
                          style={{
                            padding: '14px', background: isActive ? `rgba(230,81,0,0.08)` : C.card,
                            border: `1px solid ${isActive ? '#E65100' : C.border}`,
                            borderRadius: '10px', color: C.text, cursor: 'pointer',
                            fontWeight: '600', fontSize: '14px', textAlign: 'left', transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#E65100'; }}
                          onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = C.border; }}
                        >
                          <div style={{ marginBottom: '4px' }}>{cat.name}</div>
                          <div style={{ fontSize: '12px', color: isActive ? '#E65100' : C.textSecondary, fontWeight: 700 }}>
                            {isActive ? brandValueSkin : `${cat.subCategories.length} options`}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ padding: '14px', background: 'rgba(230,81,0,0.06)', borderRadius: '10px', textAlign: 'center', marginTop: '20px' }}>
                    <div style={{ fontSize: '11px', color: C.textSecondary, lineHeight: 1.5 }}>
                      $10 one-time purchase. Your brand ValueSkin unlocks the Marketplace and signals your identity to creators.
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── SETTINGS VIEW ────────────────────────────────── */}
          {activeView === 'settings' && (
            <>
              <div style={{ height: '60px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', paddingLeft: '20px', fontWeight: 'bold', fontSize: '16px', background: C.surface }}>
                Settings
                <span style={{ fontSize: '11px', fontWeight: 600, color: C.textSecondary, marginLeft: '10px' }}>ValuSkins preferences</span>
              </div>
              <div style={{ padding: '20px' }}>

                {/* Barter / Exposure Toggle — server-side setting */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Collaboration Preferences
                  </div>
                  <div style={{
                    borderRadius: '12px',
                    border: `1px solid ${willingToBarter ? '#10b981' : C.borderLight}`,
                    padding: '14px 16px',
                    backgroundColor: willingToBarter ? 'rgba(16,185,129,0.06)' : C.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                    transition: 'all 0.2s ease',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: C.text, marginBottom: '2px' }}>
                        Open to Free / Exposure / Barter
                      </div>
                      <div style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.4 }}>
                        Signal that you are willing to collaborate without monetary compensation. Visible on your profile and in marketplace search.
                      </div>
                    </div>
                    <button
                      onClick={() => setWillingToBarter(!willingToBarter)}
                      style={{
                        width: '44px', height: '24px', borderRadius: '12px', border: 'none',
                        backgroundColor: willingToBarter ? '#10b981' : 'rgba(255,255,255,0.15)',
                        cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background-color 0.2s',
                      }}
                    >
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff',
                        position: 'absolute', top: '2px', left: willingToBarter ? '22px' : '2px',
                        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      }} />
                    </button>
                  </div>
                </div>

                {/* Energy State */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Availability
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {([
                      { key: 'available', label: 'Available', color: '#10b981' },
                      { key: 'limited', label: 'Limited', color: '#f59e0b' },
                      { key: 'burnout', label: 'Burnout', color: '#ef4444' },
                      { key: 'pause', label: 'Paused', color: '#6b7280' },
                    ] as const).map(({ key, label, color }) => (
                      <button
                        key={key}
                        onClick={() => setCreatorEnergy(key)}
                        style={{
                          flex: 1, padding: '10px 8px', borderRadius: '8px',
                          border: `1px solid ${creatorEnergy === key ? color : C.border}`,
                          background: creatorEnergy === key ? `${color}15` : C.card,
                          color: creatorEnergy === key ? color : C.textSecondary,
                          fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Band */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Price Band
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {([
                      { key: 'experimental', label: 'Experimental' },
                      { key: 'mid-tier', label: 'Mid-Tier' },
                      { key: 'premium', label: 'Premium' },
                      { key: 'exclusive', label: 'Exclusive' },
                    ] as const).map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setCreatorPriceBand(key)}
                        style={{
                          flex: 1, padding: '10px 8px', borderRadius: '8px',
                          border: `1px solid ${creatorPriceBand === key ? C.primary : C.border}`,
                          background: creatorPriceBand === key ? `${C.primary}15` : C.card,
                          color: creatorPriceBand === key ? C.primary : C.textSecondary,
                          fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location & Availability */}
                {(() => {
                  const [locOpen, setLocOpen] = [creatorSettingsOpen === 'location', () => setCreatorSettingsOpen(creatorSettingsOpen === 'location' ? null : 'location')];
                  return (
                    <div style={{ marginBottom: '16px' }}>
                      <button onClick={setLocOpen} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '12px 14px', cursor: 'pointer', color: C.text }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: C.textMuted }}>Location & Availability</span>
                        <span style={{ fontSize: '14px', color: C.textMuted }}>{locOpen ? '▲' : '▼'}</span>
                      </button>
                      {locOpen && (
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '14px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            {[['City', 'e.g. New York'], ['Country', 'e.g. USA']].map(([lbl, ph]) => (
                              <div key={lbl}><div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>{lbl}</div><input placeholder={ph} style={{ width: '100%', padding: '7px 9px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '7px', color: C.text, fontSize: '12px', boxSizing: 'border-box' as const }} /></div>
                            ))}
                          </div>
                          <div style={{ marginBottom: '10px' }}><div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>Availability Hours</div><input placeholder="e.g. 9am–6pm EST" style={{ width: '100%', padding: '7px 9px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '7px', color: C.text, fontSize: '12px', boxSizing: 'border-box' as const }} /></div>
                          {[['Willing to relocate', 'relocate'], ['Willing to travel', 'travel'], ['Available for live events', 'events']].map(([lbl]) => (
                            <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderTop: `1px solid ${C.border}` }}>
                              <span style={{ fontSize: '12px', color: C.text }}>{lbl}</span>
                              <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: C.border, position: 'relative', cursor: 'pointer' }}><div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: '2px' }} /></div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Identity & Content */}
                {(() => {
                  const open = creatorSettingsOpen === 'identity';
                  return (
                    <div style={{ marginBottom: '16px' }}>
                      <button onClick={() => setCreatorSettingsOpen(open ? null : 'identity')} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: open ? '10px 10px 0 0' : '10px', padding: '12px 14px', cursor: 'pointer', color: C.text }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: C.textMuted }}>Identity & Content</span>
                        <span style={{ fontSize: '14px', color: C.textMuted }}>{open ? '▲' : '▼'}</span>
                      </button>
                      {open && (
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '14px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <div><div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>Age</div><input type="number" placeholder="25" style={{ width: '100%', padding: '7px 9px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '7px', color: C.text, fontSize: '12px', boxSizing: 'border-box' as const }} /></div>
                            <div><div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>Gender</div>
                              <select style={{ width: '100%', padding: '7px 9px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '7px', color: C.text, fontSize: '12px', boxSizing: 'border-box' as const }}>
                                {['Select...', 'Male', 'Female', 'Non-binary', 'Prefer not to say'].map(g => <option key={g}>{g}</option>)}
                              </select>
                            </div>
                          </div>
                          <div style={{ marginBottom: '10px' }}><div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '6px', textTransform: 'uppercase' }}>Content Niche</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                              {['Fashion','Beauty','Tech','Finance','Fitness','Food','Travel','Gaming','Education','Lifestyle','Business','Health','Sports','Music','Art'].map(n => (
                                <span key={n} style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '11px', background: C.bg, border: `1px solid ${C.border}`, color: C.textSecondary, cursor: 'pointer' }}>{n}</span>
                              ))}
                            </div>
                          </div>
                          <div style={{ marginBottom: '10px' }}><div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '6px', textTransform: 'uppercase' }}>Content Format</div>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                              {['Video','Photo','Text','Podcast','Live'].map(f => (
                                <span key={f} style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', background: C.bg, border: `1px solid ${C.border}`, color: C.textSecondary, cursor: 'pointer' }}>{f}</span>
                              ))}
                            </div>
                          </div>
                          <div><div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>Posting Frequency</div><input placeholder="e.g. 3x/week" style={{ width: '100%', padding: '7px 9px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '7px', color: C.text, fontSize: '12px', boxSizing: 'border-box' as const }} /></div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Audience */}
                {(() => {
                  const open = creatorSettingsOpen === 'audience';
                  return (
                    <div style={{ marginBottom: '16px' }}>
                      <button onClick={() => setCreatorSettingsOpen(open ? null : 'audience')} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: open ? '10px 10px 0 0' : '10px', padding: '12px 14px', cursor: 'pointer', color: C.text }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: C.textMuted }}>Your Audience</span>
                        <span style={{ fontSize: '14px', color: C.textMuted }}>{open ? '▲' : '▼'}</span>
                      </button>
                      {open && (
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '14px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <div><div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>Age Range</div>
                              <select style={{ width: '100%', padding: '7px 9px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '7px', color: C.text, fontSize: '12px', boxSizing: 'border-box' as const }}>
                                {['Select...','13-17','18-24','25-34','35-44','45-54','55+'].map(a => <option key={a}>{a}</option>)}
                              </select>
                            </div>
                            <div><div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>Primary Location</div><input placeholder="USA" style={{ width: '100%', padding: '7px 9px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '7px', color: C.text, fontSize: '12px', boxSizing: 'border-box' as const }} /></div>
                          </div>
                          <div><div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>Primary Platform</div><input placeholder="Instagram" style={{ width: '100%', padding: '7px 9px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '7px', color: C.text, fontSize: '12px', boxSizing: 'border-box' as const }} /></div>
                          <div style={{ marginTop: '10px' }}><div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '6px', textTransform: 'uppercase' }}>Audience Language</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                              {['English','Spanish','French','Hindi','Portuguese','Arabic','Mandarin','German','Japanese','Korean'].map(l => (
                                <span key={l} style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '11px', background: C.bg, border: `1px solid ${C.border}`, color: C.textSecondary, cursor: 'pointer' }}>{l}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Deal Preferences */}
                {(() => {
                  const open = creatorSettingsOpen === 'deals';
                  return (
                    <div style={{ marginBottom: '16px' }}>
                      <button onClick={() => setCreatorSettingsOpen(open ? null : 'deals')} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: open ? '10px 10px 0 0' : '10px', padding: '12px 14px', cursor: 'pointer', color: C.text }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: C.textMuted }}>Deal Preferences</span>
                        <span style={{ fontSize: '14px', color: C.textMuted }}>{open ? '▲' : '▼'}</span>
                      </button>
                      {open && (
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '14px' }}>
                          <div style={{ marginBottom: '10px' }}><div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '6px', textTransform: 'uppercase' }}>Deal Type (select all that apply)</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                              {['Paid','Gifted Product','Equity','Barter','Revenue Share','Ambassador','Licensing'].map(d => (
                                <span key={d} style={{ padding: '4px 10px', borderRadius: '10px', fontSize: '11px', background: C.bg, border: `1px solid ${C.border}`, color: C.textSecondary, cursor: 'pointer' }}>{d}</span>
                              ))}
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <div><div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>Min Deal (USD)</div><input type="number" placeholder="500" style={{ width: '100%', padding: '7px 9px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '7px', color: C.text, fontSize: '12px', boxSizing: 'border-box' as const }} /></div>
                            <div><div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>Response Time (hrs)</div><input type="number" placeholder="24" style={{ width: '100%', padding: '7px 9px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '7px', color: C.text, fontSize: '12px', boxSizing: 'border-box' as const }} /></div>
                          </div>
                          {[['Open to exclusivity','excl'],['Willing to sign NDA','nda'],['Grant usage rights','rights'],['On-camera willing','cam']].map(([lbl]) => (
                            <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderTop: `1px solid ${C.border}` }}>
                              <span style={{ fontSize: '12px', color: C.text }}>{lbl}</span>
                              <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: C.border, position: 'relative', cursor: 'pointer' }}><div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: '2px' }} /></div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ── INBOX & SAFETY ─────────────────────────── */}
                <div style={{ marginBottom: '16px' }}>
                  <button onClick={() => setCreatorShowSafetySettings(p => !p)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.card, border: `1px solid ${creatorDealOnlyMode ? C.primary : C.border}`, borderRadius: creatorShowSafetySettings ? '10px 10px 0 0' : '10px', padding: '12px 14px', cursor: 'pointer', color: C.text }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={creatorDealOnlyMode ? C.primary : C.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: creatorDealOnlyMode ? C.primary : C.textMuted }}>Inbox & Safety</span>
                      {creatorDealOnlyMode && <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff', background: C.primary, padding: '1px 6px', borderRadius: '8px' }}>DEAL-ONLY ON</span>}
                    </div>
                    <span style={{ fontSize: '14px', color: C.textMuted }}>{creatorShowSafetySettings ? '▲' : '▼'}</span>
                  </button>
                  {creatorShowSafetySettings && (
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '14px' }}>

                      {/* Deal-Only Mode — primary toggle */}
                      <div style={{ padding: '12px', background: creatorDealOnlyMode ? 'rgba(0,102,204,0.07)' : C.bg, border: `1px solid ${creatorDealOnlyMode ? C.primary : C.border}`, borderRadius: '8px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>Deal-Only Mode</div>
                          <div style={{ fontSize: '11px', color: C.textSecondary, marginTop: '2px', lineHeight: 1.4 }}>
                            Only structured brand proposals reach you. Free-text messages are blocked entirely. Brands must fill a campaign brief to contact you.
                          </div>
                        </div>
                        <button onClick={() => setCreatorDealOnlyMode(p => !p)}
                          style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', backgroundColor: creatorDealOnlyMode ? C.primary : 'rgba(255,255,255,0.15)', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background-color 0.2s' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: '2px', left: creatorDealOnlyMode ? '22px' : '2px', transition: 'left 0.2s' }} />
                        </button>
                      </div>

                      {/* Filter by brand niche */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '6px', textTransform: 'uppercase' }}>Only accept proposals from these brand niches</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {['Tech', 'Fashion', 'Finance', 'Health', 'Food', 'Gaming', 'Travel', 'Beauty', 'Fitness', 'Education'].map(n => {
                            const active = creatorAllowedNiches.includes(n);
                            return (
                              <button key={n} onClick={() => setCreatorAllowedNiches(prev => active ? prev.filter(x => x !== n) : [...prev, n])}
                                style={{ padding: '3px 9px', borderRadius: '12px', fontSize: '11px', cursor: 'pointer', fontWeight: 600,
                                  background: active ? `${C.primary}20` : C.bg,
                                  color: active ? C.primary : C.textSecondary,
                                  border: `1px solid ${active ? C.primary : C.border}`,
                                }}>{n}</button>
                            );
                          })}
                        </div>
                        {creatorAllowedNiches.length === 0 && (
                          <div style={{ fontSize: '10px', color: C.textMuted, marginTop: '4px' }}>None selected = all niches allowed</div>
                        )}
                      </div>

                      {/* Blocked brands */}
                      <div style={{ marginBottom: '4px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '6px', textTransform: 'uppercase' }}>Blocked Brands</div>
                        {creatorBlockedBrands.length === 0 ? (
                          <div style={{ fontSize: '11px', color: C.textMuted, padding: '8px', background: C.bg, borderRadius: '7px', textAlign: 'center' }}>No brands blocked</div>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                            {creatorBlockedBrands.map(b => (
                              <span key={b} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                                {b}
                                <button onClick={() => setCreatorBlockedBrands(prev => prev.filter(x => x !== b))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', padding: 0, lineHeight: 1 }}>×</button>
                              </span>
                            ))}
                          </div>
                        )}
                        <button onClick={() => { const name = prompt('Block brand name:'); if (name?.trim()) setCreatorBlockedBrands(prev => [...prev, name.trim()]); }}
                          style={{ marginTop: '6px', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: 'transparent', border: `1px solid ${C.border}`, color: C.textSecondary, cursor: 'pointer' }}>
                          + Block a brand
                        </button>
                      </div>

                      {/* Info bar */}
                      <div style={{ marginTop: '12px', padding: '9px 11px', background: 'rgba(0,102,204,0.05)', borderRadius: '7px', fontSize: '10px', color: C.textSecondary, lineHeight: 1.6 }}>
                        Platform-level limits set by Meta also apply and cannot be turned off by you. These are your <em>personal</em> controls on top.
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ padding: '14px', background: 'rgba(0,102,204,0.06)', borderRadius: '10px', textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ fontSize: '11px', color: C.textSecondary, lineHeight: 1.5 }}>
                    Settings are synced to your profile and marketplace presence. Changes take effect immediately.
                  </div>
                </div>

                {/* Profile Completeness */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Profile Completeness
                  </div>
                  {(() => {
                    const hasAvatar = true;
                    const hasBio = true;
                    const hasValueSkin = Object.values(valueSkins).some(Boolean);
                    const hasPriceBand = Boolean(creatorPriceBand);
                    const hasCredential = false;
                    const hasTestimonial = false;
                    const hasBarterPref = true;
                    const hasEnergy = Boolean(creatorEnergy);
                    const score =
                      (hasAvatar ? 15 : 0) + (hasBio ? 15 : 0) + (hasValueSkin ? 20 : 0) +
                      (hasPriceBand ? 10 : 0) + (hasCredential ? 15 : 0) + (hasTestimonial ? 15 : 0) +
                      (hasBarterPref ? 5 : 0) + (hasEnergy ? 5 : 0);
                    const tier = score >= 90 ? 'Elite' : score >= 70 ? 'Established' : score >= 40 ? 'Developing' : 'Incomplete';
                    const tierColor = score >= 90 ? '#f59e0b' : score >= 70 ? '#22c55e' : score >= 40 ? C.primary : '#ef4444';
                    const items = [
                      { label: 'Avatar', done: hasAvatar, pts: 15 },
                      { label: 'Bio', done: hasBio, pts: 15 },
                      { label: 'ValueSkin', done: hasValueSkin, pts: 20 },
                      { label: 'Price Band', done: hasPriceBand, pts: 10 },
                      { label: 'Credential', done: hasCredential, pts: 15 },
                      { label: 'Testimonial', done: hasTestimonial, pts: 15 },
                      { label: 'Barter Pref', done: hasBarterPref, pts: 5 },
                      { label: 'Availability', done: hasEnergy, pts: 5 },
                    ];
                    return (
                      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: tierColor }}>{score}<span style={{ fontSize: '13px', fontWeight: 600, color: C.textSecondary }}>/100</span></div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: tierColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tier}</div>
                          </div>
                          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: `conic-gradient(${tierColor} ${score * 3.6}deg, ${C.border} 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: tierColor }}>{score}</div>
                          </div>
                        </div>
                        <div style={{ height: '4px', background: C.border, borderRadius: '2px', overflow: 'hidden', marginBottom: '14px' }}>
                          <div style={{ height: '100%', width: `${score}%`, background: tierColor, borderRadius: '2px', transition: 'width 0.4s' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                          {items.map(({ label, done, pts }) => (
                            <div key={label} style={{ padding: '6px 4px', background: done ? 'rgba(34,197,94,0.08)' : C.surfaceAlt, borderRadius: '6px', textAlign: 'center', border: `1px solid ${done ? 'rgba(34,197,94,0.25)' : C.border}` }}>
                              <div style={{ fontSize: '14px', marginBottom: '2px' }}>{done ? '✓' : '○'}</div>
                              <div style={{ fontSize: '9px', fontWeight: 600, color: done ? '#22c55e' : C.textMuted, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</div>
                              <div style={{ fontSize: '9px', color: C.textMuted }}>+{pts}pt</div>
                            </div>
                          ))}
                        </div>
                        {!hasCredential && (
                          <div style={{ marginTop: '10px', padding: '8px 10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', fontSize: '11px', color: '#f59e0b' }}>
                            Next: Link a credential (GitHub/LinkedIn) to earn +15 pts
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* GDPR Data Controls */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Privacy & Data Controls
                  </div>
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                    {[
                      { label: 'Download My Data', sub: 'Export all your data in JSON format', action: () => alert('Data export initiated — you will receive an email with download link within 24 hours'), color: C.primary, icon: '⬇' },
                      { label: 'Request Data Deletion', sub: 'Permanently erase your account (GDPR Art. 17) — 30 day process', action: () => alert('Data deletion request submitted.\n\nYour account will be anonymized within 30 days as required by GDPR.\nYou can cancel this request within 24 hours.'), color: '#ef4444', icon: '🗑' },
                    ].map(({ label, sub, action, color, icon }, i) => (
                      <div
                        key={label}
                        onClick={action}
                        style={{
                          padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                          borderBottom: i === 0 ? `1px solid ${C.border}` : 'none',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <span style={{ fontSize: '16px' }}>{icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color }}>{label}</div>
                          <div style={{ fontSize: '11px', color: C.textSecondary, marginTop: '1px' }}>{sub}</div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── MODALS ──────────────────────────────────────────── */}

      {showLevelModal && (
        <Modal onClose={() => setShowLevelModal(false)}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', color: C.text }}>What Determines Your Level?</h2>
          <p style={{ color: C.textSecondary, marginBottom: '20px', fontSize: '14px' }}>Your Valueskins Level is based on multiple factors:</p>
          {Object.entries(levels).map(([level, data]) => (
            <div key={level} style={{ background: C.surfaceAlt, padding: '16px', borderRadius: '12px', marginBottom: '12px', borderLeft: parseInt(level) === currentLevel ? `4px solid ${C.primary}` : '4px solid transparent' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '15px', color: C.text }}>Level {level}: {data.name}</div>
              <div style={{ fontSize: '13px', color: C.textSecondary, lineHeight: '1.6' }}>Followers: {data.followers.toLocaleString()} | Engagement: {data.engagement}% | Deal Value: ${data.dealValue.toLocaleString()}</div>
            </div>
          ))}
        </Modal>
      )}

      {showMetricsModal && (
        <Modal onClose={() => setShowMetricsModal(false)}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', color: C.text }}>Edit Your Metrics</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <MetricInput label="Followers" value={metrics.followers} onChange={(v) => updateMetric('followers', v)} />
            <MetricInput label="Engagement Rate (%)" value={metrics.engagement} onChange={(v) => updateMetric('engagement', v)} />
            <MetricInput label="Deals Completed" value={metrics.dealsCompleted} onChange={(v) => updateMetric('dealsCompleted', v)} />
            <MetricInput label="Average Deal Value ($)" value={metrics.avgDealValue} onChange={(v) => updateMetric('avgDealValue', v)} />
            <MetricInput label="On-Time Rate (%)" value={metrics.onTimeRate} onChange={(v) => updateMetric('onTimeRate', v)} />
            <MetricInput label="Brand Rating" value={metrics.brandRating} onChange={(v) => updateMetric('brandRating', v)} />
          </div>
          <div style={{ background: C.primary, borderRadius: '12px', padding: '16px', marginTop: '20px', textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Current Level</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>LEVEL {currentLevel}</div>
          </div>
        </Modal>
      )}

      {showReputationModal && (() => {
        const totalMax = factors.reduce((sum, f) => sum + f.maxPoints, 0);
        const score = 847;
        const pct = Math.round((score / totalMax) * 100);
        // Simulated per-factor scores
        const factorScores: Record<string, number> = {
          'Content Consistency': 82,
          'Audience Engagement': 91,
          'Brand Partnerships': 78,
          'On-time Delivery': 99,
          'Community Trust': 85,
          'Profile Completeness': 95,
        };
        return (
          <Modal onClose={() => setShowReputationModal(false)}>
            {/* Score header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Reputation Score</div>
              <div style={{ fontSize: '42px', fontWeight: 800, color: C.primary, lineHeight: 1 }}>{score}</div>
              <div style={{ fontSize: '13px', color: C.textSecondary, marginTop: '4px' }}>out of {totalMax} possible points</div>
              <div style={{ height: '6px', background: C.border, borderRadius: '3px', overflow: 'hidden', margin: '14px 0 0' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: C.primary, borderRadius: '3px', transition: 'width 0.3s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: C.textMuted, marginTop: '4px', fontWeight: 600 }}>
                <span>0</span>
                <span style={{ color: pct >= 80 ? '#2E7D32' : C.textSecondary }}>Top {100 - pct + 3}% of creators</span>
                <span>{totalMax}</span>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
              {[
                { label: 'Level', value: `${currentLevel}`, sub: 'of 5' },
                { label: 'Deals', value: `${metrics.dealsCompleted}`, sub: 'completed' },
                { label: 'Avg Deal', value: `$${Math.round(metrics.avgDealValue / 1000)}k`, sub: 'per deal' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '12px 8px', background: C.surfaceAlt, borderRadius: '10px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: C.text, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '10px', color: C.textMuted, marginTop: '4px' }}>{s.sub}</div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Factor breakdown */}
            <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>Score Breakdown</div>
            {factors.map((factor) => {
              const earned = factorScores[factor.name] ?? Math.round(factor.maxPoints * 0.8);
              const fillPct = Math.round((earned / factor.maxPoints) * 100);
              return (
                <div key={factor.name} style={{ background: C.surfaceAlt, padding: '14px', borderRadius: '10px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: C.text }}>{factor.name}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: fillPct >= 90 ? '#2E7D32' : fillPct >= 70 ? C.primary : '#E65100' }}>{earned}</span>
                      <span style={{ fontSize: '11px', color: C.textMuted }}>/{factor.maxPoints}</span>
                    </div>
                  </div>
                  <div style={{ height: '4px', background: C.border, borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${fillPct}%`, background: fillPct >= 90 ? '#2E7D32' : fillPct >= 70 ? C.primary : '#E65100', borderRadius: '2px', transition: 'width 0.3s' }} />
                  </div>
                </div>
              );
            })}

            {/* Footer */}
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(0,102,204,0.06)', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: C.textSecondary, lineHeight: 1.5 }}>
                Scores are computed from verified engagement data, transaction history, and peer attestations. Updated every 24 hours.
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* Store Modal — shows only the selected category's professions */}
      {showStoreModal && assigningSlot && storeCategory && (PROFESSIONS as Record<string, typeof PROFESSIONS[keyof typeof PROFESSIONS]>)[storeCategory] && (
        <Modal onClose={() => { setShowStoreModal(false); setStoreCategory(null); }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: C.text, margin: 0 }}>{storeCategory}</h2>
            <span style={{ fontSize: '11px', fontWeight: 700, color: SLOT_COLORS[assigningSlot], background: `${SLOT_COLORS[assigningSlot]}20`, padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              {SLOT_LABELS[assigningSlot]}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: C.textSecondary, marginBottom: '16px' }}>
            Tap any badge to purchase ($10) and instantly apply it to your {SLOT_LABELS[assigningSlot].toLowerCase()} slot.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {(PROFESSIONS as Record<string, typeof PROFESSIONS[keyof typeof PROFESSIONS]>)[storeCategory].subProfessions.map((sub) => {
              const defined = PROFESSION_BADGES[sub];
              const abbr = defined?.abbreviation ?? sub.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 3);
              const badgeColor = defined?.color ?? SLOT_COLORS[assigningSlot];
              const isActiveHere = valueSkins[assigningSlot]?.profession === sub;
              const isUsedElsewhere = !isActiveHere && assignedProfessions.has(sub);
              return (
                <button
                  key={sub}
                  onClick={() => !isUsedElsewhere && purchaseProfession(sub)}
                  disabled={isUsedElsewhere}
                  style={{
                    background: isActiveHere ? 'rgba(0,102,204,0.15)' : C.card,
                    border: `1px solid ${isActiveHere ? C.primary : C.border}`,
                    borderRadius: '8px', color: isUsedElsewhere ? C.textMuted : C.text,
                    padding: '10px 12px', fontSize: '13px',
                    cursor: isUsedElsewhere ? 'default' : 'pointer',
                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '8px',
                    opacity: isUsedElsewhere ? 0.45 : 1,
                  }}
                  onMouseEnter={(e) => { if (!isUsedElsewhere && !isActiveHere) e.currentTarget.style.borderColor = C.primary; }}
                  onMouseLeave={(e) => { if (!isActiveHere) e.currentTarget.style.borderColor = C.border; }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '5px', background: badgeColor, color: '#fff', fontSize: '8px', fontWeight: 700, flexShrink: 0 }}>
                    {abbr}
                  </span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{sub}</span>
                  {isActiveHere && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {isUsedElsewhere && (
                    <span style={{ fontSize: '10px', color: C.textMuted }}>used</span>
                  )}
                </button>
              );
            })}
          </div>
        </Modal>
      )}

      {/* Brand Store Modal */}
      {showBrandStoreModal && brandStoreCategory && BRAND_CATEGORIES[brandStoreCategory] && (
        <Modal onClose={() => { setShowBrandStoreModal(false); setBrandStoreCategory(null); }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: C.text, margin: 0 }}>{brandStoreCategory}</h2>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#E65100', background: 'rgba(230,81,0,0.1)', padding: '3px 8px', borderRadius: '6px' }}>Brand</span>
          </div>
          <p style={{ fontSize: '13px', color: C.textSecondary, marginBottom: '16px' }}>
            Tap to purchase ($10) and set as your brand identity.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {BRAND_CATEGORIES[brandStoreCategory].subCategories.map((sub) => {
              const isActive = brandValueSkin === sub;
              return (
                <button
                  key={sub}
                  onClick={() => {
                    setBrandValueSkin(sub);
                    setShowBrandStoreModal(false);
                    setBrandStoreCategory(null);
                    setPurchaseToast(`${sub} set as your brand identity`);
                    setTimeout(() => setPurchaseToast(null), 3000);
                  }}
                  style={{
                    background: isActive ? 'rgba(230,81,0,0.12)' : C.card,
                    border: `1px solid ${isActive ? '#E65100' : C.border}`,
                    borderRadius: '8px', color: C.text, padding: '10px 12px', fontSize: '13px',
                    cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = '#E65100'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = C.border; }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '5px', background: '#E65100', color: '#fff', fontSize: '8px', fontWeight: 700, flexShrink: 0 }}>
                    {sub.slice(0, 3).toUpperCase()}
                  </span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{sub}</span>
                  {isActive && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </Modal>
      )}

      {/* ValueSkin Management Modal */}
      {showSkinManageModal && (
        <SkinManagementModal
          slot={showSkinManageModal}
          onClose={() => setShowSkinManageModal(null)}
          valueSkins={valueSkins}
          hiddenSkins={hiddenSkins}
          onHide={(slot) => {
            setHiddenSkins(prev => new Set([...prev, slot]));
            setPurchaseToast(`🙈 ${SLOT_LABELS[slot]} ValueSkin hidden from marketplace`);
            setTimeout(() => setPurchaseToast(null), 3000);
          }}
          onUnhide={(slot) => {
            setHiddenSkins(prev => {
              const next = new Set(prev);
              next.delete(slot);
              return next;
            });
            setPurchaseToast(`👁️ ${SLOT_LABELS[slot]} ValueSkin restored to marketplace`);
            setTimeout(() => setPurchaseToast(null), 3000);
          }}
          onDelete={(slot) => {
            setValueSkins(prev => {
              const next = { ...prev };
              delete next[slot];
              return next;
            });
            setHiddenSkins(prev => {
              const next = new Set(prev);
              next.delete(slot);
              return next;
            });
            setPurchaseToast(`🗑️ ${SLOT_LABELS[slot]} ValueSkin permanently deleted`);
            setTimeout(() => setPurchaseToast(null), 3000);
          }}
        />
      )}
    </div>
  );
}

function NavItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ background: active ? 'rgba(0,102,204,0.1)' : 'transparent', border: 'none', borderRadius: '8px', padding: '10px 16px', color: active ? C.primary : C.textSecondary, fontWeight: active ? '600' : '500', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.15s', width: '100%', justifyContent: 'flex-start' }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = C.text; e.currentTarget.style.background = C.surfaceAlt; } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = C.textSecondary; e.currentTarget.style.background = 'transparent'; } }}
    >
      <span>{label}</span>
    </button>
  );
}

function SkinManagementModal({ slot, onClose, valueSkins, hiddenSkins, onHide, onUnhide, onDelete }: { slot: ValueSkinSlot; onClose: () => void; valueSkins: ValueSkinMap; hiddenSkins: Set<ValueSkinSlot>; onHide: (slot: ValueSkinSlot) => void; onUnhide: (slot: ValueSkinSlot) => void; onDelete: (slot: ValueSkinSlot) => void }) {
  const skin = valueSkins[slot];
  if (!skin) return null;

  const isHidden = hiddenSkins.has(slot);
  const SLOT_LABELS: Record<ValueSkinSlot, string> = { profession: 'Professional', passion: 'Passion', hobby: 'Hobby' };
  const SLOT_COLORS: Record<ValueSkinSlot, string> = { profession: '#0066CC', passion: '#880E4F', hobby: '#37474F' };

  return (
    <Modal onClose={onClose}>
      <div style={{ paddingBottom: '20px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: C.text }}>
          Manage {SLOT_LABELS[slot]} ValueSkin
        </div>

        {/* Current skin info */}
        <div style={{ background: C.surfaceAlt, borderRadius: '10px', padding: '14px', marginBottom: '20px', border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: SLOT_COLORS[slot], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
              {SLOT_LABELS[slot].substring(0, 3).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>{skin.profession}</div>
              <div style={{ fontSize: '11px', color: C.textMuted }}>{isHidden ? '🙈 Hidden' : '👁️ Visible'}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Hide/Unhide button */}
          <button
            onClick={() => { isHidden ? onUnhide(slot) : onHide(slot); onClose(); }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: `1px solid ${C.border}`,
              background: C.bg,
              color: C.text,
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {isHidden ? '👁️ Restore visibility' : '🙈 Hide temporarily'}
            <span style={{ fontSize: '12px', color: C.textMuted }}>
              {isHidden ? '(Appears in profile)' : '(Hidden from discovery)'}
            </span>
          </button>

          {/* Delete button */}
          <button
            onClick={() => {
              if (window.confirm('⚠️ Permanently delete this ValueSkin? This cannot be undone and no refund will be issued.')) {
                onDelete(slot);
                onClose();
              }
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #D32F2F',
              background: 'rgba(211, 47, 47, 0.08)',
              color: '#D32F2F',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            🗑️ Delete permanently
            <span style={{ fontSize: '12px', color: 'rgba(211, 47, 47, 0.7)' }}>(No refund)</span>
          </button>

          {/* Info */}
          <div style={{ fontSize: '11px', color: C.textMuted, padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', lineHeight: 1.5 }}>
            <strong>Hide:</strong> Temporarily remove from marketplace/communities (reversible)<br />
            <strong>Delete:</strong> Permanently remove (irreversible, no refund)
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: C.surface, borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto', position: 'relative', border: `1px solid ${C.border}` }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: C.textMuted, fontSize: '24px', cursor: 'pointer', lineHeight: 1 }}>×</button>
        {children}
      </div>
    </div>
  );
}

function MetricInput({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '13px', fontWeight: '600', color: C.text }}>{label}</label>
      <input
        type="text" value={value.toLocaleString()}
        onChange={(e) => onChange(e.target.value.replace(/,/g, ''))}
        style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, padding: '10px 12px', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }}
        onFocus={(e) => { e.currentTarget.style.borderColor = C.primary; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }}
      />
    </div>
  );
}

function calculateLevel(metrics: any, levels: any): number {
  for (let level = 5; level >= 1; level--) {
    const t = levels[level];
    if (metrics.followers >= t.followers && metrics.engagement >= t.engagement && metrics.avgDealValue >= t.dealValue) return level;
  }
  return 1;
}
