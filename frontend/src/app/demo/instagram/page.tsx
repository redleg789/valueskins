'use client';

import { useState, useEffect } from 'react';
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
    dealCompletionRate: 97, incomeTier: '50k+', isFirstDeal: false,
    rateCard: { reel: '$4,500', story: '$1,200', post: '$2,800' },
    exclusivitySlotFree: true, revisionLimit: 2, usageRightsDays: 90,
    availableFrom: 'Now', contractMode: 'both',
    portfolio: ['TechFlow collab — 2.1M views', 'CloudBase integration — 890K views'],
  },
  {
    name: 'Priya Sharma', handle: '@priya_designs', valueSkin: 'UX/UI Designer',
    followers: '1.2M', engagement: '5.8%', rate: '$6,000', matchScore: '91%',
    featured: false, willingToBarter: false,
    timezone: 'UTC+5:30 (IST)', responseTimeHrs: 12, minDealUsd: 4000,
    audienceAgeRange: '18-24', audienceLocation: 'India', audienceLang: 'English',
    dealTypes: ['Paid', 'Revenue Share'], openToDeals: true,
    ndaOk: true, usageRightsOk: false,
    dealCompletionRate: 91, incomeTier: '100k+', isFirstDeal: false,
    rateCard: { reel: '$6,000', story: '$1,800', post: '$4,000' },
    exclusivitySlotFree: false, revisionLimit: 3, usageRightsDays: 60,
    availableFrom: 'Mar 15', contractMode: 'long-term',
    portfolio: ['Figma design showcase — 3.4M views', 'Framer landing page — 1.2M views'],
  },
  {
    name: 'Marcus Chen', handle: '@marcus_fitness', valueSkin: 'Fitness Coach',
    followers: '650K', engagement: '8.1%', rate: '$3,200', matchScore: '84%',
    featured: false, willingToBarter: true,
    timezone: 'UTC-8 (PST)', responseTimeHrs: 24, minDealUsd: 500,
    audienceAgeRange: '18-24', audienceLocation: 'USA', audienceLang: 'English',
    dealTypes: ['Paid', 'Gifted Product', 'Barter', 'Ambassador'], openToDeals: true,
    ndaOk: false, usageRightsOk: true,
    dealCompletionRate: 88, incomeTier: '10k+', isFirstDeal: false,
    rateCard: { reel: '$3,200', story: '$800', post: '$1,800' },
    exclusivitySlotFree: true, revisionLimit: 2, usageRightsDays: 30,
    availableFrom: 'Now', contractMode: 'one-off',
    portfolio: ['Nike Training series — 4.1M views', 'MyProtein review — 980K views'],
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
    acceptedLevels: [1, 2, 3, 4, 5] as number[],
    memberCount: 2847, postCount: 1203,
    posts: [
      { id: 0, author: 'Alex R.', handle: '@alex_codes', profession: 'Software Engineer', content: 'Hot take: Rust > Go for anything that matters. Fight me.', likes: 312, pinned: false, announcement: false, time: '2h' },
      { id: 1, author: 'Priya S.', handle: '@priya_builds', profession: 'DevOps Engineer', content: '[Pinned] Monthly hiring board is live — drop your referral links below.', likes: 89, pinned: true, announcement: true, time: '1d' },
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
    acceptedLevels: [3, 4, 5] as number[],
    memberCount: 612, postCount: 389,
    posts: [
      { id: 3, author: 'Dr. Chen', handle: '@drchen', profession: 'Surgeon', content: 'Interesting presentation today — 34F with atypical chest pain. What would your differential be?', likes: 56, pinned: false, announcement: false, time: '3h' },
      { id: 4, author: 'Admin', handle: '@md_lounge', profession: 'Doctor', content: '[Pinned] CME webinar this Friday at 6PM EST. Register in the link below.', likes: 128, pinned: true, announcement: true, time: '2d' },
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
    acceptedLevels: [1, 2, 3, 4, 5] as number[],
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
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  // 3-slot ValueSkin state — persisted to localStorage
  const [valueSkins, setValueSkins] = useState<ValueSkinMap>({});
  const [skinsLoaded, setSkinsLoaded] = useState(false);

  // Restore valueSkins from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('vs_demo_value_skins');
      if (stored) setValueSkins(JSON.parse(stored));
    } catch (e) { /* ignore corrupted data */ }
    setSkinsLoaded(true);
  }, []);

  // Persist valueSkins to localStorage — only after initial load
  useEffect(() => {
    if (!skinsLoaded) return;
    try {
      localStorage.setItem('vs_demo_value_skins', JSON.stringify(valueSkins));
    } catch (e) { /* quota exceeded — safe to ignore */ }
  }, [valueSkins, skinsLoaded]);

  // Which slot is being assigned in the Store modal
  const [assigningSlot, setAssigningSlot] = useState<ValueSkinSlot | null>(null);

  const [valueskinAvatarEnabled, setValueskinAvatarEnabled] = useState(false);
  const [showAvatarSettings, setShowAvatarSettings] = useState(false);
  const [purchaseToast, setPurchaseToast] = useState<string | null>(null);

  // ValueSkin hide/delete management — also persisted
  const [hiddenSkins, setHiddenSkins] = useState<Set<ValueSkinSlot>>(new Set());
  const [hiddenLoaded, setHiddenLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('vs_demo_hidden_skins');
      if (stored) setHiddenSkins(new Set(JSON.parse(stored)));
    } catch (e) { /* ignore */ }
    setHiddenLoaded(true);
  }, []);

  useEffect(() => {
    if (!hiddenLoaded) return;
    try {
      localStorage.setItem('vs_demo_hidden_skins', JSON.stringify([...hiddenSkins]));
    } catch (e) { /* ignore */ }
  }, [hiddenSkins, hiddenLoaded]);
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

  // Brand ValuSkin as marketing — brands can promote products/campaigns via their skin
  const [brandSkinMode, setBrandSkinMode] = useState<'static' | 'promo'>('static');
  const [brandPromoText, setBrandPromoText] = useState('');
  const [brandPromoUrl, setBrandPromoUrl] = useState('');

  // Creator ValuSkin showcase — creators can add a pitch video + text to their skin
  const [creatorSkinMode, setCreatorSkinMode] = useState<'static' | 'showcase'>('static');
  const [creatorPitchText, setCreatorPitchText] = useState('');
  const [creatorPitchVideoUrl, setCreatorPitchVideoUrl] = useState('');
  const [creatorPitchVideoName, setCreatorPitchVideoName] = useState('');
  const [showSkinShowcaseModal, setShowSkinShowcaseModal] = useState<string | null>(null); // skin name when open

  // Which ValueSkin the creator is viewing the marketplace for
  const [selectedMarketplaceSkin, setSelectedMarketplaceSkin] = useState<string | null>(null);

  // Auto-select single skin if only one is owned
  useEffect(() => {
    const ownedProfessions = Object.values(valueSkins)
      .map(entry => entry?.profession)
      .filter(Boolean) as string[];

    if (ownedProfessions.length === 1 && !selectedMarketplaceSkin) {
      setSelectedMarketplaceSkin(ownedProfessions[0]);
    }
  }, [valueSkins, selectedMarketplaceSkin]);

  // Negotiation state — tracks which opportunity/creator has opened negotiation
  const [negotiatingOpp, setNegotiatingOpp] = useState<number | null>(null);
  const [negotiatingCreator, setNegotiatingCreator] = useState<number | null>(null);

  // Per-deal state map: key = `${skin}:${oppIndex}`, preserves progress when switching skins
  type DealRoomPhase = 'brief' | 'offer' | 'counter' | 'chatroom' | 'checklist' | 'accepted' | 'softhold';
  type DealState = {
    phase: DealRoomPhase;
    intent: 'explore' | 'campaign' | 'long-term';
    briefFilled: boolean;
    briefTitle: string;
    offerAmount: string;
    counterAmount: string;
    chatMessages: { id: number; sender: 'me' | 'brand'; text: string; time: string; seen?: boolean }[];
    chatInput: string;
    performanceClause: boolean;
    advancePercent: number;
  };
  const [dealStates, setDealStates] = useState<Record<string, DealState>>({});
  const [dealsLoaded, setDealsLoaded] = useState(false);

  // Restore dealStates from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('vs_demo_deal_states');
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, DealState>;
        setDealStates(parsed);
      }
    } catch (e) { /* ignore corrupted data */ }
    setDealsLoaded(true);
  }, []);

  // Persist dealStates to localStorage — only after initial load
  useEffect(() => {
    if (!dealsLoaded) return;
    try {
      localStorage.setItem('vs_demo_deal_states', JSON.stringify(dealStates));
    } catch (e) { /* ignore */ }
  }, [dealStates, dealsLoaded]);

  // Active deal key derived from current skin + opp
  const activeDealKey = selectedMarketplaceSkin && negotiatingOpp !== null ? `${selectedMarketplaceSkin}:${negotiatingOpp}` : null;
  const getOrCreateDeal = (key: string): DealState => dealStates[key] ?? {
    phase: 'brief', intent: 'campaign', briefFilled: false, briefTitle: '', offerAmount: '', counterAmount: '',
    chatMessages: [{ id: 1, sender: 'brand' as const, text: 'Hey! Excited to work together on this campaign.', time: 'just now', seen: false }],
    chatInput: '', performanceClause: false, advancePercent: 70,
  };
  const activeDeal = activeDealKey ? getOrCreateDeal(activeDealKey) : null;
  const updateDeal = (key: string, patch: Partial<DealState>) => {
    setDealStates(prev => ({ ...prev, [key]: { ...getOrCreateDeal(key), ...prev[key], ...patch } }));
  };

  // Convenience accessors for the active deal (backward compat with existing render code)
  const dealRoomPhase = activeDeal?.phase ?? 'brief';
  const setDealRoomPhase = (p: DealRoomPhase) => { if (activeDealKey) updateDeal(activeDealKey, { phase: p }); };
  const dealIntent = activeDeal?.intent ?? 'campaign';
  const setDealIntent = (i: 'explore' | 'campaign' | 'long-term') => { if (activeDealKey) updateDeal(activeDealKey, { intent: i }); };
  const dealBriefFilled = activeDeal?.briefFilled ?? false;
  const setDealBriefFilled = (v: boolean) => { if (activeDealKey) updateDeal(activeDealKey, { briefFilled: v }); };
  const dealBriefTitle = activeDeal?.briefTitle ?? '';
  const setDealBriefTitle = (v: string) => { if (activeDealKey) updateDeal(activeDealKey, { briefTitle: v }); };
  const dealOfferAmount = activeDeal?.offerAmount ?? '';
  const setDealOfferAmount = (v: string) => { if (activeDealKey) updateDeal(activeDealKey, { offerAmount: v }); };
  const dealCounterAmount = activeDeal?.counterAmount ?? '';
  const setDealCounterAmount = (v: string) => { if (activeDealKey) updateDeal(activeDealKey, { counterAmount: v }); };
  const chatMessages = activeDeal?.chatMessages ?? [];
  const setChatMessages = (fn: ((prev: DealState['chatMessages']) => DealState['chatMessages']) | DealState['chatMessages']) => {
    if (!activeDealKey) return;
    setDealStates(prev => {
      const deal = { ...getOrCreateDeal(activeDealKey), ...prev[activeDealKey] };
      const newMsgs = typeof fn === 'function' ? fn(deal.chatMessages) : fn;
      return { ...prev, [activeDealKey]: { ...deal, chatMessages: newMsgs } };
    });
  };
  const chatInput = activeDeal?.chatInput ?? '';
  const setChatInput = (v: string) => { if (activeDealKey) updateDeal(activeDealKey, { chatInput: v }); };
  const performanceClause = activeDeal?.performanceClause ?? false;
  const setPerformanceClause = (v: boolean) => { if (activeDealKey) updateDeal(activeDealKey, { performanceClause: v }); };
  const advancePercent = activeDeal?.advancePercent ?? 70;
  const setAdvancePercent = (v: number) => { if (activeDealKey) updateDeal(activeDealKey, { advancePercent: v }); };
  const offerExpiresLabel = '23h 47m';

  // Active deals indicator: count of in-progress deals across all skins
  const activeDeals = Object.entries(dealStates).filter(([, d]) => d.phase !== 'brief');

  // Tooltip state for intent/campaign type badges
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);

  // Energy state (creator)
  const [creatorEnergy, setCreatorEnergy] = useState<'available' | 'limited' | 'burnout' | 'pause'>('available');

  // Deal preference toggles (profile section)
  const [profileDealTypes, setProfileDealTypes] = useState<string[]>(['Paid']);
  const [profileExclusivity, setProfileExclusivity] = useState(false);
  const [profileNda, setProfileNda] = useState(false);
  const [profileUsageRights, setProfileUsageRights] = useState(false);
  const [profileOnCamera, setProfileOnCamera] = useState(true);

  // Not available dates (vacation / break)
  const [notAvailableFrom, setNotAvailableFrom] = useState('');
  const [notAvailableTo, setNotAvailableTo] = useState('');
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
  const [newCommAcceptedLevels, setNewCommAcceptedLevels] = useState<number[]>([1, 2, 3, 4, 5]);
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

  // Rate card
  const [rateCard, setRateCard] = useState({ reel: '4500', story: '1200', post: '2800', podcast: '3500', live: '6000' });
  const [creatorAvailableFrom, setCreatorAvailableFrom] = useState('2026-03-01');
  const [creatorMaxActiveDeals, setCreatorMaxActiveDeals] = useState(3);
  const [contractMode, setContractMode] = useState<'one-off' | 'long-term' | 'both'>('both');
  const [dealCompletionRate] = useState(94);
  const [verifiedIncomeTier] = useState<'starter' | '10k+' | '50k+' | '100k+'>('50k+');
  const [isFirstDealOpen, setIsFirstDealOpen] = useState(false);
  const [showRateCard, setShowRateCard] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [usageRightsDays, setUsageRightsDays] = useState(90);
  const [exclusivityUntil, setExclusivityUntil] = useState('');
  const [revisionLimit, setRevisionLimit] = useState(2);
  const [savedDealTemplates, setSavedDealTemplates] = useState([
    { id: 1, name: 'Q2 Standard Review', type: 'Product Review', deliverables: '2x Reels, 3x Stories', budget: '4000' },
  ]);
  const [savedSearches, setSavedSearches] = useState([
    { id: 1, label: 'Fitness Coach, 18-24, USA', profession: 'Fitness Coach', age: '18-24', loc: 'USA' },
  ]);
  // Admin feature flags
  const [adminShowRateCard, setAdminShowRateCard] = useState(true);
  const [adminShowPortfolio, setAdminShowPortfolio] = useState(true);
  const [adminShowDealCompletion, setAdminShowDealCompletion] = useState(true);
  const [adminShowIncomeTier, setAdminShowIncomeTier] = useState(true);
  const [adminShowFirstDealBadge, setAdminShowFirstDealBadge] = useState(true);
  const [adminShowExclusivitySignal, setAdminShowExclusivitySignal] = useState(true);
  const [adminShowRevisionLimit, setAdminShowRevisionLimit] = useState(true);
  const [adminShowUsageRightsDuration, setAdminShowUsageRightsDuration] = useState(true);
  const [adminShowAvailabilityCalendar, setAdminShowAvailabilityCalendar] = useState(true);
  const [adminShowSavedSearches, setAdminShowSavedSearches] = useState(true);
  const [adminShowDealTemplates, setAdminShowDealTemplates] = useState(true);
  const [adminShowSimilarCreators, setAdminShowSimilarCreators] = useState(true);
  const [adminShowBrandTrackRecord, setAdminShowBrandTrackRecord] = useState(true);
  const [adminShowMutualRating, setAdminShowMutualRating] = useState(true);
  const [adminAllowLongTermContracts, setAdminAllowLongTermContracts] = useState(true);
  const [adminSavedFeaturesTab, setAdminSavedFeaturesTab] = useState(false);

  // Campaign type — shared across tabs via localStorage
  type Campaign = {
    id: number;
    brandProfession: string;
    title: string;
    description: string;
    requiredProfessions: string[];
    minLevel: number;
    maxLevel: number;
    budget: string;
    deadline: string;
    location: string;
    nonNegotiables: string[];
    deliverables: string;
    status: 'open' | 'closed' | 'expired';
    applicants: number;
  };

  // Application type — shared across tabs via localStorage
  type SharedApplication = {
    id: number;
    campaignId: number;
    campaignTitle: string;
    creatorProfession: string;
    creatorHandle: string;
    status: 'pending' | 'accepted' | 'rejected';
    appliedAt: string;
  };

  const STORAGE_KEY_CAMPAIGNS = 'vs_demo_campaigns';
  const STORAGE_KEY_APPLICATIONS = 'vs_demo_applications';
  const BC_NAME = 'vs_demo_sync';

  const defaultCampaigns: Campaign[] = [
    { id:1, brandProfession:'Software Engineer', title:'React Expert for SaaS Launch', description:'We need an authentic Software Engineer to demo our dev tool to a tech audience. 2x Reels.', requiredProfessions:['Software Engineer','Data Scientist'], minLevel:2, maxLevel:5, budget:'5000', deadline:'2026-03-15', location:'USA', nonNegotiables:['NDA required','Usage rights: 90 days'], deliverables:'2x Instagram Reels', status:'expired', applicants:3 },
    { id:2, brandProfession:'UX/UI Designer', title:'Mobile App Design Review', description:'UI/UX designer to review and showcase our new mobile app. 1x Reel, 3x Stories.', requiredProfessions:['UX/UI Designer','Product Manager'], minLevel:1, maxLevel:5, budget:'4500', deadline:'2026-03-20', location:'Remote', nonNegotiables:['Exclusivity: 30 days'], deliverables:'1x Reel, 3x Stories', status:'open', applicants:1 },
    { id:3, brandProfession:'Fitness Coach', title:'Spring Fitness Challenge', description:'Fitness coach to lead a 7-day challenge campaign. 3x Reels.', requiredProfessions:['Fitness Coach','Nutritionist'], minLevel:1, maxLevel:3, budget:'3800', deadline:'2026-04-01', location:'Remote', nonNegotiables:[], deliverables:'3x Instagram Reels', status:'open', applicants:2 },
  ];

  const loadCampaigns = (): Campaign[] => {
    if (typeof window === 'undefined') return defaultCampaigns;
    try { const s = localStorage.getItem(STORAGE_KEY_CAMPAIGNS); return s ? JSON.parse(s) : defaultCampaigns; } catch { return defaultCampaigns; }
  };
  const loadApplications = (): SharedApplication[] => {
    if (typeof window === 'undefined') return [];
    try { const s = localStorage.getItem(STORAGE_KEY_APPLICATIONS); return s ? JSON.parse(s) : []; } catch { return []; }
  };

  const [marketplaceTab, setMarketplaceTab] = useState<'creators' | 'campaigns' | 'applications'>('creators');
  const [campaigns, setCampaigns] = useState<Campaign[]>(defaultCampaigns);
  const [sharedApplications, setSharedApplications] = useState<SharedApplication[]>([]);
  const [showCampaignCreator, setShowCampaignCreator] = useState(false);
  const [newCampaignTitle, setNewCampaignTitle] = useState('');
  const [newCampaignDesc, setNewCampaignDesc] = useState('');
  const [newCampaignBudget, setNewCampaignBudget] = useState('');
  const [newCampaignDeadline, setNewCampaignDeadline] = useState('');
  const [newCampaignProfessions, setNewCampaignProfessions] = useState<string[]>([]);
  const [newCampaignMinLevel, setNewCampaignMinLevel] = useState(1);
  const [newCampaignMaxLevel, setNewCampaignMaxLevel] = useState(5);
  const [newCampaignLocation, setNewCampaignLocation] = useState('');
  const [newCampaignDeliverables, setNewCampaignDeliverables] = useState('');
  const [newCampaignNonNeg, setNewCampaignNonNeg] = useState<string[]>([]);

  // Sync campaigns + applications across tabs via localStorage + BroadcastChannel
  useEffect(() => {
    setCampaigns(loadCampaigns());
    setSharedApplications(loadApplications());
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(BC_NAME);
      bc.onmessage = () => {
        setCampaigns(loadCampaigns());
        setSharedApplications(loadApplications());
      };
    } catch {}
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_CAMPAIGNS) setCampaigns(loadCampaigns());
      if (e.key === STORAGE_KEY_APPLICATIONS) setSharedApplications(loadApplications());
    };
    window.addEventListener('storage', onStorage);
    return () => { bc?.close(); window.removeEventListener('storage', onStorage); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistCampaigns = (updated: Campaign[]) => {
    localStorage.setItem(STORAGE_KEY_CAMPAIGNS, JSON.stringify(updated));
    setCampaigns(updated);
    try { new BroadcastChannel(BC_NAME).postMessage('sync'); } catch {}
  };
  const persistApplications = (updated: SharedApplication[]) => {
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(updated));
    setSharedApplications(updated);
    try { new BroadcastChannel(BC_NAME).postMessage('sync'); } catch {}
  };

  // Keep legacy myApplications wired to sharedApplications for creator view
  const myApplications = sharedApplications;
  // Gap 4: deal lifecycle
  type CreatorDealLifecycle = 'checklist'|'deliverables'|'submitted'|'approved';
  type BrandApprovalPhase = 'accepted'|'reviewing'|'approved';
  const [creatorDealLifecycle, setCreatorDealLifecycle] = useState<CreatorDealLifecycle>('checklist');
  const [brandApprovalPhase, setBrandApprovalPhase] = useState<BrandApprovalPhase>('accepted');
  const [dealUploadSimulated, setDealUploadSimulated] = useState(false);
  const [completedDeals, setCompletedDeals] = useState<Array<{id:number;brand:string;amount:number;completedAt:string;deliverable:string;}>>([]);
  // Gap 5: level-up
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpFrom, setLevelUpFrom] = useState(1);
  const [levelUpTo, setLevelUpTo] = useState(2);

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

  const handleDealComplete = (earnedAmount: number, brandName: string, deliverable: string) => {
    const updatedMetrics = {
      ...metrics,
      dealsCompleted: metrics.dealsCompleted + 1,
      avgDealValue: Math.round((metrics.avgDealValue * metrics.dealsCompleted + earnedAmount * 100) / (metrics.dealsCompleted + 1)),
    };
    setMetrics(updatedMetrics);
    const newLevel = levelsLoaded ? calculateLevel(updatedMetrics, levels) : currentLevel;
    setCompletedDeals(prev => [...prev, { id: Date.now(), brand: brandName, amount: earnedAmount, completedAt: new Date().toLocaleDateString(), deliverable }]);
    if (newLevel > currentLevel) {
      setLevelUpFrom(currentLevel);
      setLevelUpTo(newLevel);
      setShowLevelUpModal(true);
    } else {
      setPurchaseToast('Deal complete — earnings added to your balance');
      setTimeout(() => setPurchaseToast(null), 3000);
    }
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

  // Opportunities for the currently selected skin — sorted by match % descending
  const activeOpportunities = selectedMarketplaceSkin
    ? (OPPORTUNITIES_BY_PROFESSION[selectedMarketplaceSkin] ?? DEFAULT_OPPORTUNITIES)
        .slice()
        .sort((a, b) => parseInt(b.match) - parseInt(a.match))
    : [];

  // Auto-expire campaigns past deadline
  const today = new Date().toISOString().split('T')[0];
  const liveCampaigns = campaigns.map(c => {
    if (c.status === 'open' && c.deadline && c.deadline < today) return { ...c, status: 'expired' as const };
    return c;
  });
  // Deals the creator missed (expired campaigns matching their skins)
  const missedDeals = selectedMarketplaceSkin
    ? liveCampaigns.filter(c => c.status === 'expired' && c.requiredProfessions.includes(selectedMarketplaceSkin))
    : [];

  return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', color: C.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', overflowX: 'hidden' }}>

      {/* ValuSkin Showcase Modal — add video + pitch when clicking your skin */}
      {showSkinShowcaseModal && (
        <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99999 }}>
          <div style={{ background:C.surface, borderRadius:'16px', padding:'24px', maxWidth:'440px', width:'95vw', maxHeight:'90vh', overflowY:'auto', border:`1px solid ${C.border}`, position:'relative' }}>
            <button onClick={() => setShowSkinShowcaseModal(null)} style={{ position:'absolute', top:'14px', right:'16px', background:'none', border:'none', color:C.textMuted, fontSize:'22px', cursor:'pointer', lineHeight:1 }}>x</button>

            <div style={{ fontSize:'16px', fontWeight:700, color:C.text, marginBottom:'4px' }}>{showSkinShowcaseModal} Showcase</div>
            <div style={{ fontSize:'12px', color:C.textSecondary, marginBottom:'20px' }}>Brands see this when they click your ValuSkin. Tell them why they should collab with you.</div>

            {/* Mode toggle */}
            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
              <button onClick={()=>setCreatorSkinMode('static')} style={{ flex:1, padding:'10px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', background:creatorSkinMode==='static'?C.primary:C.bg, color:creatorSkinMode==='static'?'#fff':C.textSecondary, border:`1px solid ${creatorSkinMode==='static'?C.primary:C.border}` }}>
                Static Skin
              </button>
              <button onClick={()=>setCreatorSkinMode('showcase')} style={{ flex:1, padding:'10px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', background:creatorSkinMode==='showcase'?'#8b5cf6':C.bg, color:creatorSkinMode==='showcase'?'#fff':C.textSecondary, border:`1px solid ${creatorSkinMode==='showcase'?'#8b5cf6':C.border}` }}>
                Showcase Mode
              </button>
            </div>

            {creatorSkinMode === 'static' && (
              <div style={{ textAlign:'center', padding:'30px 20px', color:C.textMuted, fontSize:13 }}>
                Your ValuSkin displays as a standard badge. Switch to Showcase to add a video pitch and bio.
              </div>
            )}

            {creatorSkinMode === 'showcase' && (
              <>
                {/* Video upload section */}
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:'11px', fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8 }}>Pitch Video</div>
                  <div style={{ fontSize:'11px', color:C.textSecondary, marginBottom:8 }}>Record a short video explaining why brands should work with you. This plays when they click your skin.</div>

                  {!creatorPitchVideoUrl ? (
                    <label style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'24px', background:C.bg, border:`2px dashed ${C.border}`, borderRadius:10, cursor:'pointer', transition:'border-color 0.2s' }}>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        style={{ display:'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 50 * 1024 * 1024) {
                              setPurchaseToast('Video must be under 50MB');
                              setTimeout(() => setPurchaseToast(null), 3000);
                              return;
                            }
                            const url = URL.createObjectURL(file);
                            setCreatorPitchVideoUrl(url);
                            setCreatorPitchVideoName(file.name);
                          }
                        }}
                      />
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="1.5">
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                      </svg>
                      <span style={{ fontSize:13, fontWeight:600, color:C.text }}>Upload pitch video</span>
                      <span style={{ fontSize:11, color:C.textMuted }}>MP4, WebM or MOV &middot; Max 50MB</span>
                    </label>
                  ) : (
                    <div style={{ position:'relative' }}>
                      <video
                        src={creatorPitchVideoUrl}
                        controls
                        style={{ width:'100%', borderRadius:10, maxHeight:220, background:'#000' }}
                      />
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:6 }}>
                        <span style={{ fontSize:11, color:C.textMuted }}>{creatorPitchVideoName}</span>
                        <button onClick={() => { URL.revokeObjectURL(creatorPitchVideoUrl); setCreatorPitchVideoUrl(''); setCreatorPitchVideoName(''); }} style={{ background:'none', border:`1px solid rgba(239,68,68,0.3)`, borderRadius:6, padding:'4px 10px', fontSize:11, color:'#ef4444', cursor:'pointer', fontWeight:600 }}>Remove</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Text pitch */}
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:'11px', fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:6 }}>Written Pitch</div>
                  <textarea
                    value={creatorPitchText}
                    onChange={e => setCreatorPitchText(e.target.value)}
                    placeholder={`e.g. "I've built products used by 50K+ devs. Let me authentically showcase yours to my audience."`}
                    rows={3}
                    style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:'10px', fontSize:13, fontFamily:'inherit', outline:'none', resize:'none', boxSizing:'border-box' as const }}
                  />
                </div>

                {/* Preview card */}
                {(creatorPitchVideoUrl || creatorPitchText) && (
                  <div style={{ background:C.card, border:`1px solid rgba(139,92,246,0.2)`, borderRadius:10, padding:12, marginBottom:8 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'#8b5cf6', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8 }}>How brands see your skin</div>
                    {creatorPitchVideoUrl && (
                      <video src={creatorPitchVideoUrl} controls style={{ width:'100%', borderRadius:8, maxHeight:160, background:'#000', marginBottom:8 }} />
                    )}
                    {creatorPitchText && (
                      <div style={{ fontSize:12, color:C.text, lineHeight:1.5 }}>{creatorPitchText}</div>
                    )}
                  </div>
                )}
              </>
            )}

            <button onClick={() => { setShowSkinShowcaseModal(null); setPurchaseToast(creatorSkinMode === 'showcase' ? 'Showcase saved — brands will see your pitch' : 'Skin set to static'); setTimeout(()=>setPurchaseToast(null),3000); }} style={{ width:'100%', background:creatorSkinMode==='showcase'?'#8b5cf6':C.primary, border:'none', borderRadius:8, padding:'12px', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', marginTop:8 }}>
              {creatorSkinMode === 'showcase' ? 'Save Showcase' : 'Done'}
            </button>
          </div>
        </div>
      )}

      {/* Level-Up Modal */}
      {showLevelUpModal && (
        <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99999 }}>
          <div style={{ background:C.surface, borderRadius:'16px', padding:'32px 24px', maxWidth:'360px', width:'95vw', maxHeight:'90vh', overflowY:'auto', border:`1px solid ${C.border}`, textAlign:'center' }}>
            <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:'rgba(0,102,204,0.12)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <div style={{ fontSize:'20px', fontWeight:800, color:C.text, marginBottom:'6px' }}>Level Up</div>
            <div style={{ fontSize:'13px', color:C.textSecondary, marginBottom:'20px' }}>You completed a deal and levelled up your reputation.</div>
            <div style={{ display:'flex', justifyContent:'center', gap:'16px', marginBottom:'20px' }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'11px', color:C.textMuted, marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Previous</div>
                <div style={{ fontSize:'24px', fontWeight:800, color:C.textSecondary }}>L{levelUpFrom}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', color:C.primary, fontSize:'20px', fontWeight:700 }}>&rarr;</div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'11px', color:C.textMuted, marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.5px' }}>New</div>
                <div style={{ fontSize:'24px', fontWeight:800, color:C.primary }}>L{levelUpTo}</div>
              </div>
            </div>
            <div style={{ background:C.surfaceAlt, borderRadius:'10px', padding:'12px 14px', marginBottom:'20px', textAlign:'left' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:C.textMuted, textTransform:'uppercase', marginBottom:'8px' }}>Benefits of Level {levelUpTo}</div>
              {['Access to premium brands', '+15% rate negotiation power', 'Featured in top creators', 'Priority support'].map((b,i) => (
                <div key={i} style={{ fontSize:'12px', color:C.text, padding:'4px 0', display:'flex', alignItems:'center', gap:'6px' }}>
                  <div style={{ width:'4px', height:'4px', borderRadius:'50%', background:C.primary, flexShrink:0 }} />
                  {b}
                </div>
              ))}
            </div>
            <button onClick={() => { setShowLevelUpModal(false); setPurchaseToast('Deal complete — earnings added to your balance'); setTimeout(() => setPurchaseToast(null), 3000); }} style={{ width:'100%', background:C.primary, border:'none', borderRadius:'8px', padding:'11px', color:'#fff', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>
              Continue
            </button>
          </div>
        </div>
      )}

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

      {/* Left Sidebar — desktop only */}
      {!isMobile && (
        <div style={{ width: '280px', borderRight: `1px solid ${C.border}`, padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100vh', overflowY: 'auto', position: 'sticky', top: 0, background: C.surface, flexShrink: 0 }}>
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
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', overflowX: 'hidden', paddingBottom: isMobile ? '60px' : 0 }}>
        <div style={{ width: '100%', maxWidth: '600px', borderLeft: isMobile ? 'none' : `1px solid ${C.border}`, borderRight: isMobile ? 'none' : `1px solid ${C.border}`, background: C.bg, overflowX: 'hidden' }}>

          {/* ── PROFILE VIEW ──────────────────────────────────── */}
          {activeView === 'profile' && (
            <>
              {/* Header */}
              <div style={{
                height: '60px', borderBottom: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontWeight: 'bold', fontSize: isMobile ? '14px' : '16px', position: 'sticky', top: 0,
                background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                zIndex: 10, padding: '0 16px',
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
              <div style={{ padding: isMobile ? '12px' : '20px' }}>
                <div style={{ display: 'flex', alignItems: isMobile ? 'center' : 'flex-start', flexDirection: isMobile ? 'column' : 'row', marginBottom: '24px', gap: isMobile ? '12px' : 0 }}>
                  {/* Profile photo */}
                  <div style={{ marginRight: isMobile ? 0 : '40px', flexShrink: 0 }}>
                    <ProfilePhotoWithLongPress
                      showValueskinAvatar={valueskinAvatarEnabled}
                      level={currentLevel}
                      valueSkins={valueSkins}
                      avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=Saketh"
                      displayName="Saketh Velamuri"
                      size={isMobile ? 72 : 86}
                      onValueSkinsChange={setValueSkins}
                    />
                  </div>

                  {/* Stats */}
                  <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                    {/* Name + up to 3 stickers (each clickable → About Me) */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                      <h2 style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 'bold', margin: 0, color: C.text }}>
                        Saketh Velamuri
                      </h2>
                      {/* ValueSkin stickers — click to open showcase, right-click to manage */}
                      <div
                        onClick={() => {
                          const slots: ValueSkinSlot[] = ['profession', 'passion', 'hobby'];
                          for (const slot of slots) {
                            if (valueSkins[slot]) {
                              setShowSkinShowcaseModal(valueSkins[slot]!.profession);
                              break;
                            }
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          const slots: ValueSkinSlot[] = ['profession', 'passion', 'hobby'];
                          for (const slot of slots) {
                            if (valueSkins[slot]) {
                              setShowSkinManageModal(slot);
                              break;
                            }
                          }
                        }}
                        style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative', cursor: 'pointer' }}
                      >
                        <ValueSkinStickers valueSkins={valueSkins} onValueSkinsChange={setValueSkins} size="default" level={currentLevel} />
                        {Object.keys(valueSkins).length > 0 && (
                          <span style={{ fontSize: '11px', color: C.textMuted, marginLeft: '4px' }} title="Click to add showcase video · Right-click to manage">
                            ⋮
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: isMobile ? '16px' : '20px', marginBottom: '20px', fontSize: isMobile ? '13px' : '14px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                      <button onClick={() => setShowMetricsModal(true)} style={{ background: 'none', border: 'none', color: C.text, padding: 0, cursor: 'pointer', textAlign: 'center' }}>
                        <strong>{(metrics.followers / 1000).toFixed(0)}k</strong>
                        <div style={{ fontSize: '12px', color: C.textSecondary }}>followers</div>
                      </button>
                      <div style={{ textAlign: 'center' }}><strong>47</strong><div style={{ fontSize: '12px', color: C.textSecondary }}>posts</div></div>
                      <div style={{ textAlign: 'center' }}><strong>450</strong><div style={{ fontSize: '12px', color: C.textSecondary }}>following</div></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                      <button
                        onClick={handleFollow}
                        style={{ background: isFollowing ? C.surfaceAlt : C.primary, border: `1px solid ${isFollowing ? C.borderLight : C.primary}`, borderRadius: '8px', color: '#fff', padding: '8px 24px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div style={{ marginBottom: '16px', textAlign: isMobile ? 'center' : 'left' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px', color: C.text }}>Saketh Velamuri</div>
                  <div style={{ color: C.textSecondary, fontSize: isMobile ? '12px' : '14px', lineHeight: '1.5' }}>
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
                        {platform.toUpperCase()}
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
                {['posts', 'reels', 'tagged', 'insights', 'deals'].map((tab) => (
                  <div key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '44px', borderTop: activeTab === tab ? `2px solid ${tab === 'insights' ? C.primary : C.text}` : '2px solid transparent', color: activeTab === tab ? (tab === 'insights' ? C.primary : C.text) : C.textMuted, cursor: 'pointer', fontWeight: activeTab === tab ? '600' : 'normal', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {tab}
                  </div>
                ))}
              </div>

              {/* Post Grid — shown for posts/reels/tagged */}
              {activeTab !== 'insights' && activeTab !== 'deals' && (
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

              {/* Deals Tab Content */}
              {activeTab === 'deals' && (
                <div style={{ padding:'20px' }}>
                  <div style={{ fontSize:'13px', fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'14px' }}>Completed Deals</div>
                  {completedDeals.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'40px 20px', color:C.textMuted }}>
                      <div style={{ fontSize:'14px', marginBottom:'4px' }}>No completed deals yet</div>
                      <div style={{ fontSize:'12px' }}>Complete a deal in the Marketplace to see it here.</div>
                    </div>
                  ) : (
                    completedDeals.map((deal, i) => (
                      <div key={i} style={{ background:C.card, borderRadius:'10px', padding:'14px', marginBottom:'10px', border:`1px solid ${C.border}` }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                          <span style={{ fontSize:'13px', fontWeight:700, color:C.text }}>{deal.brand}</span>
                          <span style={{ fontSize:'14px', fontWeight:800, color:'#2E7D32' }}>${deal.amount.toLocaleString()}</span>
                        </div>
                        <div style={{ fontSize:'11px', color:C.textSecondary, marginBottom:'4px' }}>{deal.deliverable}</div>
                        <div style={{ display:'flex', justifyContent:'space-between' }}>
                          <span style={{ fontSize:'10px', color:C.textMuted }}>Completed {deal.completedAt}</span>
                          <span style={{ fontSize:'10px', fontWeight:700, color:'#2E7D32', background:'rgba(46,125,50,0.1)', padding:'2px 8px', borderRadius:'6px' }}>Approved</span>
                        </div>
                      </div>
                    ))
                  )}
                  <div style={{ marginTop:'16px', padding:'12px', background:'rgba(0,102,204,0.05)', borderRadius:'8px', border:`1px solid rgba(0,102,204,0.1)` }}>
                    <div style={{ fontSize:'11px', fontWeight:700, color:C.text, marginBottom:'2px' }}>Total earned: ${completedDeals.reduce((s,d) => s+d.amount, 0).toLocaleString()}</div>
                    <div style={{ fontSize:'11px', color:C.textSecondary }}>{completedDeals.length} deal{completedDeals.length !== 1 ? 's' : ''} completed</div>
                  </div>
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
                      <>
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
                      {currentLevel < 5 && (
                        <div style={{ marginTop:'6px', fontSize:'11px', color:C.textMuted, textAlign:'center' }}>
                          Complete more deals to reach Level {currentLevel + 1}
                        </div>
                      )}
                      </>
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
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
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
                  <div style={{ padding: '16px' }}>
                    {(<>
                    {/* ValueSkin selector */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>Browse as</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {ownedSkins.map(({ slot, profession }) => {
                          const badge = PROFESSION_BADGES[profession];
                          const abbr = badge?.abbreviation ?? profession.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 3);
                          const badgeColor = badge?.color ?? SLOT_COLORS[slot];
                          const isActive = selectedMarketplaceSkin === profession;
                          const skinDeals = Object.entries(dealStates).filter(([k, d]) => k.startsWith(`${profession}:`) && d.phase !== 'brief');
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
                                position: 'relative',
                              }}
                            >
                              {skinDeals.length > 0 && (
                                <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{skinDeals.length}</span>
                              )}
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

                    {/* Active Deals Banner */}
                    {activeDeals.length > 0 && (
                      <div style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:10, padding:'10px 14px', marginBottom:14, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><path d="M12 23c-3.866 0-7-2.686-7-6 0-1.954.951-3.677 2.427-5.173C8.853 10.392 10 8.639 10 6.5c0-.381-.044-.756-.127-1.116A9.86 9.86 0 0 1 12 2a9.86 9.86 0 0 1 2.127 3.384A4.725 4.725 0 0 0 14 6.5c0 2.139 1.147 3.892 2.573 5.327C18.049 13.323 19 15.046 19 17c0 3.314-3.134 6-7 6z"/></svg>
                          <div>
                            <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{activeDeals.length} Active Deal{activeDeals.length>1?'s':''}</div>
                            <div style={{ fontSize:10, color:C.textSecondary }}>
                              {activeDeals.map(([k]) => { const [skin] = k.split(':'); return skin; }).filter((v,i,a)=>a.indexOf(v)===i).join(', ')}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

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
                          const dealKey = `${selectedMarketplaceSkin}:${i}`;
                          const existingDeal = dealStates[dealKey];
                          const hasActiveDeal = existingDeal && existingDeal.phase !== 'brief';
                          const isNegotiating = negotiatingOpp === i || hasActiveDeal;
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
                                      const key = `${selectedMarketplaceSkin}:${i}`;
                                      setNegotiatingOpp(i);
                                      updateDeal(key, { phase: 'offer', offerAmount: '', counterAmount: '' });
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
                              ) : negotiatingOpp !== i && hasActiveDeal ? (
                                <div onClick={() => setNegotiatingOpp(i)} style={{ background: C.surfaceAlt, borderRadius: '10px', padding: '12px 14px', border: `1px solid rgba(0,102,204,0.3)`, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Deal Room · {opp.brand}</span>
                                  </div>
                                  <span style={{ fontSize: '10px', fontWeight: 600, color: C.textSecondary, background: C.bg, padding: '2px 8px', borderRadius: '4px', border: `1px solid ${C.border}` }}>
                                    {existingDeal.phase === 'chatroom' ? 'In Chat' : existingDeal.phase === 'offer' ? 'Offer Pending' : existingDeal.phase === 'counter' ? 'Counter Offer' : existingDeal.phase === 'accepted' ? 'Accepted' : existingDeal.phase === 'checklist' ? 'Checklist' : existingDeal.phase === 'softhold' ? 'Soft Hold' : 'Active'}
                                  </span>
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

                                  {/* Brand identity + intent */}
                                  {brandValueSkin && (
                                    <div style={{ background:'rgba(230,81,0,0.06)', border:'1px solid rgba(230,81,0,0.15)', borderRadius:'8px', padding:'8px 12px', marginBottom:'10px', fontSize:'11px', color:C.textSecondary }}>
                                      Brand identity: <strong style={{ color:C.text }}>{brandValueSkin}</strong>
                                      {opp && (() => { const myProfs = Object.values(valueSkins).map(v=>v?.profession).filter(Boolean) as string[]; return myProfs.includes(brandValueSkin) ? <span style={{ marginLeft:'8px', color:'#2E7D32', fontWeight:700 }}>Matched</span> : <span style={{ marginLeft:'8px', color:'#E65100', fontWeight:700 }}>No shared ValueSkin</span>; })()}
                                    </div>
                                  )}
                                  <div style={{ fontSize: '11px', color: C.textMuted, marginBottom: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <span
                                      onMouseEnter={() => setHoveredTooltip('intent')}
                                      onMouseLeave={() => setHoveredTooltip(null)}
                                      style={{ background: C.bg, padding: '2px 8px', borderRadius: '4px', border: `1px solid ${C.border}`, cursor: 'help', position: 'relative' }}
                                    >
                                      Intent: <strong style={{ color: C.text }}>Campaign</strong>
                                      {hoveredTooltip === 'intent' && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', width: 220, zIndex: 10, fontSize: 11, lineHeight: 1.5, color: C.text, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                                          <strong>What is Intent?</strong><br/>
                                          How the brand wants to work with you:<br/>
                                          <span style={{ color: '#8b5cf6' }}>Explore</span> — just browsing, no commitment<br/>
                                          <span style={{ color: C.primary }}>Campaign</span> — specific paid project<br/>
                                          <span style={{ color: '#22c55e' }}>Long-term</span> — ongoing partnership/retainer
                                        </div>
                                      )}
                                    </span>
                                    <span
                                      onMouseEnter={() => setHoveredTooltip('campaign_type')}
                                      onMouseLeave={() => setHoveredTooltip(null)}
                                      style={{ background: C.bg, padding: '2px 8px', borderRadius: '4px', border: `1px solid ${C.border}`, cursor: 'help', position: 'relative' }}
                                    >
                                      Type: <strong style={{ color: C.text }}>{brandCampaignType}</strong>
                                      {hoveredTooltip === 'campaign_type' && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', width: 240, zIndex: 10, fontSize: 11, lineHeight: 1.5, color: C.text, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                                          <strong>Campaign Types:</strong><br/>
                                          <span style={{ color: '#8b5cf6' }}>Product Review</span> — showcase/review their product<br/>
                                          <span style={{ color: C.primary }}>Sponsored Content</span> — branded post/reel<br/>
                                          <span style={{ color: '#22c55e' }}>Brand Ambassador</span> — represent the brand over time<br/>
                                          <span style={{ color: '#f59e0b' }}>UGC</span> — user-generated content for their ads<br/>
                                          <span style={{ color: '#ef4444' }}>Affiliate</span> — earn per sale/click you drive
                                        </div>
                                      )}
                                    </span>
                                  </div>

                                  {dealRoomPhase === 'offer' && (
                                    <>
                                      <div style={{ fontSize: '12px', color: C.textSecondary, marginBottom: '8px', lineHeight: 1.5 }}>
                                        Brand offer has arrived. Respond to their offer or submit a counter-offer — prices are only visible inside this room.
                                      </div>
                                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', position: 'relative' }}>
                                        <span style={{ fontSize: '13px', color: C.textMuted }}>Their offer ($):</span>
                                        <div style={{ position: 'relative', flex: 1 }}>
                                          <input
                                            type="text"
                                            disabled={true}
                                            value={dealOfferAmount || creatorRate}
                                            style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, padding: '6px 10px', fontSize: '15px', fontWeight: 700, fontFamily: 'inherit', outline: 'none', width: '100px', opacity: 0.8, cursor: 'not-allowed' }}
                                          />
                                        </div>
                                      </div>
                                      <div style={{ fontSize: '10px', color: C.textMuted, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                        Only visible to you and {opp.brand} · Auto-expires in {offerExpiresLabel}
                                      </div>
                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        <button onClick={() => setDealRoomPhase('accepted')} style={{ flex: 1, background: '#2E7D32', border: 'none', padding: '8px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>Accept</button>
                                        <button onClick={() => setDealRoomPhase('counter')} style={{ flex: 1, background: C.primary, border: 'none', padding: '8px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>Counter Offer</button>
                                        <button onClick={() => setNegotiatingOpp(null)} style={{ flex: 1, background: 'none', border: `1px solid ${C.border}`, padding: '8px', borderRadius: '8px', color: C.textSecondary, fontWeight: 500, cursor: 'pointer', fontSize: '12px' }}>Decline</button>
                                      </div>
                                    </>
                                  )}

                                  {dealRoomPhase === 'counter' && (
                                    <>
                                      <div style={{ fontSize: '12px', color: C.textSecondary, marginBottom: '8px' }}>Enter your counter-offer. Brand has 24h to respond or it auto-expires.</div>
                                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', padding: '8px 10px', background: C.card, borderRadius: '8px', border: `1px solid ${C.border}` }}>
                                        <div style={{ fontSize: '11px', color: C.textMuted }}>Your current ask: <strong style={{ color: C.text }}>${creatorRate}</strong></div>
                                      </div>
                                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '13px', color: C.textMuted }}>Your counter ($):</span>
                                        <input
                                          type="text"
                                          value={dealCounterAmount}
                                          onChange={(e) => setDealCounterAmount(e.target.value.replace(/[^0-9]/g, ''))}
                                          placeholder="Enter amount"
                                          style={{ background: C.bg, border: `1px solid ${C.primary}`, borderRadius: '8px', color: C.text, padding: '6px 10px', fontSize: '15px', fontWeight: 700, fontFamily: 'inherit', outline: 'none', width: '100px' }}
                                        />
                                      </div>
                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        <button onClick={() => { setDealRoomPhase('offer'); setDealOfferAmount(dealCounterAmount); }} style={{ flex: 1, background: C.primary, border: 'none', padding: '8px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>Send Counter</button>
                                        <button onClick={() => setDealRoomPhase('offer')} style={{ background: 'none', border: `1px solid ${C.border}`, padding: '8px 12px', borderRadius: '8px', color: C.textSecondary, cursor: 'pointer', fontSize: '12px' }}>Back</button>
                                      </div>
                                    </>
                                  )}

                                  {dealRoomPhase === 'accepted' && (
                                    <>
                                      <div style={{ padding: '12px', background: 'rgba(46,125,50,0.08)', borderRadius: '8px', marginBottom: '10px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#2E7D32', marginBottom: '4px' }}>Deal accepted!</div>
                                        <div style={{ fontSize: '12px', color: C.textSecondary }}>Enter the chat room to negotiate details and finalize.</div>
                                      </div>
                                      <button onClick={() => setDealRoomPhase('chatroom')} style={{ width: '100%', background: C.primary, border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                                        Enter Chat Room
                                      </button>
                                    </>
                                  )}

                                  {dealRoomPhase === 'chatroom' && (
                                    <>
                                      {/* Chat + Sidebar layout */}
                                      <div style={{ display: 'flex', gap: '8px', minHeight: '340px' }}>
                                        {/* Chat area */}
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.bg, borderRadius: '8px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                                          <div style={{ padding: '8px 10px', borderBottom: `1px solid ${C.border}`, fontSize: '11px', fontWeight: 700, color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2E7D32' }} />
                                              Deal Room Chat
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                              <span style={{ fontSize: 9, color: C.textMuted, fontWeight: 400 }}>All messages are recorded and legally documented</span>
                                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                            </div>
                                          </div>
                                          {/* Messages */}
                                          <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px' }}>
                                            {chatMessages.map((msg, mi) => (
                                              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start' }}>
                                                <div style={{
                                                  maxWidth: '80%',
                                                  padding: '6px 10px',
                                                  borderRadius: msg.sender === 'me' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                                                  background: msg.sender === 'me' ? C.primary : C.surfaceAlt,
                                                  color: msg.sender === 'me' ? '#fff' : C.text,
                                                  fontSize: '12px',
                                                  lineHeight: 1.4,
                                                }}>
                                                  {msg.text}
                                                  <div style={{ fontSize: '9px', color: msg.sender === 'me' ? 'rgba(255,255,255,0.5)' : C.textMuted, marginTop: '2px', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                                                    {msg.time}
                                                    {msg.sender === 'me' && (
                                                      <span style={{ display: 'inline-flex', gap: 1 }}>
                                                        {/* Double check = seen, single = delivered */}
                                                        {(msg.seen || mi < chatMessages.length - 1) ? (
                                                          <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="#4fc3f7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1,5 4,8 8,2"/><polyline points="6,5 9,8 13,2"/></svg>
                                                        ) : (
                                                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1,5 3.5,8 9,2"/></svg>
                                                        )}
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                          {/* Input */}
                                          <form onSubmit={(e) => {
                                            e.preventDefault();
                                            if (!chatInput.trim()) return;
                                            const now = new Date();
                                            const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                                            setChatMessages(prev => [...prev, { id: Date.now(), sender: 'me', text: chatInput.trim(), time: timeStr, seen: false }]);
                                            setChatInput('');
                                            // Mark previous messages as seen when brand replies, then add reply
                                            setTimeout(() => {
                                              const replies = [
                                                'Sounds good! Let me check with my team.',
                                                'Great point. We can work with that.',
                                                'Agreed. Let\'s finalize the terms.',
                                                'Perfect, I\'ll update the brief.',
                                                'That works for us. Ready to proceed?',
                                              ];
                                              const replyTime = new Date();
                                              const replyTimeStr = replyTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                                              setChatMessages(prev => [
                                                ...prev.map(m => m.sender === 'me' ? { ...m, seen: true } : m),
                                                { id: Date.now(), sender: 'brand' as const, text: replies[Math.floor(Math.random() * replies.length)], time: replyTimeStr, seen: false },
                                              ]);
                                            }, 1500);
                                          }} style={{ display: 'flex', gap: '4px', padding: '6px', borderTop: `1px solid ${C.border}` }}>
                                            <input
                                              type="text"
                                              value={chatInput}
                                              onChange={(e) => setChatInput(e.target.value)}
                                              placeholder="Type a message..."
                                              style={{ flex: 1, padding: '6px 10px', background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: '14px', color: C.text, fontSize: '12px', outline: 'none' }}
                                            />
                                            <button type="submit" disabled={!chatInput.trim()} style={{ padding: '6px 12px', background: chatInput.trim() ? C.primary : `${C.primary}40`, color: '#fff', border: 'none', borderRadius: '14px', fontSize: '11px', fontWeight: 600, cursor: chatInput.trim() ? 'pointer' : 'not-allowed' }}>Send</button>
                                          </form>
                                        </div>

                                        {/* Sidebar: checklist + payment */}
                                        <div style={{ width: '160px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                          {/* Checklist */}
                                          <div style={{ background: C.bg, borderRadius: '8px', border: `1px solid ${C.border}`, padding: '8px' }}>
                                            <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Checklist</div>
                                            {[
                                              'Deliverables',
                                              'Timeline',
                                              'Payment terms',
                                              'Contract',
                                            ].map((item, i) => (
                                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 0', fontSize: '11px', color: C.text }}>
                                                <div style={{ width: 12, height: 12, borderRadius: 3, background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                                </div>
                                                {item}
                                              </div>
                                            ))}
                                          </div>

                                          {/* Payment */}
                                          <div style={{ background: C.bg, borderRadius: '8px', border: `1px solid ${C.border}`, padding: '8px' }}>
                                            <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Payment</div>
                                            <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                                              <div style={{ flex: 1, textAlign: 'center', padding: '4px', background: C.surfaceAlt, borderRadius: '4px' }}>
                                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#2E7D32' }}>{advancePercent}%</div>
                                                <div style={{ fontSize: '8px', color: C.textMuted }}>Advance</div>
                                              </div>
                                              <div style={{ flex: 1, textAlign: 'center', padding: '4px', background: C.surfaceAlt, borderRadius: '4px' }}>
                                                <div style={{ fontSize: '12px', fontWeight: 700, color: C.primary }}>{100 - advancePercent}%</div>
                                                <div style={{ fontSize: '8px', color: C.textMuted }}>Perf.</div>
                                              </div>
                                            </div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '10px', color: C.text }}>
                                              <input type="checkbox" checked={performanceClause} onChange={(e) => { setPerformanceClause(e.target.checked); if (!e.target.checked) setAdvancePercent(100); }} style={{ width: 10, height: 10 }} />
                                              Perf. clause
                                            </label>
                                            {performanceClause && (
                                              <input type="range" min="70" max="100" value={advancePercent} onChange={(e) => setAdvancePercent(Number(e.target.value))} style={{ width: '100%', marginTop: '4px' }} />
                                            )}
                                            <div style={{ fontSize: '9px', color: '#2E7D32', marginTop: '4px', textAlign: 'center' }}>Payment locked</div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Done button */}
                                      <button onClick={() => { setDealRoomPhase('checklist'); }} style={{ width: '100%', background: '#2E7D32', border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px', marginTop: '10px' }}>
                                        Done, Accept Now
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
                                      <button onClick={() => { setDealRoomPhase('softhold'); setCreatorDealLifecycle('deliverables'); }} style={{ width: '100%', background: C.primary, border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px', marginTop: '12px' }}>
                                        Confirm &amp; Finalise Deal
                                      </button>
                                    </>
                                  )}

                                  {dealRoomPhase === 'softhold' && creatorDealLifecycle === 'deliverables' && (
                                    <>
                                      <div style={{ fontSize:'11px', fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'10px' }}>Upload Deliverables</div>
                                      <div style={{ background:C.bg, borderRadius:'8px', padding:'12px', border:`1px solid ${C.border}`, marginBottom:'12px' }}>
                                        <div style={{ fontSize:'12px', fontWeight:600, color:C.text, marginBottom:'4px' }}>Deliverable: 1 x Instagram Reel</div>
                                        <div style={{ fontSize:'11px', color:C.textMuted }}>Format: MP4, max 50MB</div>
                                      </div>
                                      <div style={{ background:'rgba(46,125,50,0.06)', border:'1px solid rgba(46,125,50,0.2)', borderRadius:'8px', padding:'10px', marginBottom:'12px', fontSize:'11px', color:C.textSecondary }}>
                                        Brand payment on-hold: ${parseInt(dealCounterAmount || '5000').toLocaleString()} — released on approval
                                      </div>
                                      {!dealUploadSimulated ? (
                                        <button onClick={() => { setDealUploadSimulated(true); setCreatorDealLifecycle('submitted'); }} style={{ width:'100%', background:C.primary, border:'none', padding:'10px', borderRadius:'8px', color:'#fff', fontWeight:600, cursor:'pointer', fontSize:'13px' }}>
                                          Simulate Upload
                                        </button>
                                      ) : null}
                                    </>
                                  )}

                                  {dealRoomPhase === 'softhold' && creatorDealLifecycle === 'submitted' && (
                                    <>
                                      <div style={{ background:'rgba(0,102,204,0.06)', border:`1px solid rgba(0,102,204,0.2)`, borderRadius:'8px', padding:'12px', marginBottom:'12px' }}>
                                        <div style={{ fontSize:'13px', fontWeight:700, color:C.text, marginBottom:'4px' }}>Deliverable Submitted</div>
                                        <div style={{ fontSize:'11px', color:C.textSecondary }}>Waiting for brand approval — typically within 48h.</div>
                                      </div>
                                      <button onClick={() => { setCreatorDealLifecycle('approved'); handleDealComplete(parseInt(dealCounterAmount || '5000'), 'Brand', '1x Instagram Reel'); }} style={{ width:'100%', background:'none', border:`1px solid ${C.border}`, padding:'8px', borderRadius:'8px', color:C.textMuted, fontSize:'11px', cursor:'pointer' }}>
                                        Simulate: Brand approved
                                      </button>
                                    </>
                                  )}

                                  {dealRoomPhase === 'softhold' && creatorDealLifecycle === 'approved' && (
                                    <>
                                      <div style={{ textAlign:'center', padding:'12px 0' }}>
                                        <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'rgba(46,125,50,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
                                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                        </div>
                                        <div style={{ fontSize:'15px', fontWeight:700, color:C.text, marginBottom:'4px' }}>Deal Complete</div>
                                        <div style={{ fontSize:'12px', color:C.textSecondary, marginBottom:'16px' }}>Your deliverable was approved.</div>
                                        <div style={{ background:'rgba(46,125,50,0.06)', border:'1px solid rgba(46,125,50,0.2)', borderRadius:'8px', padding:'12px', marginBottom:'14px' }}>
                                          <div style={{ fontSize:'11px', color:C.textMuted, marginBottom:'2px' }}>Earnings</div>
                                          <div style={{ fontSize:'22px', fontWeight:800, color:'#2E7D32' }}>${parseInt(dealCounterAmount || '5000').toLocaleString()}</div>
                                        </div>
                                        <button onClick={() => { if (activeDealKey) { setDealStates(prev => { const next = {...prev}; delete next[activeDealKey]; return next; }); } setNegotiatingOpp(null); setCreatorDealLifecycle('checklist'); setDealUploadSimulated(false); }} style={{ width:'100%', background:C.primary, border:'none', padding:'10px', borderRadius:'8px', color:'#fff', fontWeight:600, cursor:'pointer', fontSize:'13px' }}>
                                          Withdraw to Bank
                                        </button>
                                      </div>
                                    </>
                                  )}

                                  {!['offer','counter','accepted','chatroom','checklist','softhold'].includes(dealRoomPhase) && (
                                    <button onClick={() => setNegotiatingOpp(null)} style={{ width: '100%', background: 'none', border: `1px solid ${C.border}`, padding: '8px', borderRadius: '8px', color: C.textSecondary, cursor: 'pointer', fontSize: '12px' }}>Close</button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}
                    </>)}


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
                    {/* New Campaign Creator Modal */}
                    {showCampaignCreator && (
                      <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
                        <div style={{ background:C.surface, borderRadius:'16px', padding:'24px', maxWidth:'480px', width:'95vw', maxHeight:'90vh', overflowY:'auto', border:`1px solid ${C.border}`, position:'relative' }}>
                          <button onClick={() => setShowCampaignCreator(false)} style={{ position:'absolute', top:'16px', right:'16px', background:'none', border:'none', color:C.textMuted, fontSize:'22px', cursor:'pointer', lineHeight:1 }}>x</button>
                          <div style={{ fontSize:'16px', fontWeight:700, color:C.text, marginBottom:'16px' }}>Create Campaign</div>
                          {[
                            { label:'Campaign title', val:newCampaignTitle, set:setNewCampaignTitle, placeholder:'e.g. Spring Product Launch' },
                          ].map(f => (
                            <div key={f.label} style={{ marginBottom:'12px' }}>
                              <div style={{ fontSize:'11px', color:C.textMuted, fontWeight:600, marginBottom:'4px' }}>{f.label} *</div>
                              <input type="text" value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.placeholder} style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:'8px', color:C.text, padding:'8px 10px', fontSize:'13px', fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                            </div>
                          ))}
                          <div style={{ marginBottom:'12px' }}>
                            <div style={{ fontSize:'11px', color:C.textMuted, fontWeight:600, marginBottom:'4px' }}>Description *</div>
                            <textarea value={newCampaignDesc} onChange={e=>setNewCampaignDesc(e.target.value)} rows={3} placeholder="Describe the campaign and what you need from creators" style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:'8px', color:C.text, padding:'8px 10px', fontSize:'13px', fontFamily:'inherit', outline:'none', resize:'none', boxSizing:'border-box' as const }} />
                          </div>
                          <div style={{ marginBottom:'12px' }}>
                            <div style={{ fontSize:'11px', color:C.textMuted, fontWeight:600, marginBottom:'6px' }}>Required ValueSkin (profession) *</div>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                              {['Software Engineer','Data Scientist','UX/UI Designer','Fitness Coach','Nutritionist','Product Manager','Graphic Designer','Chef','Actor','Fitness Coach','Doctor','Financial Advisor'].map(p => (
                                <button key={p} onClick={() => setNewCampaignProfessions(prev => prev.includes(p) ? prev.filter(x=>x!==p) : [...prev,p])} style={{ padding:'5px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:600, cursor:'pointer', background:newCampaignProfessions.includes(p)?`${C.primary}15`:C.bg, color:newCampaignProfessions.includes(p)?C.primary:C.textSecondary, border:`1px solid ${newCampaignProfessions.includes(p)?C.primary:C.border}` }}>{p}</button>
                              ))}
                            </div>
                            <div style={{ fontSize:'10px', color:C.textMuted, marginTop:'5px' }}>Only creators with a matching ValueSkin can enter negotiation.</div>
                          </div>
                          <div style={{ marginBottom:'12px' }}>
                            <div style={{ fontSize:'11px', color:C.textMuted, fontWeight:600, marginBottom:'4px' }}>Creator level range *</div>
                            <div style={{ fontSize:'10px', color:C.textMuted, marginBottom:'6px' }}>Select min and max level. Only creators within this range can apply.</div>
                            <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                              <span style={{ fontSize:'10px', color:C.textMuted, fontWeight:600, width:24 }}>Min</span>
                              {[1,2,3,4,5].map(l => (
                                <button key={l} onClick={()=>{ setNewCampaignMinLevel(l); if (l > newCampaignMaxLevel) setNewCampaignMaxLevel(l); }} style={{ flex:1, padding:'7px 0', borderRadius:'6px', fontSize:'12px', fontWeight:700, cursor:'pointer', background:newCampaignMinLevel===l?C.primary:C.bg, color:newCampaignMinLevel===l?'#fff':C.textSecondary, border:`1px solid ${newCampaignMinLevel===l?C.primary:C.border}` }}>L{l}</button>
                              ))}
                            </div>
                            <div style={{ display:'flex', gap:'6px', alignItems:'center', marginTop:'6px' }}>
                              <span style={{ fontSize:'10px', color:C.textMuted, fontWeight:600, width:24 }}>Max</span>
                              {[1,2,3,4,5].map(l => (
                                <button key={l} onClick={()=>{ setNewCampaignMaxLevel(l); if (l < newCampaignMinLevel) setNewCampaignMinLevel(l); }} disabled={l < newCampaignMinLevel} style={{ flex:1, padding:'7px 0', borderRadius:'6px', fontSize:'12px', fontWeight:700, cursor: l < newCampaignMinLevel ? 'not-allowed' : 'pointer', background:newCampaignMaxLevel===l?'#22c55e':C.bg, color:newCampaignMaxLevel===l?'#fff': l < newCampaignMinLevel ? C.border : C.textSecondary, border:`1px solid ${newCampaignMaxLevel===l?'#22c55e':C.border}`, opacity: l < newCampaignMinLevel ? 0.4 : 1 }}>L{l}</button>
                              ))}
                            </div>
                            <div style={{ fontSize:'10px', color:C.primary, marginTop:'4px', fontWeight:600 }}>Accepting Level {newCampaignMinLevel}{newCampaignMaxLevel !== newCampaignMinLevel ? ` to ${newCampaignMaxLevel}` : ' only'}</div>
                          </div>
                          <div style={{ display:'flex', gap:'10px', marginBottom:'12px' }}>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:'11px', color:C.textMuted, fontWeight:600, marginBottom:'4px' }}>Budget ($) *</div>
                              <input type="text" value={newCampaignBudget} onChange={e=>setNewCampaignBudget(e.target.value.replace(/[^0-9]/g,''))} placeholder="5000" style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:'8px', color:C.text, padding:'8px 10px', fontSize:'13px', fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:'11px', color:C.textMuted, fontWeight:600, marginBottom:'4px' }}>Location</div>
                              <input type="text" value={newCampaignLocation} onChange={e=>setNewCampaignLocation(e.target.value)} placeholder="USA / Remote / Global" style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:'8px', color:C.text, padding:'8px 10px', fontSize:'13px', fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                            </div>
                          </div>
                          <div style={{ marginBottom:'12px' }}>
                            <div style={{ fontSize:'11px', color:C.textMuted, fontWeight:600, marginBottom:'4px' }}>Deliverables</div>
                            <input type="text" value={newCampaignDeliverables} onChange={e=>setNewCampaignDeliverables(e.target.value)} placeholder="e.g. 2x Reels, 3x Stories" style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:'8px', color:C.text, padding:'8px 10px', fontSize:'13px', fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                          </div>
                          <div style={{ marginBottom:'12px' }}>
                            <div style={{ fontSize:'11px', color:C.textMuted, fontWeight:600, marginBottom:'6px' }}>Non-negotiables</div>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                              {['NDA required','Usage rights: 90 days','Usage rights: 30 days','Exclusivity: 30 days','Exclusivity: 60 days','On-camera required','English only'].map(n => (
                                <button key={n} onClick={()=>setNewCampaignNonNeg(prev=>prev.includes(n)?prev.filter(x=>x!==n):[...prev,n])} style={{ padding:'4px 9px', borderRadius:'6px', fontSize:'10px', fontWeight:600, cursor:'pointer', background:newCampaignNonNeg.includes(n)?'rgba(239,68,68,0.12)':C.bg, color:newCampaignNonNeg.includes(n)?'#ef4444':C.textSecondary, border:`1px solid ${newCampaignNonNeg.includes(n)?'rgba(239,68,68,0.4)':C.border}` }}>{n}</button>
                              ))}
                            </div>
                          </div>
                          <div style={{ marginBottom:'16px' }}>
                            <div style={{ fontSize:'11px', color:C.textMuted, fontWeight:600, marginBottom:'4px' }}>Application deadline</div>
                            <input type="date" value={newCampaignDeadline} onChange={e=>setNewCampaignDeadline(e.target.value)} style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:'8px', color:C.text, padding:'8px 10px', fontSize:'13px', fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                          </div>
                          <button
                            onClick={() => {
                              const missing: string[] = [];
                              if (!newCampaignTitle.trim()) missing.push('Title');
                              if (!newCampaignDesc.trim()) missing.push('Description');
                              if (!newCampaignBudget) missing.push('Budget');
                              if (newCampaignProfessions.length===0) missing.push('Required ValueSkin');
                              if (missing.length > 0) { setPurchaseToast(`Missing: ${missing.join(', ')}`); setTimeout(()=>setPurchaseToast(null),4000); return; }
                              const newC: Campaign = { id:Date.now(), brandProfession:brandValueSkin??'', title:newCampaignTitle, description:newCampaignDesc, requiredProfessions:newCampaignProfessions, minLevel:newCampaignMinLevel, maxLevel:newCampaignMaxLevel, budget:newCampaignBudget, deadline:newCampaignDeadline, location:newCampaignLocation, nonNegotiables:newCampaignNonNeg, deliverables:newCampaignDeliverables, status:'open', applicants:0 };
                              persistCampaigns([...campaigns, newC]);
                              setShowCampaignCreator(false); setNewCampaignTitle(''); setNewCampaignDesc(''); setNewCampaignBudget(''); setNewCampaignDeadline(''); setNewCampaignProfessions([]); setNewCampaignMinLevel(1); setNewCampaignMaxLevel(5); setNewCampaignLocation(''); setNewCampaignDeliverables(''); setNewCampaignNonNeg([]);
                              setPurchaseToast('Campaign published — visible to matching creators now'); setTimeout(()=>setPurchaseToast(null),3000);
                            }}
                            style={{ width:'100%', background:C.primary, border:'none', borderRadius:'8px', padding:'11px', color:'#fff', fontWeight:700, fontSize:'14px', cursor:'pointer' }}
                          >
                            Publish Campaign
                          </button>
                        </div>
                      </div>
                    )}
                    {/* Brand Identity Card */}
                    <div style={{ background:C.card, border:`1px solid ${brandValueSkin ? 'rgba(230,81,0,0.3)' : C.border}`, borderRadius:'12px', padding:'14px 16px', marginBottom:'14px' }}>
                      <div style={{ fontSize:'10px', fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'8px' }}>Your Brand Identity</div>
                      {brandValueSkin ? (
                        <>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 10 }}>
                            <div>
                              <div style={{ fontSize:'14px', fontWeight:700, color:C.text }}>{brandValueSkin}</div>
                              <div style={{ fontSize:'11px', color:C.textSecondary, marginTop:'2px' }}>You match with creators in this profession</div>
                            </div>
                            <button onClick={() => setShowBrandStoreModal(true)} style={{ background:'none', border:`1px solid ${C.border}`, borderRadius:'6px', padding:'5px 10px', fontSize:'11px', color:C.textSecondary, cursor:'pointer' }}>Change</button>
                          </div>
                          {/* Brand Skin Mode — static or promo (like Google Doodles) */}
                          <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:10 }}>
                            <div style={{ fontSize:'10px', fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:6 }}>Skin Mode</div>
                            <div style={{ display:'flex', gap:6, marginBottom:8 }}>
                              <button onClick={()=>setBrandSkinMode('static')} style={{ flex:1, padding:'6px', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer', background:brandSkinMode==='static'?C.primary:C.bg, color:brandSkinMode==='static'?'#fff':C.textSecondary, border:`1px solid ${brandSkinMode==='static'?C.primary:C.border}` }}>Static</button>
                              <button onClick={()=>setBrandSkinMode('promo')} style={{ flex:1, padding:'6px', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer', background:brandSkinMode==='promo'?'#f59e0b':C.bg, color:brandSkinMode==='promo'?'#000':C.textSecondary, border:`1px solid ${brandSkinMode==='promo'?'#f59e0b':C.border}` }}>Promotional</button>
                            </div>
                            {brandSkinMode === 'promo' && (
                              <div style={{ background:C.bg, borderRadius:8, padding:8, border:`1px solid ${C.border}` }}>
                                <div style={{ fontSize:10, color:C.textMuted, marginBottom:4 }}>Promote a product or campaign — creators see this when they click your ValuSkin</div>
                                <input type="text" value={brandPromoText} onChange={e=>setBrandPromoText(e.target.value)} placeholder="e.g. Try our new McPlant burger!" style={{ width:'100%', background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:6, color:C.text, padding:'6px 8px', fontSize:12, fontFamily:'inherit', outline:'none', marginBottom:6, boxSizing:'border-box' as const }} />
                                <input type="text" value={brandPromoUrl} onChange={e=>setBrandPromoUrl(e.target.value)} placeholder="Link (optional)" style={{ width:'100%', background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:6, color:C.text, padding:'6px 8px', fontSize:12, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                                {brandPromoText && (
                                  <div style={{ marginTop:8, padding:8, background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:6, fontSize:11, color:C.text }}>
                                    <div style={{ fontWeight:700, marginBottom:2, color:'#f59e0b' }}>Live Preview</div>
                                    {brandPromoText}
                                    {brandPromoUrl && <div style={{ fontSize:10, color:C.primary, marginTop:4, textDecoration:'underline' }}>{brandPromoUrl}</div>}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div style={{ fontSize:'12px', color:C.textMuted }}>No profession set — brands need a ValueSkin to contact creators</div>
                          <button onClick={() => setShowBrandStoreModal(true)} style={{ background:C.primary, border:'none', borderRadius:'6px', padding:'6px 12px', fontSize:'11px', fontWeight:700, color:'#fff', cursor:'pointer' }}>Get ValueSkin</button>
                        </div>
                      )}
                    </div>

                    {marketplaceTab === 'creators' && (<>
                    {/* Matching Rule Banner */}
                    <div style={{ background: 'rgba(0,102,204,0.06)', border: `1px solid rgba(0,102,204,0.15)`, borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>ValuSkin Matching Active</div>
                        <div style={{ fontSize: '11px', color: C.textSecondary }}>Only creators holding the ValuSkin you select below will appear. Matching is deterministic and server-enforced.</div>
                      </div>
                    </div>

                    {/* Saved Searches */}
                    {adminShowSavedSearches && savedSearches.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', marginBottom: '6px' }}>Saved Searches</div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {savedSearches.map(s => (
                            <button key={s.id} onClick={() => { setBrandSearchMode('profession'); setBrandSearchQuery(s.profession); setFilterAudienceAge(s.age); setFilterAudienceLoc(s.loc); }}
                              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', background: `${C.primary}15`, color: C.primary, border: `1px solid ${C.primary}40` }}>
                              {s.label}
                              <span onClick={e => { e.stopPropagation(); setSavedSearches(prev => prev.filter(x => x.id !== s.id)); }} style={{ marginLeft: '2px', color: C.textMuted, fontSize: '12px' }}>×</span>
                            </button>
                          ))}
                          <button onClick={() => { const label = `${brandSearchQuery || 'Any'}, ${filterAudienceAge || 'Any age'}, ${filterAudienceLoc || 'Any loc'}`; setSavedSearches(prev => [...prev, { id: Date.now(), label, profession: brandSearchQuery, age: filterAudienceAge ?? '', loc: filterAudienceLoc }]); }}
                            style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', background: 'transparent', color: C.textMuted, border: `1px solid ${C.border}` }}>
                            + Save current search
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Deal Templates */}
                    {adminShowDealTemplates && savedDealTemplates.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', marginBottom: '6px' }}>Deal Templates</div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {savedDealTemplates.map(t => (
                            <button key={t.id} onClick={() => { setBrandBriefTitle(t.name); setBrandBriefDeliverables(t.deliverables); setBrandBudget(t.budget); setBrandCampaignType(t.type); }}
                              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', background: 'rgba(230,81,0,0.08)', color: '#E65100', border: '1px solid rgba(230,81,0,0.25)' }}>
                              {t.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

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
                              {creator.audienceLocation}
                            </span>
                            <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: 'rgba(0,102,204,0.08)', color: C.primary, border: `1px solid rgba(0,102,204,0.2)` }}>
                              {creator.audienceAgeRange}
                            </span>
                            <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: 'rgba(0,102,204,0.08)', color: C.primary, border: `1px solid rgba(0,102,204,0.2)` }}>
                              {creator.audienceLang}
                            </span>
                            <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: 'rgba(100,100,100,0.1)', color: C.textSecondary, border: `1px solid ${C.border}` }}>
                              {creator.timezone}
                            </span>
                          </div>
                          {/* Deal types + NDA/rights row */}
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            {creator.dealTypes.map(dt => (
                              <span key={dt} style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', textTransform: 'uppercase' }}>{dt}</span>
                            ))}
                            {creator.ndaOk && <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '8px', background: 'rgba(139,92,246,0.08)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)', textTransform: 'uppercase' }}>NDA</span>}
                            {creator.usageRightsOk && <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '8px', background: 'rgba(139,92,246,0.08)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)', textTransform: 'uppercase' }}>Usage Rights</span>}
                          </div>

                          {/* Rate card */}
                          {adminShowRateCard && (
                            <div style={{ background: C.bg, borderRadius: '7px', padding: '8px 10px', marginBottom: '8px', border: `1px solid ${C.border}` }}>
                              <div style={{ fontSize: '9px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', marginBottom: '5px' }}>Rate Card</div>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {Object.entries(creator.rateCard).map(([fmt, price]) => (
                                  <div key={fmt} style={{ flex: 1, textAlign: 'center', padding: '4px', background: C.card, borderRadius: '5px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: C.text }}>{price}</div>
                                    <div style={{ fontSize: '8px', color: C.textMuted, textTransform: 'capitalize' }}>{fmt}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Trust signals row */}
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            {adminShowDealCompletion && (
                              <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px',
                                background: creator.dealCompletionRate >= 90 ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                                color: creator.dealCompletionRate >= 90 ? '#22c55e' : '#f59e0b',
                                border: `1px solid ${creator.dealCompletionRate >= 90 ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}`,
                              }}>{creator.dealCompletionRate}% completion</span>
                            )}
                            {adminShowIncomeTier && (
                              <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px', background: 'rgba(0,102,204,0.08)', color: C.primary, border: `1px solid rgba(0,102,204,0.2)` }}>
                                ${creator.incomeTier} earned
                              </span>
                            )}
                            {adminShowAvailabilityCalendar && (
                              <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px',
                                background: creator.availableFrom === 'Now' ? 'rgba(34,197,94,0.08)' : 'rgba(100,100,100,0.08)',
                                color: creator.availableFrom === 'Now' ? '#22c55e' : C.textSecondary,
                                border: `1px solid ${creator.availableFrom === 'Now' ? 'rgba(34,197,94,0.2)' : C.border}`,
                              }}>{creator.availableFrom === 'Now' ? 'Available now' : `From ${creator.availableFrom}`}</span>
                            )}
                            {adminShowExclusivitySignal && !creator.exclusivitySlotFree && (
                              <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>Exclusivity taken</span>
                            )}
                            {adminShowRevisionLimit && (
                              <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px', background: 'rgba(100,100,100,0.08)', color: C.textSecondary, border: `1px solid ${C.border}` }}>{creator.revisionLimit} revisions</span>
                            )}
                            {adminShowUsageRightsDuration && (
                              <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px', background: 'rgba(139,92,246,0.08)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)' }}>{creator.usageRightsDays}d rights</span>
                            )}
                          </div>

                          {/* Portfolio samples */}
                          {adminShowPortfolio && (
                            <div style={{ marginBottom: '8px' }}>
                              <div style={{ fontSize: '9px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', marginBottom: '4px' }}>Portfolio</div>
                              {creator.portfolio.map((p, pi) => (
                                <div key={pi} style={{ fontSize: '10px', color: C.textSecondary, padding: '3px 0', borderTop: pi > 0 ? `1px solid ${C.border}` : 'none' }}>▶ {p}</div>
                              ))}
                            </div>
                          )}

                          {/* Platform safety status bar */}
                          <div style={{ display: 'flex', gap: '5px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            {safetyRequireVerifiedBrand && (
                              <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>VERIFIED BRAND</span>
                            )}
                            {safetyRequireBrief && (
                              <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px', background: 'rgba(0,102,204,0.08)', color: C.primary, border: `1px solid rgba(0,102,204,0.2)` }}>BRIEF REQUIRED</span>
                            )}
                            <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                              MAX {safetyDmRateLimit}/DAY
                            </span>
                          </div>

                          {!isNegotiating ? (
                            (() => {
                              const hasMatch = brandValueSkin === creator.valueSkin;
                              const noBrandSkin = !brandValueSkin;
                              return (
                                <div>
                                  {!hasMatch && !noBrandSkin && (
                                    <div style={{ background:'rgba(230,81,0,0.06)', border:'1px solid rgba(230,81,0,0.2)', borderRadius:'8px', padding:'8px 10px', marginBottom:'8px', fontSize:'11px', color:'#E65100' }}>
                                      No shared ValueSkin — you are {brandValueSkin}, this creator is {creator.valueSkin}
                                    </div>
                                  )}
                                  {noBrandSkin && (
                                    <div style={{ background:'rgba(230,81,0,0.06)', border:'1px solid rgba(230,81,0,0.2)', borderRadius:'8px', padding:'8px 10px', marginBottom:'8px', fontSize:'11px', color:'#E65100' }}>
                                      Get a brand ValueSkin to contact creators
                                    </div>
                                  )}
                                  <button
                                    onClick={() => {
                                      if (noBrandSkin) { setPurchaseToast('Get a brand ValueSkin first'); setTimeout(() => setPurchaseToast(null), 3000); return; }
                                      if (!hasMatch) { setPurchaseToast('No shared ValueSkin with this creator'); setTimeout(() => setPurchaseToast(null), 3000); return; }
                                      setNegotiatingCreator(i); setBrandDealPhase('brief'); setBrandBriefTitle(''); setBrandBriefDeliverables(''); setBrandBudget('4000'); setBrandDealIntent('campaign');
                                    }}
                                    style={{ background: hasMatch ? (creator.featured ? C.primary : C.surfaceAlt) : C.surfaceAlt, border: hasMatch && creator.featured ? 'none' : `1px solid ${hasMatch ? C.border : 'rgba(230,81,0,0.3)'}`, padding: '10px 16px', borderRadius: '8px', color: hasMatch ? '#fff' : '#E65100', fontWeight: '600', cursor: 'pointer', width: '100%', fontSize: '14px', opacity: hasMatch ? 1 : 0.7 }}
                                  >
                                    {noBrandSkin ? 'No ValueSkin' : hasMatch ? 'Send Proposal' : 'No Shared ValueSkin'}
                                  </button>
                                </div>
                              );
                            })()
                          ) : (
                            <div style={{ background: C.surfaceAlt, borderRadius: '10px', padding: '14px', border: `1px solid rgba(230,81,0,0.3)` }}>
                              {/* Deal Room Header */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div>
                                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#E65100', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                    Deal Room
                                  </div>
                                  {brandValueSkin && <div style={{ fontSize:'10px', color:C.textMuted, marginTop:'2px' }}>Your identity: {brandValueSkin}</div>}
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
                                      onClick={() => { setBrandDealPhase('accepted'); setBrandApprovalPhase('accepted'); setPurchaseToast('Deal accepted — review deliverables when creator uploads'); setTimeout(() => setPurchaseToast(null), 3000); }}
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

                                  {brandApprovalPhase === 'accepted' && (
                                    <button
                                      onClick={() => setBrandApprovalPhase('reviewing')}
                                      style={{ width: '100%', background: '#2E7D32', border: 'none', padding: '9px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                                    >
                                      Proceed to Escrow — Review Deliverables
                                    </button>
                                  )}
                                  {brandApprovalPhase === 'reviewing' && (
                                    <div style={{ marginTop:'12px' }}>
                                      <div style={{ fontSize:'11px', fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'10px' }}>Review Creator Deliverables</div>
                                      <div style={{ background:C.bg, borderRadius:'8px', padding:'12px', border:`1px solid ${C.border}`, marginBottom:'10px' }}>
                                        <div style={{ fontSize:'12px', fontWeight:600, color:C.text, marginBottom:'4px' }}>Deliverable: 1x Instagram Reel</div>
                                        <div style={{ fontSize:'11px', color:C.textSecondary, marginBottom:'8px' }}>Submitted 2 hours ago</div>
                                        <div style={{ display:'flex', gap:'6px' }}>
                                          <button style={{ flex:1, background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:'6px', padding:'5px', fontSize:'11px', color:C.text, cursor:'pointer' }}>View File</button>
                                          <button style={{ flex:1, background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:'6px', padding:'5px', fontSize:'11px', color:C.text, cursor:'pointer' }}>Download</button>
                                        </div>
                                      </div>
                                      <div style={{ display:'flex', gap:'8px' }}>
                                        <button
                                          onClick={() => { setBrandApprovalPhase('approved'); setPurchaseToast('Deliverable approved — payment released'); setTimeout(() => setPurchaseToast(null), 3000); }}
                                          style={{ flex:1, background:'#2E7D32', border:'none', padding:'9px', borderRadius:'8px', color:'#fff', fontWeight:600, cursor:'pointer', fontSize:'13px' }}
                                        >
                                          Approve
                                        </button>
                                        <button
                                          onClick={() => { setPurchaseToast('Revision requested — creator notified'); setTimeout(() => setPurchaseToast(null), 3000); }}
                                          style={{ flex:1, background:'none', border:`1px solid ${C.border}`, padding:'9px', borderRadius:'8px', color:C.textSecondary, fontWeight:600, cursor:'pointer', fontSize:'13px' }}
                                        >
                                          Request Revision
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  {brandApprovalPhase === 'approved' && (
                                    <div style={{ textAlign:'center', padding:'12px 0', marginTop:'12px' }}>
                                      <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'rgba(46,125,50,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 8px' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                      </div>
                                      <div style={{ fontSize:'14px', fontWeight:700, color:C.text, marginBottom:'4px' }}>Deal Complete</div>
                                      <div style={{ fontSize:'12px', color:C.textSecondary, marginBottom:'12px' }}>Payment released: ${parseInt(simulatedCounterAmount).toLocaleString()}</div>
                                      <div style={{ display:'flex', gap:'6px' }}>
                                        <button onClick={() => setPurchaseToast('Rating submitted — thank you')} style={{ flex:1, background:C.surfaceAlt, border:`1px solid ${C.border}`, padding:'8px', borderRadius:'8px', color:C.text, fontSize:'12px', cursor:'pointer' }}>Rate Creator</button>
                                        <button onClick={() => { setNegotiatingCreator(null); setBrandDealPhase('brief'); setBrandApprovalPhase('accepted'); }} style={{ flex:1, background:C.primary, border:'none', padding:'8px', borderRadius:'8px', color:'#fff', fontWeight:600, fontSize:'12px', cursor:'pointer' }}>Done</button>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                          {/* Similar Creators */}
                          {adminShowSimilarCreators && results.length > 0 && (
                            <div style={{ marginTop: '8px', padding: '12px 14px', background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px' }}>
                              <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', marginBottom: '8px' }}>Similar Creators</div>
                              <div style={{ fontSize: '11px', color: C.textSecondary, marginBottom: '8px' }}>Based on your most-viewed creator this session:</div>
                              {BRAND_MARKETPLACE_CREATORS.filter((_, idx) => idx !== 0).slice(0, 2).map((c, si) => {
                                const b = PROFESSION_BADGES[c.valueSkin];
                                return (
                                  <div key={si} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderTop: si > 0 ? `1px solid ${C.border}` : 'none' }}>
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name.replace(/\s/g,'')}`} alt={c.name} style={{ width: '32px', height: '32px', borderRadius: '50%', background: C.surfaceAlt }} />
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>{c.name}</div>
                                      <div style={{ fontSize: '10px', color: C.textSecondary }}>{c.valueSkin} · {c.followers} · {c.engagement}</div>
                                    </div>
                                    <span style={{ fontSize: '9px', fontWeight: 700, color: b?.color ?? C.primary, background: `${b?.color ?? C.primary}15`, padding: '2px 6px', borderRadius: '6px' }}>{c.matchScore}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      );
                    })()}
                    </>)}

                    {/* Your Campaigns — always visible below creator list */}
                    <div style={{ marginTop:'24px', paddingTop:'20px', borderTop:`1px solid ${C.border}` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                        <div style={{ fontSize:'12px', fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.6px' }}>Your Campaigns</div>
                        <button onClick={() => setShowCampaignCreator(true)} style={{ background:C.primary, border:'none', borderRadius:'6px', padding:'6px 12px', fontSize:'12px', fontWeight:700, color:'#fff', cursor:'pointer' }}>+ New Campaign</button>
                      </div>
                      {campaigns.length === 0 ? (
                        <div style={{ textAlign:'center', padding:'24px 20px', color:C.textMuted }}>
                          <div style={{ fontSize:'13px', marginBottom:'4px' }}>No campaigns yet</div>
                          <div style={{ fontSize:'11px' }}>Create a campaign to start receiving creator applications.</div>
                        </div>
                      ) : campaigns.map((c,i) => (
                        <div key={i} style={{ background:C.card, borderRadius:'12px', padding:'14px', marginBottom:'10px', border:`1px solid ${C.border}` }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px', flexWrap:'wrap', gap:'4px' }}>
                            <span style={{ fontSize:'13px', fontWeight:700, color:C.text }}>{c.title}</span>
                            <span style={{ fontSize:'12px', fontWeight:700, color:'#2E7D32' }}>${parseInt(c.budget||'0').toLocaleString()}</span>
                          </div>
                          <div style={{ fontSize:'11px', color:C.textSecondary, marginBottom:'8px', lineHeight:1.4 }}>{c.description}</div>
                          <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', marginBottom:'6px' }}>
                            {c.requiredProfessions.map(p => <span key={p} style={{ fontSize:'10px', fontWeight:600, color:C.primary, background:`${C.primary}12`, padding:'2px 7px', borderRadius:'6px', border:`1px solid ${C.primary}30` }}>{p}</span>)}
                          </div>
                          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', fontSize:'10px', color:C.textMuted, marginBottom: c.nonNegotiables?.length ? '6px':'8px' }}>
                            <span>Level: L{c.minLevel||1}{(c.maxLevel && c.maxLevel !== c.minLevel) ? `–L${c.maxLevel}` : ''}</span>
                            {c.location && <span>{c.location}</span>}
                            {c.deliverables && <span>{c.deliverables}</span>}
                          </div>
                          {c.nonNegotiables && c.nonNegotiables.length > 0 && (
                            <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', marginBottom:'8px' }}>
                              {c.nonNegotiables.map(n=><span key={n} style={{ fontSize:'10px', color:'#ef4444', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', padding:'2px 7px', borderRadius:'6px' }}>{n}</span>)}
                            </div>
                          )}
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <span style={{ fontSize:'10px', color:C.textMuted }}>{c.applicants} applicant{c.applicants!==1?'s':''}{c.deadline?` · Deadline ${c.deadline}`:''}</span>
                            <span style={{ fontSize:'10px', fontWeight:700, color:c.status==='expired'?'#ef4444':c.status==='open'?'#2E7D32':'#888', background:c.status==='expired'?'rgba(239,68,68,0.1)':c.status==='open'?'rgba(46,125,50,0.1)':'rgba(136,136,136,0.1)', padding:'2px 8px', borderRadius:'6px', textTransform:'uppercase' }}>{c.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Applications Received — always visible below campaigns */}
                    <div style={{ marginTop:'20px', paddingTop:'20px', borderTop:`1px solid ${C.border}` }}>
                      <div style={{ fontSize:'12px', fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'14px' }}>Applications Received</div>
                      {sharedApplications.filter(a => campaigns.some(c => c.id===a.campaignId)).length === 0 ? (
                        <div style={{ textAlign:'center', padding:'24px 20px', color:C.textMuted }}>
                          <div style={{ fontSize:'13px', marginBottom:'4px' }}>No applications yet</div>
                          <div style={{ fontSize:'11px' }}>Creators will appear here once they apply to your campaigns.</div>
                        </div>
                      ) : sharedApplications.filter(a=>campaigns.some(c=>c.id===a.campaignId)).map((app,i) => {
                        const camp = campaigns.find(c=>c.id===app.campaignId);
                        return (
                          <div key={i} style={{ background:C.card, borderRadius:'12px', padding:'14px', marginBottom:'10px', border:`1px solid ${app.status==='accepted'?'rgba(46,125,50,0.3)':C.border}` }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                              <span style={{ fontSize:'13px', fontWeight:700, color:C.text }}>{app.creatorHandle} ({app.creatorProfession})</span>
                              <span style={{ fontSize:'10px', fontWeight:700, color:app.status==='pending'?'#f59e0b':app.status==='accepted'?'#2E7D32':'#ef4444', background:app.status==='pending'?'rgba(245,158,11,0.1)':app.status==='accepted'?'rgba(46,125,50,0.1)':'rgba(239,68,68,0.1)', padding:'2px 8px', borderRadius:'6px', textTransform:'uppercase' }}>{app.status}</span>
                            </div>
                            <div style={{ fontSize:'11px', color:C.textSecondary, marginBottom:'8px' }}>Campaign: {camp?.title} · Applied {app.appliedAt}</div>
                            {app.status === 'accepted' && <div style={{ fontSize:'11px', color:'#2E7D32', marginBottom:'8px' }}>Creator has been notified and can now enter negotiation.</div>}
                            {app.status === 'pending' && (
                              <div style={{ display:'flex', gap:'6px' }}>
                                <button onClick={() => { persistApplications(sharedApplications.map(a=>a.id===app.id?{...a,status:'accepted' as const}:a)); setPurchaseToast('Accepted — creator can now enter negotiation'); setTimeout(()=>setPurchaseToast(null),3000); }} style={{ flex:1, background:'#2E7D32', border:'none', borderRadius:'6px', padding:'7px', fontSize:'12px', fontWeight:600, color:'#fff', cursor:'pointer' }}>Accept</button>
                                <button onClick={() => { persistApplications(sharedApplications.map(a=>a.id===app.id?{...a,status:'rejected' as const}:a)); setPurchaseToast('Application declined'); setTimeout(()=>setPurchaseToast(null),3000); }} style={{ flex:1, background:'none', border:`1px solid ${C.border}`, borderRadius:'6px', padding:'7px', fontSize:'12px', fontWeight:600, color:C.textSecondary, cursor:'pointer' }}>Decline</button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
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
                    {/* DISCOVER TAB — only show communities matching user's ValuSkins */}
                    {communitiesTab === 'discover' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(() => {
                          const userProfessions = Object.values(valueSkins).filter(Boolean).map(s => s!.profession);
                          const filtered = MOCK_COMMUNITIES.filter(comm =>
                            comm.gateType === 'any_valueskin' ||
                            comm.allowedProfessions.some(p => userProfessions.includes(p))
                          );
                          if (!hasValueSkin) return (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: C.textMuted }}>
                              <div style={{ fontSize: '14px', marginBottom: '8px' }}>Get a ValuSkin to discover communities</div>
                              <div style={{ fontSize: '12px' }}>Communities are matched to your profession</div>
                            </div>
                          );
                          if (filtered.length === 0) return (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: C.textMuted }}>
                              <div style={{ fontSize: '14px', marginBottom: '8px' }}>No communities match your ValuSkins yet</div>
                              <div style={{ fontSize: '12px' }}>Communities for {userProfessions.join(', ')} will appear here</div>
                            </div>
                          );
                          return filtered.map((comm) => {
                          const canJoin = true;
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
                                    {comm.visibility === 'public' ? 'Public' : 'Private'}
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
                                  {comm.acceptedLevels && !(comm.acceptedLevels.length === 5 && comm.acceptedLevels.includes(1)) && (
                                    <span style={{ fontSize: '10px', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', padding: '2px 6px', borderRadius: '4px' }}>
                                      L{Math.min(...comm.acceptedLevels)}{comm.acceptedLevels.length > 1 ? `–L${Math.max(...comm.acceptedLevels)}` : ''} required
                                    </span>
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
                                ) : null}
                              </div>
                            </div>
                          );
                        });
                        })()}
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
                                    {v === 'public' ? 'Public' : 'Private'}
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
                              <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, marginBottom: '8px' }}>Accepted ValuSkin Levels</div>
                              <div style={{ fontSize: '10px', color: C.textSecondary, marginBottom: '8px' }}>Choose which levels can join. Select one or many.</div>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {[1, 2, 3, 4, 5].map(lvl => {
                                  const active = newCommAcceptedLevels.includes(lvl);
                                  return (
                                    <button key={lvl}
                                      onClick={() => setNewCommAcceptedLevels(prev => active ? prev.filter(l => l !== lvl) : [...prev, lvl].sort())}
                                      style={{
                                        flex: 1, padding: '8px 4px', borderRadius: '6px',
                                        border: `1px solid ${active ? '#8b5cf6' : C.border}`,
                                        background: active ? 'rgba(139,92,246,0.15)' : C.surface,
                                        color: active ? '#8b5cf6' : C.textSecondary,
                                        fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                                      }}
                                    >L{lvl}</button>
                                  );
                                })}
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
                                  setPurchaseToast('Community created');
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
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill={likedCommunityPosts.includes(post.id) ? '#e74c3c' : 'none'} stroke={likedCommunityPosts.includes(post.id) ? '#e74c3c' : 'currentColor'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> {post.likes + (likedCommunityPosts.includes(post.id) ? 1 : 0)}
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
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
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
                      setPurchaseToast('Pricing updated');
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
                  {savedSafetyToast ? 'Safety settings saved' : 'Save Safety Settings'}
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

              {/* ── FEATURE FLAGS ───────────────────────────────── */}
              <div style={{ padding: '20px', borderTop: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>Feature Flags</div>
                  </div>
                  <span style={{ fontSize: '10px', color: C.textMuted }}>Toggle any feature platform-wide</span>
                </div>
                <div style={{ fontSize: '11px', color: C.textSecondary, marginBottom: '16px' }}>
                  All features are on by default. Turn off to hide from all creators and brands instantly.
                </div>

                {([
                  { label: 'Rate Card', desc: 'Per-format pricing (Reel/Story/Post) visible on creator cards', value: adminShowRateCard, set: setAdminShowRateCard },
                  { label: 'Availability Calendar', desc: 'Creator "available from" date shown on cards and in search', value: adminShowAvailabilityCalendar, set: setAdminShowAvailabilityCalendar },
                  { label: 'Portfolio Samples', desc: 'Past brand work visible on creator cards', value: adminShowPortfolio, set: setAdminShowPortfolio },
                  { label: 'Deal Completion Rate', desc: 'Creator % of started deals finished — penalises ghosting', value: adminShowDealCompletion, set: setAdminShowDealCompletion },
                  { label: 'Verified Income Tier', desc: 'Trust badge showing lifetime earnings tier ($10K+, $50K+, etc)', value: adminShowIncomeTier, set: setAdminShowIncomeTier },
                  { label: 'First-Deal Badge', desc: 'Badge shown on creators open to discounted first collaboration', value: adminShowFirstDealBadge, set: setAdminShowFirstDealBadge },
                  { label: 'Exclusivity Slot Signal', desc: 'Shows "Slot taken until [date]" when creator is exclusive with a brand', value: adminShowExclusivitySignal, set: setAdminShowExclusivitySignal },
                  { label: 'Revision Limit Display', desc: 'Number of revisions included shown upfront on creator cards', value: adminShowRevisionLimit, set: setAdminShowRevisionLimit },
                  { label: 'Usage Rights Duration', desc: 'Days of usage rights shown before deal accepted', value: adminShowUsageRightsDuration, set: setAdminShowUsageRightsDuration },
                  { label: 'Brand Track Record', desc: 'Brand deals completed + avg payment time + creator ratings of brand', value: adminShowBrandTrackRecord, set: setAdminShowBrandTrackRecord },
                  { label: 'Mutual Rating System', desc: 'Both parties rate each other after deal close', value: adminShowMutualRating, set: setAdminShowMutualRating },
                  { label: 'Deal Templates', desc: 'Brands can save and reuse campaign brief templates', value: adminShowDealTemplates, set: setAdminShowDealTemplates },
                  { label: 'Saved Searches', desc: 'Brands get notified when a matching creator joins', value: adminShowSavedSearches, set: setAdminShowSavedSearches },
                  { label: 'Similar Creators', desc: 'Suggest creators similar to ones a brand already worked with', value: adminShowSimilarCreators, set: setAdminShowSimilarCreators },
                  { label: 'Long-Term Contracts', desc: 'Multi-month ambassador deals with recurring escrow milestones', value: adminAllowLongTermContracts, set: setAdminAllowLongTermContracts },
                ] as const).map(({ label, desc, value, set }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderTop: `1px solid ${C.border}` }}>
                    <div style={{ flex: 1, paddingRight: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: value ? C.text : C.textMuted }}>{label}</div>
                      <div style={{ fontSize: '10px', color: C.textMuted, marginTop: '1px' }}>{desc}</div>
                    </div>
                    <button onClick={() => set((p: boolean) => !p)}
                      style={{ width: '40px', height: '22px', borderRadius: '11px', border: 'none', backgroundColor: value ? C.primary : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background-color 0.2s' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: '2px', left: value ? '20px' : '2px', transition: 'left 0.2s' }} />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => { setAdminSavedFeaturesTab(true); setTimeout(() => setAdminSavedFeaturesTab(false), 3000); }}
                  style={{ width: '100%', marginTop: '16px', padding: '11px', background: C.primary, border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  {adminSavedFeaturesTab ? 'Feature flags saved' : 'Save Feature Flags'}
                </button>
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

                {/* Brand Settings — only shown when logged in as brand */}
                {marketplaceRole === 'brand' && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>Brand Settings</div>
                    <div style={{ background: C.card, border: `1px solid rgba(230,81,0,0.25)`, borderRadius: '12px', padding: '14px 16px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: C.text, marginBottom: '2px' }}>Brand Identity</div>
                      <div style={{ fontSize: '12px', color: C.textSecondary, marginBottom: '12px' }}>Your ValueSkin determines which creators you can contact. Only creators with the same profession will see your proposals.</div>
                      {brandValueSkin ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(230,81,0,0.06)', borderRadius: '8px', padding: '10px 12px' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>{brandValueSkin}</div>
                            <div style={{ fontSize: '11px', color: C.textSecondary }}>Active brand ValueSkin</div>
                          </div>
                          <button onClick={() => setShowBrandStoreModal(true)} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: '6px', padding: '5px 10px', fontSize: '11px', color: C.textSecondary, cursor: 'pointer' }}>Change</button>
                        </div>
                      ) : (
                        <button onClick={() => setShowBrandStoreModal(true)} style={{ width: '100%', background: '#E65100', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                          Get Brand ValueSkin
                        </button>
                      )}
                    </div>
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: C.text, marginBottom: '8px' }}>Campaign Budget</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: C.textMuted }}>Default budget ($)</span>
                        <input
                          type="text"
                          value={brandBudget}
                          onChange={e => setBrandBudget(e.target.value.replace(/[^0-9]/g, ''))}
                          style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, padding: '6px 10px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', width: '100px' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

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

                {/* Availability */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: C.textMuted, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Availability
                  </div>
                  <div style={{ fontSize: '11px', color: C.textSecondary, marginBottom: '12px', lineHeight: 1.4 }}>
                    You are assumed available for deals at all times. Set dates below only if you are taking a break.
                  </div>
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', marginBottom: '10px' }}>Not available from</div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '10px', color: C.textMuted, marginBottom: '4px' }}>From</div>
                        <input type="date" value={notAvailableFrom} onChange={e => setNotAvailableFrom(e.target.value)}
                          style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, padding: '8px 10px', fontSize: '12px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '10px', color: C.textMuted, marginBottom: '4px' }}>To</div>
                        <input type="date" value={notAvailableTo} onChange={e => setNotAvailableTo(e.target.value)}
                          style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, padding: '8px 10px', fontSize: '12px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const }} />
                      </div>
                    </div>
                    {(notAvailableFrom || notAvailableTo) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '11px', color: '#f59e0b' }}>
                          You will appear as unavailable during this period.
                        </div>
                        <button onClick={() => { setNotAvailableFrom(''); setNotAvailableTo(''); }}
                          style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: '6px', padding: '4px 10px', fontSize: '10px', color: C.textSecondary, cursor: 'pointer' }}>
                          Clear
                        </button>
                      </div>
                    )}
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
                              {['Paid','Gifted Product','Equity','Barter','Revenue Share','Ambassador','Licensing'].map(d => {
                                const active = profileDealTypes.includes(d);
                                return (
                                  <span key={d} onClick={() => setProfileDealTypes(prev => active ? prev.filter(x => x !== d) : [...prev, d])}
                                    style={{ padding: '4px 10px', borderRadius: '10px', fontSize: '11px',
                                      background: active ? `${C.primary}20` : C.bg,
                                      border: `1px solid ${active ? C.primary : C.border}`,
                                      color: active ? C.primary : C.textSecondary,
                                      cursor: 'pointer', fontWeight: active ? 600 : 400,
                                      transition: 'all 0.15s',
                                    }}>{d}</span>
                                );
                              })}
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <div><div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>Min Deal (USD)</div><input type="number" placeholder="500" style={{ width: '100%', padding: '7px 9px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '7px', color: C.text, fontSize: '12px', boxSizing: 'border-box' as const }} /></div>
                            <div><div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>Response Time (hrs)</div><input type="number" placeholder="24" style={{ width: '100%', padding: '7px 9px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '7px', color: C.text, fontSize: '12px', boxSizing: 'border-box' as const }} /></div>
                          </div>
                          {([['Open to exclusivity', profileExclusivity, (v: boolean) => setProfileExclusivity(v)] as const,
                            ['Willing to sign NDA', profileNda, (v: boolean) => setProfileNda(v)] as const,
                            ['Grant usage rights', profileUsageRights, (v: boolean) => setProfileUsageRights(v)] as const,
                            ['On-camera willing', profileOnCamera, (v: boolean) => setProfileOnCamera(v)] as const,
                          ]).map(([lbl, val, setter]) => (
                            <div key={lbl} onClick={() => setter(!val)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderTop: `1px solid ${C.border}`, cursor: 'pointer' }}>
                              <span style={{ fontSize: '12px', color: C.text }}>{lbl}</span>
                              <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: val ? C.primary : C.border, position: 'relative', transition: 'background 0.2s' }}>
                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: val ? '18px' : '2px', transition: 'left 0.2s' }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ── SKIN SHOWCASE ─────────────────────────── */}
                {(() => {
                  const open = creatorSettingsOpen === ('showcase' as any);
                  const ownedSkinsList = Object.entries(valueSkins).filter(([, v]) => v?.profession).map(([, v]) => v!.profession);
                  return (
                    <div style={{ marginBottom: '16px' }}>
                      <button onClick={() => setCreatorSettingsOpen(open ? null : 'showcase' as any)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: open ? '10px 10px 0 0' : '10px', padding: '12px 14px', cursor: 'pointer', color: C.text }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: C.textMuted }}>Skin Showcase</span>
                          {creatorSkinMode === 'showcase' && <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff', background: '#8b5cf6', padding: '1px 6px', borderRadius: '8px' }}>LIVE</span>}
                        </div>
                        <span style={{ fontSize: '14px', color: C.textMuted }}>{open ? '▲' : '▼'}</span>
                      </button>
                      {open && (
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '14px' }}>
                          <div style={{ fontSize: '11px', color: C.textSecondary, marginBottom: '10px', lineHeight: 1.5 }}>
                            When showcase mode is on, brands see your video pitch and bio when they click your ValuSkin on your profile.
                          </div>

                          {/* Mode toggle */}
                          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                            <button onClick={() => setCreatorSkinMode('static')} style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: creatorSkinMode === 'static' ? C.primary : C.bg, color: creatorSkinMode === 'static' ? '#fff' : C.textSecondary, border: `1px solid ${creatorSkinMode === 'static' ? C.primary : C.border}` }}>Static</button>
                            <button onClick={() => setCreatorSkinMode('showcase')} style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: creatorSkinMode === 'showcase' ? '#8b5cf6' : C.bg, color: creatorSkinMode === 'showcase' ? '#fff' : C.textSecondary, border: `1px solid ${creatorSkinMode === 'showcase' ? '#8b5cf6' : C.border}` }}>Showcase</button>
                          </div>

                          {creatorSkinMode === 'showcase' && (
                            <>
                              {/* Current showcase preview */}
                              {creatorPitchVideoUrl && (
                                <div style={{ marginBottom: '10px' }}>
                                  <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>Video Pitch</div>
                                  <video src={creatorPitchVideoUrl} controls style={{ width: '100%', borderRadius: '8px', maxHeight: '160px', background: '#000' }} />
                                  <div style={{ fontSize: '10px', color: C.textMuted, marginTop: '4px' }}>{creatorPitchVideoName}</div>
                                </div>
                              )}
                              {creatorPitchText && (
                                <div style={{ marginBottom: '10px' }}>
                                  <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>Written Pitch</div>
                                  <div style={{ padding: '8px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', fontSize: '12px', color: C.text, lineHeight: 1.5 }}>
                                    {creatorPitchText}
                                  </div>
                                </div>
                              )}

                              {/* Add/edit button */}
                              <button onClick={() => setShowSkinShowcaseModal(ownedSkinsList[0] ?? 'showcase')} style={{ width: '100%', padding: '10px', background: C.bg, border: `1px dashed ${C.border}`, borderRadius: '8px', color: C.textSecondary, fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                                {creatorPitchVideoUrl || creatorPitchText ? 'Edit video pitch & bio' : '+ Add video pitch & bio'}
                              </button>
                            </>
                          )}
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

                {/* ── RATE CARD ──────────────────────────────────── */}
                {adminShowRateCard && (() => {
                  const open = creatorSettingsOpen === ('ratecard' as any);
                  return (
                    <div style={{ marginBottom: '16px' }}>
                      <button onClick={() => setCreatorSettingsOpen(open ? null : 'ratecard' as any)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: open ? '10px 10px 0 0' : '10px', padding: '12px 14px', cursor: 'pointer', color: C.text }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: C.textMuted }}>Rate Card</span>
                        <span style={{ fontSize: '14px', color: C.textMuted }}>{open ? '▲' : '▼'}</span>
                      </button>
                      {open && (
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '14px' }}>
                          <div style={{ fontSize: '10px', color: C.textSecondary, marginBottom: '10px' }}>Set your price per content format. These are shown to brands before they send a proposal.</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                            {(Object.keys(rateCard) as Array<keyof typeof rateCard>).map(fmt => (
                              <div key={fmt}>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'capitalize' }}>{fmt}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <span style={{ color: C.textSecondary, fontSize: '12px' }}>$</span>
                                  <input type="number" value={rateCard[fmt]} onChange={e => setRateCard(prev => ({ ...prev, [fmt]: e.target.value }))}
                                    style={{ width: '100%', padding: '6px 7px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '7px', color: C.text, fontSize: '12px', boxSizing: 'border-box' as const }} />
                                </div>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>
                              <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>Contract Mode</div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {(['one-off', 'long-term', 'both'] as const).map(m => (
                                  <button key={m} onClick={() => setContractMode(m)} style={{ flex: 1, padding: '5px 3px', borderRadius: '6px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                                    background: contractMode === m ? `${C.primary}20` : C.bg, color: contractMode === m ? C.primary : C.textSecondary, border: `1px solid ${contractMode === m ? C.primary : C.border}` }}>{m}</button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>Max Active Deals</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <button onClick={() => setCreatorMaxActiveDeals(Math.max(1, creatorMaxActiveDeals - 1))} style={{ width: '24px', height: '24px', borderRadius: '4px', border: `1px solid ${C.border}`, background: C.bg, color: C.text, cursor: 'pointer', fontWeight: 700 }}>−</button>
                                <span style={{ fontSize: '14px', fontWeight: 800, color: C.primary, minWidth: '20px', textAlign: 'center' }}>{creatorMaxActiveDeals}</span>
                                <button onClick={() => setCreatorMaxActiveDeals(Math.min(20, creatorMaxActiveDeals + 1))} style={{ width: '24px', height: '24px', borderRadius: '4px', border: `1px solid ${C.border}`, background: C.bg, color: C.text, cursor: 'pointer', fontWeight: 700 }}>+</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ── AVAILABILITY CALENDAR ──────────────────────── */}
                {adminShowAvailabilityCalendar && (() => {
                  const open = creatorSettingsOpen === ('availability' as any);
                  return (
                    <div style={{ marginBottom: '16px' }}>
                      <button onClick={() => setCreatorSettingsOpen(open ? null : 'availability' as any)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: open ? '10px 10px 0 0' : '10px', padding: '12px 14px', cursor: 'pointer', color: C.text }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: C.textMuted }}>Availability Calendar</span>
                        <span style={{ fontSize: '14px', color: C.textMuted }}>{open ? '▲' : '▼'}</span>
                      </button>
                      {open && (
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '14px' }}>
                          <div style={{ marginBottom: '10px' }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>Available for new deals from</div>
                            <input type="date" value={creatorAvailableFrom} onChange={e => setCreatorAvailableFrom(e.target.value)}
                              style={{ width: '100%', padding: '7px 9px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '7px', color: C.text, fontSize: '12px', boxSizing: 'border-box' as const }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: `1px solid ${C.border}` }}>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>Open to first-deal (discounted collab)</div>
                              <div style={{ fontSize: '10px', color: C.textSecondary }}>Badge shown to brands — signals you'll do a discounted first collab to build your record</div>
                            </div>
                            <button onClick={() => setIsFirstDealOpen(p => !p)} style={{ width: '40px', height: '22px', borderRadius: '11px', border: 'none', backgroundColor: isFirstDealOpen ? C.primary : 'rgba(255,255,255,0.12)', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background-color 0.2s' }}>
                              <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: '2px', left: isFirstDealOpen ? '20px' : '2px', transition: 'left 0.2s' }} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ── DEAL STRUCTURE DEFAULTS ────────────────────── */}
                {(() => {
                  const open = creatorSettingsOpen === ('dealstructure' as any);
                  return (
                    <div style={{ marginBottom: '16px' }}>
                      <button onClick={() => setCreatorSettingsOpen(open ? null : 'dealstructure' as any)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: open ? '10px 10px 0 0' : '10px', padding: '12px 14px', cursor: 'pointer', color: C.text }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: C.textMuted }}>Deal Structure Defaults</span>
                        <span style={{ fontSize: '14px', color: C.textMuted }}>{open ? '▲' : '▼'}</span>
                      </button>
                      {open && (
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '14px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <div>
                              <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>Revision Limit</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <button onClick={() => setRevisionLimit(Math.max(0, revisionLimit - 1))} style={{ width: '24px', height: '24px', borderRadius: '4px', border: `1px solid ${C.border}`, background: C.bg, color: C.text, cursor: 'pointer', fontWeight: 700 }}>−</button>
                                <span style={{ fontSize: '14px', fontWeight: 800, color: C.primary, minWidth: '20px', textAlign: 'center' }}>{revisionLimit}</span>
                                <button onClick={() => setRevisionLimit(Math.min(10, revisionLimit + 1))} style={{ width: '24px', height: '24px', borderRadius: '4px', border: `1px solid ${C.border}`, background: C.bg, color: C.text, cursor: 'pointer', fontWeight: 700 }}>+</button>
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>Usage Rights (days)</div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {[30, 60, 90, 180].map(d => (
                                  <button key={d} onClick={() => setUsageRightsDays(d)} style={{ flex: 1, padding: '5px 2px', borderRadius: '5px', fontSize: '10px', fontWeight: 600, cursor: 'pointer',
                                    background: usageRightsDays === d ? `${C.primary}20` : C.bg, color: usageRightsDays === d ? C.primary : C.textMuted, border: `1px solid ${usageRightsDays === d ? C.primary : C.border}` }}>{d}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>Exclusivity locked until</div>
                            <input type="date" value={exclusivityUntil} onChange={e => setExclusivityUntil(e.target.value)} placeholder="Leave blank if not exclusive"
                              style={{ width: '100%', padding: '7px 9px', background: C.bg, border: `1px solid ${exclusivityUntil ? '#ef4444' : C.border}`, borderRadius: '7px', color: C.text, fontSize: '12px', boxSizing: 'border-box' as const }} />
                            {exclusivityUntil && <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '3px' }}>Brands will see &quot;Exclusivity taken until {exclusivityUntil}&quot;</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

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
                    const hasDealPrefs = profileDealTypes.length > 0;
                    const hasCredential = false;
                    const hasTestimonial = false;
                    const hasBarterPref = true;
                    const hasEnergy = Boolean(creatorEnergy);
                    const score =
                      (hasAvatar ? 15 : 0) + (hasBio ? 15 : 0) + (hasValueSkin ? 20 : 0) +
                      (hasDealPrefs ? 10 : 0) + (hasCredential ? 15 : 0) + (hasTestimonial ? 15 : 0) +
                      (hasBarterPref ? 5 : 0) + (hasEnergy ? 5 : 0);
                    const tier = score >= 90 ? 'Elite' : score >= 70 ? 'Established' : score >= 40 ? 'Developing' : 'Incomplete';
                    const tierColor = score >= 90 ? '#f59e0b' : score >= 70 ? '#22c55e' : score >= 40 ? C.primary : '#ef4444';
                    const items = [
                      { label: 'Avatar', done: hasAvatar, pts: 15 },
                      { label: 'Bio', done: hasBio, pts: 15 },
                      { label: 'ValueSkin', done: hasValueSkin, pts: 20 },
                      { label: 'Deal Preferences', done: hasDealPrefs, pts: 10 },
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
                              <div style={{ fontSize: '14px', marginBottom: '2px' }}>{done ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,7 5.5,10.5 12,3.5"/></svg> : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={C.textMuted} strokeWidth="1.5"><circle cx="7" cy="7" r="5.5"/></svg>}</div>
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
                      { label: 'Download My Data', sub: 'Export all your data in JSON format', action: () => alert('Data export initiated — you will receive an email with download link within 24 hours'), color: C.primary, icon: 'DL' },
                      { label: 'Request Data Deletion', sub: 'Permanently erase your account (GDPR Art. 17) — 30 day process', action: () => alert('Data deletion request submitted.\n\nYour account will be anonymized within 30 days as required by GDPR.\nYou can cancel this request within 24 hours.'), color: '#ef4444', icon: 'DEL' },
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
            setPurchaseToast(`${SLOT_LABELS[slot]} ValueSkin hidden from marketplace`);
            setTimeout(() => setPurchaseToast(null), 3000);
          }}
          onUnhide={(slot) => {
            setHiddenSkins(prev => {
              const next = new Set(prev);
              next.delete(slot);
              return next;
            });
            setPurchaseToast(`${SLOT_LABELS[slot]} ValueSkin restored to marketplace`);
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
            setPurchaseToast(`${SLOT_LABELS[slot]} ValueSkin permanently deleted`);
            setTimeout(() => setPurchaseToast(null), 3000);
          }}
        />
      )}

      {/* Mobile Bottom Tab Bar */}
      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
          background: C.surface, borderTop: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'stretch',
        }}>
          {([
            { label: 'Profile', view: 'profile' as const },
            { label: 'Market', view: 'mim' as const },
            { label: 'Store', view: 'store' as const },
            { label: 'Community', view: 'communities' as const },
            { label: 'Settings', view: 'settings' as const },
          ]).map(({ label, view }) => (
            <button
              key={view}
              onClick={() => {
                if (view === 'mim') { setMarketplaceRole('none'); }
                if (view === 'communities') { setActiveCommunity(null); }
                setActiveView(view);
              }}
              style={{
                flex: 1, minHeight: '44px', background: 'none', border: 'none',
                color: activeView === view ? C.primary : C.textMuted,
                fontSize: '10px', fontWeight: activeView === view ? 700 : 500,
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '2px',
                padding: '6px 2px',
              }}
            >
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: activeView === view ? C.primary : 'transparent' }} />
              {label}
            </button>
          ))}
        </div>
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
              <div style={{ fontSize: '11px', color: C.textMuted }}>{isHidden ? 'Hidden' : 'Visible'}</div>
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
            {isHidden ? 'Restore visibility' : 'Hide temporarily'}
            <span style={{ fontSize: '12px', color: C.textMuted }}>
              {isHidden ? '(Appears in profile)' : '(Hidden from discovery)'}
            </span>
          </button>

          {/* Delete button */}
          <button
            onClick={() => {
              if (window.confirm('Permanently delete this ValueSkin? This cannot be undone and no refund will be issued.')) {
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
            Delete permanently
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
      <div style={{ background: C.surface, borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '95vw', maxHeight: '90vh', overflowY: 'auto', position: 'relative', border: `1px solid ${C.border}` }}>
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
