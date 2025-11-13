describe('Landing Page E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays hero section with headline and description', () => {
    cy.contains('Discover Your Path with').should('be.visible');
    cy.contains('AI-Powered Tarot').should('be.visible');
    cy.contains('Combine ancient tarot wisdom with modern AI').should('be.visible');
  });

  it('displays Sign Up and Login buttons', () => {
    cy.get('[data-testid="signup-button"]').should('be.visible');
    cy.get('[data-testid="login-button"]').should('be.visible');
  });

  it('navigates to signup page when Sign Up button is clicked', () => {
    cy.get('[data-testid="signup-button"]').click();
    cy.url().should('include', '/signup');
  });

  it('navigates to login page when Login button is clicked', () => {
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/login');
  });

  it('displays value propositions section', () => {
    cy.contains('Why TarotLyfe?').should('be.visible');
    cy.contains('Magical Card Drawing').should('be.visible');
    cy.contains('AI Interpretations').should('be.visible');
    cy.contains('Frictionless Journaling').should('be.visible');
  });

  it('displays privacy and security assurance section', () => {
    cy.contains('Your Privacy & Security Matter').should('be.visible');
    cy.contains('GDPR compliance').should('be.visible');
  });

  it('displays privacy policy and terms links', () => {
    cy.get('a[href="/privacy"]').should('be.visible').and('contain', 'Privacy Policy');
    cy.get('a[href="/terms"]').should('be.visible').and('contain', 'Terms of Service');
  });

  it('navigates to privacy page when Privacy Policy link is clicked', () => {
    cy.get('a[href="/privacy"]').click();
    cy.url().should('include', '/privacy');
  });

  it('navigates to terms page when Terms of Service link is clicked', () => {
    cy.get('a[href="/terms"]').click();
    cy.url().should('include', '/terms');
  });

  describe('Responsiveness', () => {
    it('displays correctly on mobile viewport', () => {
      cy.viewport(375, 667); // iPhone SE
      cy.get('[data-testid="hero-section"]').should('be.visible');
      cy.get('[data-testid="signup-button"]').should('be.visible');
      cy.get('[data-testid="login-button"]').should('be.visible');
    });

    it('displays correctly on tablet viewport', () => {
      cy.viewport(768, 1024); // iPad
      cy.get('[data-testid="hero-section"]').should('be.visible');
      cy.get('[data-testid="signup-button"]').should('be.visible');
      cy.get('[data-testid="login-button"]').should('be.visible');
    });

    it('displays correctly on desktop viewport', () => {
      cy.viewport(1920, 1080); // Desktop
      cy.get('[data-testid="hero-section"]').should('be.visible');
      cy.get('[data-testid="signup-button"]').should('be.visible');
      cy.get('[data-testid="login-button"]').should('be.visible');
    });

    it('maintains layout integrity across breakpoints', () => {
      const viewports = [
        { width: 375, height: 667, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1920, height: 1080, name: 'desktop' },
      ];

      viewports.forEach((viewport) => {
        cy.viewport(viewport.width, viewport.height);
        cy.get('[data-testid="hero-section"]').should('be.visible');
        cy.get('[data-testid="value-propositions"]').should('be.visible');
        cy.get('[data-testid="signup-button"]').should('be.visible');
        cy.get('[data-testid="login-button"]').should('be.visible');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic HTML structure', () => {
      cy.get('header').should('exist');
      cy.get('main').should('exist');
      cy.get('footer').should('exist');
      cy.get('nav').should('exist');
    });

    it('has accessible button labels', () => {
      cy.get('button').contains('Sign Up').should('have.attr', 'aria-label');
      cy.get('button').contains('Login').should('have.attr', 'aria-label');
    });

    it('has accessible link labels', () => {
      cy.get('a[href="/privacy"]').should('have.attr', 'aria-label');
      cy.get('a[href="/terms"]').should('have.attr', 'aria-label');
    });

    it('has navigation landmark with aria-label', () => {
      cy.get('nav').should('have.attr', 'aria-label');
    });
  });
});

