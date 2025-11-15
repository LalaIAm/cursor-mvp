import apiClient from './client';
import { User } from '@/utils/auth';

/**
 * Register request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register response
 */
export interface RegisterResponse {
  message: string;
  user: User;
}

/**
 * Login response
 */
export interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
}

/**
 * API error with status code
 */
export interface ApiError {
  code: string;
  message: string;
  statusCode?: number;
}

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
  } catch (error: any) {
    // Re-throw with proper typing
    throw error as ApiError;
  }
};

/**
 * Login user
 * POST /api/auth/login
 * Note: Refresh token is set as HttpOnly cookie by backend
 * Access token is returned but should not be stored client-side
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  } catch (error: any) {
    // Re-throw with proper typing
    throw error as ApiError;
  }
};

/**
 * Password reset request payload
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset request response
 */
export interface PasswordResetRequestResponse {
  message: string;
}

/**
 * Password reset confirm payload
 */
export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

/**
 * Password reset confirm response
 */
export interface PasswordResetConfirmResponse {
  message: string;
}

/**
 * Request a password reset
 * POST /api/auth/password-reset/request
 * Always returns generic success to prevent user enumeration
 */
export const requestPasswordReset = async (
  data: PasswordResetRequest
): Promise<PasswordResetRequestResponse> => {
  try {
    const response = await apiClient.post<PasswordResetRequestResponse>(
      '/auth/password-reset/request',
      data
    );
    return response.data;
  } catch (error: any) {
    // Re-throw with proper typing
    throw error as ApiError;
  }
};

/**
 * Confirm password reset
 * POST /api/auth/password-reset/confirm
 */
export const confirmPasswordReset = async (
  data: PasswordResetConfirmRequest
): Promise<PasswordResetConfirmResponse> => {
  try {
    const response = await apiClient.post<PasswordResetConfirmResponse>(
      '/auth/password-reset/confirm',
      data
    );
    return response.data;
  } catch (error: any) {
    // Re-throw with proper typing
    throw error as ApiError;
  }
};

