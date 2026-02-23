import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);



export const fetchDashboard = () => API.get('/admin/dashboard');
export const fetchAnalytics = () => API.get('/admin/analytics');
export const verifyPro = (id) => API.patch(`/admin/verify/${id}`);
export const suspendPro = (id) => API.patch(`/admin/toggle-suspension/${id}`);
export const deleteUser = (id) => API.delete(`/admin/user/${id}`);

export default API;