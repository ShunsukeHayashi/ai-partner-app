/**
 * JWT Token utilities
 */

import jwt from 'jsonwebtoken';
import { createLogger } from './logger.js';

const logger = createLogger('jwt');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * トークンを生成
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * トークンを検証
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid token', { error: error.message });
    } else if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Token expired', { expiredAt: error.expiredAt });
    }
    return null;
  }
}

/**
 * トークンをデコード（検証なし）
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    logger.error('Failed to decode token', { error });
    return null;
  }
}
