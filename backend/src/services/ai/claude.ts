/**
 * Claude API Service
 * Anthropic Claude APIを使用してプロンプト生成
 */

import Anthropic from '@anthropic-ai/sdk';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('claude-service');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface PromptGenerationRequest {
  userInput: string;
  expression: string;
}

interface PromptGenerationResponse {
  prompt: string;
  originalInput: string;
}

class ClaudeService {
  /**
   * 日本語の要望を英語のプロンプトに変換
   */
  async generatePrompt(
    params: PromptGenerationRequest
  ): Promise<PromptGenerationResponse> {
    const { userInput, expression } = params;

    logger.info('Generating prompt with Claude', { userInput, expression });

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        temperature: 0.7,
        system: `You are a helpful assistant that converts Japanese requests into English image generation prompts.
The user will provide a Japanese description of what they want to add to a character image.
Convert it into a concise, clear English prompt (1-2 sentences, 50-100 words) suitable for image generation.
Focus on visual elements like colors, textures, effects, accessories, backgrounds, etc.
Output ONLY the English prompt, nothing else.`,
        messages: [
          {
            role: 'user',
            content: `Expression: ${expression}
User Request (Japanese): ${userInput}

Convert this to an English image generation prompt:`,
          },
        ],
      });

      const prompt = message.content[0].type === 'text'
        ? message.content[0].text.trim()
        : '';

      logger.info('Prompt generated successfully', {
        originalInput: userInput,
        generatedPrompt: prompt
      });

      return {
        prompt,
        originalInput: userInput,
      };
    } catch (error) {
      logger.error('Failed to generate prompt', { error });
      throw new Error('プロンプト生成に失敗しました');
    }
  }
}

export const claudeService = new ClaudeService();
