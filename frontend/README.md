# TarotLyfe Frontend

React + TypeScript frontend application for TarotLyfe, an AI-powered tarot reading and journaling platform.

## Tech Stack

- **React 18** with **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for routing
- **Jest** + **React Testing Library** for unit/integration tests
- **Cypress** for E2E tests

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing

### Unit/Integration Tests (Jest + React Testing Library)

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### E2E Tests (Cypress)

```bash
# Run E2E tests headlessly
npm run test:e2e

# Open Cypress Test Runner
npm run test:e2e:open
```

**Note:** Make sure the development server is running (`npm run dev`) before running E2E tests.

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   ├── pages/            # Page components
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main app component with routing
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── cypress/              # Cypress E2E tests
├── public/               # Static assets
└── package.json
```

## Routes

- `/` - Landing page (public)
- `/signup` - Sign up page (public)
- `/login` - Login page (public)
- `/privacy` - Privacy policy (public)
- `/terms` - Terms of service (public)
- `/dashboard` - User dashboard (protected)

## Features

### Landing Page

- Hero section with product messaging
- Prominent Sign Up and Login CTAs
- Value propositions (Magical Card Drawing, AI Interpretations, Frictionless Journaling)
- Privacy/security assurance section with links to Privacy Policy and Terms
- Fully responsive design
- Accessibility compliant (WCAG guidelines)
- SEO optimized with meta tags

### Authentication

- Auth utilities for checking authentication status
- Protected routes that redirect unauthenticated users
- Automatic redirect to dashboard for authenticated users on landing page

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow React best practices (hooks, functional components)
- Use Tailwind CSS utility classes (avoid inline styles)
- Follow existing component patterns

### Testing

- Write unit tests for all components
- Use `data-testid` attributes for stable test selectors
- Include accessibility tests using `jest-axe`
- Write E2E tests for critical user flows

### Accessibility

- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers

## TODO

- [ ] Integrate with actual auth state management (Redux/Zustand)
- [ ] Implement Sign Up form with validation
- [ ] Implement Login form with validation
- [ ] Add actual Privacy Policy content
- [ ] Add actual Terms of Service content
- [ ] Implement Dashboard page
- [ ] Add Storybook stories for components

## License

Copyright © 2024 TarotLyfe. All rights reserved.

