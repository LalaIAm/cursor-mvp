import dotenv from 'dotenv';

dotenv.config();

export const config = {
  database: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/tarotlyfe',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '1h',
    refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || '30d',
  },
  cookie: {
    domain: process.env.COOKIE_DOMAIN || 'localhost',
    path: process.env.COOKIE_PATH || '/',
    secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    sameSite: (process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none') || 'lax',
  },
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  },
};

// Validate required environment variables
if (!config.jwt.secret || config.jwt.secret === 'your-super-secret-jwt-key-change-in-production') {
  if (config.server.nodeEnv === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  console.warn('⚠️  Warning: Using default JWT_SECRET. This should be changed in production.');
}

