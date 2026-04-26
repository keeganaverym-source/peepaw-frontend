import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Business {
  place_id: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  category?: string;
  rating?: number;
  review_count?: number;
  has_website: boolean;
  website_score?: number;
  website_breakdown?: Record<string, number>;
  no_website?: boolean;
  lead_score?: number;
  likelihood?: 'Hot' | 'Warm' | 'Cold';
  lat?: number;
  lng?: number;
  is_open?: boolean;
  business_status?: string;
  reviews?: any[];
}

export interface Lead {
  id: number;
  place_id: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  category?: string;
  rating?: number;
  review_count?: number;
  has_website: boolean;
  website_score?: number;
  lead_score?: number;
  likelihood?: string;
  niche?: string;
  status: string;
  lat?: number;
  lng?: number;
  last_contacted?: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: number;
  lead_id: number;
  content: string;
  created_at: string;
}

export interface DashboardStats {
  total_leads: number;
  high_value_leads: number;
  no_website_leads: number;
  hot_leads: number;
  warm_leads: number;
  cold_leads: number;
  sold: number;
  conversion_rate: number;
  recent_leads_7d: number;
  recent_contacted_7d: number;
  status_breakdown: Record<string, number>;
  recent_activity: any[];
}

// ─── Business API ─────────────────────────────────────────────────────────────

export const searchBusinesses = (params: {
  lat: number; lng: number; radius?: number; niche?: string; keyword?: string;
}) => api.post('/api/businesses/search', { radius: 1500, niche: 'custom', keyword: '', ...params });

export const getBusinessDetails = (placeId: string, niche = 'custom') =>
  api.get(`/api/businesses/details/${placeId}`, { params: { niche } });

export const findEasyWins = (params: {
  lat: number; lng: number; radius?: number; niche?: string;
}) => api.post('/api/businesses/easy-wins', { radius: 1500, niche: 'custom', ...params });

export const findNoWebsite = (params: {
  lat: number; lng: number; radius?: number; niche?: string;
}) => api.get('/api/businesses/no-website', { params: { radius: 1500, niche: 'custom', ...params } });

// ─── Leads API ────────────────────────────────────────────────────────────────

export const getLeads = (params?: { status?: string; niche?: string }) =>
  api.get('/api/leads/', { params });

export const createLead = (data: Partial<Business> & { niche?: string }) =>
  api.post('/api/leads/', data);

export const updateLead = (id: number, data: { status?: string; niche?: string }) =>
  api.patch(`/api/leads/${id}`, data);

export const markContacted = (id: number) =>
  api.post(`/api/leads/${id}/contact`);

export const deleteLead = (id: number) =>
  api.delete(`/api/leads/${id}`);

export const exportLeadsCSV = () =>
  api.get('/api/leads/export/csv', { responseType: 'blob' });

// ─── Notes API ────────────────────────────────────────────────────────────────

export const getNotes = (leadId: number) =>
  api.get(`/api/notes/${leadId}`);

export const addNote = (leadId: number, content: string) =>
  api.post(`/api/notes/${leadId}`, { content });

export const deleteNote = (noteId: number) =>
  api.delete(`/api/notes/${noteId}/delete`);

// ─── AI API ───────────────────────────────────────────────────────────────────

export const analyzeBusinessAI = (business: Partial<Business> & { niche: string }) =>
  api.post('/api/ai/analyze', business);

export const generateEmail = (business: Partial<Business> & { niche: string }) =>
  api.post('/api/ai/email', business);

export const generateScript = (business: Partial<Business> & { niche: string }) =>
  api.post('/api/ai/script', business);

export const generatePitchPackage = (business: Partial<Business> & { niche: string }) =>
  api.post('/api/ai/pitch-package', business);

export const generateFollowUp = (leadId: number) =>
  api.post('/api/ai/followup', { lead_id: leadId });

// ─── Dashboard API ────────────────────────────────────────────────────────────

export const getDashboardStats = () =>
  api.get('/api/dashboard/stats');
