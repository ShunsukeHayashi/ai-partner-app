/**
 * Gemini Text-to-Speech Service
 */

import { createLogger } from '../../utils/logger.js';

const logger = createLogger('gemini-tts');

/**
 * Gemini TTS Request
 */
export interface GeminiTTSRequest {
  text: string;
  voiceConfig?: {
    voiceName?: string;
    pitch?: number; // -20.0 to 20.0
    speakingRate?: number; // 0.25 to 4.0
    volumeGainDb?: number; // -96.0 to 16.0
  };
  audioConfig?: {
    audioEncoding?: 'LINEAR16' | 'MP3' | 'OGG_OPUS';
    sampleRateHertz?: number;
  };
}

/**
 * Gemini TTS Response
 */
export interface GeminiTTSResponse {
  audioContent: string; // Base64 encoded audio
  contentType: string;
  duration?: number;
}

export class GeminiTTS {
  private apiKey: string;
  private endpoint: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.endpoint =
      process.env.GEMINI_TTS_ENDPOINT ||
      'https://generativelanguage.googleapis.com/v1';

    if (!this.apiKey) {
      logger.warn('Gemini API key is not set');
    }
  }

  /**
   * テキストを音声に変換
   */
  async synthesize(request: GeminiTTSRequest): Promise<GeminiTTSResponse> {
    logger.info('Synthesizing speech', {
      textLength: request.text.length,
      voice: request.voiceConfig?.voiceName,
    });

    // Mock response for development/testing
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here' || process.env.NODE_ENV === 'development') {
      logger.info('Using mock response for Gemini TTS');
      
      // Generate mock audio content (silent audio)
      const mockAudioContent = Buffer.alloc(1024, 0).toString('base64');
      
      return {
        audioContent: mockAudioContent,
        contentType: 'audio/wav',
        duration: request.text.length * 0.1, // Estimate duration
      };
    }

    try {
      // Gemini API endpoint for text-to-speech
      const url = `${this.endpoint}/models/gemini-2.0-flash-tts:streamGenerateContent?key=${this.apiKey}`;

      const payload = {
        contents: [
          {
            parts: [
              {
                text: request.text,
              },
            ],
          },
        ],
        generationConfig: {
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: request.voiceConfig?.voiceName || 'Puck',
              },
            },
          },
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Gemini TTS failed', {
          status: response.status,
          error: errorText,
        });
        throw new Error(`Gemini TTS failed: ${response.status} - ${errorText}`);
      }

      // Parse streaming response
      const text = await response.text();
      const lines = text.split('\n').filter((line) => line.trim());

      let audioContent = '';

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
            audioContent += data.candidates[0].content.parts[0].inlineData.data;
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }

      if (!audioContent) {
        throw new Error('No audio content in response');
      }

      logger.info('Speech synthesized successfully', {
        audioSize: audioContent.length,
      });

      return {
        audioContent,
        contentType: 'audio/wav',
      };
    } catch (error) {
      logger.error('Failed to synthesize speech', { error });
      throw error;
    }
  }

  /**
   * キャラクターの音声を生成
   */
  async generateCharacterVoice(params: {
    text: string;
    voiceName?: string;
    emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'romantic';
  }): Promise<GeminiTTSResponse> {
    const { text, voiceName, emotion = 'neutral' } = params;

    // Adjust pitch and speaking rate based on emotion
    const emotionConfig: Record<
      string,
      { pitch: number; speakingRate: number }
    > = {
      neutral: { pitch: 0, speakingRate: 1.0 },
      happy: { pitch: 2, speakingRate: 1.1 },
      sad: { pitch: -2, speakingRate: 0.9 },
      angry: { pitch: 1, speakingRate: 1.2 },
      romantic: { pitch: -1, speakingRate: 0.95 },
    };

    const config = emotionConfig[emotion] || emotionConfig.neutral;

    return this.synthesize({
      text,
      voiceConfig: {
        voiceName: voiceName || 'Puck',
        pitch: config.pitch,
        speakingRate: config.speakingRate,
      },
    });
  }

  /**
   * 音声をBase64からBufferに変換
   */
  decodeAudio(base64Audio: string): Buffer {
    return Buffer.from(base64Audio, 'base64');
  }
}

// Singleton instance
export const geminiTTS = new GeminiTTS();
