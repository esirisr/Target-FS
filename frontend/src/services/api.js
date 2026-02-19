import axios from 'axios';

const api = axios.create({
  baseURL: 'https://tsbe-production.up.railway.app',
});

// Request Interceptor: Attach token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Global error handling (e.g., redirect on 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Optional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- Auth Functions ---
export const login = (data) => api.post('/auth', data);
export const register = (data) => api.post('/auth', data);

// --- Professional Functions ---
export const fetchPros = () => api.get('/pros/all'); 
export const requestService = (id) => api.post(`/pros/request/${id}`);

// --- Admin Functions ---
export const fetchPendingPros = () => api.get('/admin/pending');
export const verifyPro = (id) => api.put(`/admin/verify/${id}`);

export default api;
