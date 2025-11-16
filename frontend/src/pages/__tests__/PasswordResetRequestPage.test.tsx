import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AuthProvider } from '@/context/AuthContext';
import PasswordResetRequestPage from '../PasswordResetRequestPage';
import * as authApi from '@/api/auth';

expect.extend(toHaveNoViolations);

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock auth API
jest.mock('@/api/auth', () => ({
  requestPasswordReset: jest.fn(),
}));

// Mock useAuth hook
const mockUseAuth = jest.fn();
jest.mock('@/context/AuthContext', () => ({
  ...jest.requireActual('@/context/AuthContext'),
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('PasswordResetRequestPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      setAuth: jest.fn(),
      clearAuth: jest.fn(),
    });
  });

  const renderPasswordResetRequestPage = () => {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <PasswordResetRequestPage />
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('renders password reset request form', () => {
    renderPasswordResetRequestPage();
    expect(screen.getByText(/Reset Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
  });

  it('renders links to login and signup', () => {
    renderPasswordResetRequestPage();
    expect(screen.getByText(/Remember your password\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    renderPasswordResetRequestPage();

    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toHaveTextContent(/Invalid email format/i);
    });
  });

  it('requires email field', async () => {
    const user = userEvent.setup();
    renderPasswordResetRequestPage();

    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    await user.click(submitButton);

    await waitFor(() => {
      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toHaveTextContent(/Email is required/i);
    });
  });

  it('submits form with valid email', async () => {
    const user = userEvent.setup();
    const mockRequestPasswordReset = authApi.requestPasswordReset as jest.MockedFunction<
      typeof authApi.requestPasswordReset
    >;
    mockRequestPasswordReset.mockResolvedValue({
      message: 'If an account exists with this email, a password reset link has been sent.',
    });

    renderPasswordResetRequestPage();

    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText(/If an account exists with this email, a password reset link has been sent/i)
      ).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    const mockRequestPasswordReset = authApi.requestPasswordReset as jest.MockedFunction<
      typeof authApi.requestPasswordReset
    >;
    mockRequestPasswordReset.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ message: 'Success' }), 100))
    );

    renderPasswordResetRequestPage();

    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('handles API errors', async () => {
    const user = userEvent.setup();
    const mockRequestPasswordReset = authApi.requestPasswordReset as jest.MockedFunction<
      typeof authApi.requestPasswordReset
    >;
    mockRequestPasswordReset.mockRejectedValue({
      code: 'network_error',
      message: 'Network error. Please check your connection and try again.',
    });

    renderPasswordResetRequestPage();

    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toHaveTextContent(/Network error. Please check your connection and try again/i);
    });
  });

  it('clears email on success', async () => {
    const user = userEvent.setup();
    const mockRequestPasswordReset = authApi.requestPasswordReset as jest.MockedFunction<
      typeof authApi.requestPasswordReset
    >;
    mockRequestPasswordReset.mockResolvedValue({
      message: 'If an account exists with this email, a password reset link has been sent.',
    });

    renderPasswordResetRequestPage();

    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(emailInput.value).toBe('');
    });
  });

  it('disables form after successful submission', async () => {
    const user = userEvent.setup();
    const mockRequestPasswordReset = authApi.requestPasswordReset as jest.MockedFunction<
      typeof authApi.requestPasswordReset
    >;
    mockRequestPasswordReset.mockResolvedValue({
      message: 'If an account exists with this email, a password reset link has been sent.',
    });

    renderPasswordResetRequestPage();

    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(emailInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  it('navigates to login when login link is clicked', async () => {
    const user = userEvent.setup();
    renderPasswordResetRequestPage();

    const loginLink = screen.getByText(/Log in/i);
    await user.click(loginLink);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navigates to signup when signup link is clicked', async () => {
    const user = userEvent.setup();
    renderPasswordResetRequestPage();

    const signupLink = screen.getByText(/Sign up/i);
    await user.click(signupLink);

    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  it('should not have accessibility violations', async () => {
    const { container } = renderPasswordResetRequestPage();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

