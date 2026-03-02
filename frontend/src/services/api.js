import axios from 'axios';

const API = axios.create({ baseURL: 'https://hbe-production.up.railway.app/api' });
//const API = axios.create({ baseURL: 'https://target-be-production.up.railway.app/api' });
//const API = axios.create({ baseURL: 'https://mybe.up.railway.app/api' });

//const API = axios.create({ baseURL: 'http://localhost:5000/api' });
// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle session expiration (401)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      if (window.location.pathname !== '/') window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);

// Admin & Analytics (Matching your Controller)
export const fetchAnalytics = () => API.get('/admin/analytics');
export const fetchDashboard = () => API.get('/admin/dashboard');
export const verifyPro = (id) => API.patch(`/admin/verify/${id}`);
export const suspendPro = (id) => API.patch(`/admin/toggle-suspension/${id}`);
export const deleteUser = (id) => API.delete(`/admin/user/${id}`);

export default API;
