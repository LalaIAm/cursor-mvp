# Technical Summary

Implement TarotLyfe as a cross-platform digital platform for tarot readings, AI-powered interpretations, and journaling, featuring secure authentication, subscription management, payment integration, and premium feature access control.  
The system follows a React.js frontend, Node.js backend, PostgreSQL database, Stripe for payments, OpenAI for AI, and uses OAuth2/JWT for authentication, with infrastructure hosted on AWS and Vercel.

## System Design

### **Frontend**

- Built with React.js, styled using Tailwind CSS, and uses TypeScript for type safety.
- Routing managed via React Router; state managed with Redux Toolkit.
- Responsive landing page introduces TarotLyfe, with accessible Sign Up and Login buttons.
- Authentication forms validate email/password and display error/success messages.
- Password reset flow includes request, confirmation, and new password entry.
- Journal editor uses Draft.js for rich-text editing, autosave, and tagging/categorization.
- Tarot card selection UI supports spread selection, card drawing, and feedback on AI interpretations.
- Subscription management UI displays plan status, allows upgrades/downgrades/cancellation, and integrates with Stripe payment forms.
- Premium features are conditionally rendered based on subscription status.
- All API calls use Axios or React Query, with error handling and user notifications for failures.
- Accessibility and responsiveness are prioritized across all components.
- Testing uses Jest, React Testing Library, and Cypress for unit, integration, and E2E tests.

### **Backend**

- Node.js backend exposes RESTful API endpoints for authentication, journal management, tarot readings, subscription, and payment processing.
- Authentication uses OAuth2 and JWT; tokens issued on login, expire after 1 hour, and refresh tokens (30 days) are stored in HttpOnly cookies.
- Secure password hashing (Argon2 or bcrypt) for user credentials.
- Password reset flow generates time-limited tokens, sends email via integrated service, and validates token on reset.
- Subscription management endpoints handle viewing, updating, and canceling subscriptions, with immediate access rights updates.
- Stripe integration for PCI-compliant payment processing; handles payment authorization, confirmation, and error notifications.
- AI tarot reading endpoints integrate with OpenAI API for context-aware interpretations and journaling prompts.
- Journal management endpoints support CRUD operations, autosave, tagging, categorization, and linking entries to readings.
- Access control logic verifies subscription status before granting premium feature access.
- All authentication and sensitive communications enforced via HTTPS/TLS at the infrastructure level (AWS/Vercel).
- Error handling includes clear user feedback, retry options, and fallback messaging for service outages.
- Testing uses Jest and Supertest for backend unit and integration tests.

### **Data & Storage**

- PostgreSQL database stores user accounts, journal entries, tarot readings, subscription details, tags, and categories.
- Redis used for caching and session management where needed.
- Local SQLite database supports offline access and sync for desktop/Electron app.
- Journal entries and readings are linked via foreign keys for cross-referencing.
- Autosave and sync logic queues changes for later upload if offline.
- All sensitive data is encrypted at rest and in transit.

### **Integrations**

- Stripe for payment processing, with backend handling payment events and status updates.
- OpenAI API for AI-generated tarot interpretations and journaling prompts.
- Email service for password reset and notifications.
- Electron desktop app syncs with backend for cross-device consistency and offline access.

#### **Security**

- OAuth2/JWT for authentication; tokens expire after 1 hour, refresh tokens (30 days) in HttpOnly cookies.
- Single active session per user enforced; logging in elsewhere invalidates previous session.
- HTTPS/TLS enforced at infrastructure level (AWS/Vercel).
- GDPR compliance and secure data handling displayed on landing page.
- Access control checks subscription status before enabling premium features.
- PCI compliance for payment forms and Stripe integration.
- Error handling for expired/invalid tokens redirects users to login immediately.

#### **Testing**

- Unit, integration, and E2E tests for all major flows: authentication, journal management, tarot readings, subscription, and payments.
- Jest and React Testing Library for frontend; Jest and Supertest for backend; Cypress for E2E.
- Coverage includes edge cases: token expiration, payment failures, autosave/network loss, duplicate tags, and feedback submission errors.

### Data Model / Schema Changes

| Table                | Column                | Type                | Description                                                      |
|----------------------|----------------------|---------------------|------------------------------------------------------------------|
| `users`              | `email`              | VARCHAR             | User email address                                               |
|                      | `password_hash`      | VARCHAR             | Hashed password                                                  |
|                      | `refresh_token`      | VARCHAR             | HttpOnly cookie value for session management                     |
|                      | `subscription_id`    | UUID (FK)           | References current subscription                                  |
| `journal_entries`    | `id`                 | UUID (PK)           | Journal entry identifier                                         |
|                      | `user_id`            | UUID (FK)           | References user                                                  |
|                      | `content`            | TEXT                | Rich-text journal content                                        |
|                      | `tags`               | TEXT[]              | Array of tags                                                    |
|                      | `category_id`        | UUID (FK)           | References category                                              |
|                      | `reading_id`         | UUID (FK)           | References linked tarot reading                                  |
| `categories`         | `id`                 | UUID (PK)           | Category identifier                                              |
|                      | `name`               | VARCHAR             | Category name                                                    |
| `tags`               | `id`                 | UUID (PK)           | Tag identifier                                                   |
|                      | `name`               | VARCHAR             | Tag name                                                         |
| `tarot_readings`     | `id`                 | UUID (PK)           | Tarot reading identifier                                         |
|                      | `user_id`            | UUID (FK)           | References user                                                  |
|                      | `spread_type`        | VARCHAR             | Type of tarot spread                                             |
|                      | `cards`              | JSONB               | Selected cards and positions                                     |
|                      | `ai_interpretation`  | TEXT                | AI-generated interpretation                                      |
| `subscriptions`      | `id`                 | UUID (PK)           | Subscription identifier                                          |
|                      | `user_id`            | UUID (FK)           | References user                                                  |
|                      | `plan`               | VARCHAR             | Subscription plan name                                           |
|                      | `status`             | VARCHAR             | Active, canceled, etc.                                           |
|                      | `stripe_id`          | VARCHAR             | Stripe subscription/payment identifier                           |

All schema changes follow existing naming, indexing, and migration standards.
