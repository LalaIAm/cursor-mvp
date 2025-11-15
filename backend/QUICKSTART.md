# Quick Start Guide

## Prerequisites

1. **Node.js 18+** installed
2. **PostgreSQL** installed and running
3. **Database created**: `tarotlyfe`

## Setup Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy the example environment file:
```bash
cp env.example .env
```

Edit `.env` and set:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A strong random secret (use `openssl rand -hex 32` to generate)

### 3. Create Database and Run Migration

```bash
# Create database (if not exists)
createdb tarotlyfe

# Run migration
psql -d tarotlyfe -f src/db/migrations/001_create_users_table.sql
```

### 4. Start the Server

Development mode (with hot reload):
```bash
npm run dev
```

The server will start on `http://localhost:3001`

### 5. Test the Endpoints

#### Register a new user:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

Expected response (201):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "email": "test@example.com"
  }
}
```

#### Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }' \
  -c cookies.txt
```

Expected response (200):
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "email": "test@example.com"
  },
  "accessToken": "jwt-token-here"
}
```

The refresh token will be set as an HttpOnly cookie (check `cookies.txt`).

### 6. Run Tests

```bash
npm test
```

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Ensure database exists: `psql -l | grep tarotlyfe`

### Port Already in Use

Change the port in `.env`:
```
PORT=3002
```

### JWT Secret Warning

In development, a default secret is used. In production, you **must** set a strong `JWT_SECRET`:
```bash
export JWT_SECRET=$(openssl rand -hex 32)
```

## Next Steps

- Integrate with frontend
- Implement refresh token endpoint
- Add rate limiting
- Set up production environment variables

