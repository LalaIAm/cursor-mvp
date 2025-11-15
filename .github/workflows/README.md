# CI/CD Workflows

This directory contains GitHub Actions workflows for continuous integration and deployment.

## CI Workflow (`.github/workflows/ci.yml`)

### Overview
The CI workflow runs on every push and pull request to `main` and `develop` branches. It executes all tests and generates comprehensive coverage reports.

### Jobs

#### 1. Backend Tests
- **Runs on**: Ubuntu Latest
- **Services**: PostgreSQL 15 (test database)
- **Steps**:
  1. Checkout code
  2. Setup Node.js 20 with npm cache
  3. Install backend dependencies
  4. Install PostgreSQL client tools
  5. Wait for PostgreSQL to be ready
  6. Run database migrations
  7. Run backend tests with coverage
  8. Upload coverage reports as artifacts

#### 2. Frontend Tests
- **Runs on**: Ubuntu Latest
- **Steps**:
  1. Checkout code
  2. Setup Node.js 20 with npm cache
  3. Install frontend dependencies
  4. Run frontend tests with coverage
  5. Upload coverage reports as artifacts

#### 3. Frontend E2E Tests
- **Runs on**: Ubuntu Latest
- **Services**: PostgreSQL 15 (test database)
- **Dependencies**: Backend Tests, Frontend Tests
- **Steps**:
  1. Checkout code
  2. Setup Node.js 20 with npm cache
  3. Install backend and frontend dependencies
  4. Install PostgreSQL client tools
  5. Wait for PostgreSQL to be ready
  6. Run database migrations
  7. Build backend
  8. Start backend server (port 3001)
  9. Start frontend dev server (port 3000)
  10. Wait for both servers to be ready
  11. Run Cypress E2E tests
  12. Upload test results, videos, and screenshots as artifacts

#### 4. Test Report Summary
- **Runs on**: Ubuntu Latest
- **Dependencies**: Backend Tests, Frontend Tests, Frontend E2E Tests
- **Steps**:
  1. Download coverage artifacts
  2. Download Cypress test results
  3. Generate test report summary with coverage metrics and E2E test results
  4. Display summary in GitHub Actions UI

### Coverage Reports

The workflow generates multiple coverage report formats:

- **HTML Reports**: Interactive coverage reports (download from artifacts)
- **LCOV Reports**: Standard format for coverage tools (Codecov, Coveralls, etc.)
- **JSON Summary**: Machine-readable coverage summary
- **Text Reports**: Console-friendly coverage output

### Artifacts

The following artifacts are uploaded and retained for 30 days:

**Backend:**
- `backend-coverage`: Complete backend coverage directory (HTML, LCOV, JSON)
- `backend-lcov`: Backend LCOV file only

**Frontend:**
- `frontend-coverage`: Complete frontend coverage directory (HTML, LCOV, JSON)
- `frontend-lcov`: Frontend LCOV file only

**E2E Tests:**
- `cypress-test-results`: JUnit XML test reports
- `cypress-videos`: Test execution videos
- `cypress-screenshots`: Failure screenshots

### Viewing Coverage Reports

1. Go to the GitHub Actions tab in your repository
2. Click on a workflow run
3. Scroll to the "Artifacts" section at the bottom
4. Download the coverage artifacts
5. Extract and open `coverage/index.html` in a browser

### Environment Variables

The workflow uses the following environment variables (set automatically):

**Backend:**
- `NODE_ENV=test`
- `DATABASE_URL=postgresql://test_user:test_password@localhost:5432/tarotlyfe_test`
- `JWT_SECRET=test-jwt-secret-for-ci`
- `EMAIL_PROVIDER=console`
- `PASSWORD_RESET_TOKEN_TTL_HOURS=1`

**Frontend:**
- Standard test environment (no special variables needed)

### Future Enhancements

- [ ] Codecov/Coveralls integration for coverage badges
- [ ] Test result annotations in PR comments
- [ ] Parallel test execution for faster runs
- [ ] Matrix builds for multiple Node.js versions
- [ ] Cypress Dashboard integration for better test visualization

