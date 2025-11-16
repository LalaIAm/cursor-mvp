import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset } from "@/api/auth";
import { validatePassword, mapApiErrorToMessage } from "@/utils/validation";
import Input from "@/components/Input";
import Button from "@/components/Button";
import SEO from "@/components/SEO";

/**
 * PasswordResetConfirmPage component
 * Allows users to set a new password using a reset token from the URL
 */
const PasswordResetConfirmPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenMissing, setIsTokenMissing] = useState(false);
  const successMessageRef = useRef<HTMLDivElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const redirectTimeoutRef = useRef<number | null>(null);

  // Check if token is missing on mount
  useEffect(() => {
    if (!token) {
      setIsTokenMissing(true);
    }
  }, [token]);

  // Focus management: move focus to success message or first error
  useEffect(() => {
    if (isSuccess && successMessageRef.current) {
      successMessageRef.current.focus();
    } else if (errors.newPassword && newPasswordRef.current) {
      newPasswordRef.current.focus();
    } else if (errors.confirmPassword && confirmPasswordRef.current) {
      confirmPasswordRef.current.focus();
    }
  }, [isSuccess, errors]);

  // Cleanup redirect timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, []);

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

    // Validate new password
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
    }

    // Validate password confirmation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Check if token exists
    if (!token) {
      setIsTokenMissing(true);
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await confirmPasswordReset({
        token,
        newPassword: formData.newPassword,
      });

      // Show success message
      setIsSuccess(true);

      // Clear form data for security
      setFormData({
        newPassword: "",
        confirmPassword: "",
      });

      // Redirect to login after a short delay
      redirectTimeoutRef.current = window.setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            message:
              "Password has been reset successfully. Please log in with your new password.",
          },
        });
      }, 3000);
    } catch (err: unknown) {
      const e =
        typeof err === "object" && err !== null
          ? (err as { statusCode?: number; code?: string; message?: string })
          : {};
      const statusCode = e.statusCode ?? 0;
      const errorCode = e.code ?? "";
      const fallbackMessage =
        e.message ?? "Failed to reset password. Please try again.";
      // Handle token-related errors
      if (statusCode === 400 || statusCode === 401) {
        if (
          errorCode.includes("token") ||
          errorCode.includes("expired") ||
          errorCode.includes("invalid")
        ) {
          setSubmitError(
            "This password reset link is invalid or has expired. Please request a new password reset link."
          );
        } else {
          const errorMessage = mapApiErrorToMessage(
            errorCode || "unknown_error",
            fallbackMessage
          );
          setSubmitError(errorMessage);
        }
      } else {
        const errorMessage = mapApiErrorToMessage(
          errorCode || "unknown_error",
          fallbackMessage
        );
        setSubmitError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show token missing message
  if (isTokenMissing) {
    return (
      <>
        <SEO
          title="Reset Password - TarotLyfe"
          description="Reset your TarotLyfe account password."
        />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
              Reset Password
            </h1>
            <div
              className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              role="alert"
              aria-live="polite"
            >
              <p className="text-sm text-yellow-800 mb-4">
                No reset token found. Please use the link from your email to
                reset your password.
              </p>
            </div>
            <div className="space-y-2 text-center">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate("/password-reset")}
              >
                Request New Reset Link
              </Button>
              <p className="text-sm text-gray-600">
                <a
                  href="/login"
                  className="text-primary-600 hover:text-primary-700 font-semibold underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/login");
                  }}
                >
                  Back to Login
                </a>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Reset Password - TarotLyfe"
        description="Set a new password for your TarotLyfe account."
      />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Set New Password
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Enter your new password below.
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
                <p className="text-sm text-green-800 mb-2">
                  Password has been reset successfully! Redirecting to login...
                </p>
              </div>
            )}

            {/* Error message */}
            {submitError && (
              <div
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                role="alert"
                aria-live="polite"
              >
                <p className="text-sm text-red-800 mb-2">{submitError}</p>
                {(submitError.includes("invalid") ||
                  submitError.includes("expired")) && (
                  <a
                    href="/password-reset"
                    className="text-sm text-red-800 underline font-semibold hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/password-reset");
                    }}
                  >
                    Request a new reset link
                  </a>
                )}
              </div>
            )}

            {/* New Password field */}
            <div className="mb-4">
              <Input
                ref={newPasswordRef}
                type="password"
                name="newPassword"
                label="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                error={errors.newPassword}
                helperText="Must be at least 8 characters with uppercase, lowercase, and number"
                autoComplete="new-password"
                required
                disabled={isSubmitting || isSuccess}
              />
            </div>

            {/* Confirm Password field */}
            <div className="mb-6">
              <Input
                ref={confirmPasswordRef}
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                autoComplete="new-password"
                required
                disabled={isSubmitting || isSuccess}
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
              Reset Password
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-2 text-center text-sm">
            <p className="text-gray-600">
              <a
                href="/password-reset"
                className="text-primary-600 hover:text-primary-700 font-semibold underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/password-reset");
                }}
              >
                Request a new reset link
              </a>
            </p>
            <p className="text-gray-600">
              Remember your password?{" "}
              <a
                href="/login"
                className="text-primary-600 hover:text-primary-700 font-semibold underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
              >
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PasswordResetConfirmPage;
