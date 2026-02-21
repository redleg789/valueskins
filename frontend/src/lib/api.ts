const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

// Base HTTP client — handles token management and HTTP requests
class HttpClient {
    private token: string | null = null;

    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('valueskins_token', token);
        }
    }

    getToken(): string | null {
        if (this.token) return this.token;
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('valueskins_token');
        }
        return this.token;
    }

    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('valueskins_token');
            localStorage.removeItem('valueskins_user');
        }
    }

    async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers as Record<string, string>,
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                return { error: errorData.error || `HTTP ${response.status}` };
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            return { error: error instanceof Error ? error.message : 'Network error' };
        }
    }
}

// Auth API client — authenticates via Instagram access token
class AuthClient {
    constructor(private http: HttpClient) {}

    async login(accessToken: string, role: 'creator' | 'brand') {
        const result = await this.http.request<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ access_token: accessToken, role }),
        });
        if (result.data?.token) {
            this.http.setToken(result.data.token);
            if (typeof window !== 'undefined') {
                localStorage.setItem('valueskins_user', JSON.stringify(result.data.user));
            }
        }
        return result;
    }

    async logout() {
        this.http.clearToken();
    }

    isAuthenticated(): boolean {
        return !!this.http.getToken();
    }

    getUser(): UserProfile | null {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem('valueskins_user');
        if (!stored) return null;
        try { return JSON.parse(stored); } catch { return null; }
    }
}

// Health & System API client
class SystemClient {
    constructor(private http: HttpClient) {}

    async health() {
        return this.http.request<{ status: string; service: string }>('/health');
    }
}

// Persona API client
class PersonaClient {
    constructor(private http: HttpClient) {}

    async getPersonas(limit = 20, offset = 0) {
        return this.http.request<Persona[]>(`/personas?limit=${limit}&offset=${offset}`);
    }

    async getPersona(id: number) {
        return this.http.request<Persona>(`/personas/${id}`);
    }

    async getPersonaSkins(personaId: number) {
        return this.http.request<Skin[]>(`/personas/${personaId}/skins`);
    }

    async getMyProfile() {
        return this.http.request<CreatorProfile>('/personas/me/profile');
    }
}

// Social API client
class SocialClient {
    constructor(private http: HttpClient) {}

    async createPost(authorPersonaId: number, content: string, mediaUrls?: string[]) {
        return this.http.request<{ id: string }>('/social/posts', {
            method: 'POST',
            body: JSON.stringify({ author_persona_id: authorPersonaId, content, media_urls: mediaUrls }),
        });
    }
}

// Analytics API client
class AnalyticsClient {
    constructor(private http: HttpClient) {}

    async logEvent(eventType: string, eventData: Record<string, unknown>) {
        return this.http.request('/analytics/events', {
            method: 'POST',
            body: JSON.stringify({ event_type: eventType, event_data: eventData }),
        });
    }
}

// Referral API client
class ReferralClient {
    constructor(private http: HttpClient) {}

    async createReferralCode(personaId: number, code: string) {
        return this.http.request<{ code: string }>('/referrals/codes', {
            method: 'POST',
            body: JSON.stringify({ persona_id: personaId, code }),
        });
    }

    async getReferralStats(personaId: number) {
        return this.http.request<ReferralStats>(`/referrals/stats/${personaId}`);
    }

    async getReferralLeaderboard(limit = 10) {
        return this.http.request<LeaderboardEntry[]>(`/referrals/leaderboard?limit=${limit}`);
    }

    async validateReferralCode(code: string) {
        return this.http.request<{ valid: boolean; persona_id?: number }>(`/referrals/validate/${code}`);
    }
}

// Waitlist API client
class WaitlistClient {
    constructor(private http: HttpClient) {}

    async joinWaitlist(data: WaitlistSignup) {
        return this.http.request<{ position: number; referral_code: string }>('/waitlist/join', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getWaitlistPosition(email: string) {
        return this.http.request<{ position: number }>(`/waitlist/position?email=${encodeURIComponent(email)}`);
    }
}

// Marketplace API client — calls real backend endpoints
class MarketplaceClient {
    constructor(private http: HttpClient) {}

    async getOpportunities(filters?: OpportunityFilters) {
        const params = new URLSearchParams();
        if (filters?.professionId) params.append('profession_id', filters.professionId.toString());
        if (filters?.minLevel) params.append('min_level', filters.minLevel.toString());
        if (filters?.maxLevel) params.append('max_level', filters.maxLevel.toString());
        if (filters?.category) params.append('category', filters.category);
        if (filters?.status) params.append('status', filters.status);

        const queryStr = params.toString();
        const endpoint = queryStr ? `/marketplace/opportunities?${queryStr}` : '/marketplace/opportunities';
        return this.http.request<{ opportunities: MarketplaceOpportunity[]; count: number }>(endpoint);
    }

    async getOpportunityDetails(opportunityId: number) {
        return this.http.request<MarketplaceOpportunity>(`/marketplace/opportunities/${opportunityId}`);
    }

    async applyToOpportunity(opportunityId: number, personaId: number, pitch: string) {
        return this.http.request<{ application_id: number }>('/marketplace/applications', {
            method: 'POST',
            body: JSON.stringify({ opportunity_id: opportunityId, persona_id: personaId, pitch }),
        });
    }

    async getMyApplications() {
        return this.http.request<{ applications: Application[] }>('/marketplace/applications/mine');
    }

    async getStats() {
        return this.http.request<MarketplaceStats>('/marketplace/stats');
    }

    async getMyDeals() {
        return this.http.request<{ deals: CreatorDeal[] }>('/marketplace/deals/mine');
    }

    async submitDeliverable(dealId: number, deliverableId: number, contentUrl: string) {
        return this.http.request('/marketplace/deliverables/submit', {
            method: 'POST',
            body: JSON.stringify({ deal_id: dealId, deliverable_id: deliverableId, content_url: contentUrl }),
        });
    }
}

// Brand API client — brand dashboard and opportunity management
class BrandClient {
    constructor(private http: HttpClient) {}

    async createOpportunity(data: CreateOpportunityData) {
        return this.http.request<{ opportunity_id: number }>('/marketplace/opportunities', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getOpportunityApplications(opportunityId: number) {
        return this.http.request<{ applications: Application[] }>(`/brands/opportunities/${opportunityId}/applications`);
    }

    async acceptApplication(opportunityId: number, personaId: number) {
        return this.http.request('/brands/applications/accept', {
            method: 'POST',
            body: JSON.stringify({ opportunity_id: opportunityId, persona_id: personaId }),
        });
    }

    async completeDeal(opportunityId: number) {
        return this.http.request('/brands/deals/complete', {
            method: 'POST',
            body: JSON.stringify({ opportunity_id: opportunityId }),
        });
    }
}

// AI Scoring API client
class ScoringClient {
    constructor(private http: HttpClient) {}

    async getScore(input: ScoringInput) {
        return this.http.request<ScoringResult>('/ai/score', {
            method: 'POST',
            body: JSON.stringify(input),
        });
    }
}

// Facade: Composite API client
class ApiClient {
    private http: HttpClient;

    readonly auth: AuthClient;
    readonly system: SystemClient;
    readonly persona: PersonaClient;
    readonly social: SocialClient;
    readonly analytics: AnalyticsClient;
    readonly referral: ReferralClient;
    readonly waitlist: WaitlistClient;
    readonly marketplace: MarketplaceClient;
    readonly brand: BrandClient;
    readonly scoring: ScoringClient;

    constructor() {
        this.http = new HttpClient();

        this.auth = new AuthClient(this.http);
        this.system = new SystemClient(this.http);
        this.persona = new PersonaClient(this.http);
        this.social = new SocialClient(this.http);
        this.analytics = new AnalyticsClient(this.http);
        this.referral = new ReferralClient(this.http);
        this.waitlist = new WaitlistClient(this.http);
        this.marketplace = new MarketplaceClient(this.http);
        this.brand = new BrandClient(this.http);
        this.scoring = new ScoringClient(this.http);
    }
}

// ============ TYPES ============

export interface LoginResponse {
    token: string;
    user: UserProfile;
}

export interface UserProfile {
    id: number;
    instagram_user_id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    role: 'creator' | 'brand';
    persona_id: number | null;
}

export interface Persona {
    id: number;
    owner_user_id: number;
    username: string;
    display_name: string;
    avatar_uri?: string;
    created_at: string;
    last_active_at: string;
}

export interface Skin {
    persona_id: number;
    profession_id: number;
    profession_name: string;
    slot: string;
    level: number;
    score: number;
}

export interface Post {
    id: string;
    author_persona_id: number;
    author_name: string;
    author_level: number;
    content: string;
    media_urls: string[];
    created_at: string;
    like_count: number;
}

export interface ReferralStats {
    code: string;
    total_referrals: number;
    total_earnings_cents: number;
    tier1_count: number;
    tier2_count: number;
    tier3_count: number;
}

export interface LeaderboardEntry {
    rank: number;
    persona_id: number;
    display_name: string;
    referral_count: number;
    total_earnings_cents: number;
}

export interface WaitlistSignup {
    email: string;
    creator_type: string;
    follower_range: string;
    platforms: string[];
    referral_code?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
}

export interface OpportunityFilters {
    professionId?: number;
    minLevel?: number;
    maxLevel?: number;
    category?: string;
    status?: 'open' | 'filled' | 'completed';
}

export interface MarketplaceOpportunity {
    id: number;
    brand_name: string | null;
    brand_logo?: string;
    brand_verified: boolean;
    title: string;
    description: string;
    category: string;
    required_profession_id: number;
    required_profession_name: string;
    required_level: number;
    reward_amount: string;
    reward_currency: string;
    deadline: string;
    status: string;
    application_count: number;
    created_at: string;
    can_apply: boolean;
}

export interface MarketplaceStats {
    total_opportunities: number;
    active_opportunities: number;
    completed_deals: number;
    total_volume: string;
    total_platform_revenue: string;
    avg_deal_size: string;
}

export interface Application {
    id: number;
    opportunity_id: number;
    opportunity_title: string;
    persona_id: number;
    pitch: string;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    created_at: string;
}

export interface CreateOpportunityData {
    title: string;
    description: string;
    category: string;
    required_profession_id: number;
    required_level: number;
    reward_amount: string;
    reward_currency?: string;
    duration_days: number;
}

export interface ScoringInput {
    followers_count: number;
    engagement_rate: number;
    post_frequency: number;
    account_age_days: number;
    verified: boolean;
}

export interface ScoringResult {
    total_score: number;
    level: number;
    components: {
        follower_score: number;
        engagement_score: number;
        authenticity_score: number;
        consistency_score: number;
    };
}

export interface CreatorProfile {
    id: number;
    display_name: string;
    handle: string;
    avatar_url: string | null;
    bio: string | null;
    level: number;
    score: number;
    profession: string | null;
    connected_platforms: string[];
    badges: string[];
    stats: {
        total_earnings: string;
        completed_deals: number;
        avg_rating: number;
        referrals: number;
    };
    score_breakdown: {
        activity: number;
        engagement: number;
        consistency: number;
        verification: number;
    };
    recent_activity: Array<{
        type: string;
        title: string;
        date: string;
        amount: string | null;
    }>;
}

export interface CreatorDeal {
    id: number;
    title: string;
    brand_name: string;
    status: string;
    total_amount: number;
    base_budget: number;
    required_level: number;
    category: string;
    platforms: string[];
    description: string;
    application_deadline: string;
    delivery_deadline: string;
    applicant_count: number;
    deliverables: Array<{
        id: number;
        type: string;
        description: string;
        quantity: number;
        platform: string;
        status: string;
    }>;
}

// Singleton instance
export const api = new ApiClient();
