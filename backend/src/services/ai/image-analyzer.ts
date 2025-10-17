/**
 * Image Analyzer Service
 * Uses Claude Vision API to analyze images and extract character appearance details
 */

import Anthropic from '@anthropic-ai/sdk';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('image-analyzer');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface ImageAnalysisResult {
  // Appearance
  appearanceStyle: 'realistic' | 'anime' | 'manga';
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  estimatedHeight: string;
  bodyType: string;
  outfit: string;
  accessories: string;

  // Estimated attributes
  estimatedAge: number;
  estimatedPersonality: string;
  overallImpression: string;
  suggestedName: string;

  // For image generation
  customPrompt: string;
}

class ImageAnalyzerService {
  /**
   * Analyze an image and extract character appearance details
   */
  async analyzeCharacterImage(
    imageData: string, // Base64 encoded image data
    mimeType: string = 'image/jpeg'
  ): Promise<ImageAnalysisResult> {
    logger.info('Analyzing character image with Claude Vision');

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                  data: imageData,
                },
              },
              {
                type: 'text',
                text: `この画像の人物を詳細に分析して、キャラクタープロフィールを作成してください。

以下の情報を抽出してください：

1. 外見の特徴:
   - 画像のスタイル (realistic/anime/manga)
   - 髪の色と髪型
   - 瞳の色
   - 肌の色
   - 推定身長
   - 体型
   - 服装
   - アクセサリー

2. 推定される属性:
   - 推定年齢 (18-100の数値)
   - 性格の印象 (外見から推測される性格タイプ)
   - 全体的な印象
   - おすすめの名前 (日本語、性別に適した名前)

3. 画像生成用プロンプト:
   - この人物を再現するための英語の詳細なプロンプト

JSON形式で回答してください:
{
  "appearanceStyle": "anime or realistic or manga",
  "hairColor": "髪の色 (例: 黒髪, 金髪, ピンク)",
  "hairStyle": "髪型 (例: ロングヘア, ショートカット)",
  "eyeColor": "瞳の色",
  "skinTone": "肌の色 (例: 色白, 健康的, 小麦色)",
  "estimatedHeight": "推定身長 (例: 160cm)",
  "bodyType": "体型 (例: スリム, 標準, ぽっちゃり)",
  "outfit": "服装の詳細な説明",
  "accessories": "アクセサリーの説明",
  "estimatedAge": 年齢の数値 (18-100),
  "estimatedPersonality": "推測される性格 (例: 明るく社交的, クールで知的)",
  "overallImpression": "全体的な印象の説明",
  "suggestedName": "おすすめの日本語名前",
  "customPrompt": "英語の画像生成プロンプト"
}

重要:
- JSON形式でのみ回答してください (マークダウンや説明文は不要)
- すべてのフィールドを埋めてください
- estimatedAgeは数値型で回答してください`,
              },
            ],
          },
        ],
      });

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text.trim() : '';

      logger.info('Image analysis completed', {
        responseLength: responseText.length
      });

      // Strip markdown code blocks if present
      let jsonText = responseText;
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      // Parse JSON response
      const analysisResult = JSON.parse(jsonText.trim()) as ImageAnalysisResult;

      // Validate required fields
      if (!analysisResult.hairColor || !analysisResult.estimatedAge) {
        throw new Error('Invalid analysis result: missing required fields');
      }

      // Ensure estimatedAge is within valid range
      if (analysisResult.estimatedAge < 18) {
        analysisResult.estimatedAge = 18;
      } else if (analysisResult.estimatedAge > 100) {
        analysisResult.estimatedAge = 100;
      }

      logger.info('Image analysis successful', {
        style: analysisResult.appearanceStyle,
        estimatedAge: analysisResult.estimatedAge,
        suggestedName: analysisResult.suggestedName,
      });

      return analysisResult;
    } catch (error) {
      logger.error('Failed to analyze image', { error });
      throw new Error('画像の解析に失敗しました');
    }
  }

  /**
   * Generate full character profile from image analysis
   */
  async generateCharacterFromImage(
    imageData: string,
    mimeType: string = 'image/jpeg',
    additionalInfo?: {
      name?: string;
      age?: number;
      description?: string;
    }
  ): Promise<{
    appearance: ImageAnalysisResult;
    profile: {
      occupation: string;
      hobbies: string;
      favoriteFood: string;
      bio: string;
      personalityArchetype: string;
      traits: string;
      speechStyle: string;
      emotionalTendency: string;
      interests: string;
      values: string;
      voiceId: string;
      voicePitch: number;
      voiceSpeed: number;
      voiceStyle: string;
    };
  }> {
    // First, analyze the image
    const appearance = await this.analyzeCharacterImage(imageData, mimeType);

    // Use provided info or defaults from analysis
    const name = additionalInfo?.name || appearance.suggestedName;
    const age = additionalInfo?.age || appearance.estimatedAge;
    const description = additionalInfo?.description || appearance.overallImpression;

    logger.info('Generating full profile from image analysis', { name, age });

    // Generate personality and other details based on appearance
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.8,
      system: `You are an expert character designer. Based on the character's appearance and impression,
generate a detailed personality profile that matches their looks.
Output ONLY valid JSON with NO markdown formatting.`,
      messages: [
        {
          role: 'user',
          content: `名前: ${name}
年齢: ${age}歳
外見の印象: ${description}
外見スタイル: ${appearance.appearanceStyle}
髪色・髪型: ${appearance.hairColor} ${appearance.hairStyle}
服装: ${appearance.outfit}
全体の印象: ${appearance.overallImpression}
推測される性格: ${appearance.estimatedPersonality}

この外見と印象に合う、詳細なキャラクタープロフィールを生成してください。

JSON形式で出力:
{
  "occupation": "職業",
  "hobbies": "趣味 (カンマ区切り)",
  "favoriteFood": "好きな食べ物",
  "bio": "自己紹介 (2-3文)",
  "personalityArchetype": "gentle or cheerful or cool or shy or energetic or mysterious",
  "traits": "性格の特徴 (カンマ区切り)",
  "speechStyle": "polite or casual or formal or cute or mature",
  "emotionalTendency": "stable or expressive or reserved or passionate",
  "interests": "興味 (カンマ区切り)",
  "values": "大切にしていること (カンマ区切り)",
  "voiceId": "Puck or Charon or Kore or Fenrir or Aoede",
  "voicePitch": number between -20 and 20,
  "voiceSpeed": number between 0.5 and 2.0,
  "voiceStyle": "normal or cheerful or calm or excited"
}`,
        },
      ],
    });

    const profileText =
      message.content[0].type === 'text' ? message.content[0].text.trim() : '';

    // Strip markdown code blocks if present
    let jsonProfileText = profileText;
    if (jsonProfileText.startsWith('```json')) {
      jsonProfileText = jsonProfileText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonProfileText.startsWith('```')) {
      jsonProfileText = jsonProfileText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    const profile = JSON.parse(jsonProfileText.trim());

    logger.info('Full character profile generated from image');

    return {
      appearance,
      profile,
    };
  }
}

export const imageAnalyzerService = new ImageAnalyzerService();
