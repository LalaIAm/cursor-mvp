/**
 * Client-side validation utilities
 * Matches backend validation rules
 */

/**
 * Validate email format
 */
export const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  
  return null;
};

/**
 * Validate password strength
 * Minimum 8 characters, at least one uppercase, one lowercase, one number
 */
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  return null;
};

/**
 * Get password strength feedback
 */
export const getPasswordStrength = (password: string): {
  strength: 'weak' | 'medium' | 'strong';
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('At least 8 characters');
  }

  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('One uppercase letter');
  }

  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('One lowercase letter');
  }

  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('One number');
  }

  if (score === 4) {
    return { strength: 'strong', feedback: [] };
  } else if (score >= 2) {
    return { strength: 'medium', feedback };
  } else {
    return { strength: 'weak', feedback };
  }
};

/**
 * Map backend error codes to user-friendly messages
 */
export const mapApiErrorToMessage = (code: string, defaultMessage: string): string => {
  const errorMap: Record<string, string> = {
    duplicate_email:
      'An account with this email already exists. Try logging in or reset your password.',
    invalid_credentials: 'Email or password is incorrect.',
    invalid_email: 'Invalid email format.',
    invalid_password: 'Password does not meet requirements.',
    invalid_token: 'This password reset link is invalid or has expired. Please request a new one.',
    expired_token: 'This password reset link has expired. Please request a new one.',
    token_not_found: 'This password reset link is invalid. Please request a new one.',
    network_error: 'Network error. Please check your connection and try again.',
    server_error: 'Server error. Please try again later.',
    unknown_error: 'An unexpected error occurred. Please try again.',
  };

  return errorMap[code] || defaultMessage;
};

