import axios from 'axios';

// Create a custom event for token expiration
export const createTokenExpiredEvent = () => {
  return new CustomEvent('tokenExpired');
};

const api = axios.create({
  baseURL: '/api',
  withCredentials: false, // Set to true if you use cookies
});

// Request interceptor to add Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Dispatch custom event to notify AuthContext
      window.dispatchEvent(createTokenExpiredEvent());
    }
    return Promise.reject(error);
  }
);

export default api; 