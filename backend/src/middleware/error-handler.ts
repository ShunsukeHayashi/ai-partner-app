/**
 * Global error handler middleware
 */

import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('error-handler');

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    logger.warn(`Operational error: ${err.message}`, {
      statusCode: err.statusCode,
      path: req.path,
    });

    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
  }

  // Programming or unknown errors
  logger.error('Unknown error occurred', {
    message: err.message,
    stack: err.stack,
    path: req.path,
  });

  return res.status(500).json({
    error: {
      message: 'Internal server error',
      statusCode: 500,
    },
  });
}
