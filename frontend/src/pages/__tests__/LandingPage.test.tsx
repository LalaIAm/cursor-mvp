import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import LandingPage from '../LandingPage';

expect.extend(toHaveNoViolations);

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock auth utility
jest.mock('@/utils/auth', () => ({
  shouldRedirectToDashboard: jest.fn(() => false),
}));

describe('LandingPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const renderLandingPage = () => {
    return render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
  };

  it('renders hero section with headline', () => {
    renderLandingPage();
    expect(
      screen.getByText(/Discover Your Path with/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/AI-Powered Tarot/i)
    ).toBeInTheDocument();
  });

  it('renders product description', () => {
    renderLandingPage();
    expect(
      screen.getByText(/Combine ancient tarot wisdom with modern AI/i)
    ).toBeInTheDocument();
  });

  it('renders Sign Up button', () => {
    renderLandingPage();
    const signUpButton = screen.getByTestId('signup-button');
    expect(signUpButton).toBeInTheDocument();
    expect(signUpButton).toHaveAttribute('aria-label', 'Sign up for TarotLyfe');
    expect(signUpButton).toHaveTextContent('Sign Up');
  });

  it('renders Login button', () => {
    renderLandingPage();
    const loginButton = screen.getByTestId('login-button');
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveAttribute('aria-label', 'Log in to your TarotLyfe account');
    expect(loginButton).toHaveTextContent('Login');
  });

  it('navigates to /signup when Sign Up button is clicked', () => {
    renderLandingPage();
    const signUpButton = screen.getByTestId('signup-button');
    signUpButton.click();
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  it('navigates to /login when Login button is clicked', () => {
    renderLandingPage();
    const loginButton = screen.getByTestId('login-button');
    loginButton.click();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('renders value propositions section', () => {
    renderLandingPage();
    expect(screen.getByText(/Why TarotLyfe\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Magical Card Drawing/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Interpretations/i)).toBeInTheDocument();
    expect(screen.getByText(/Frictionless Journaling/i)).toBeInTheDocument();
  });

  it('renders privacy and security assurance section', () => {
    renderLandingPage();
    expect(
      screen.getByText(/Your Privacy & Security Matter/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/We are committed to protecting your personal data/i)
    ).toBeInTheDocument();
  });

  it('renders privacy policy link', () => {
    renderLandingPage();
    const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '/privacy');
    expect(privacyLink).toHaveAttribute('aria-label', 'View our privacy policy');
  });

  it('renders terms of service link', () => {
    renderLandingPage();
    const termsLink = screen.getByRole('link', { name: /terms of service/i });
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('href', '/terms');
    expect(termsLink).toHaveAttribute('aria-label', 'View our terms of service');
  });

  it('has semantic HTML structure', () => {
    renderLandingPage();
    expect(document.querySelector('header')).toBeInTheDocument();
    expect(document.querySelector('main')).toBeInTheDocument();
    expect(document.querySelector('footer')).toBeInTheDocument();
    expect(document.querySelector('nav')).toBeInTheDocument();
  });

  it('has proper navigation landmarks', () => {
    renderLandingPage();
    const nav = document.querySelector('nav');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('should not have accessibility violations', async () => {
    const { container } = renderLandingPage();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('redirects authenticated users to dashboard', () => {
    const authModule = require('@/utils/auth');
    authModule.shouldRedirectToDashboard.mockReturnValue(true);

    renderLandingPage();
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });
});

