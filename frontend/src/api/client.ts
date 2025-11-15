import axios, { AxiosError, AxiosInstance } from 'axios';

/**
 * API Client configuration
 * Base URL for backend API
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Backend error response structure
 */
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: Include cookies (HttpOnly refresh token)
});

/**
 * Response interceptor for handling errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        code: 'network_error',
        message: 'Network error. Please check your connection and try again.',
      });
    }

    // Handle HTTP errors with backend error structure
    const apiError = error.response.data;
    if (apiError?.error) {
      return Promise.reject({
        code: apiError.error.code,
        message: apiError.error.message,
        statusCode: error.response.status,
      });
    }

    // Fallback for unexpected error format
    return Promise.reject({
      code: 'unknown_error',
      message: error.message || 'An unexpected error occurred',
      statusCode: error.response.status,
    });
  }
);

export default apiClient;

