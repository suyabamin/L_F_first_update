import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Proxy handles this
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true
});

// Response interceptor to handle data normalization
api.interceptors.response.use(
  (response) => {
    if (response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject({ success: false, message: 'Network error or server unavailable' });
  }
);

export default api;
