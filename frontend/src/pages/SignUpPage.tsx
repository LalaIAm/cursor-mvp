import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import { validateEmail, validatePassword, getPasswordStrength, mapApiErrorToMessage } from '@/utils/validation';
import Input from '@/components/Input';
import Button from '@/components/Button';
import SEO from '@/components/SEO';

/**
 * SignUpPage component
 * Registration form with email/password validation
 */
const SignUpPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setAuth, clearAuth } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<ReturnType<typeof getPasswordStrength> | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Validate password strength on change
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(getPasswordStrength(formData.password));
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password]);

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

    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const response = await register({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      // Update auth state
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
        error.message || 'Registration failed. Please try again.'
      );
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Sign Up - TarotLyfe"
        description="Create your TarotLyfe account to start your journey with AI-powered tarot readings and journaling."
      />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Start your journey with TarotLyfe
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
                helperText={
                  passwordStrength && passwordStrength.feedback.length > 0
                    ? `Requirements: ${passwordStrength.feedback.join(', ')}`
                    : undefined
                }
                autoComplete="new-password"
                required
                disabled={isSubmitting}
              />
              {passwordStrength && passwordStrength.strength === 'strong' && (
                <p className="mt-1 text-sm text-green-600">✓ Password strength: Strong</p>
              )}
            </div>

            {/* Confirm Password field */}
            <div className="mb-6">
              <Input
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                autoComplete="new-password"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full"
              disabled={isSubmitting}
            >
              Sign Up
            </Button>
          </form>

          {/* Link to login */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a
              href="/login"
              className="text-primary-600 hover:text-primary-700 font-semibold underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;
