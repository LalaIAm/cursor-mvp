import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AuthProvider } from '@/context/AuthContext';
import PasswordResetConfirmPage from '../PasswordResetConfirmPage';
import * as authApi from '@/api/auth';

expect.extend(toHaveNoViolations);

// Mock useNavigate and useSearchParams
const mockNavigate = jest.fn();
let mockToken: string | null = null;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => {
    const params = new URLSearchParams();
    if (mockToken) {
      params.set('token', mockToken);
    }
    return [params];
  },
}));

// Mock auth API
jest.mock('@/api/auth', () => ({
  confirmPasswordReset: jest.fn(),
}));

// Mock useAuth hook
const mockUseAuth = jest.fn();
jest.mock('@/context/AuthContext', () => ({
  ...jest.requireActual('@/context/AuthContext'),
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('PasswordResetConfirmPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    jest.clearAllMocks();
    mockToken = null;
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      setAuth: jest.fn(),
      clearAuth: jest.fn(),
    });
  });

  const renderPasswordResetConfirmPage = (token?: string) => {
    mockToken = token || null;
    return render(
      <MemoryRouter>
        <AuthProvider>
          <PasswordResetConfirmPage />
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('renders password reset confirm form with token', () => {
    renderPasswordResetConfirmPage('test-token');
    expect(screen.getByText(/Set New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
  });

  it('shows token missing message when token is not provided', () => {
    renderPasswordResetConfirmPage();
    expect(
      screen.getByText(/No reset token found. Please use the link from your email/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Request New Reset Link/i })).toBeInTheDocument();
  });

  it('validates password requirements', async () => {
    const user = userEvent.setup();
    renderPasswordResetConfirmPage('test-token');

    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });

    await user.type(newPasswordInput, 'short');
    await user.click(submitButton);

    await waitFor(() => {
      // Error appears in the input field error message
      expect(screen.getByText(/Password must be at least 8 characters long/i)).toBeInTheDocument();
    });
  });

  it('validates password confirmation match', async () => {
    const user = userEvent.setup();
    renderPasswordResetConfirmPage('test-token');

    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });

    await user.type(newPasswordInput, 'NewPass123!');
    await user.type(confirmPasswordInput, 'DifferentPass123!');
    await user.click(submitButton);

    await waitFor(() => {
      // Error appears in the input field error message
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('requires password confirmation', async () => {
    const user = userEvent.setup();
    renderPasswordResetConfirmPage('test-token');

    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });

    await user.type(newPasswordInput, 'NewPass123!');
    await user.click(submitButton);

    await waitFor(() => {
      // Error appears in the input field error message
      expect(screen.getByText(/Please confirm your password/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid password and token', async () => {
    const user = userEvent.setup();
    const mockConfirmPasswordReset = authApi.confirmPasswordReset as jest.MockedFunction<
      typeof authApi.confirmPasswordReset
    >;
    mockConfirmPasswordReset.mockResolvedValue({
      message: 'Password has been reset successfully. Please log in with your new password.',
    });

    renderPasswordResetConfirmPage('test-token');

    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });

    await user.type(newPasswordInput, 'NewPass123!');
    await user.type(confirmPasswordInput, 'NewPass123!');
    
    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(mockConfirmPasswordReset).toHaveBeenCalledWith({
        token: 'test-token',
        newPassword: 'NewPass123!',
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Password has been reset successfully! Redirecting to login/i)
      ).toBeInTheDocument();
    }, { timeout: 10000 });
  }, 15000);

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    const mockConfirmPasswordReset = authApi.confirmPasswordReset as jest.MockedFunction<
      typeof authApi.confirmPasswordReset
    >;
    mockConfirmPasswordReset.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ message: 'Success' }), 100))
    );

    renderPasswordResetConfirmPage('test-token');

    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });

    await user.type(newPasswordInput, 'NewPass123!');
    await user.type(confirmPasswordInput, 'NewPass123!');
    await user.click(submitButton);

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('handles invalid token error', async () => {
    const user = userEvent.setup();
    const mockConfirmPasswordReset = authApi.confirmPasswordReset as jest.MockedFunction<
      typeof authApi.confirmPasswordReset
    >;
    mockConfirmPasswordReset.mockRejectedValue({
      code: 'invalid_token',
      message: 'Invalid token',
      statusCode: 400,
    });

    renderPasswordResetConfirmPage('invalid-token');

    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });

    await user.type(newPasswordInput, 'NewPass123!');
    await user.type(confirmPasswordInput, 'NewPass123!');
    
    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toHaveTextContent(/This password reset link is invalid or has expired/i);
    });
    expect(screen.getByText(/Request a new reset link/i)).toBeInTheDocument();
  }, 15000);

  it('handles expired token error', async () => {
    const user = userEvent.setup();
    const mockConfirmPasswordReset = authApi.confirmPasswordReset as jest.MockedFunction<
      typeof authApi.confirmPasswordReset
    >;
    mockConfirmPasswordReset.mockRejectedValue({
      code: 'expired_token',
      message: 'Token expired',
      statusCode: 400,
    });

    renderPasswordResetConfirmPage('expired-token');

    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });

    await user.type(newPasswordInput, 'NewPass123!');
    await user.type(confirmPasswordInput, 'NewPass123!');
    
    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toHaveTextContent(/This password reset link is invalid or has expired/i);
    });
  }, 15000);

  it('clears form data on success', async () => {
    const user = userEvent.setup();
    const mockConfirmPasswordReset = authApi.confirmPasswordReset as jest.MockedFunction<
      typeof authApi.confirmPasswordReset
    >;
    mockConfirmPasswordReset.mockResolvedValue({
      message: 'Password has been reset successfully. Please log in with your new password.',
    });

    renderPasswordResetConfirmPage('test-token');

    const newPasswordInput = screen.getByLabelText(/New Password/i) as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });

    await user.type(newPasswordInput, 'NewPass123!');
    await user.type(confirmPasswordInput, 'NewPass123!');
    
    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(newPasswordInput.value).toBe('');
      expect(confirmPasswordInput.value).toBe('');
    }, { timeout: 10000 });
  }, 15000);

  it('disables form after successful submission', async () => {
    const user = userEvent.setup();
    const mockConfirmPasswordReset = authApi.confirmPasswordReset as jest.MockedFunction<
      typeof authApi.confirmPasswordReset
    >;
    mockConfirmPasswordReset.mockResolvedValue({
      message: 'Password has been reset successfully. Please log in with your new password.',
    });

    renderPasswordResetConfirmPage('test-token');

    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });

    await user.type(newPasswordInput, 'NewPass123!');
    await user.type(confirmPasswordInput, 'NewPass123!');
    
    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(newPasswordInput).toBeDisabled();
      expect(confirmPasswordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    }, { timeout: 10000 });
  }, 15000);

  it('navigates to password reset request when token is missing and button is clicked', async () => {
    const user = userEvent.setup();
    renderPasswordResetConfirmPage();

    const requestLinkButton = screen.getByRole('button', { name: /Request New Reset Link/i });
    await user.click(requestLinkButton);

    expect(mockNavigate).toHaveBeenCalledWith('/password-reset');
  });

  it('navigates to password reset request when link is clicked', async () => {
    const user = userEvent.setup();
    renderPasswordResetConfirmPage('test-token');

    const requestLink = screen.getByText(/Request a new reset link/i);
    await user.click(requestLink);

    expect(mockNavigate).toHaveBeenCalledWith('/password-reset');
  });

  it('navigates to login when login link is clicked', async () => {
    const user = userEvent.setup();
    renderPasswordResetConfirmPage('test-token');

    const loginLink = screen.getByText(/Log in/i);
    await user.click(loginLink);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should not have accessibility violations', async () => {
    const { container } = renderPasswordResetConfirmPage('test-token');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

