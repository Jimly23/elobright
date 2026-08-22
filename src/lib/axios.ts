import axios from 'axios';

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const normalizedApiUrl = configuredApiUrl ? configuredApiUrl.replace(/\/$/, '') : '';

if (!normalizedApiUrl && process.env.NODE_ENV !== 'production') {
  console.warn('NEXT_PUBLIC_API_URL is not set. Falling back to relative /api base URL.');
}

const api = axios.create({
  baseURL: normalizedApiUrl ? `${normalizedApiUrl}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to automatically attach token if it exists in localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;