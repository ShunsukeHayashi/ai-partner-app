/**
 * Character Generator Service
 * Uses Claude API to generate character details from brief descriptions
 */

import Anthropic from '@anthropic-ai/sdk';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('character-generator');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface CharacterGenerationRequest {
  name: string;
  age: number;
  description: string;
}

interface CharacterGenerationResponse {
  // Profile
  occupation: string;
  hobbies: string;
  favoriteFood: string;
  bio: string;

  // Appearance
  appearanceStyle: 'realistic' | 'anime' | 'manga';
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  height: string;
  bodyType: string;
  outfit: string;
  accessories: string;
  customPrompt: string;

  // Personality
  personalityArchetype: string;
  traits: string;
  speechStyle: string;
  emotionalTendency: string;
  interests: string;
  values: string;

  // Voice
  voiceId: string;
  voicePitch: number;
  voiceSpeed: number;
  voiceStyle: string;
}

class CharacterGeneratorService {
  /**
   * Generate character details from basic info using Claude
   */
  async generateCharacterDetails(
    params: CharacterGenerationRequest
  ): Promise<CharacterGenerationResponse> {
    const { name, age, description } = params;

    logger.info('Generating character details with Claude', { name, age });

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.8,
        system: `You are an expert character designer for visual novels and AI companions.
Generate detailed character profiles based on brief descriptions.
Output ONLY valid JSON with NO markdown formatting or code blocks.
Ensure all values are strings except for age, voicePitch, and voiceSpeed which are numbers.

Response format:
{
  "occupation": "職業 (例: カフェ店員)",
  "hobbies": "趣味をカンマ区切り (例: 読書, 音楽鑑賞)",
  "favoriteFood": "好きな食べ物 (例: パスタ, ケーキ)",
  "bio": "2-3文の自己紹介",
  "appearanceStyle": "anime or realistic or manga",
  "hairColor": "髪の色 (例: 黒髪)",
  "hairStyle": "髪型 (例: ロングヘア)",
  "eyeColor": "瞳の色 (例: 茶色)",
  "skinTone": "肌の色 (例: 色白)",
  "height": "身長 (例: 160cm)",
  "bodyType": "体型 (例: スリム)",
  "outfit": "服装の説明",
  "accessories": "アクセサリー",
  "customPrompt": "画像生成用の詳細プロンプト (英語)",
  "personalityArchetype": "gentle or cheerful or cool or shy or energetic or mysterious",
  "traits": "性格の特徴をカンマ区切り",
  "speechStyle": "polite or casual or formal or cute or mature",
  "emotionalTendency": "stable or expressive or reserved or passionate",
  "interests": "興味のあることをカンマ区切り",
  "values": "大切にしていることをカンマ区切り",
  "voiceId": "Puck or Charon or Kore or Fenrir or Aoede",
  "voicePitch": number between -20 and 20,
  "voiceSpeed": number between 0.5 and 2.0,
  "voiceStyle": "normal or cheerful or calm or excited"
}`,
        messages: [
          {
            role: 'user',
            content: `名前: ${name}
年齢: ${age}歳
説明: ${description}

この情報から、詳細なキャラクタープロフィールを生成してください。
説明から推測できる外見、性格、趣味、価値観などを具体的に記述してください。
JSON形式で出力してください。`,
          },
        ],
      });

      const responseText = message.content[0].type === 'text'
        ? message.content[0].text.trim()
        : '';

      logger.info('Character details generated', { responseText });

      // Parse JSON response
      const characterDetails = JSON.parse(responseText) as CharacterGenerationResponse;

      // Validate required fields
      if (!characterDetails.occupation || !characterDetails.bio) {
        throw new Error('Invalid character details generated');
      }

      return characterDetails;
    } catch (error) {
      logger.error('Failed to generate character details', { error });
      throw new Error('キャラクター詳細の生成に失敗しました');
    }
  }
}

export const characterGeneratorService = new CharacterGeneratorService();
