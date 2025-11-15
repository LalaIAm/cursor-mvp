# TarotLyfe Backend API

Node.js REST API backend for TarotLyfe application.

## Features

- User registration and authentication
- JWT access tokens (1 hour expiry)
- HttpOnly refresh token cookies (30 days expiry)
- Secure password hashing with bcrypt
- PostgreSQL database
- Input validation with Zod
- Comprehensive error handling

## Setup

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your database connection and secrets:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/tarotlyfe
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

4. Create the database:
```bash
createdb tarotlyfe
```

5. Run migrations:
```bash
psql -d tarotlyfe -f src/db/migrations/001_create_users_table.sql
```

### Running the Server

Development mode (with hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

The server will run on `http://localhost:3001` by default.

## API Endpoints

### POST /api/auth/register

Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation error (invalid email format, weak password)
- `409 Conflict`: Email already registered

### POST /api/auth/login

Login and receive access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "accessToken": "jwt-token-here"
}
```

**Cookies:**
- `refreshToken`: HttpOnly cookie containing refresh token (30 days expiry)

**Error Responses:**
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Invalid credentials

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret key for JWT signing | - |
| `JWT_ACCESS_TOKEN_EXPIRY` | Access token expiry | `1h` |
| `JWT_REFRESH_TOKEN_EXPIRY` | Refresh token expiry | `30d` |
| `COOKIE_DOMAIN` | Cookie domain | `localhost` |
| `COOKIE_PATH` | Cookie path | `/` |
| `COOKIE_SECURE` | Secure cookie flag | `false` (true in production) |
| `COOKIE_SAME_SITE` | SameSite cookie attribute | `lax` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `BCRYPT_ROUNDS` | Bcrypt salt rounds | `12` |

## Security Considerations

- Passwords are hashed using bcrypt with configurable rounds
- Refresh tokens are hashed before storage in database
- JWT tokens are signed with a secret key
- HttpOnly cookies prevent XSS attacks
- Input validation prevents injection attacks
- Error messages don't leak sensitive information

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration
│   ├── db/              # Database connection and migrations
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── __tests__/       # Tests
├── dist/                # Compiled JavaScript
└── package.json
```

