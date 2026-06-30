/**
 * Axios client instance.
 * Single configured instance for all API communication.
 *
 * - baseURL from environment variable with localhost fallback
 * - JSON content-type headers
 * - Request interceptor placeholder for JWT injection
 * - Response interceptor placeholder for 401 handling
 */

import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15_000,
});

// ─── Request Interceptor ────────────────────────────────────────────
    /** Inject JWT access token from the authentication store for authorized requests. */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mit_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ───────────────────────────────────────────
    /** Handle 401 Unauthorized responses by triggering token refresh or redirecting to the login portal. */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    /** Execute token refresh flow to acquire a new valid session token. */
    if (error.response?.status === 401) {
      const originalUrl = error.config?.url;
      if (originalUrl !== '/auth/login' && originalUrl !== '/auth/forgot-password') {
        localStorage.removeItem('mit_access_token');
        localStorage.removeItem('mit_refresh_token');
        localStorage.removeItem('mit_mock_session');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export { apiClient };
