import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Error handler middleware
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log failed login attempts
  if (err.code === 'invalid_credentials' && req.path === '/api/auth/login') {
    console.log(`[WARN] Failed login attempt for email: ${req.body?.email || 'unknown'}`);
  }

  // Log error (but not sensitive data)
  const logLevel = err.statusCode && err.statusCode < 500 ? 'log' : 'error';
  console[logLevel]('Error:', {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  const code = err.code || 'server_error';
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: {
      code,
      message,
    },
  });
};

/**
 * 404 handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: {
      code: 'not_found',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
};

