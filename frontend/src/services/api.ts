import axios from 'axios';

const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';
// Sanitize URL by removing any trailing slashes
const API_URL = RAW_URL.replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_URL,
  timeout: 45000, // 45s timeout to accommodate Render free-tier cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized session expiration)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Don't force redirect on failed login or register attempt
      if (!url.includes('/api/auth/login') && !url.includes('/api/auth/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (email: string, password: string, name?: string) =>
    api.post('/api/auth/register', { email, password, name }),
  
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
};

export const profileAPI = {
  getProfile: () => api.get('/api/profile'),
  
  updateProfile: (data: any) => api.put('/api/profile', data),
};

export const careerAPI = {
  analyzeCareer: () => api.post('/api/analyze-career'),
  
  searchCareer: (careerQuery: string) =>
    api.post('/api/search-career', { career_query: careerQuery }),
  
  getAnalyses: () => api.get('/api/analyses'),

  deleteAnalysis: (analysisId: string) => api.delete(`/api/analyses/${analysisId}`),
};

export default api;