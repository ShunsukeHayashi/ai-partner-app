/**
 * Character Management Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/db.js';
import { AppError } from '../middleware/error-handler.js';
import { requireAuth } from '../middleware/auth.js';
import { bytePlusI2I, bytePlusI2V } from '../services/byteplus/legacy.js';
import { characterGeneratorService } from '../services/ai/character-generator.js';
import { imageAnalyzerService } from '../services/ai/image-analyzer.js';
import { saveImage } from '../utils/image-storage.js';

const router = Router();

// Validation schemas
const createCharacterSchema = z.object({
  name: z.string().min(1).max(50),
  age: z.number().min(18).max(100),
  occupation: z.string(),
  hobbies: z.string(),
  favoriteFood: z.string(),
  birthday: z.string().datetime(),
  bio: z.string(),
  // Appearance
  appearanceStyle: z.enum(['realistic', 'anime', 'manga']),
  hairColor: z.string(),
  hairStyle: z.string(),
  eyeColor: z.string(),
  skinTone: z.string(),
  height: z.string(),
  bodyType: z.string(),
  outfit: z.string(),
  accessories: z.string(),
  customPrompt: z.string().optional(),
  // Personality
  personalityArchetype: z.string(),
  traits: z.string(),
  speechStyle: z.string(),
  emotionalTendency: z.string(),
  interests: z.string(),
  values: z.string(),
  // Voice
  voiceId: z.string().optional(),
  voicePitch: z.number().optional(),
  voiceSpeed: z.number().optional(),
  voiceStyle: z.string().optional(),
});

const generateCharacterDetailsSchema = z.object({
  name: z.string().min(1).max(50),
  age: z.number().min(18).max(100),
  description: z.string().min(10).max(500),
});

const generateFromImageSchema = z.object({
  imageData: z.string().min(1), // Base64 encoded image
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp']).optional().default('image/jpeg'),
  name: z.string().min(1).max(50).optional(),
  age: z.number().min(18).max(100).optional(),
  description: z.string().max(500).optional(),
});

const generateFromMultipleImagesSchema = z.object({
  images: z.array(z.object({
    imageData: z.string().min(1),
    mimeType: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp']).optional().default('image/jpeg'),
  })).min(2).max(5), // 2-5枚の画像
  name: z.string().min(1).max(50).optional(),
  age: z.number().min(18).max(100).optional(),
  description: z.string().max(500).optional(),
  customPrompt: z.string().max(500).optional(), // 画像合成用のカスタムプロンプト
});

/**
 * POST /api/characters/generate-details
 * AI自動生成でキャラクター詳細を生成
 */
router.post(
  '/generate-details',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = generateCharacterDetailsSchema.parse(req.body);

      // Generate character details with Claude
      const generatedDetails = await characterGeneratorService.generateCharacterDetails({
        name: body.name,
        age: body.age,
        description: body.description,
      });

      // Generate a random birthday for the current age
      const today = new Date();
      const birthYear = today.getFullYear() - body.age;
      const birthMonth = Math.floor(Math.random() * 12);
      const birthDay = Math.floor(Math.random() * 28) + 1;
      const birthday = new Date(birthYear, birthMonth, birthDay);

      // Create character with generated details
      const character = await prisma.character.create({
        data: {
          userId: req.user!.userId,
          name: body.name,
          age: body.age,
          birthday,
          // Generated fields
          occupation: generatedDetails.occupation,
          hobbies: generatedDetails.hobbies,
          favoriteFood: generatedDetails.favoriteFood,
          bio: generatedDetails.bio,
          // Appearance
          appearanceStyle: generatedDetails.appearanceStyle,
          hairColor: generatedDetails.hairColor,
          hairStyle: generatedDetails.hairStyle,
          eyeColor: generatedDetails.eyeColor,
          skinTone: generatedDetails.skinTone,
          height: generatedDetails.height,
          bodyType: generatedDetails.bodyType,
          outfit: generatedDetails.outfit,
          accessories: generatedDetails.accessories,
          customPrompt: generatedDetails.customPrompt,
          // Personality
          personalityArchetype: generatedDetails.personalityArchetype,
          traits: generatedDetails.traits,
          speechStyle: generatedDetails.speechStyle,
          emotionalTendency: generatedDetails.emotionalTendency,
          interests: generatedDetails.interests,
          values: generatedDetails.values,
          // Voice
          voiceId: generatedDetails.voiceId,
          voicePitch: generatedDetails.voicePitch,
          voiceSpeed: generatedDetails.voiceSpeed,
          voiceStyle: generatedDetails.voiceStyle,
        },
      });

      // Create initial stage progress
      await prisma.stageProgress.create({
        data: {
          characterId: character.id,
          userId: req.user!.userId,
          currentStage: 'first_meet',
          affection: 0,
          unlockedStages: 'first_meet',
          completedEvents: '',
        },
      });

      res.status(201).json({
        character,
        generatedDetails: true,
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
 * POST /api/characters/generate-from-image
 * 画像からキャラクター生成
 * TODO: 本番環境では requireAuth を有効化すること
 */
router.post(
  '/generate-from-image',
  requireAuth, // 認証必須に変更
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = generateFromImageSchema.parse(req.body);

      // 認証済みユーザーIDを使用
      const userId = req.user!.userId;

      // Save image to local filesystem FIRST
      const savedImage = await saveImage({
        userId,
        imageType: 'source',
        base64Data: body.imageData,
        mimeType: body.mimeType,
      });

      // Analyze image with Claude Vision
      const { appearance, profile } = await imageAnalyzerService.generateCharacterFromImage(
        body.imageData,
        body.mimeType,
        {
          name: body.name,
          age: body.age,
          description: body.description,
        }
      );

      // Use provided values or defaults from analysis
      const finalName = body.name || appearance.suggestedName;
      const finalAge = body.age || appearance.estimatedAge;

      // Generate a random birthday for the age
      const today = new Date();
      const birthYear = today.getFullYear() - finalAge;
      const birthMonth = Math.floor(Math.random() * 12);
      const birthDay = Math.floor(Math.random() * 28) + 1;
      const birthday = new Date(birthYear, birthMonth, birthDay);

      // Create character with analyzed appearance and generated profile
      const character = await prisma.character.create({
        data: {
          userId,
          name: finalName,
          age: finalAge,
          birthday,
          // Profile from AI generation
          occupation: profile.occupation,
          hobbies: profile.hobbies,
          favoriteFood: profile.favoriteFood,
          bio: profile.bio,
          // Appearance from image analysis
          appearanceStyle: appearance.appearanceStyle,
          hairColor: appearance.hairColor,
          hairStyle: appearance.hairStyle,
          eyeColor: appearance.eyeColor,
          skinTone: appearance.skinTone,
          height: appearance.estimatedHeight,
          bodyType: appearance.bodyType,
          outfit: appearance.outfit,
          accessories: appearance.accessories,
          customPrompt: appearance.customPrompt,
          // Personality from profile generation
          personalityArchetype: profile.personalityArchetype,
          traits: profile.traits,
          speechStyle: profile.speechStyle,
          emotionalTendency: profile.emotionalTendency,
          interests: profile.interests,
          values: profile.values,
          // Voice settings from profile
          voiceId: profile.voiceId,
          voicePitch: profile.voicePitch,
          voiceSpeed: profile.voiceSpeed,
          voiceStyle: profile.voiceStyle,
          // Saved image path
          sourceImagePath: savedImage.relativePath,
        },
      });

      // Create initial stage progress
      await prisma.stageProgress.create({
        data: {
          characterId: character.id,
          userId,
          currentStage: 'first_meet',
          affection: 0,
          unlockedStages: 'first_meet',
          completedEvents: '',
        },
      });

      res.status(201).json({
        character,
        generatedFromImage: true,
        savedImagePath: savedImage.relativePath,
        analysis: {
          appearance,
          personality: appearance.estimatedPersonality,
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
 * POST /api/characters/generate-from-multiple-images
 * 複数画像からキャラクター生成
 * TODO: 本番環境では requireAuth を有効化すること
 */
router.post(
  '/generate-from-multiple-images',
  // requireAuth, // 開発中は一時的にコメントアウト
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = generateFromMultipleImagesSchema.parse(req.body);

      // TODO: 開発中は固定ユーザーID、本番環境では req.user!.userId を使用
      const userId = req.user?.userId || 'dev-user-001';

      // Save all images to local filesystem
      const savedImages = await Promise.all(
        body.images.map((img, index) =>
          saveImage({
            userId,
            imageType: 'source',
            base64Data: img.imageData,
            mimeType: img.mimeType,
            suffix: `_${index + 1}`, // Add index to filename
          })
        )
      );

      // Analyze first image with Claude Vision (primary reference)
      const { appearance, profile } = await imageAnalyzerService.generateCharacterFromImage(
        body.images[0].imageData,
        body.images[0].mimeType,
        {
          name: body.name,
          age: body.age,
          description: body.description,
        }
      );

      // Use provided values or defaults from analysis
      const finalName = body.name || appearance.suggestedName;
      const finalAge = body.age || appearance.estimatedAge;

      // Generate a random birthday for the age
      const today = new Date();
      const birthYear = today.getFullYear() - finalAge;
      const birthMonth = Math.floor(Math.random() * 12);
      const birthDay = Math.floor(Math.random() * 28) + 1;
      const birthday = new Date(birthYear, birthMonth, birthDay);

      // Create character with analyzed appearance and generated profile
      const character = await prisma.character.create({
        data: {
          userId,
          name: finalName,
          age: finalAge,
          birthday,
          // Profile from AI generation
          occupation: profile.occupation,
          hobbies: profile.hobbies,
          favoriteFood: profile.favoriteFood,
          bio: profile.bio,
          // Appearance from image analysis
          appearanceStyle: appearance.appearanceStyle,
          hairColor: appearance.hairColor,
          hairStyle: appearance.hairStyle,
          eyeColor: appearance.eyeColor,
          skinTone: appearance.skinTone,
          height: appearance.estimatedHeight,
          bodyType: appearance.bodyType,
          outfit: appearance.outfit,
          accessories: appearance.accessories,
          customPrompt: body.customPrompt || appearance.customPrompt,
          // Personality from profile generation
          personalityArchetype: profile.personalityArchetype,
          traits: profile.traits,
          speechStyle: profile.speechStyle,
          emotionalTendency: profile.emotionalTendency,
          interests: profile.interests,
          values: profile.values,
          // Voice settings from profile
          voiceId: profile.voiceId,
          voicePitch: profile.voicePitch,
          voiceSpeed: profile.voiceSpeed,
          voiceStyle: profile.voiceStyle,
          // Save first image path as primary source
          sourceImagePath: savedImages[0].relativePath,
        },
      });

      // Create initial stage progress
      await prisma.stageProgress.create({
        data: {
          characterId: character.id,
          userId,
          currentStage: 'first_meet',
          affection: 0,
          unlockedStages: 'first_meet',
          completedEvents: '',
        },
      });

      // Now generate primary image using all uploaded images via I2I
      const imageDataURIs = body.images.map(
        (img) => `data:${img.mimeType};base64,${img.imageData}`
      );

      const combinedPrompt = body.customPrompt
        ? `${body.customPrompt}. ${appearance.customPrompt}`
        : appearance.customPrompt;

      const imageResult = await bytePlusI2I.generate({
        prompt: combinedPrompt,
        imageUrl: imageDataURIs, // Multiple images as data URIs
        size: '1024x1024',
        watermark: false,
        strength: 0.6, // More transformation for multiple images
      });

      // Update character with generated image
      await prisma.character.update({
        where: { id: character.id },
        data: {
          primaryImageUrl: imageResult.imageUrl,
          imagesGenerated: true,
          lastGeneratedAt: new Date(),
        },
      });

      res.status(201).json({
        character: {
          ...character,
          primaryImageUrl: imageResult.imageUrl,
          imagesGenerated: true,
        },
        generatedFromMultipleImages: true,
        imageCount: body.images.length,
        savedImagePaths: savedImages.map((img) => img.relativePath),
        analysis: {
          appearance,
          personality: appearance.estimatedPersonality,
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
 * POST /api/characters
 * キャラクター作成
 */
router.post(
  '/',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createCharacterSchema.parse(req.body);

      const character = await prisma.character.create({
        data: {
          userId: req.user!.userId,
          name: body.name,
          age: body.age,
          occupation: body.occupation,
          hobbies: body.hobbies,
          favoriteFood: body.favoriteFood,
          birthday: new Date(body.birthday),
          bio: body.bio,
          // Appearance
          appearanceStyle: body.appearanceStyle,
          hairColor: body.hairColor,
          hairStyle: body.hairStyle,
          eyeColor: body.eyeColor,
          skinTone: body.skinTone,
          height: body.height,
          bodyType: body.bodyType,
          outfit: body.outfit,
          accessories: body.accessories,
          customPrompt: body.customPrompt,
          // Personality
          personalityArchetype: body.personalityArchetype,
          traits: body.traits,
          speechStyle: body.speechStyle,
          emotionalTendency: body.emotionalTendency,
          interests: body.interests,
          values: body.values,
          // Voice
          voiceId: body.voiceId || 'Puck',
          voicePitch: body.voicePitch || 0,
          voiceSpeed: body.voiceSpeed || 1.0,
          voiceStyle: body.voiceStyle || 'normal',
        },
      });

      // Create initial stage progress
      await prisma.stageProgress.create({
        data: {
          characterId: character.id,
          userId: req.user!.userId,
          currentStage: 'first_meet',
          affection: 0,
          unlockedStages: 'first_meet',
          completedEvents: '',
        },
      });

      res.status(201).json({ character });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(new AppError('Invalid input', 400));
      }
      next(error);
    }
  }
);

/**
 * GET /api/characters
 * キャラクター一覧取得
 */
router.get(
  '/',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const characters = await prisma.character.findMany({
        where: { userId: userId },
        include: {
          stageProgress: true,
        },
        orderBy: { lastInteraction: 'desc' },
      });

      res.json({ characters });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/characters/:id
 * キャラクター詳細取得
 */
router.get(
  '/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const character = await prisma.character.findFirst({
        where: {
          id: req.params.id,
          userId: userId,
        },
        include: {
          stageProgress: true,
        },
      });

      if (!character) {
        throw new AppError('Character not found', 404);
      }

      res.json({ character });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/characters/:id/generate-image
 * キャラクター画像生成（リファレンス画像ベース I2I）
 * TODO: 本番環境では requireAuth を有効化すること
 */
router.post(
  '/:id/generate-image',
  requireAuth, // 認証必須に変更
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId; // 認証済みユーザーIDを使用

      const character = await prisma.character.findFirst({
        where: {
          id: req.params.id,
          userId: userId,
        },
      });

      if (!character) {
        throw new AppError('Character not found', 404);
      }

      // Check if source image exists
      if (!character.sourceImagePath) {
        throw new AppError(
          'Source image not found. Please upload a reference image first.',
          400
        );
      }

      // Convert local file path to full URL for BytePlus API
      // Read the local image file as base64
      const fs = await import('fs/promises');
      const path = await import('path');
      const fullPath = path.resolve(character.sourceImagePath);
      const imageBuffer = await fs.readFile(fullPath);
      const base64Image = imageBuffer.toString('base64');

      // Determine MIME type from file extension
      const ext = path.extname(fullPath).toLowerCase();
      const mimeTypeMap: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
      };
      const mimeType = mimeTypeMap[ext] || 'image/jpeg';

      // Build prompt for image generation
      const prompt = `High quality ${character.appearanceStyle} style portrait.
${character.hairColor} ${character.hairStyle} hair, ${character.eyeColor} eyes, ${character.skinTone} skin tone.
${character.height}, ${character.bodyType} body type, wearing ${character.outfit}.
${character.accessories ? `Accessories: ${character.accessories}.` : ''}
Neutral expression, professional quality, detailed.`;

      // Generate image using I2I (Image-to-Image) from reference
      const result = await bytePlusI2I.generate({
        prompt,
        imageData: base64Image,
        mimeType,
        strength: 0.7, // Preserve 30% of original image
        size: '1024x1024',
        watermark: false,
      });

      // Download and store image locally (BytePlus URLs expire after 24h)
      const { imageDownloader } = await import('../services/image-downloader.js');
      const downloaded = await imageDownloader.downloadImage(
        result.imageUrl,
        userId,
        character.id,
        'primary'
      );

      // Update character with local image path
      await prisma.character.update({
        where: { id: character.id },
        data: {
          primaryImageUrl: downloaded.localPath, // Store local path instead of temporary URL
          imagesGenerated: true,
          lastGeneratedAt: new Date(),
        },
      });

      // Cleanup old images (keep last 5)
      await imageDownloader.cleanupOldImages(userId, character.id, 5);

      res.json({
        imageUrl: downloaded.localPath, // Return local path
        message: 'Character image generated from reference successfully',
        usedReferenceImage: true,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/characters/:id/generate-expression
 * 表情画像生成（カスタムプロンプト対応）
 * TODO: 本番環境では requireAuth を有効化すること
 */
router.post(
  '/:id/generate-expression',
  // requireAuth, // 開発中は一時的にコメントアウト
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { expression, customPrompt } = req.body;

      if (!expression) {
        throw new AppError('Expression is required', 400);
      }

      // TODO: 開発中は固定ユーザーID、本番環境では req.user!.userId を使用
      const userId = req.user?.userId || 'dev-user-001';

      const character = await prisma.character.findFirst({
        where: {
          id: req.params.id,
          userId: userId,
        },
      });

      if (!character) {
        throw new AppError('Character not found', 404);
      }

      if (!character.primaryImageUrl) {
        throw new AppError(
          'Primary image must be generated first',
          400
        );
      }

      // Generate expression variation with optional custom prompt
      const result = await bytePlusI2I.changeExpression({
        sourceImageUrl: character.primaryImageUrl,
        expression,
        customPrompt,
      });

      // Update expression URLs
      const expressionUrls =
        (character.expressionUrls as Record<string, string>) || {};
      expressionUrls[expression] = result.imageUrl;

      await prisma.character.update({
        where: { id: character.id },
        data: {
          expressionUrls,
        },
      });

      res.json({
        expression,
        imageUrl: result.imageUrl,
        message: 'Expression generated successfully',
        usedCustomPrompt: !!customPrompt,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/characters/:id/combine-images
 * 複数画像の組み合わせ（例：表情と服装の合成）
 */
router.post(
  '/:id/combine-images',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sourceImageUrl, prompt, customPrompt } = req.body;

      if (!sourceImageUrl) {
        throw new AppError('Source image URL is required', 400);
      }

      const character = await prisma.character.findFirst({
        where: {
          id: req.params.id,
          userId: req.user!.userId,
        },
      });

      if (!character) {
        throw new AppError('Character not found', 404);
      }

      if (!character.primaryImageUrl) {
        throw new AppError(
          'Primary image must be generated first',
          400
        );
      }

      // Build final prompt
      const basePrompt = prompt || 'Combine elements from both images while maintaining character identity.';
      const finalPrompt = customPrompt ? `${basePrompt} ${customPrompt}` : basePrompt;

      // Use I2I service with multiple images
      const result = await bytePlusI2I.generate({
        prompt: finalPrompt,
        imageUrl: [character.primaryImageUrl, sourceImageUrl],
        size: '2k',
        watermark: false,
      });

      res.json({
        imageUrl: result.imageUrl,
        imageUrls: result.imageUrls,
        message: 'Images combined successfully',
        usedMultipleImages: true,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/characters/:id/generate-video
 * キャラクター動画生成（I2V - Image to Video）
 * TODO: 本番環境では requireAuth を有効化すること
 */
router.post(
  '/:id/generate-video',
  // requireAuth, // 開発中は一時的にコメントアウト
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { action, duration, customPrompt } = req.body;

      if (!action) {
        throw new AppError('Action is required', 400);
      }

      // TODO: 開発中は固定ユーザーID、本番環境では req.user!.userId を使用
      const userId = req.user?.userId || 'dev-user-001';

      const character = await prisma.character.findFirst({
        where: {
          id: req.params.id,
          userId: userId,
        },
      });

      if (!character) {
        throw new AppError('Character not found', 404);
      }

      if (!character.primaryImageUrl) {
        throw new AppError(
          'Primary image must be generated first before creating video',
          400
        );
      }

      // Generate video from primary character image
      const videoPrompt = customPrompt
        ? `${action}. ${customPrompt}`
        : action;

      const videoTask = await bytePlusI2V.animateCharacter({
        imageUrl: character.primaryImageUrl,
        action: videoPrompt,
        duration: duration || 5,
      });

      // Update video URLs in character
      const videoUrls =
        (character.videoUrls as Record<string, string>) || {};

      // Store task ID temporarily (will be replaced with actual URL after processing)
      videoUrls[action] = videoTask.taskId;

      await prisma.character.update({
        where: { id: character.id },
        data: {
          videoUrls,
          videosGenerated: true,
        },
      });

      res.json({
        action,
        taskId: videoTask.taskId,
        status: videoTask.status,
        videoUrl: videoTask.videoUrl,
        message: 'Video generation started. Use task ID to check status.',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/characters/:id/video-status/:taskId
 * 動画生成ステータス確認
 * TODO: 本番環境では requireAuth を有効化すること
 */
router.get(
  '/:id/video-status/:taskId',
  // requireAuth, // 開発中は一時的にコメントアウト
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { taskId } = req.params;

      // TODO: 開発中は固定ユーザーID、本番環境では req.user!.userId を使用
      const userId = req.user?.userId || 'dev-user-001';

      const character = await prisma.character.findFirst({
        where: {
          id: req.params.id,
          userId: userId,
        },
      });

      if (!character) {
        throw new AppError('Character not found', 404);
      }

      // Get task status from BytePlus
      const taskStatus = await bytePlusI2V.getTaskStatus(taskId);

      // If completed, update the video URL in database
      if (taskStatus.status === 'completed' && taskStatus.videoUrl) {
        const videoUrls = (character.videoUrls as Record<string, string>) || {};

        // Find the action key for this task ID and update with actual URL
        const actionKey = Object.keys(videoUrls).find(
          (key) => videoUrls[key] === taskId
        );

        if (actionKey) {
          videoUrls[actionKey] = taskStatus.videoUrl;

          await prisma.character.update({
            where: { id: character.id },
            data: {
              videoUrls,
            },
          });
        }
      }

      res.json({
        taskId,
        status: taskStatus.status,
        videoUrl: taskStatus.videoUrl,
        duration: taskStatus.duration,
        resolution: taskStatus.resolution,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/characters/:id/change-hairstyle
 * 髪型変更（I2I）
 * TODO: 本番環境では requireAuth を有効化すること
 */
router.post(
  '/:id/change-hairstyle',
  // requireAuth, // 開発中は一時的にコメントアウト
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { hairstyle, hairColor, customPrompt } = req.body;

      if (!hairstyle) {
        throw new AppError('Hairstyle is required', 400);
      }

      // TODO: 開発中は固定ユーザーID、本番環境では req.user!.userId を使用
      const userId = req.user?.userId || 'dev-user-001';

      const character = await prisma.character.findFirst({
        where: {
          id: req.params.id,
          userId: userId,
        },
      });

      if (!character) {
        throw new AppError('Character not found', 404);
      }

      if (!character.primaryImageUrl) {
        throw new AppError(
          'Primary image must be generated first',
          400
        );
      }

      // Change hairstyle using I2I
      const result = await bytePlusI2I.changeHairstyle({
        sourceImageUrl: character.primaryImageUrl,
        hairstyle,
        hairColor,
        customPrompt,
      });

      // Update hairstyle URLs in character (similar to expressionUrls)
      const hairstyleUrls =
        (character.expressionUrls as Record<string, any>) || {};

      // Store in expressionUrls with hairstyle prefix
      const key = hairColor ? `${hairstyle}-${hairColor}` : hairstyle;
      hairstyleUrls[`hairstyle:${key}`] = result.imageUrl;

      await prisma.character.update({
        where: { id: character.id },
        data: {
          expressionUrls: hairstyleUrls,
        },
      });

      res.json({
        hairstyle,
        hairColor,
        imageUrl: result.imageUrl,
        message: 'Hairstyle changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/characters/:id/change-background
 * 背景/場所変更（I2I）
 * TODO: 本番環境では requireAuth を有効化すること
 */
router.post(
  '/:id/change-background',
  // requireAuth, // 開発中は一時的にコメントアウト
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { location, timeOfDay, weather, customPrompt } = req.body;

      if (!location) {
        throw new AppError('Location is required', 400);
      }

      // TODO: 開発中は固定ユーザーID、本番環境では req.user!.userId を使用
      const userId = req.user?.userId || 'dev-user-001';

      const character = await prisma.character.findFirst({
        where: {
          id: req.params.id,
          userId: userId,
        },
      });

      if (!character) {
        throw new AppError('Character not found', 404);
      }

      if (!character.primaryImageUrl) {
        throw new AppError(
          'Primary image must be generated first',
          400
        );
      }

      // Change background using I2I
      const result = await bytePlusI2I.changeBackground({
        sourceImageUrl: character.primaryImageUrl,
        location,
        timeOfDay,
        weather,
        customPrompt,
      });

      // Update background URLs in character (use expressionUrls for now)
      const backgroundUrls =
        (character.expressionUrls as Record<string, any>) || {};

      // Store in expressionUrls with background prefix
      let key = location;
      if (timeOfDay) key += `-${timeOfDay}`;
      if (weather) key += `-${weather}`;

      backgroundUrls[`background:${key}`] = result.imageUrl;

      await prisma.character.update({
        where: { id: character.id },
        data: {
          expressionUrls: backgroundUrls,
        },
      });

      res.json({
        location,
        timeOfDay,
        weather,
        imageUrl: result.imageUrl,
        message: 'Background changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/characters/:id/change-outfit
 * 服装変更（I2I）
 * TODO: 本番環境では requireAuth を有効化すること
 */
router.post(
  '/:id/change-outfit',
  // requireAuth, // 開発中は一時的にコメントアウト
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { outfit, style, color, accessories, customPrompt } = req.body;

      if (!outfit) {
        throw new AppError('Outfit is required', 400);
      }

      // TODO: 開発中は固定ユーザーID、本番環境では req.user!.userId を使用
      const userId = req.user?.userId || 'dev-user-001';

      const character = await prisma.character.findFirst({
        where: {
          id: req.params.id,
          userId: userId,
        },
      });

      if (!character) {
        throw new AppError('Character not found', 404);
      }

      if (!character.primaryImageUrl) {
        throw new AppError(
          'Primary image must be generated first',
          400
        );
      }

      // Change outfit using I2I
      const result = await bytePlusI2I.changeOutfit({
        sourceImageUrl: character.primaryImageUrl,
        outfit,
        style,
        color,
        accessories,
        customPrompt,
      });

      // Update outfit URLs in character (use expressionUrls for now)
      const outfitUrls =
        (character.expressionUrls as Record<string, any>) || {};

      // Store in expressionUrls with outfit prefix
      let key = outfit;
      if (style) key += `-${style}`;
      if (color) key += `-${color}`;

      outfitUrls[`outfit:${key}`] = result.imageUrl;

      await prisma.character.update({
        where: { id: character.id },
        data: {
          expressionUrls: outfitUrls,
        },
      });

      res.json({
        outfit,
        style,
        color,
        accessories,
        imageUrl: result.imageUrl,
        message: 'Outfit changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/characters/:id/image/:imageKey
 * 画像削除
 * TODO: 本番環境では requireAuth を有効化すること
 */
router.delete(
  '/:id/image/:imageKey',
  // requireAuth, // 開発中は一時的にコメントアウト
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { imageKey } = req.params;

      // TODO: 開発中は固定ユーザーID、本番環境では req.user!.userId を使用
      const userId = req.user?.userId || 'dev-user-001';

      const character = await prisma.character.findFirst({
        where: {
          id: req.params.id,
          userId: userId,
        },
      });

      if (!character) {
        throw new AppError('Character not found', 404);
      }

      const expressionUrls = (character.expressionUrls as Record<string, string>) || {};

      if (!expressionUrls[imageKey]) {
        throw new AppError('Image not found', 404);
      }

      // Remove the image from expressionUrls
      delete expressionUrls[imageKey];

      // Update character
      await prisma.character.update({
        where: { id: character.id },
        data: {
          expressionUrls,
        },
      });

      res.json({
        message: 'Image deleted successfully',
        deletedKey: imageKey,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/characters/:id
 * キャラクター削除
 */
router.delete(
  '/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const character = await prisma.character.findFirst({
        where: {
          id: req.params.id,
          userId: req.user!.userId,
        },
      });

      if (!character) {
        throw new AppError('Character not found', 404);
      }

      await prisma.character.delete({
        where: { id: character.id },
      });

      res.json({ message: 'Character deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
