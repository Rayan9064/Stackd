const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore?: boolean;
}

export interface Article {
  id: string;
  title: string;
  url: string;
  sourceUrl: string;
  summary?: string | null;
  source: string;
  geography?: string | null;
  publishedAt: string;
  tags: string[];
  createdAt: string;
}

export interface Launch {
  id: string;
  title: string;
  tagline?: string | null;
  description?: string | null; // fallback
  url: string;
  sourceUrl: string;
  source: string;
  upvotes: number;
  launchedAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  remote: boolean;
  equity?: string | null;
  url: string;
  sourceUrl: string;
  source: string;
  postedAt: string;
  role?: string | null;
  stage?: string | null;
  geography?: string | null;
}

export interface Cohort {
  name: string;
  deadline: string;
  investment?: string | null;
  equity?: string | null;
  geography: string;
  sectors: string[];
  applyUrl: string;
  sourceUrl: string;
  open: boolean;
}

export interface Investor {
  name: string;
  firm: string;
  thesis: string;
  sectors: string[];
  chequeMin: number;
  chequeMax: number;
  currency: string;
  xHandle?: string | null;
  linkedinUrl?: string | null;
  website: string;
  sourceUrl: string;
  location?: string | null;
  geography: string;
  stage?: string[];
  stages?: string[];
}

export interface Startup {
  id: string;
  name: string;
  sector: string;
  stage: string;
  location: string;
  geography: string;
  oneLiner: string;
  fundingTotal: string;
  website: string;
  sourceUrl: string;
  graphSlug?: string | null;
  signalCount?: number;
  sourceCount?: number;
  sources?: Array<{
    id: string;
    name: string;
    slug: string;
    type: string;
  }>;
  domains?: Array<{ domain: string; isPrimary: boolean }>;
  founders?: Founder[];
}

export interface CompanySignal {
  id: string;
  companyId?: string;
  type: string;
  title: string;
  url: string;
  summary?: string | null;
  occurredAt: string;
  metadata?: string | null;
  externalType?: string | null;
  externalId?: string | null;
  sourceId?: string | null;
  source?: {
    id: string;
    name: string;
    slug: string;
    type: string;
  } | null;
  sources?: Array<{
    id: string;
    name: string;
    slug: string;
    type: string;
    externalId?: string;
    url?: string | null;
  }>;
}

export interface Founder {
  id: string;
  name: string;
  slug: string;
  headline?: string | null;
  geography?: string | null;
  linkedinUrl?: string | null;
  xUrl?: string | null;
  website?: string | null;
  confidenceScore?: number;
  role?: string | null;
  title?: string | null;
  sourceUrl?: string | null;
  companies?: Array<{
    id: string;
    name: string;
    slug: string;
    role?: string | null;
    title?: string | null;
    sourceUrl?: string | null;
  }>;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  website?: string | null;
  description?: string | null;
  sector?: string | null;
  stage?: string | null;
  geography?: string | null;
  location?: string | null;
  country?: string | null;
  logoUrl?: string | null;
  confidenceScore: number;
  signalCount?: number;
  sourceCount?: number;
  sources?: Array<{
    id: string;
    name: string;
    slug: string;
    type: string;
  }>;
  domains?: Array<{ domain: string; isPrimary: boolean }>;
  founders?: Founder[];
  aliases?: Array<{ alias: string; domain?: string | null }>;
  signals?: CompanySignal[];
  createdAt: string;
  updatedAt: string;
}

export interface GithubRepo {
  id: string;
  name: string;
  description?: string | null;
  url: string;
  sourceUrl: string;
  stars: number;
  language?: string | null;
  topics: string[];
  owner: string;
  fetchedAt: string;
}

export interface SearchResults {
  companies?: Company[];
  startups?: Startup[];
  news?: Article[];
  jobs?: Job[];
  investors?: Investor[];
  cohorts?: Cohort[];
  launches?: Launch[];
}

// Fetch with revalidation for Next.js ISR (Incremental Static Regeneration)
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error(`API returned status ${res.status}: ${res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error(`Fetch error on endpoint ${endpoint}:`, error);
    // Return empty fallback models to prevent crash on backend server downtime
    if (endpoint.startsWith('/api/cohorts')) {
      return { data: [], total: 0, page: 1, limit: 10 } as T;
    }
    return { data: [], total: 0, page: 1, limit: 10 } as T;
  }
}

export const api = {
  // GET /api/news
  async getNews(params: { page?: number; limit?: number; source?: string; geography?: string; search?: string } = {}): Promise<PaginatedResponse<Article>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.source) query.append('source', params.source);
    if (params.geography) query.append('geography', params.geography);
    if (params.search) query.append('search', params.search);
    
    return fetchAPI<PaginatedResponse<Article>>(`/api/news?${query.toString()}`);
  },

  // GET /api/launches
  async getLaunches(params: { page?: number; limit?: number; source?: string } = {}): Promise<PaginatedResponse<Launch>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.source) query.append('source', params.source);
    
    return fetchAPI<PaginatedResponse<Launch>>(`/api/launches?${query.toString()}`);
  },

  // GET /api/jobs
  async getJobs(params: { page?: number; limit?: number; role?: string; remote?: boolean; geography?: string; location?: string; stage?: string; search?: string } = {}): Promise<PaginatedResponse<Job>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.role) query.append('role', params.role);
    if (params.remote !== undefined) query.append('remote', params.remote.toString());
    if (params.geography) query.append('geography', params.geography);
    if (params.location) query.append('location', params.location);
    if (params.stage) query.append('stage', params.stage);
    if (params.search) query.append('search', params.search);
    
    return fetchAPI<PaginatedResponse<Job>>(`/api/jobs?${query.toString()}`);
  },

  // GET /api/startups
  async getStartups(params: { page?: number; limit?: number; sector?: string; stage?: string; geography?: string; search?: string } = {}): Promise<PaginatedResponse<Startup>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.sector) query.append('sector', params.sector);
    if (params.stage) query.append('stage', params.stage);
    if (params.geography) query.append('geography', params.geography);
    if (params.search) query.append('search', params.search);
    
    return fetchAPI<PaginatedResponse<Startup>>(`/api/startups?${query.toString()}`);
  },

  // GET /api/founders
  async getFounders(params: { page?: number; limit?: number; search?: string } = {}): Promise<PaginatedResponse<Founder>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);

    return fetchAPI<PaginatedResponse<Founder>>(`/api/founders?${query.toString()}`);
  },

  // GET /api/founders/:slug
  async getFounder(slug: string): Promise<Founder> {
    return fetchAPI<Founder>(`/api/founders/${slug}`);
  },

  // GET /api/cohorts
  async getCohorts(params: { page?: number; limit?: number; geography?: string; open?: boolean } = {}): Promise<PaginatedResponse<Cohort>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.geography) query.append('geography', params.geography);
    if (params.open !== undefined) query.append('open', params.open.toString());
    
    return fetchAPI<PaginatedResponse<Cohort>>(`/api/cohorts?${query.toString()}`);
  },

  // GET /api/investors
  async getInvestors(params: { page?: number; limit?: number; sector?: string; stage?: string; geography?: string; search?: string } = {}): Promise<PaginatedResponse<Investor>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.sector) query.append('sector', params.sector);
    if (params.stage) query.append('stage', params.stage);
    if (params.geography) query.append('geography', params.geography);
    if (params.search) query.append('search', params.search);
    
    return fetchAPI<PaginatedResponse<Investor>>(`/api/investors?${query.toString()}`);
  },

  // GET /api/funding
  async getFunding(params: { page?: number; limit?: number; geography?: string; stage?: string; search?: string } = {}): Promise<PaginatedResponse<Article>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.geography) query.append('geography', params.geography);
    if (params.stage) query.append('stage', params.stage);
    if (params.search) query.append('search', params.search);
    
    return fetchAPI<PaginatedResponse<Article>>(`/api/funding?${query.toString()}`);
  },

  // GET /api/github
  async getGithub(params: { page?: number; limit?: number; language?: string } = {}): Promise<PaginatedResponse<GithubRepo>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.language) query.append('language', params.language);
    
    return fetchAPI<PaginatedResponse<GithubRepo>>(`/api/github?${query.toString()}`);
  },

  // GET /api/search (Client-side trigger)
  async globalSearch(q: string, types?: string): Promise<SearchResults> {
    const query = new URLSearchParams();
    query.append('q', q);
    if (types) query.append('types', types);
    
    // Trigger direct client fetch, bypass ISR
    const res = await fetch(`${API_URL}/api/search?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Search failed');
    }
    return await res.json();
  },

  // POST /api/digest/subscribe (Runs on client-side, do not cache/revalidate)
  async subscribeToDigest(email: string, geography?: string): Promise<{ message: string; email: string }> {
    const res = await fetch(`${API_URL}/api/digest/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, geography }),
      cache: 'no-store'
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Subscription failed');
    }
    return data;
  }
};
