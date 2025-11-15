import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import authRoutes from './routes/authRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app: Express = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

const PORT = config.server.port;

// Start server if:
// 1. Not in Jest test environment (Jest sets process.env.JEST_WORKER_ID)
// 2. OR START_SERVER env var is explicitly set to 'true'
// 3. AND this file is run directly (not imported)
const shouldStartServer = 
  require.main === module && 
  (!process.env.JEST_WORKER_ID || process.env.START_SERVER === 'true');

if (shouldStartServer) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${config.server.nodeEnv}`);
  });
}

export default app;

