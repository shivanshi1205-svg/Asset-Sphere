import axios from 'axios';

// Default to same-origin /api/v1 to leverage the Vite proxy during development,
// or fallback to the backend API base url from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '15000', 10),
  withCredentials: true, // Crucial for sending Laravel session and Passport cookies
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Inject Authorization header
apiClient.interceptors.request.use(
  (config) => {
    // Inject Authorization token if configured in localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle session expiration (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid redirecting on active login attempts
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
