/**
 * Authentication Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/db.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../middleware/error-handler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

/**
 * POST /api/auth/register
 * ユーザー登録
 */
router.post(
  '/register',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: body.email }, { username: body.username }],
        },
      });

      if (existingUser) {
        throw new AppError('User already exists', 400);
      }

      // Hash password
      const hashedPassword = await hashPassword(body.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: body.email,
          username: body.username,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
        },
      });

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      res.status(201).json({
        user,
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(new AppError('Invalid input', 400));
      }
      next(error);
    }
  }
);

/**
 * POST /api/auth/login
 * ログイン
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isValid = await verifyPassword(body.password, user.password);

    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid input', 400));
    }
    next(error);
  }
});

/**
 * GET /api/auth/me
 * 現在のユーザー情報を取得
 */
router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * ログアウト（クライアント側でトークンを削除）
 */
router.post('/logout', (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
