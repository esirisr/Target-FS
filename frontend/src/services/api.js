import axios from 'axios';

//const API = axios.create({ baseURL: 'http://localhost:5000/api' });

const API = axios.create({ baseURL: 'https://hbe-production.up.railway.app/api' });


// ---- Attach JWT automatically ----
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Handle Unauthorized globally ----
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ---------------- AUTH ----------------
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);

// ---------------- PROFESSIONALS ----------------
export const fetchPros = () => API.get('/pros/all');
export const requestService = (id) => API.post(`/pros/request/${id}`);

// ---------------- ADMIN ----------------
export const fetchDashboard = () => API.get('/admin/dashboard');
export const verifyPro = (id) => API.patch(`/admin/verify/${id}`);
export const suspendPro = (id) => API.patch(`/admin/toggle-suspension/${id}`);
export const deleteUser = (id) => API.delete(`/admin/user/${id}`);

export default API;
