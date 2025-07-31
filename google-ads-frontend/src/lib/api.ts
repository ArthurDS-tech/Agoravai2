import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('google_ads_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('google_ads_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export interface Campaign {
  id: string;
  name: string;
  status: string;
  budget: number;
  impressions: number;
  clicks: number;
  cost: number;
  ctr: string;
}

export interface MetricsSummary {
  totalCampaigns: number;
  activeCampaigns: number;
  totalImpressions: number;
  totalClicks: number;
  totalCost: number;
  averageCtr: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    authUrl: string;
    instructions: string;
  };
}

export interface CampaignsResponse {
  success: boolean;
  data: {
    campaigns: Campaign[];
    total: number;
    customerId: string;
    filters: any;
  };
  message: string;
}

export interface MetricsResponse {
  success: boolean;
  data: {
    summary: MetricsSummary;
    customerId: string;
  };
  message: string;
}

// Serviços da API
export const authService = {
  getAuthUrl: async (customerId?: string, userId?: string): Promise<AuthResponse> => {
    const params = new URLSearchParams();
    if (customerId) params.append('customerId', customerId);
    if (userId) params.append('userId', userId);
    
    const response = await api.get(`/api/auth/url?${params.toString()}`);
    return response.data;
  },
};

export const campaignsService = {
  getCampaigns: async (customerId: string, options?: { limit?: number; status?: string }): Promise<CampaignsResponse> => {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.status) params.append('status', options.status);
    
    const response = await api.get(`/api/campaigns/${customerId}?${params.toString()}`);
    return response.data;
  },
};

export const metricsService = {
  getSummary: async (customerId: string): Promise<MetricsResponse> => {
    const response = await api.get(`/api/metrics/${customerId}/summary`);
    return response.data;
  },
};

export const healthService = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;