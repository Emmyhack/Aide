import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized response
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (civicToken) => api.post('/auth/login', {}, {
    headers: { Authorization: `Bearer ${civicToken}` }
  }),
  logout: () => api.post('/auth/logout'),
  verify: () => api.get('/auth/verify'),
};

// Events API calls
export const eventsAPI = {
  getAll: (params = {}) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  getBySlug: (slug) => api.get(`/events/slug/${slug}`),
  create: (eventData) => api.post('/events', eventData),
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  delete: (id) => api.delete(`/events/${id}`),
  getRegistrations: (id) => api.get(`/events/${id}/registrations`),
  getCategories: () => api.get('/events/meta/categories'),
  getStats: () => api.get('/events/stats/overview'),
};

// Users API calls
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getDashboard: () => api.get('/users/dashboard'),
  getEvents: (params = {}) => api.get('/users/events', { params }),
  getStats: () => api.get('/users/stats'),
  deleteAccount: () => api.delete('/users/account'),
  getPublicProfile: (id) => api.get(`/users/${id}/public`),
};

// Registrations API calls
export const registrationsAPI = {
  create: (registrationData) => api.post('/registrations', registrationData),
  getById: (id) => api.get(`/registrations/${id}`),
  update: (id, updateData) => api.put(`/registrations/${id}`, updateData),
  cancel: (id) => api.delete(`/registrations/${id}`),
  approve: (id, notes) => api.post(`/registrations/${id}/approve`, { notes }),
  reject: (id, reason) => api.post(`/registrations/${id}/reject`, { reason }),
  checkin: (id, data) => api.post(`/registrations/${id}/checkin`, data),
  submitFeedback: (id, feedback) => api.post(`/registrations/${id}/feedback`, feedback),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

// Generic API helpers
export const apiHelpers = {
  // Handle API errors consistently
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      const status = error.response.status;
      return { message, status, isServerError: true };
    } else if (error.request) {
      // Request was made but no response received
      return { 
        message: 'Network error - please check your connection', 
        status: 0, 
        isNetworkError: true 
      };
    } else {
      // Something else happened
      return { 
        message: error.message || 'An unexpected error occurred', 
        status: 0, 
        isUnknownError: true 
      };
    }
  },

  // Format API response data
  formatResponse: (response) => {
    return {
      data: response.data,
      status: response.status,
      headers: response.headers,
    };
  },

  // Create query string from object
  createQueryString: (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    return searchParams.toString();
  },
};

export default api;