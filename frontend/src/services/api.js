import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    try {
      const response = await api.post('/api/login', formData);
      return response.data;
    } catch (error) {
      // Fallback to demo mode if API fails
      if (username === 'demo' && password === 'demo123') {
        return {
          access_token: 'demo-token-123',
          token_type: 'bearer',
          user: {
            username: 'demo',
            email: 'demo@spendwise.com'
          }
        };
      }
      throw error;
    }
  },
};

// Expenses API
export const expensesAPI = {
  getAll: () => api.get('/api/expenses'),
  create: (expenseData) => api.post('/api/expenses', expenseData),
  update: (id, expenseData) => api.put(`/api/expenses/${id}`, expenseData),
  delete: (id) => api.delete(`/api/expenses/${id}`),
  getByCategory: (category) => api.get(`/api/expenses?category=${category}`),
};

// Dashboard API
export const dashboardAPI = {
  getSummary: () => api.get('/api/dashboard'),
};

// Budgets API
export const budgetsAPI = {
  getAll: () => api.get('/api/budgets'),
  create: (budgetData) => api.post('/api/budgets', budgetData),
  delete: (id) => api.delete(`/api/budgets/${id}`),
};

export default api;