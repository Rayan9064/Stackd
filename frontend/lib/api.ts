const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Article {
  id: string;
  title: string;
  url: string;
  sourceUrl: string;
  summary: string;
  source: string;
  publishedAt: string;
  tags: string[];
  createdAt: string;
}

export interface Launch {
  id: string;
  title: string;
  description: string;
  url: string;
  sourceUrl: string;
  source: 'ph' | 'hn';
  upvotes: number;
  launchedAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  equity?: string;
  salaryRange?: string;
  url: string;
  sourceUrl: string;
  source: string;
  postedAt: string;
  role: string;
  stage?: string;
}

export interface Cohort {
  name: string;
  deadline: string;
  investmentAmount: string;
  geography: string;
  sectors: string[];
  applyUrl: string;
  sourceUrl: string;
}

export interface Investor {
  name: string;
  firm: string;
  thesis: string;
  sectors: string[];
  chequeMin: number;
  chequeMax: number;
  currency: string;
  xHandle?: string;
  linkedinUrl?: string;
  website: string;
  sourceUrl: string;
  location: string;
  stage: string[];
}

export interface Startup {
  id: string;
  name: string;
  sector: string;
  stage: string;
  location: string;
  oneLiner: string;
  fundingTotal: string;
  website: string;
  sourceUrl: string;
}

// Fetch with revalidation for Next.js ISR (Incremental Static Regeneration)
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      next: { revalidate: 3600, ...(options.next || {}) } // Default Cache for 1 Hour
    });
    
    if (!res.ok) {
      throw new Error(`API returned status ${res.status}: ${res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error(`Fetch error on endpoint ${endpoint}:`, error);
    // Return empty fallback models to prevent crash on backend server downtime
    if (endpoint.startsWith('/api/cohorts')) {
      return { data: [], total: 0 } as any;
    }
    return { data: [], total: 0, page: 1, limit: 10 } as any;
  }
}

export const api = {
  // GET /api/news
  async getNews(params: { page?: number; limit?: number; source?: string; search?: string } = {}): Promise<PaginatedResponse<Article>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.source) query.append('source', params.source);
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
  async getJobs(params: { page?: number; limit?: number; role?: string; location?: string; stage?: string; search?: string } = {}): Promise<PaginatedResponse<Job>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.role) query.append('role', params.role);
    if (params.location) query.append('location', params.location);
    if (params.stage) query.append('stage', params.stage);
    if (params.search) query.append('search', params.search);
    
    return fetchAPI<PaginatedResponse<Job>>(`/api/jobs?${query.toString()}`);
  },

  // GET /api/startups
  async getStartups(params: { page?: number; limit?: number; sector?: string; stage?: string; search?: string } = {}): Promise<PaginatedResponse<Startup>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.sector) query.append('sector', params.sector);
    if (params.stage) query.append('stage', params.stage);
    if (params.search) query.append('search', params.search);
    
    return fetchAPI<PaginatedResponse<Startup>>(`/api/startups?${query.toString()}`);
  },

  // GET /api/cohorts
  async getCohorts(): Promise<PaginatedResponse<Cohort>> {
    return fetchAPI<PaginatedResponse<Cohort>>('/api/cohorts');
  },

  // GET /api/investors
  async getInvestors(params: { page?: number; limit?: number; sector?: string; stage?: string; search?: string } = {}): Promise<PaginatedResponse<Investor>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.sector) query.append('sector', params.sector);
    if (params.stage) query.append('stage', params.stage);
    if (params.search) query.append('search', params.search);
    
    return fetchAPI<PaginatedResponse<Investor>>(`/api/investors?${query.toString()}`);
  },

  // POST /api/digest/subscribe (Runs on client-side, do not cache/revalidate)
  async subscribeToDigest(email: string): Promise<{ message: string; email: string }> {
    const res = await fetch(`${API_URL}/api/digest/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email }),
      cache: 'no-store'
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Subscription failed');
    }
    return data;
  }
};
