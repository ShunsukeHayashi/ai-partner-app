/**
 * BytePlus API Test Routes
 * Testing endpoints for T2I, I2I, I2V, T2V
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';
import { bytePlusT2I, bytePlusI2I, bytePlusI2V, bytePlusT2V } from '../services/byteplus/legacy.js';
import { geminiTTS } from '../services/ai/gemini-tts.js';
import { claudeService } from '../services/ai/claude.js';

const router = Router();

// T2I Test Schema
const t2iTestSchema = z.object({
  prompt: z.string().min(1),
  size: z.string().optional(),
  guidanceScale: z.number().optional(),
  watermark: z.boolean().optional(),
});

// I2I Test Schema
const i2iTestSchema = z.object({
  prompt: z.string().min(1),
  imageUrl: z.union([z.string().url(), z.array(z.string().url())]),
  size: z.string().optional(),
  guidanceScale: z.number().optional(),
  watermark: z.boolean().optional(),
  sequentialImageGeneration: z.enum(['auto', 'disabled']).optional(),
  maxImages: z.number().min(1).max(10).optional(),
});

// Expression Test Schema (with custom prompt support)
const expressionTestSchema = z.object({
  imageUrl: z.string().url(),
  expression: z.string().min(1),
  customPrompt: z.string().optional(),
});

// Image Combination Test Schema
const imageCombineTestSchema = z.object({
  imageUrls: z.array(z.string().url()).min(2).max(2),
  prompt: z.string().min(1),
  customPrompt: z.string().optional(),
});

// I2V Test Schema
const i2vTestSchema = z.object({
  prompt: z.string().min(1),
  imageUrl: z.string().url(),
  options: z.object({
    resolution: z.string().optional(),
    duration: z.number().optional(),
    cameraFixed: z.boolean().optional(),
  }).optional(),
});

// T2V Test Schema
const t2vTestSchema = z.object({
  prompt: z.string().min(1),
  options: z.object({
    resolution: z.string().optional(),
    duration: z.number().optional(),
    cameraFixed: z.boolean().optional(),
  }).optional(),
});

// TTS Test Schema
const ttsTestSchema = z.object({
  text: z.string().min(1),
  voiceName: z.string().optional(),
  emotion: z.enum(['neutral', 'happy', 'sad', 'angry', 'romantic']).optional(),
});

// Prompt Generation Test Schema
const promptGenerationSchema = z.object({
  userInput: z.string().min(1),
  expression: z.string().min(1),
});

/**
 * POST /api/test/t2i
 * Test Text-to-Image API
 */
router.post(
  '/t2i',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = t2iTestSchema.parse(req.body);

      const result = await bytePlusT2I.generate({
        prompt: body.prompt,
        size: body.size as '1024x1024' | '512x512' | '768x768' | undefined,
        guidanceScale: body.guidanceScale,
        watermark: body.watermark,
      });

      res.json({
        success: true,
        data: result,
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
 * POST /api/test/i2i
 * Test Image-to-Image API
 */
router.post(
  '/i2i',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = i2iTestSchema.parse(req.body);

      const result = await bytePlusI2I.generate({
        prompt: body.prompt,
        imageUrl: body.imageUrl,
        size: body.size as 'adaptive' | '1024x1024' | '1k' | '2k' | '4k' | undefined,
        guidanceScale: body.guidanceScale,
        watermark: body.watermark,
        sequentialImageGeneration: body.sequentialImageGeneration,
        maxImages: body.maxImages,
      });

      res.json({
        success: true,
        data: result,
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
 * POST /api/test/i2v
 * Test Image-to-Video API (Create Task)
 */
router.post(
  '/i2v',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = i2vTestSchema.parse(req.body);

      const result = await bytePlusI2V.generate({
        prompt: body.prompt,
        imageUrl: body.imageUrl,
        options: body.options,
      });

      res.json({
        success: true,
        data: result,
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
 * GET /api/test/i2v/:taskId
 * Query Image-to-Video Task Status
 */
router.get(
  '/i2v/:taskId',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { taskId } = req.params;

      const result = await bytePlusI2V.queryTask(taskId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/test/t2v
 * Test Text-to-Video API (Create Task)
 */
router.post(
  '/t2v',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = t2vTestSchema.parse(req.body);

      const result = await bytePlusT2V.generate({
        prompt: body.prompt,
        options: body.options,
      });

      res.json({
        success: true,
        data: result,
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
 * GET /api/test/t2v/:taskId
 * Query Text-to-Video Task Status
 */
router.get(
  '/t2v/:taskId',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { taskId } = req.params;

      const result = await bytePlusT2V.queryTask(taskId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/test/expression
 * Test Expression Change with Custom Prompt
 */
router.post(
  '/expression',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = expressionTestSchema.parse(req.body);

      const result = await bytePlusI2I.changeExpression({
        sourceImageUrl: body.imageUrl,
        expression: body.expression,
        customPrompt: body.customPrompt,
      });

      res.json({
        success: true,
        data: result,
        usedCustomPrompt: !!body.customPrompt,
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
 * POST /api/test/combine-images
 * Test Multiple Image Combination
 */
router.post(
  '/combine-images',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = imageCombineTestSchema.parse(req.body);

      // Build final prompt
      const finalPrompt = body.customPrompt
        ? `${body.prompt} ${body.customPrompt}`
        : body.prompt;

      // Use I2I service with multiple images
      const result = await bytePlusI2I.generate({
        prompt: finalPrompt,
        imageUrl: body.imageUrls,
        size: '2k',
        watermark: false,
      });

      res.json({
        success: true,
        data: result,
        usedMultipleImages: true,
        usedCustomPrompt: !!body.customPrompt,
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
 * POST /api/test/tts
 * Test Text-to-Speech API
 */
router.post(
  '/tts',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = ttsTestSchema.parse(req.body);

      const result = await geminiTTS.generateCharacterVoice({
        text: body.text,
        voiceName: body.voiceName,
        emotion: body.emotion,
      });

      res.json({
        success: true,
        data: {
          audioContent: result.audioContent,
          contentType: result.contentType,
          duration: result.duration,
          text: body.text,
          voiceName: body.voiceName,
          emotion: body.emotion,
        },
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
 * POST /api/test/generate-prompt
 * Test Claude API Prompt Generation (Japanese to English)
 */
router.post(
  '/generate-prompt',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = promptGenerationSchema.parse(req.body);

      const result = await claudeService.generatePrompt({
        userInput: body.userInput,
        expression: body.expression,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(new AppError('Invalid input', 400));
      }
      next(error);
    }
  }
);

export default router;
