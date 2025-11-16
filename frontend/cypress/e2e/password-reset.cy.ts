describe('Password Reset Flow E2E Tests', () => {
  const API_BASE_URL = Cypress.env('VITE_API_BASE_URL') || 'http://localhost:3001';

  beforeEach(() => {
    // Intercept API calls
    cy.intercept('POST', `${API_BASE_URL}/api/auth/password-reset/request`, {
      statusCode: 200,
      body: {
        message: 'If an account exists with this email, a password reset link has been sent.',
      },
    }).as('requestPasswordReset');

    cy.intercept('POST', `${API_BASE_URL}/api/auth/password-reset/confirm`, {
      statusCode: 200,
      body: {
        message: 'Password has been reset successfully. Please log in with your new password.',
      },
    }).as('confirmPasswordReset');
  });

  describe('Password Reset Request Page', () => {
    beforeEach(() => {
      cy.visit('/password-reset');
    });

    it('displays password reset request form', () => {
      cy.contains('Reset Password').should('be.visible');
      cy.contains('Enter your email address').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('button').contains('Send Reset Link').should('be.visible');
    });

    it('displays links to login and signup', () => {
      cy.contains('Remember your password?').should('be.visible');
      cy.contains("Don't have an account?").should('be.visible');
      cy.get('a').contains('Log in').should('be.visible');
      cy.get('a').contains('Sign up').should('be.visible');
    });

    it('validates email format', () => {
      cy.get('input[type="email"]').type('invalid-email');
      cy.get('button').contains('Send Reset Link').click();
      cy.contains('Invalid email format').should('be.visible');
    });

    it('requires email field', () => {
      cy.get('button').contains('Send Reset Link').click();
      cy.contains('Email is required').should('be.visible');
    });

    it('submits form with valid email', () => {
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('button').contains('Send Reset Link').click();

      cy.wait('@requestPasswordReset').then((interception) => {
        expect(interception.request.body).to.deep.equal({
          email: 'test@example.com',
        });
      });

      cy.contains(
        'If an account exists with this email, a password reset link has been sent.'
      ).should('be.visible');
    });

    it('shows loading state during submission', () => {
      cy.intercept('POST', `${API_BASE_URL}/api/auth/password-reset/request`, {
        statusCode: 200,
        body: {
          message: 'If an account exists with this email, a password reset link has been sent.',
        },
        delay: 500,
      }).as('slowRequest');

      cy.get('input[type="email"]').type('test@example.com');
      cy.get('button').contains('Send Reset Link').click();
      cy.contains('Loading...').should('be.visible');
      cy.get('button').contains('Send Reset Link').should('be.disabled');
    });

    it('handles network errors', () => {
      cy.intercept('POST', `${API_BASE_URL}/api/auth/password-reset/request`, {
        statusCode: 500,
        body: {
          error: {
            code: 'server_error',
            message: 'Server error. Please try again later.',
          },
        },
      }).as('serverError');

      cy.get('input[type="email"]').type('test@example.com');
      cy.get('button').contains('Send Reset Link').click();

      cy.wait('@serverError');
      cy.contains('Server error').should('be.visible');
    });

    it('clears email on success', () => {
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('button').contains('Send Reset Link').click();

      cy.wait('@requestPasswordReset');
      cy.get('input[type="email"]').should('have.value', '');
    });

    it('disables form after successful submission', () => {
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('button').contains('Send Reset Link').click();

      cy.wait('@requestPasswordReset');
      cy.get('input[type="email"]').should('be.disabled');
      cy.get('button').contains('Send Reset Link').should('be.disabled');
    });

    it('navigates to login when login link is clicked', () => {
      cy.get('a').contains('Log in').click();
      cy.url().should('include', '/login');
    });

    it('navigates to signup when signup link is clicked', () => {
      cy.get('a').contains('Sign up').click();
      cy.url().should('include', '/signup');
    });
  });

  describe('Password Reset Confirm Page', () => {
    it('displays token missing message when token is not provided', () => {
      cy.visit('/password-reset/confirm');
      cy.contains('No reset token found').should('be.visible');
      cy.get('button').contains('Request New Reset Link').should('be.visible');
    });

    it('displays password reset confirm form with valid token', () => {
      cy.visit('/password-reset/confirm?token=test-token-123');
      cy.contains('Set New Password').should('be.visible');
      cy.get('input[name="newPassword"]').should('be.visible');
      cy.get('input[name="confirmPassword"]').should('be.visible');
      cy.get('button').contains('Reset Password').should('be.visible');
    });

    it('validates password requirements', () => {
      cy.visit('/password-reset/confirm?token=test-token-123');
      cy.get('input[name="newPassword"]').type('short');
      cy.get('button').contains('Reset Password').click();
      cy.contains('Password must be at least 8 characters long').should('be.visible');
    });

    it('validates password confirmation match', () => {
      cy.visit('/password-reset/confirm?token=test-token-123');
      cy.get('input[name="newPassword"]').type('NewPass123!');
      cy.get('input[name="confirmPassword"]').type('DifferentPass123!');
      cy.get('button').contains('Reset Password').click();
      cy.contains('Passwords do not match').should('be.visible');
    });

    it('requires password confirmation', () => {
      cy.visit('/password-reset/confirm?token=test-token-123');
      cy.get('input[name="newPassword"]').type('NewPass123!');
      cy.get('button').contains('Reset Password').click();
      cy.contains('Please confirm your password').should('be.visible');
    });

    it('submits form with valid password and token', () => {
      cy.visit('/password-reset/confirm?token=test-token-123');
      cy.get('input[name="newPassword"]').type('NewPass123!');
      cy.get('input[name="confirmPassword"]').type('NewPass123!');
      cy.get('button').contains('Reset Password').click();

      cy.wait('@confirmPasswordReset').then((interception) => {
        expect(interception.request.body).to.deep.equal({
          token: 'test-token-123',
          newPassword: 'NewPass123!',
        });
      });

      cy.contains('Password has been reset successfully! Redirecting to login').should(
        'be.visible'
      );
    });

    it('shows loading state during submission', () => {
      cy.intercept('POST', `${API_BASE_URL}/api/auth/password-reset/confirm`, {
        statusCode: 200,
        body: {
          message: 'Password has been reset successfully. Please log in with your new password.',
        },
        delay: 500,
      }).as('slowConfirm');

      cy.visit('/password-reset/confirm?token=test-token-123');
      cy.get('input[name="newPassword"]').type('NewPass123!');
      cy.get('input[name="confirmPassword"]').type('NewPass123!');
      cy.get('button').contains('Reset Password').click();
      cy.contains('Loading...').should('be.visible');
      cy.get('button').contains('Reset Password').should('be.disabled');
    });

    it('handles invalid token error', () => {
      cy.intercept('POST', `${API_BASE_URL}/api/auth/password-reset/confirm`, {
        statusCode: 400,
        body: {
          error: {
            code: 'invalid_token',
            message: 'Invalid or expired token',
          },
        },
      }).as('invalidToken');

      cy.visit('/password-reset/confirm?token=invalid-token');
      cy.get('input[name="newPassword"]').type('NewPass123!');
      cy.get('input[name="confirmPassword"]').type('NewPass123!');
      cy.get('button').contains('Reset Password').click();

      cy.wait('@invalidToken');
      cy.contains('This password reset link is invalid or has expired').should('be.visible');
      cy.contains('Request a new reset link').should('be.visible');
    });

    it('handles expired token error', () => {
      cy.intercept('POST', `${API_BASE_URL}/api/auth/password-reset/confirm`, {
        statusCode: 400,
        body: {
          error: {
            code: 'expired_token',
            message: 'Token has expired',
          },
        },
      }).as('expiredToken');

      cy.visit('/password-reset/confirm?token=expired-token');
      cy.get('input[name="newPassword"]').type('NewPass123!');
      cy.get('input[name="confirmPassword"]').type('NewPass123!');
      cy.get('button').contains('Reset Password').click();

      cy.wait('@expiredToken');
      cy.contains('This password reset link is invalid or has expired').should('be.visible');
    });

    it('clears form data on success', () => {
      cy.visit('/password-reset/confirm?token=test-token-123');
      cy.get('input[name="newPassword"]').type('NewPass123!');
      cy.get('input[name="confirmPassword"]').type('NewPass123!');
      cy.get('button').contains('Reset Password').click();

      cy.wait('@confirmPasswordReset');
      cy.get('input[name="newPassword"]').should('have.value', '');
      cy.get('input[name="confirmPassword"]').should('have.value', '');
    });

    it('disables form after successful submission', () => {
      cy.visit('/password-reset/confirm?token=test-token-123');
      cy.get('input[name="newPassword"]').type('NewPass123!');
      cy.get('input[name="confirmPassword"]').type('NewPass123!');
      cy.get('button').contains('Reset Password').click();

      cy.wait('@confirmPasswordReset');
      cy.get('input[name="newPassword"]').should('be.disabled');
      cy.get('input[name="confirmPassword"]').should('be.disabled');
      cy.get('button').contains('Reset Password').should('be.disabled');
    });

    it('navigates to password reset request when token is missing and button is clicked', () => {
      cy.visit('/password-reset/confirm');
      cy.get('button').contains('Request New Reset Link').click();
      cy.url().should('include', '/password-reset');
    });

    it('navigates to password reset request when link is clicked', () => {
      cy.visit('/password-reset/confirm?token=test-token-123');
      cy.get('a').contains('Request a new reset link').click();
      cy.url().should('include', '/password-reset');
    });

    it('navigates to login when login link is clicked', () => {
      cy.visit('/password-reset/confirm?token=test-token-123');
      cy.get('a').contains('Log in').click();
      cy.url().should('include', '/login');
    });
  });

  describe('Full Password Reset Flow', () => {
    it('completes full password reset flow', () => {
      // Step 1: Request password reset
      cy.visit('/password-reset');
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('button').contains('Send Reset Link').click();
      cy.wait('@requestPasswordReset');
      cy.contains('If an account exists with this email').should('be.visible');

      // Step 2: Confirm password reset (simulating clicking link from email)
      cy.visit('/password-reset/confirm?token=test-token-123');
      cy.get('input[name="newPassword"]').type('NewPass123!');
      cy.get('input[name="confirmPassword"]').type('NewPass123!');
      cy.get('button').contains('Reset Password').click();
      cy.wait('@confirmPasswordReset');
      cy.contains('Password has been reset successfully').should('be.visible');
    });
  });

  describe('Responsiveness', () => {
    it('displays correctly on mobile viewport', () => {
      cy.viewport(375, 667); // iPhone SE
      cy.visit('/password-reset');
      cy.contains('Reset Password').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('button').contains('Send Reset Link').should('be.visible');
    });

    it('displays correctly on tablet viewport', () => {
      cy.viewport(768, 1024); // iPad
      cy.visit('/password-reset');
      cy.contains('Reset Password').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('button').contains('Send Reset Link').should('be.visible');
    });

    it('displays correctly on desktop viewport', () => {
      cy.viewport(1920, 1080); // Desktop
      cy.visit('/password-reset');
      cy.contains('Reset Password').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('button').contains('Send Reset Link').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic HTML structure', () => {
      cy.visit('/password-reset');
      cy.get('form').should('exist');
      // Email input should be present
      cy.get('input[type="email"]').should('exist');
    });

    it('has accessible form labels', () => {
      cy.visit('/password-reset');
      // Accept any accessible-name pattern: label[for]/id association, aria-label, or aria-labelledby
      cy.get('input[type="email"]').should(($input) => {
        const id = $input.attr('id');
        const hasAriaLabel = !!$input.attr('aria-label');
        const hasAriaLabelledby = !!$input.attr('aria-labelledby');
        const hasAssociatedLabel = id
          ? Cypress.$(`label[for="${id}"]`).length > 0
          : false;
        expect(
          hasAriaLabel || hasAriaLabelledby || hasAssociatedLabel,
          'email input has accessible name via label/aria-label/aria-labelledby'
        ).to.be.true;
      });
    });

    it('has accessible error messages', () => {
      cy.visit('/password-reset');
      cy.get('button').contains('Send Reset Link').click();
      cy.get('[role="alert"]').should('exist');
    });
  });
});

