import api from './api';

// All paths now start with /services
export const fetchStudents = () => api.get('/services');
export const addStudent = (data) => api.post('/services', data);
export const updateStudent = (id, data) => api.put(`/services/${id}`, data);
export const deleteStudent = (id) => api.delete(`/services/${id}`);
