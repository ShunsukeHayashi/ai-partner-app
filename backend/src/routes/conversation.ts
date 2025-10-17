/**
 * Conversation Management Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/db.js';
import { AppError } from '../middleware/error-handler.js';
import { requireAuth } from '../middleware/auth.js';
import Anthropic from '@anthropic-ai/sdk';
import { createLogger } from '../utils/logger.js';

const router = Router();
const logger = createLogger('conversation');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Validation schemas
const createConversationSchema = z.object({
  characterId: z.string().uuid(),
});

const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  type: z.enum(['text', 'voice']).optional().default('text'),
});

/**
 * POST /api/conversations
 * 新規会話作成
 */
router.post(
  '/',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createConversationSchema.parse(req.body);

      // Verify character belongs to user
      const character = await prisma.character.findFirst({
        where: {
          id: body.characterId,
          userId: req.user!.userId,
        },
        include: {
          stageProgress: true,
        },
      });

      if (!character) {
        throw new AppError('Character not found', 404);
      }

      // Get current time of day
      const hour = new Date().getHours();
      let timeOfDay = 'morning';
      if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
      else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
      else if (hour >= 21 || hour < 5) timeOfDay = 'night';

      // Create conversation
      const conversation = await prisma.conversation.create({
        data: {
          userId: req.user!.userId,
          characterId: body.characterId,
          stage: character.stageProgress?.currentStage || 'first_meet',
          recentTopics: '',
          importantEvents: '',
          timeOfDay,
        },
      });

      logger.info('Conversation created', {
        conversationId: conversation.id,
        characterId: body.characterId,
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
 * GET /api/conversations
 * 会話一覧取得
 */
router.get(
  '/',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversations = await prisma.conversation.findMany({
        where: { userId: req.user!.userId },
        include: {
          character: {
            select: {
              id: true,
              name: true,
              primaryImageUrl: true,
            },
          },
        },
        orderBy: { lastActive: 'desc' },
      });

      res.json({ conversations });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/conversations/:id
 * 会話詳細取得
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
 * GET /api/conversations/:id/messages
 * メッセージ一覧取得
 */
router.get(
  '/:id/messages',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      // Verify conversation belongs to user
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
        where: { conversationId: req.params.id },
        orderBy: { createdAt: 'asc' },
        take: limit,
        skip: offset,
      });

      res.json({ messages });
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

      // Verify conversation belongs to user
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: req.params.id,
          userId: req.user!.userId,
        },
        include: {
          character: {
            include: {
              stageProgress: true,
            },
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

      // Get recent message history for context
      const recentMessages = await prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      // Generate character response with Claude
      const character = conversation.character;
      const stageInfo = character.stageProgress;

      // Build character personality prompt
      const personalityPrompt = `You are roleplaying as ${character.name}, a ${character.age}-year-old ${character.occupation}.

Personality:
- Archetype: ${character.personalityArchetype}
- Traits: ${character.traits}
- Speech Style: ${character.speechStyle}
- Emotional Tendency: ${character.emotionalTendency}
- Interests: ${character.interests}
- Values: ${character.values}

Bio: ${character.bio}

Current Stage: ${conversation.stage}
Affection Level: ${stageInfo?.affection || 0}/100
Time of Day: ${conversation.timeOfDay}

Conversation Guidelines:
1. Stay in character at all times
2. Respond naturally and emotionally
3. Reference past conversations if relevant
4. Show appropriate emotion based on the message
5. Keep responses 1-3 sentences unless a detailed response is appropriate
6. Use ${character.speechStyle} speech style consistently

Recent conversation context:
${recentMessages
  .reverse()
  .map((m) => `${m.sender === 'user' ? 'User' : character.name}: ${m.content}`)
  .join('\n')}

Respond as ${character.name} to the user's latest message. Your response should include:
1. The message content (natural dialogue)
2. Current emotion (happy/sad/excited/neutral/love/surprised/angry/shy)
3. Suggested expression (neutral/smile/sad/surprised/angry/shy/excited)

Format your response as JSON:
{
  "content": "your response here",
  "emotion": "emotion type",
  "expression": "expression type"
}`;

      logger.info('Generating character response', {
        characterId: character.id,
        userMessage: body.content,
      });

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        temperature: 0.8,
        system: personalityPrompt,
        messages: [
          {
            role: 'user',
            content: body.content,
          },
        ],
      });

      const responseText =
        response.content[0].type === 'text' ? response.content[0].text.trim() : '';

      let characterResponse: {
        content: string;
        emotion: string;
        expression: string;
      };

      try {
        characterResponse = JSON.parse(responseText);
      } catch {
        // Fallback if JSON parsing fails
        characterResponse = {
          content: responseText,
          emotion: 'neutral',
          expression: 'neutral',
        };
      }

      // Create character message
      const characterMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          sender: 'character',
          content: characterResponse.content,
          type: 'text',
          emotion: characterResponse.emotion,
          expression: characterResponse.expression,
        },
      });

      // Update conversation statistics
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          totalMessages: { increment: 2 },
          userMessages: { increment: 1 },
          characterMessages: { increment: 1 },
          lastActive: new Date(),
          lastMessageAt: new Date(),
          currentMood: characterResponse.emotion,
        },
      });

      // Update character statistics
      await prisma.character.update({
        where: { id: character.id },
        data: {
          totalMessages: { increment: 2 },
          lastInteraction: new Date(),
        },
      });

      // Calculate affection change based on message sentiment
      // Simple logic: positive emotions increase affection
      let affectionChange = 0;
      if (['happy', 'love', 'excited'].includes(characterResponse.emotion)) {
        affectionChange = Math.random() * 2 + 0.5; // +0.5 to +2.5
      } else if (['sad', 'angry'].includes(characterResponse.emotion)) {
        affectionChange = Math.random() * -1; // -1 to 0
      } else {
        affectionChange = Math.random() * 0.5; // 0 to +0.5
      }

      // Update stage progress affection
      if (stageInfo) {
        const newAffection = Math.max(
          0,
          Math.min(100, stageInfo.affection + affectionChange)
        );

        await prisma.stageProgress.update({
          where: { id: stageInfo.id },
          data: {
            affection: newAffection,
          },
        });
      }

      logger.info('Character response generated', {
        emotion: characterResponse.emotion,
        expression: characterResponse.expression,
        affectionChange,
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
      logger.error('Failed to send message', { error });
      next(error);
    }
  }
);

/**
 * DELETE /api/conversations/:id
 * 会話削除
 */
router.delete(
  '/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: req.params.id,
          userId: req.user!.userId,
        },
      });

      if (!conversation) {
        throw new AppError('Conversation not found', 404);
      }

      await prisma.conversation.delete({
        where: { id: conversation.id },
      });

      logger.info('Conversation deleted', { conversationId: conversation.id });

      res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
