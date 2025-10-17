/**
 * 会話型定義
 */

import { StageType } from './stage';

/**
 * メッセージ
 */
export interface Message {
  id: string;
  conversationId: string;
  sender: 'user' | 'character';
  content: string;
  type: MessageType;
  metadata: MessageMetadata;
  createdAt: Date;
}

/**
 * メッセージタイプ
 */
export type MessageType =
  | 'text'          // テキストメッセージ
  | 'voice'         // 音声メッセージ
  | 'image'         // 画像
  | 'video'         // 動画
  | 'event'         // イベント通知
  | 'system';       // システムメッセージ

/**
 * メッセージメタデータ
 */
export interface MessageMetadata {
  emotion?: string;           // 感情（character送信時）
  expression?: string;        // 表情
  voiceUrl?: string;          // 音声URL（voice type時）
  imageUrl?: string;          // 画像URL（image type時）
  videoUrl?: string;          // 動画URL（video type時）
  eventId?: string;           // イベントID（event type時）
  audioLength?: number;       // 音声長さ（秒）
  readAt?: Date;              // 既読日時
}

/**
 * 会話セッション
 */
export interface Conversation {
  id: string;
  userId: string;
  characterId: string;
  stage: StageType;
  messages: Message[];
  context: ConversationContext;
  stats: ConversationStats;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
}

/**
 * 会話コンテキスト
 */
export interface ConversationContext {
  recentTopics: string[];                // 最近の話題
  importantEvents: string[];             // 重要イベントID
  userPreferences: Record<string, any>;  // ユーザーの好み
  characterMemories: CharacterMemory[];  // キャラクターの記憶
  mood: Mood;                            // 現在のムード
  location?: string;                     // 現在の場所（仮想）
  timeOfDay: TimeOfDay;                  // 時間帯
}

/**
 * キャラクターの記憶
 */
export interface CharacterMemory {
  id: string;
  type: MemoryType;
  content: string;
  importance: number;      // 重要度（0-1）
  createdAt: Date;
  relatedEventId?: string;
}

/**
 * 記憶タイプ
 */
export type MemoryType =
  | 'personal'      // 個人的な話
  | 'preference'    // 好み
  | 'event'         // イベント
  | 'emotion'       // 感情的な出来事
  | 'shared';       // 共有した体験

/**
 * ムード
 */
export type Mood =
  | 'neutral'       // 普通
  | 'happy'         // 幸せ
  | 'excited'       // 興奮
  | 'romantic'      // ロマンティック
  | 'sad'           // 悲しい
  | 'angry'         // 怒り
  | 'tired'         // 疲れている
  | 'playful';      // 遊び心

/**
 * 時間帯
 */
export type TimeOfDay =
  | 'morning'       // 朝（6:00-11:59）
  | 'afternoon'     // 午後（12:00-17:59）
  | 'evening'       // 夕方（18:00-21:59）
  | 'night';        // 夜（22:00-5:59）

/**
 * 会話統計
 */
export interface ConversationStats {
  totalMessages: number;
  userMessages: number;
  characterMessages: number;
  averageResponseTime: number;  // 秒
  longestConversation: number;  // メッセージ数
  lastActive: Date;
}

/**
 * メッセージ送信リクエスト
 */
export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type: MessageType;
  metadata?: Partial<MessageMetadata>;
}

/**
 * メッセージレスポンス
 */
export interface MessageResponse {
  message: Message;
  characterResponse: Message;
  affectionChange: number;      // 好感度変化
  newMemories: CharacterMemory[]; // 新しい記憶
}

/**
 * 会話履歴クエリ
 */
export interface ConversationQuery {
  conversationId: string;
  limit?: number;
  offset?: number;
  beforeDate?: Date;
  afterDate?: Date;
  sender?: 'user' | 'character';
  type?: MessageType;
}

/**
 * AI応答生成コンテキスト
 */
export interface AIResponseContext {
  characterId: string;
  userId: string;
  stage: StageType;
  affection: number;
  recentMessages: Message[];      // 最近の会話（最大20件）
  characterMemories: CharacterMemory[];
  currentMood: Mood;
  timeOfDay: TimeOfDay;
  userMessage: string;
}

/**
 * AI応答
 */
export interface AIResponse {
  content: string;
  emotion: string;
  expression: string;
  suggestedTopics: string[];      // 提案する話題
  affectionImpact: number;        // 好感度への影響
  newMemories: Partial<CharacterMemory>[]; // 新しい記憶
}

/**
 * 会話分析
 */
export interface ConversationAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  emotionalTone: string;
  engagementLevel: number;        // 0-1
  userInterest: string[];         // ユーザーの興味
  characterAlignment: number;     // キャラクター一貫性（0-1）
}

/**
 * 通知設定
 */
export interface NotificationSettings {
  enabled: boolean;
  morningMessage: boolean;        // 朝のメッセージ
  eveningMessage: boolean;        // 夜のメッセージ
  anniversaryReminder: boolean;   // 記念日リマインダー
  eventNotification: boolean;     // イベント通知
  schedules: NotificationSchedule[];
}

/**
 * 通知スケジュール
 */
export interface NotificationSchedule {
  id: string;
  type: 'morning' | 'evening' | 'custom';
  time: string;           // "07:00", "22:00"
  enabled: boolean;
  message?: string;       // カスタムメッセージ
}

/**
 * ヘルパー関数
 */

/**
 * 現在の時間帯を取得
 */
export function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

/**
 * メッセージの既読時刻を設定
 */
export function markMessageAsRead(message: Message): Message {
  return {
    ...message,
    metadata: {
      ...message.metadata,
      readAt: new Date(),
    },
  };
}

/**
 * 会話統計を更新
 */
export function updateConversationStats(
  stats: ConversationStats,
  newMessage: Message,
  responseTime?: number
): ConversationStats {
  return {
    totalMessages: stats.totalMessages + 1,
    userMessages:
      stats.userMessages + (newMessage.sender === 'user' ? 1 : 0),
    characterMessages:
      stats.characterMessages + (newMessage.sender === 'character' ? 1 : 0),
    averageResponseTime: responseTime
      ? (stats.averageResponseTime * stats.totalMessages + responseTime) /
        (stats.totalMessages + 1)
      : stats.averageResponseTime,
    longestConversation: Math.max(stats.longestConversation, stats.totalMessages + 1),
    lastActive: new Date(),
  };
}
