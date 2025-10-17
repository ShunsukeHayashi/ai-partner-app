/**
 * Chat/Conversation Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/db.js';
import { AppError } from '../middleware/error-handler.js';
import { requireAuth } from '../middleware/auth.js';
import { claudeService } from '../services/ai/claude.js';
import { geminiTTS } from '../services/ai/gemini-tts.js';

const router = Router();

// Validation schemas
const createConversationSchema = z.object({
  characterId: z.string().uuid(),
});

const sendMessageSchema = z.object({
  content: z.string().min(1),
  type: z.enum(['text', 'voice']).default('text'),
});

/**
 * POST /api/conversations
 * 会話セッション作成
 */
router.post(
  '/',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createConversationSchema.parse(req.body);

      // Verify character ownership
      const character = await prisma.character.findFirst({
        where: {
          id: body.characterId,
          userId: req.user!.userId,
        },
      });

      if (!character) {
        throw new AppError('Character not found', 404);
      }

      // Get stage progress
      const stageProgress = await prisma.stageProgress.findUnique({
        where: { characterId: character.id },
      });

      const conversation = await prisma.conversation.create({
        data: {
          userId: req.user!.userId,
          characterId: character.id,
          stage: stageProgress?.currentStage || 'first_meet',
          recentTopics: [],
          importantEvents: [],
        },
      });

      res.status(201).json({ conversation });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(new AppError('Invalid input', 400));
      }
      next(error);
    }
  }
);

/**
 * GET /api/conversations/:id
 * 会話セッション取得
 */
router.get(
  '/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: req.params.id,
          userId: req.user!.userId,
        },
        include: {
          character: true,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 50,
          },
        },
      });

      if (!conversation) {
        throw new AppError('Conversation not found', 404);
      }

      res.json({ conversation });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/conversations/:id/messages
 * メッセージ送信
 */
router.post(
  '/:id/messages',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = sendMessageSchema.parse(req.body);

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: req.params.id,
          userId: req.user!.userId,
        },
        include: {
          character: true,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!conversation) {
        throw new AppError('Conversation not found', 404);
      }

      // Create user message
      const userMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          sender: 'user',
          content: body.content,
          type: body.type,
        },
      });

      // Get conversation history
      const history = conversation.messages
        .reverse()
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.content,
        }));

      // Get stage progress
      const stageProgress = await prisma.stageProgress.findUnique({
        where: { characterId: conversation.characterId },
      });

      // Generate AI response
      const aiResponse = await claudeService.generateCharacterResponse({
        userMessage: body.content,
        characterProfile: {
          name: conversation.character.name,
          personality: conversation.character.personalityArchetype,
          traits: conversation.character.traits,
          speechStyle: conversation.character.speechStyle,
        },
        conversationHistory: history,
        stage: conversation.stage,
        affection: stageProgress?.affection || 0,
      });

      // Generate voice if requested
      let voiceUrl: string | undefined;
      if (body.type === 'voice') {
        try {
          const ttsResponse = await geminiTTS.generateCharacterVoice({
            text: aiResponse.content,
            voiceName: conversation.character.voiceId,
            emotion: aiResponse.emotion as any,
          });

          // In production, save audio to storage and return URL
          // For now, we'll just indicate voice is available
          voiceUrl = 'data:audio/wav;base64,' + ttsResponse.audioContent;
        } catch (error) {
          console.error('TTS generation failed:', error);
          // Continue without voice
        }
      }

      // Create character message
      const characterMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          sender: 'character',
          content: aiResponse.content,
          type: body.type,
          emotion: aiResponse.emotion,
          expression: aiResponse.expression,
          voiceUrl,
        },
      });

      // Update conversation stats
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          totalMessages: { increment: 2 },
          userMessages: { increment: 1 },
          characterMessages: { increment: 1 },
          lastMessageAt: new Date(),
          lastActive: new Date(),
        },
      });

      // Update character stats
      await prisma.character.update({
        where: { id: conversation.characterId },
        data: {
          totalMessages: { increment: 2 },
          lastInteraction: new Date(),
        },
      });

      // Calculate affection change (simple: +0.5 per message)
      const affectionChange = 0.5;
      await prisma.stageProgress.update({
        where: { characterId: conversation.characterId },
        data: {
          affection: {
            increment: affectionChange,
          },
        },
      });

      res.json({
        userMessage,
        characterMessage,
        affectionChange,
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
 * GET /api/conversations/:id/messages
 * メッセージ一覧取得
 */
router.get(
  '/:id/messages',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit = '50', offset = '0' } = req.query;

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: req.params.id,
          userId: req.user!.userId,
        },
      });

      if (!conversation) {
        throw new AppError('Conversation not found', 404);
      }

      const messages = await prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      });

      res.json({ messages: messages.reverse() });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
