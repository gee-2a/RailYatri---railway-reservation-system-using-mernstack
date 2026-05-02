import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data)
};

export const trainAPI = {
  getTrains: (params) => api.get('/trains', { params }),
  createTrain: (data) => api.post('/trains', data),
  updateTrain: (id, data) => api.put(`/trains/${id}`, data),
  deleteTrain: (id) => api.delete(`/trains/${id}`),
  getTrainStatus: (id) => api.get(`/trains/${id}/status`),
  getAnalytics: () => api.get('/trains/analytics'),
  getTrainBookings: (id) => api.get(`/trains/${id}/bookings`)
};

export const bookingAPI = {
  getUserBookings: () => api.get('/bookings'),
  getAllBookings: () => api.get('/bookings/all'),
  createBooking: (data) => api.post('/bookings', data),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
  downloadTicket: (id) => api.get(`/bookings/${id}/pdf`, { responseType: 'blob' })
};

export default api;
