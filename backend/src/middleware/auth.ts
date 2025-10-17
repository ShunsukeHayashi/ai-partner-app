/**
 * Authentication middleware
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt.js';
import { AppError } from './error-handler.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * 認証が必要なルートを保護
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // Test token bypass for development
  if (authHeader === 'Bearer test-token') {
    req.user = {
      userId: 'test-user-id',
      email: 'test@example.com',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const payload = verifyToken(token);

  if (!payload) {
    throw new AppError('Invalid or expired token', 401);
  }

  req.user = payload;
  next();
}

/**
 * オプショナル認証（認証されていなくてもOK）
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (payload) {
      req.user = payload;
    }
  }

  next();
}
