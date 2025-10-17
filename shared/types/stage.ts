/**
 * ステージシステム型定義
 */

/**
 * ステージタイプ
 */
export type StageType =
  | 'first_meet'    // 出会い
  | 'dating'        // デート期間
  | 'relationship'  // 告白・交際
  | 'proposal'      // プロポーズ
  | 'marriage';     // 結婚生活

/**
 * ステージ情報
 */
export interface Stage {
  type: StageType;
  displayName: string;
  description: string;
  minAffection: number;    // 解放に必要な最低好感度
  maxAffection: number;    // このステージの最大好感度
  unlocked: boolean;       // 解放済みか
  features: string[];      // このステージで利用可能な機能
  events: StageEvent[];    // このステージで発生するイベント
}

/**
 * ステージイベント
 */
export interface StageEvent {
  id: string;
  name: string;
  description: string;
  type: EventType;
  trigger: EventTrigger;
  completed: boolean;
  completedAt?: Date;
}

/**
 * イベントタイプ
 */
export type EventType =
  | 'story'         // ストーリーイベント
  | 'date'          // デートイベント
  | 'anniversary'   // 記念日イベント
  | 'routine'       // 日常ルーティン
  | 'special';      // 特別イベント

/**
 * イベントトリガー
 */
export interface EventTrigger {
  type: 'time' | 'date' | 'affection' | 'manual';
  condition: TimeCondition | DateCondition | AffectionCondition | ManualCondition;
}

/**
 * 時刻ベース条件
 */
export interface TimeCondition {
  time: string;        // "07:00", "18:00", "22:00"
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
}

/**
 * 日付ベース条件
 */
export interface DateCondition {
  date: Date;
  recurring: boolean;  // 毎年繰り返すか
}

/**
 * 好感度ベース条件
 */
export interface AffectionCondition {
  threshold: number;
  triggerOnce: boolean;
}

/**
 * 手動トリガー条件
 */
export interface ManualCondition {
  requiresUserAction: boolean;
}

/**
 * ステージ進行状態
 */
export interface StageProgress {
  userId: string;
  characterId: string;
  currentStage: StageType;
  affection: number;              // 現在の好感度（0-100）
  unlockedStages: StageType[];    // 解放済みステージ
  completedEvents: string[];      // 完了済みイベントID
  nextMilestone: {
    stage: StageType;
    requiredAffection: number;
    progress: number;             // 進捗率（0-1）
  };
}

/**
 * ステージ定義マップ
 */
export const STAGE_DEFINITIONS: Record<StageType, Omit<Stage, 'unlocked'>> = {
  first_meet: {
    type: 'first_meet',
    displayName: '出会い',
    description: '初めての出会い。自己紹介と第一印象を形成するステージ。',
    minAffection: 0,
    maxAffection: 20,
    features: ['text_chat', 'character_creation', 'first_impression'],
    events: [
      {
        id: 'initial_greeting',
        name: '初回挨拶',
        description: '初めての会話',
        type: 'story',
        trigger: {
          type: 'manual',
          condition: { requiresUserAction: true },
        },
        completed: false,
      },
      {
        id: 'self_introduction',
        name: '自己紹介',
        description: 'お互いの自己紹介',
        type: 'story',
        trigger: {
          type: 'manual',
          condition: { requiresUserAction: true },
        },
        completed: false,
      },
      {
        id: 'contact_exchange',
        name: '連絡先交換',
        description: '連絡先を交換する',
        type: 'story',
        trigger: {
          type: 'affection',
          condition: { threshold: 10, triggerOnce: true },
        },
        completed: false,
      },
    ],
  },
  dating: {
    type: 'dating',
    displayName: 'デート期間',
    description: 'デートを重ねて距離を縮めるステージ。',
    minAffection: 20,
    maxAffection: 50,
    features: ['text_chat', 'voice', 'date_planning', 'gift', 'album'],
    events: [
      {
        id: 'first_date',
        name: '初デート',
        description: '初めてのデート',
        type: 'date',
        trigger: {
          type: 'affection',
          condition: { threshold: 20, triggerOnce: true },
        },
        completed: false,
      },
      {
        id: 'cafe_date',
        name: 'カフェデート',
        description: 'カフェでゆっくり話す',
        type: 'date',
        trigger: {
          type: 'manual',
          condition: { requiresUserAction: true },
        },
        completed: false,
      },
      {
        id: 'park_date',
        name: '公園デート',
        description: '公園を散歩する',
        type: 'date',
        trigger: {
          type: 'manual',
          condition: { requiresUserAction: true },
        },
        completed: false,
      },
    ],
  },
  relationship: {
    type: 'relationship',
    displayName: '交際',
    description: '告白して恋人になるステージ。記念日や日常を共有。',
    minAffection: 50,
    maxAffection: 80,
    features: ['text_chat', 'voice', 'video_call', 'anniversary', 'couple_name'],
    events: [
      {
        id: 'confession',
        name: '告白',
        description: '気持ちを伝える',
        type: 'story',
        trigger: {
          type: 'affection',
          condition: { threshold: 50, triggerOnce: true },
        },
        completed: false,
      },
      {
        id: 'first_anniversary',
        name: '1ヶ月記念',
        description: '付き合って1ヶ月',
        type: 'anniversary',
        trigger: {
          type: 'date',
          condition: {
            date: new Date(), // 実際は告白日+30日
            recurring: false,
          },
        },
        completed: false,
      },
    ],
  },
  proposal: {
    type: 'proposal',
    displayName: 'プロポーズ',
    description: '結婚を決意するステージ。プロポーズの準備と実行。',
    minAffection: 80,
    maxAffection: 100,
    features: ['text_chat', 'voice', 'video_call', 'ring_selection', 'proposal_planning'],
    events: [
      {
        id: 'ring_shopping',
        name: '指輪選び',
        description: '婚約指輪を選ぶ',
        type: 'story',
        trigger: {
          type: 'affection',
          condition: { threshold: 80, triggerOnce: true },
        },
        completed: false,
      },
      {
        id: 'proposal',
        name: 'プロポーズ',
        description: 'プロポーズする',
        type: 'story',
        trigger: {
          type: 'manual',
          condition: { requiresUserAction: true },
        },
        completed: false,
      },
    ],
  },
  marriage: {
    type: 'marriage',
    displayName: '結婚生活',
    description: '新婚生活と日常ルーティン。夫婦としての日々を過ごす。',
    minAffection: 100,
    maxAffection: 100,
    features: [
      'text_chat',
      'voice',
      'video_call',
      'daily_routine',
      'life_events',
      'family_planning',
    ],
    events: [
      {
        id: 'morning_routine',
        name: '朝の挨拶',
        description: '毎朝のおはよう',
        type: 'routine',
        trigger: {
          type: 'time',
          condition: { time: '07:00', frequency: 'daily' },
        },
        completed: false,
      },
      {
        id: 'work_return',
        name: 'おかえり',
        description: '仕事から帰宅',
        type: 'routine',
        trigger: {
          type: 'time',
          condition: { time: '18:00', frequency: 'daily' },
        },
        completed: false,
      },
      {
        id: 'bedtime',
        name: 'おやすみ',
        description: '就寝前の会話',
        type: 'routine',
        trigger: {
          type: 'time',
          condition: { time: '22:00', frequency: 'daily' },
        },
        completed: false,
      },
    ],
  },
};

/**
 * 好感度レベル定義
 */
export interface AffectionLevel {
  level: number;
  name: string;
  minAffection: number;
  maxAffection: number;
  stage: StageType;
  description: string;
}

export const AFFECTION_LEVELS: AffectionLevel[] = [
  {
    level: 1,
    name: '知り合い',
    minAffection: 0,
    maxAffection: 20,
    stage: 'first_meet',
    description: '初めて出会ったばかりの関係',
  },
  {
    level: 2,
    name: '友達以上',
    minAffection: 20,
    maxAffection: 50,
    stage: 'dating',
    description: '友達以上恋人未満の関係',
  },
  {
    level: 3,
    name: '恋人',
    minAffection: 50,
    maxAffection: 80,
    stage: 'relationship',
    description: '正式に付き合っている恋人',
  },
  {
    level: 4,
    name: '婚約者',
    minAffection: 80,
    maxAffection: 100,
    stage: 'proposal',
    description: '結婚を約束した婚約者',
  },
  {
    level: 5,
    name: '配偶者',
    minAffection: 100,
    maxAffection: 100,
    stage: 'marriage',
    description: '結婚した夫婦',
  },
];
