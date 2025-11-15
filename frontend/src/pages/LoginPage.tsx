import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import { validateEmail, mapApiErrorToMessage } from '@/utils/validation';
import Input from '@/components/Input';
import Button from '@/components/Button';
import SEO from '@/components/SEO';

/**
 * LoginPage component
 * Login form with email/password validation
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setAuth, clearAuth } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate email
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    // Validate password (just check if it's not empty for login)
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      // Update auth state
      // Note: accessToken is returned but we don't store it client-side
      // Refresh token is in HttpOnly cookie
      setAuth(response.user);

      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      // Clear auth state on 401/403
      if (error.statusCode === 401 || error.statusCode === 403) {
        clearAuth();
      }
      
      const errorMessage = mapApiErrorToMessage(
        error.code || 'unknown_error',
        error.message || 'Login failed. Please try again.'
      );
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Login - TarotLyfe"
        description="Log in to your TarotLyfe account to continue your journey with AI-powered tarot readings and journaling."
      />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Log in to your TarotLyfe account
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Global error message */}
            {submitError && (
              <div
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                role="alert"
                aria-live="polite"
              >
                <p className="text-sm text-red-800">{submitError}</p>
              </div>
            )}

            {/* Email field */}
            <div className="mb-4">
              <Input
                type="email"
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                autoComplete="email"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Password field */}
            <div className="mb-4">
              <Input
                type="password"
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="current-password"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Forgot password link */}
            <div className="mb-6 text-right">
              <a
                href="/password-reset"
                className="text-sm text-primary-600 hover:text-primary-700 font-semibold underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/password-reset');
                }}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full"
              disabled={isSubmitting}
            >
              Log In
            </Button>
          </form>

          {/* Link to signup */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a
              href="/signup"
              className="text-primary-600 hover:text-primary-700 font-semibold underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
              onClick={(e) => {
                e.preventDefault();
                navigate('/signup');
              }}
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
