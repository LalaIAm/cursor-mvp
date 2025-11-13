import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shouldRedirectToDashboard } from '@/utils/auth';
import SEO from '@/components/SEO';

/**
 * LandingPage component
 * 
 * Displays the main landing page with:
 * - Hero section with product messaging
 * - Sign Up and Login CTAs
 * - Value propositions
 * - Privacy/security assurance section
 */
const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (shouldRedirectToDashboard()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <>
      <SEO
        title="TarotLyfe - AI-Powered Tarot Readings & Journaling"
        description="Combine ancient tarot wisdom with modern AI to gain personalized insights, reflect through journaling, and grow on your spiritual journey."
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <header className="container mx-auto px-4 py-6" data-testid="landing-header">
        <nav className="flex items-center justify-between" aria-label="Main navigation">
          <div className="text-2xl font-bold text-primary-700">TarotLyfe</div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24" data-testid="hero-section">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Discover Your Path with{' '}
              <span className="text-primary-600">AI-Powered Tarot</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Combine ancient tarot wisdom with modern AI to gain personalized insights,
              reflect through journaling, and grow on your spiritual journey.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16" data-testid="cta-buttons">
              <button
                onClick={handleSignUp}
                className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                aria-label="Sign up for TarotLyfe"
                data-testid="signup-button"
              >
                Sign Up
              </button>
              <button
                onClick={handleLogin}
                className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg border-2 border-primary-600 shadow-lg hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                aria-label="Log in to your TarotLyfe account"
                data-testid="login-button"
              >
                Login
              </button>
            </div>
          </div>
        </section>

        {/* Value Propositions */}
        <section className="container mx-auto px-4 py-16 bg-white" data-testid="value-propositions">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Why TarotLyfe?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Magical Card Drawing
                </h3>
                <p className="text-gray-600">
                  Experience smooth, intuitive tarot card selection with beautiful
                  animations that bring ancient wisdom to life.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  AI Interpretations
                </h3>
                <p className="text-gray-600">
                  Receive personalized, context-aware interpretations powered by AI
                  that adapt to your questions and reading history.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Frictionless Journaling
                </h3>
                <p className="text-gray-600">
                  Capture your thoughts and insights with an intuitive journal editor,
                  complete with AI prompts and auto-save functionality.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy & Security Assurance */}
        <section className="container mx-auto px-4 py-16 bg-gray-50" data-testid="privacy-section">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Your Privacy & Security Matter
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              We are committed to protecting your personal data and ensuring GDPR compliance.
              Your readings and journal entries are encrypted and stored securely.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <a
                href="/privacy"
                className="text-primary-600 hover:text-primary-700 underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                aria-label="View our privacy policy"
              >
                Privacy Policy
              </a>
              <span className="text-gray-400" aria-hidden="true">
                |
              </span>
              <a
                href="/terms"
                className="text-primary-600 hover:text-primary-700 underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                aria-label="View our terms of service"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 py-8 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} TarotLyfe. All rights reserved.</p>
        </div>
      </footer>
    </div>
    </>
  );
};

export default LandingPage;

