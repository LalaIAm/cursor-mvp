import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestPasswordReset } from '@/api/auth';
import { validateEmail, mapApiErrorToMessage } from '@/utils/validation';
import Input from '@/components/Input';
import Button from '@/components/Button';
import SEO from '@/components/SEO';

/**
 * PasswordResetRequestPage component
 * Allows users to request a password reset link via email
 */
const PasswordResetRequestPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const successMessageRef = useRef<HTMLDivElement>(null);

  // Focus management: move focus to success message when shown
  useEffect(() => {
    if (isSuccess && successMessageRef.current) {
      successMessageRef.current.focus();
    }
  }, [isSuccess]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    
    // Clear errors when user starts typing
    if (error) {
      setError(null);
    }
    if (isSuccess) {
      setIsSuccess(false);
    }
  };

  const validateForm = (): boolean => {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSuccess(false);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await requestPasswordReset({
        email: email.trim().toLowerCase(),
      });

      // Show generic success message (prevents account enumeration)
      setIsSuccess(true);
      setEmail(''); // Clear email for security
    } catch (error: any) {
      const errorMessage = mapApiErrorToMessage(
        error.code || 'unknown_error',
        error.message || 'Failed to send password reset email. Please try again.'
      );
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Reset Password - TarotLyfe"
        description="Request a password reset link for your TarotLyfe account."
      />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Success message */}
            {isSuccess && (
              <div
                ref={successMessageRef}
                className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg"
                role="alert"
                aria-live="polite"
                tabIndex={-1}
              >
                <p className="text-sm text-green-800">
                  If an account exists with this email, a password reset link has been sent.
                  Please check your email and follow the instructions.
                </p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div
                id="error-message"
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                role="alert"
                aria-live="polite"
              >
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Email field */}
            <div className="mb-6">
              <Input
                type="email"
                name="email"
                label="Email"
                value={email}
                onChange={handleChange}
                error={undefined}
                autoComplete="email"
                required
                disabled={isSubmitting || isSuccess}
                aria-describedby={isSuccess ? 'success-message' : error ? 'error-message' : undefined}
              />
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full"
              disabled={isSubmitting || isSuccess}
            >
              Send Reset Link
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-2 text-center text-sm">
            <p className="text-gray-600">
              Remember your password?{' '}
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
            <p className="text-gray-600">
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
      </div>
    </>
  );
};

export default PasswordResetRequestPage;

