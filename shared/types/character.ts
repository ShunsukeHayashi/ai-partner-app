/**
 * キャラクター型定義
 */

/**
 * キャラクター外見
 */
export interface CharacterAppearance {
  style: 'realistic' | 'anime' | 'manga';
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  height: string;         // "160cm", "165cm"
  bodyType: string;       // "slim", "average", "curvy"
  outfit: string;         // 服装の説明
  accessories: string[];  // アクセサリー
  customPrompt?: string;  // カスタムプロンプト
}

/**
 * キャラクター性格
 */
export interface CharacterPersonality {
  archetype: PersonalityArchetype;
  traits: string[];       // 性格特性
  speechStyle: SpeechStyle;
  emotionalTendency: EmotionalTendency;
  interests: string[];    // 興味・関心
  values: string[];       // 価値観
}

/**
 * 性格アーキタイプ
 */
export type PersonalityArchetype =
  | 'gentle'        // 優しい・穏やか
  | 'cheerful'      // 明るい・元気
  | 'cool'          // クール・知的
  | 'shy'           // 内気・恥ずかしがり
  | 'energetic'     // 活発・アクティブ
  | 'mature'        // 大人っぽい・落ち着いた
  | 'playful'       // 遊び心・いたずら好き
  | 'caring'        // 世話好き・母性的
  | 'mysterious'    // 神秘的・ミステリアス
  | 'tsundere';     // ツンデレ

/**
 * 話し方スタイル
 */
export type SpeechStyle =
  | 'polite'        // 丁寧語
  | 'casual'        // カジュアル
  | 'formal'        // フォーマル
  | 'cute'          // 可愛らしい
  | 'cool'          // クール
  | 'dialect';      // 方言

/**
 * 感情傾向
 */
export type EmotionalTendency =
  | 'stable'        // 安定
  | 'expressive'    // 表現豊か
  | 'reserved'      // 控えめ
  | 'passionate';   // 情熱的

/**
 * 音声設定
 */
export interface VoiceSettings {
  provider: 'gemini';     // 将来的に拡張可能
  voiceId: string;        // Gemini TTS voice ID
  pitch: number;          // ピッチ（-20 ~ 20）
  speed: number;          // 速度（0.25 ~ 4.0）
  style: VoiceStyle;
}

/**
 * 音声スタイル
 */
export type VoiceStyle =
  | 'normal'
  | 'soft'          // 柔らかい
  | 'energetic'     // 元気
  | 'calm'          // 落ち着いた
  | 'romantic';     // ロマンティック

/**
 * キャラクタープロフィール
 */
export interface CharacterProfile {
  id: string;
  userId: string;
  name: string;
  age: number;
  occupation: string;
  hobbies: string[];
  favoriteFood: string[];
  birthday: Date;
  bio: string;            // 簡単な自己紹介
  createdAt: Date;
  updatedAt: Date;
}

/**
 * キャラクター（統合）
 */
export interface Character {
  profile: CharacterProfile;
  appearance: CharacterAppearance;
  personality: CharacterPersonality;
  voice: VoiceSettings;
  images: CharacterImages;
  stats: CharacterStats;
}

/**
 * キャラクター画像
 */
export interface CharacterImages {
  primary: string;              // メイン画像URL
  expressions: Record<Expression, string>; // 表情バリエーション
  scenes: SceneImage[];         // シーン画像
  generated: boolean;           // 生成済みか
  lastGeneratedAt?: Date;
}

/**
 * 表情タイプ
 */
export type Expression =
  | 'neutral'       // 通常
  | 'smile'         // 笑顔
  | 'happy'         // 喜び
  | 'shy'           // 恥ずかしい
  | 'surprised'     // 驚き
  | 'sad'           // 悲しい
  | 'angry'         // 怒り
  | 'in_love'       // 恋する表情
  | 'tears_of_joy'  // 嬉し涙
  | 'blushing'      // 赤面
  | 'content'       // 満足
  | 'playful'       // いたずら
  | 'tender'        // 優しい
  | 'emotional';    // 感動

/**
 * シーン画像
 */
export interface SceneImage {
  id: string;
  type: SceneType;
  url: string;
  prompt: string;
  createdAt: Date;
  metadata: {
    location?: string;
    event?: string;
    mood?: string;
  };
}

/**
 * シーンタイプ
 */
export type SceneType =
  | 'date'          // デートシーン
  | 'proposal'      // プロポーズシーン
  | 'daily'         // 日常シーン
  | 'special';      // 特別なシーン

/**
 * キャラクター統計
 */
export interface CharacterStats {
  totalConversations: number;   // 総会話数
  totalMessages: number;         // 総メッセージ数
  datesCount: number;            // デート回数
  giftsReceived: number;         // 受け取ったギフト数
  eventsCompleted: number;       // 完了イベント数
  lastInteraction: Date;         // 最終会話日時
  averageResponseTime: number;   // 平均応答時間（秒）
}

/**
 * キャラクター作成リクエスト
 */
export interface CreateCharacterRequest {
  profile: Omit<CharacterProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
  appearance: CharacterAppearance;
  personality: CharacterPersonality;
  voice: VoiceSettings;
}

/**
 * キャラクター更新リクエスト
 */
export interface UpdateCharacterRequest {
  profile?: Partial<CharacterProfile>;
  appearance?: Partial<CharacterAppearance>;
  personality?: Partial<CharacterPersonality>;
  voice?: Partial<VoiceSettings>;
}

/**
 * デフォルト設定
 */
export const DEFAULT_APPEARANCE: CharacterAppearance = {
  style: 'anime',
  hairColor: 'brown',
  hairStyle: 'long straight',
  eyeColor: 'brown',
  skinTone: 'fair',
  height: '160cm',
  bodyType: 'slim',
  outfit: 'casual dress',
  accessories: [],
};

export const DEFAULT_PERSONALITY: CharacterPersonality = {
  archetype: 'gentle',
  traits: ['kind', 'caring', 'understanding'],
  speechStyle: 'polite',
  emotionalTendency: 'stable',
  interests: ['cooking', 'reading', 'music'],
  values: ['honesty', 'kindness', 'family'],
};

export const DEFAULT_VOICE: VoiceSettings = {
  provider: 'gemini',
  voiceId: 'default',
  pitch: 0,
  speed: 1.0,
  style: 'normal',
};
